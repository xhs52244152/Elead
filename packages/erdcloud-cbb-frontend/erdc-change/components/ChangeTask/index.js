define([
    'text!' + ELMP.func('erdc-change/components/ChangeTask/index.html'),
    ELMP.func('erdc-change/utils.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-change/config/viewConfig.js'),
    ELMP.func('erdc-change/components/RelatedObject/mixin.js')
], function (template, utils, cbbUtils, viewCfg, mixin) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapActions, mapGetters } = createNamespacedHelpers('Change');

    return {
        name: 'ChangeTask',
        template: template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            readonly: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            type: String,
            isShow: {
                type: Boolean,
                default: () => {
                    return true;
                }
            },
            title: {
                type: String,
                default: '变更任务'
            },
            typeName: {
                type: String,
                default: 'PR'
            },
            probOid: String,
            containerRef: String,
            isDraft: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            vm: Object,
            prefixRoute: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                panelUnfold: true,
                addList: [], // 新增数据
                tableData: [], // 表格显示数据
                pageData: [], // page 接口查询的数据
                selectedData: [], // 选中的数据
                showDialog: false,
                associationCfg: {
                    className: '',
                    tableKey: '',
                    needSelect: true, // 是否需要下拉select选框
                    selectOpts: {
                        disabled: true, // 是否禁用一级下拉框
                        selectUrl: '', // 下拉选框的请求地址
                        className: '', // 下拉选框请求时需要的className,即类型的内部名称
                        containerRef: '', // 上下文的oid
                        defineOpts: [], // 自定义下拉框，如果要自定义二级类型，则可以进一步设置children
                        /**
                         * /common/type/findBySuperKey 动态接口参数
                         * 1. superKey 变更添加受影响对象 ; 批量审批流程/TR审批流程 ; 基线相关对象 ; 添加至工作区
                         * ['change', 'process', 'baseline', 'workSpace']
                         * 2. superKeyServer 用来判断接口前缀
                         */
                        superKey: '',
                        superKeyServer: ''
                    }
                },
                selectedViewType: '',
                selectedChildType: '',
                setContainer: ''
            };
        },
        mixins: [mixin],
        computed: {
            ...mapGetters(['getViewTableMapping', 'getChangeTaskList']),
            ...mapActions(['fetchSaveChangeTaskList']),
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: this.typeName });
            },
            computedPrefixRoute() {
                return this.prefixRoute || this.$route.meta.prefixRoute;
            },
            changeTaskList() {
                return this.getChangeTaskList;
            },
            currentContainerRef() {
                return this.setContainer || this.containerRef;
            },
            oid() {
                return this.vm?.containerOid || this.probOid;
            },
            createTaskOid() {
                return this.$route.query.createTaskOid;
            },
            columns() {
                const {
                    checkbox,
                    seq,
                    icon,
                    identifierNo,
                    name,
                    // version,
                    containerRef,
                    createBy,
                    updateBy,
                    createTime,
                    updateTime
                } = this.commonColumnsMap;
                return [
                    checkbox,
                    seq,
                    icon,
                    identifierNo,
                    name,
                    this.commonColumnsMap['lifecycleStatus.status'],
                    // version,
                    containerRef,
                    createBy,
                    updateBy,
                    createTime,
                    updateTime
                ];
            },
            selectOpts() {
                return this.associationCfg.selectOpts ?? {};
            },
            rootSelectDisabled() {
                return this.selectOpts.disabled;
            },
            urlConfig() {
                return {
                    data: {
                        typeReference: this.selectedChildType ?? ''
                    }
                };
            },
            actionConfig() {
                return {
                    name: 'CHANGE_ORDER_ACTIVITY_MENU',
                    objectOid: '',
                    containerOid: this.$store.state.space?.context?.oid || '',
                    className: this.$route.meta.className
                };
            }
        },
        created() {
            if (this.isDraft) {
                this?.vm?.$on('GetChangeContainer', (nv) => {
                    if (nv) this.setContainer = nv;
                });
            }
        },
        watch: {
            changeTaskList: {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (nv && nv.length && (!this.type || this.type === 'flow')) {
                        this.tableData = [...this.pageData, ...nv];
                    }
                }
            },
            oid: {
                immediate: true,
                handler(nv) {
                    if (nv) this.getTableList(nv);
                }
            },
            pageData: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        const data = this.type ? [] : this.changeTaskList;
                        this.tableData = [...nv, ...data];
                    }
                }
            }
        },
        methods: {
            afterRequest({ data, callback }) {
                const { className } = this.associationCfg;

                let result = data.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.indexOf(className + '#') !== -1) {
                            obj[res.attrName.split('#')[1]] = res.displayName;
                        }
                    });
                    return { ...item, ...obj, checked: false };
                });
                callback(result);
            },
            refreshTable() {
                this.$refs.famViewTable.refreshTable();
            },
            submit(data) {
                if (!data.length) {
                    // return next();
                    return;
                }
                this.addList = data;
                this.tableData = [...this.tableData, ...data];
            },
            async getTableList(relationshipRef) {
                this.pageData = await this.changeProcessTableGetList({
                    className: viewCfg.otherClassNameMap.includeIn,
                    tableKey: 'ChangeOrderRelationChangeTaskView',
                    relationshipRef
                });
            },
            getData() {
                return new Promise((resolve) => {
                    const data = this.tableData.filter((item) => item.isCreated);
                    resolve(data);
                });
            },
            refreshRelatedChangeObject() {
                // 受影响对象的表格ref
                let affectObjectRef = this?.vm?.$refs?.detail?.[0]?.$refs['change-object']?.[0];
                if (affectObjectRef) {
                    let oids = (affectObjectRef.tableData || []).map((d) => d.oid);
                    this.$store.commit('Change/relatedChangeObject', oids);
                }
            },
            handleCreate() {
                let orderOid = null;
                let type = this.isDraft ? 'draft' : this.probOid ? 'flow' : 'detail';
                if (type === 'detail') orderOid = this.oid || '';
                if (type === 'flow') {
                    orderOid = this.probOid;
                    this.refreshRelatedChangeObject();
                }
                if (type === 'draft' && !this.currentContainerRef)
                    return this.$message.warning(this.i18n.pleaseSelectContext);
                if (type === 'draft') {
                    this.refreshRelatedChangeObject();
                }
                this.$router.push({
                    path: `${this.computedPrefixRoute}/change/ecaCreate`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        componentRefresh: this.type == 'detail' || !this.$route?.meta?.openType || '', //详情、流程进来时，编辑成功更新组件
                        containerRef: this.currentContainerRef,
                        type,
                        orderOid
                    }
                });
            },
            handlerRemove() {
                const { i18n, selectedData } = this;
                if (!selectedData || !selectedData.length) {
                    this.$message({
                        type: 'warning',
                        message: i18n.selectTip
                    });
                    return;
                }
                // 已绑定的数据
                const deleteIds = selectedData.filter((item) => !item.isCreated).map((item) => item.oid);
                // 新增数据
                const filterData = selectedData.filter((item) => item.isCreated).map((item) => item.oid);

                this.$confirm(i18n.deleteBatchTip, i18n.deleteTip, {
                    type: 'warning',
                    confirmButtonText: i18n.confirm,
                    cancelButtonText: i18n.cancel
                }).then(() => {
                    if (filterData.length) {
                        const indicesToRemove = function (array) {
                            return array.reduce((acc, obj, index) => {
                                if (filterData.find((bObj) => bObj === obj.oid)) {
                                    acc.push(index);
                                }
                                return acc;
                            }, []);
                        };
                        // 从a数组中移除与b数组中共享的对象
                        indicesToRemove(this.tableData)
                            .sort((a, b) => b - a)
                            .forEach((index) => this.tableData.splice(index, 1));
                    }
                    if (deleteIds.length) {
                        const className = deleteIds[0].split(':')[1];
                        this.$famHttp({
                            url: '/fam/deleteByIds',
                            method: 'delete',
                            params: {},
                            data: {
                                oidList: deleteIds,
                                className
                            }
                        }).then(() => {
                            this.$message({
                                type: 'success',
                                message: i18n.deleteSuccess,
                                showClose: true
                            });
                            this.getTableList(this.oid);
                        });
                    }
                });
            },
            handleGoDetail(data) {
                //详情、流程进来时，只能查看
                if (this.type == 'detail' || !this.$route?.meta?.openType) {
                    //流程查看详情,需添加返回按钮
                    // ( utils.getClassNameKey(data) === 'relationOid' )指定从这个字段获取className , 别的都是 IncludedIn , 实际上 EtChangeActivity 才是正确的
                    cbbUtils.goToDetail(
                        data,
                        { query: { backButton: true }, skipMode: 'replace' },
                        utils.getClassNameKey(data)
                    );
                } else {
                    let findOid = {
                        oid: ''
                    };
                    //创建通告的时候，同时创建草稿
                    if (data?.identifierNo?.includes('T')) {
                        //取关联关系的oid
                        findOid =
                            data?.attrRawList?.find((item) => item.attrName == `${data.idKey}#roleBObjectRef`) || {};
                        //数据格式不一致,多加个判断
                        if (!findOid.oid) {
                            findOid.oid = data?.oid;
                        }
                    } else {
                        findOid = data?.attrRawList?.find((item) => item.attrName == `${data.idKey}#roleBObjectRef`);
                    }

                    this.$router.push({
                        path: `${this.prefixRoute}/change/ecaEdit`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: findOid?.oid || ''
                        }
                    });
                }
            },
            // 复选框选中数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框全选数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            },
            getIconStyle(row) {
                const style = utils.getIconClass(row.attrRawList, row?.idKey);
                style.verticalAlign = 'text-bottom';
                style.fontSize = '16px';

                return style;
            },
            getIcon(row) {
                return row.attrRawList?.find((item) => item.attrName.includes('icon'))?.value || row.icon;
            },
            // 功能按钮点击事件
            actionClick(type = {}, data = {}) {
                //问题报告
                let eventClick = {
                    CHANGE_ORDER_ACTIVITY_MENU_CREATE: this.handleCreate,
                    CHANGE_ORDER_ACTIVITY_MENU_REMOVE: this.handlerRemove
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            }
        }
    };
});
