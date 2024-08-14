define([
    'text!' + ELMP.resource('project-budget/views/detail/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'erdcloud.kit',
    'erdc-kit',
    'css!' + ELMP.resource('project-budget/views/detail/style.css')
], function (template, ppmStore, ppmUtils, ErdcKit, EKit) {
    return {
        template,
        components: {
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            SubjectBudgetInfo: ErdcKit.asyncComponent(
                ELMP.resource('project-budget/components/SubjectBudgetInfo/index.js')
            ),
            ProcessRecords: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
            )
        },
        props: {
            // 页面类型，detail=详情，create=创建，edit=编辑
            type: {
                type: String,
                default: 'detail'
            }
        },
        data() {
            return {
                // 启用国际化
                i18nPath: ELMP.resource('project-budget/locale/index.js'),
                activeName: this.$route.query.activeName || 'detail',
                saveLoading: false,
                /**
                 * footerOp
                 * 底部按钮的配置，数据结构：{
                 *      detail: {
                            show: false,
                            showSave: true,
                            showClose: true,
                            saveClick: null,
                            closeClick: null
                        }
                 * }
                 */
                footerOp: {},
                // 当前url路径关键字，用于组件缓存时但是切换到了其它页面，该页面还会因为监听了$route.query.activeName而调用对应事件
                activeUrlPath: '',

                resData: {},
                subjectInfo: {} // 科目信息
            };
        },
        computed: {
            // 预算科目
            subjectClassName() {
                return ppmStore?.state?.classNameMapping?.budgetSubject;
            },
            // 预算关联科目对象
            budgetLinkClassName() {
                return ppmStore?.state?.classNameMapping?.budgetLink;
            },
            // 项目oid
            projectOid() {
                return this.$route.query.pid;
            },
            // oid
            oid() {
                return this.$route.query.oid;
            },
            // 是否编辑模式
            isEdit() {
                return this.type === 'edit';
            },
            title() {
                if (!this.subjectInfo[`${this.subjectClassName}#identifierNo`]) {
                    return ''; // 返回空格字符串，防止页面抖动
                }
                return (
                    this.subjectInfo[`${this.subjectClassName}#name`] +
                    '; ' +
                    this.subjectInfo[`${this.subjectClassName}#identifierNo`]
                );
            },
            tabsData() {
                return [
                    {
                        activeName: 'detail',
                        name: this.i18n['detailInfo'] // '详细信息'
                    },
                    {
                        activeName: 'processRecords',
                        name: this.i18n['processRecords'] // '流程记录'
                    }
                ];
            }
        },
        watch: {
            '$route.query.activeName'(activeName) {
                if (this.activeUrlPath !== this.$route.path) {
                    return;
                }
                this.activeName = activeName;
            },
            'activeName': {
                handler() {
                    // 初始化
                    this.initFooter(this.activeName, this.footerOp?.[this.activeName] || { show: false });
                    this.$router.replace({
                        ...this.$route,
                        query: { ...this.$route?.query, activeName: this.activeName }
                    });
                },
                immediate: true
            },
            'projectOid'() {
                if (this.activeUrlPath !== this.$route.path) {
                    return;
                }
                this.debounceCallInitData(); // 防抖方式调用initData方法
            },
            'oid'() {
                if (this.activeUrlPath !== this.$route.path) {
                    return;
                }
                this.debounceCallInitData(); // 防抖方式调用initData方法
            }
        },
        created() {
            this.activeUrlPath = this.$route.path;
            this.vm = this;
            this.initData();
        },
        methods: {
            // 初始化数据
            async initData() {
                // 防止页面切得太快，导致this.oid等数据不对
                if (this.activeUrlPath !== this.$route.path) {
                    return;
                }
                let res = await this.$famHttp({
                    // 更多配置参考axios官网
                    url: '/ppm/budget/info', // 表格数据接口
                    params: {
                        contextOId: this.projectOid, // 项目oid
                        linkOId: this.oid,
                        isCost: true
                    }, // 路径参数
                    data: {
                        contextOId: this.projectOid, // 项目oid
                        linkOId: this.oid,
                        isCost: true
                    },
                    method: 'post' // 请求方法（默认get）
                });
                // 防止页面切得太快，导致this.oid等数据不对
                if (this.activeUrlPath !== this.$route.path) {
                    return;
                }
                let curSubject = res.data?.subjects?.[0];
                if (!curSubject) {
                    // 该科目预算信息不存在！
                    this.$message.warning(this.i18n['subjectBudgetNoExist']);
                    return;
                }
                this.resData = res.data;
                // 获取科目数据
                this.subjectInfo = {
                    ...ErdcKit.deserializeArray(curSubject.attrRawList || [], {
                        valueKey: 'displayName'
                    }),
                    ...curSubject
                };
            },
            // 防抖方式调用initData方法
            debounceCallInitData() {
                EKit.debounceFn(() => {
                    if (!this.activeName) {
                        this.activeName = this.tabsData[0]?.activeName;
                    }
                    this.initData();
                }, 100);
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_BUDGET_SUBJECT_LINK_OPER',
                    objectOid: row.oid,
                    className: this.budgetLinkClassName
                };
            },
            // 初始化底部按钮相关配置信息
            // 注：默认隐藏底部按钮，如某个tab页签需要显示底部按钮，则tab里面的业务组件需要$emit一个事件调用此方法并传参来控制
            initFooter(activeName, { show = false, showSave = true, showClose = true, saveClick, closeClick }) {
                this.$set(this.footerOp, activeName, {
                    show: show || false,
                    showSave: showSave,
                    showClose: showClose,
                    saveClick: saveClick,
                    closeClick: closeClick
                });
            },
            saveClick() {
                if (typeof this.footerOp?.[this.activeName]?.saveClick === 'function') {
                    this.saveLoading = true;
                    this.footerOp[this.activeName].saveClick(this.saveAfter);
                }
            },
            /**
             * 保存后的处理事件
             * @param {Boolean} isClosePage 是否关闭当前页面
             * @param {Boolean} isCloseLoading 是否关闭按钮的loading
             */
            saveAfter(isClosePage = true, isCloseLoading = true) {
                if (isCloseLoading) {
                    this.saveLoading = false;
                }
                if (isClosePage) {
                    this.closeClick();
                }
            },
            closeClick() {
                if (typeof this.footerOp?.[this.activeName]?.closeClick === 'function') {
                    this.footerOp[this.activeName].closeClick();
                } else {
                    this.goBack();
                }
            },
            goBack() {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                    this.$router.go(-1);
                });
            }
        }
    };
});
