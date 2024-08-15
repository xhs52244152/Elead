define([
    'text!' + ELMP.func('batch-approval-start/index.html'),
    ELMP.resource('erdc-cbb-workflow/app/mixin.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.resource('erdc-cbb-workflow/index.js')
], function (template, mixin, cbbUtils, registerWorkflow) {
    registerWorkflow();

    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('cbbWorkflowStore');
    const actionName = 'RepeatProcessService';
    const businessFormClassName = 'erd.cloud.pdm.workflow.domain.dto.PdmBaseFormDto';

    return {
        name: 'BatchApprovalStart',
        template,
        mixins: [mixin],
        components: {
            ReviewObjectList: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/components/ReviewObjectList/index.js')
            ),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            // 当前用户点击的节点
            activityId: String,

            // 回显数据, 用不到前端写死，没有最新版本概念
            customFormData: {
                type: Object,
                default: () => {
                    return {};
                }
            },

            // 审批pbo数据，后端会返回最新版本的数据
            pboData: {
                type: Object,
                default: () => {
                    return {};
                }
            },

            // 全部流程详情数据
            processInfos: Object,

            // 发起还是审批页面launcher, activator
            processStep: String
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-cbb-workflow/pages/batch-approval-start/locale/index.js'),
                // 是否隐藏收集相关对象按钮（启动节点不隐藏，其他节点隐藏）
                hideCollect: false,
                unfold: true,
                // 表格展示数据
                tableData: [],
                processDefinitionKey: ''
            };
        },
        computed: {
            ...mapGetters(['getReviewObject']),
            reviewObject() {
                const reviewObject = this.getReviewObject({
                    processDefinitionKey: this.processDefinitionKey,
                    activityId: this.activityId
                });
                return ErdcKit.deepClone(reviewObject) || [];
            },
            column() {
                return [
                    {
                        type: 'seq',
                        align: 'center',
                        fixed: 'left',
                        width: 48
                    },
                    {
                        type: 'checkbox',
                        align: 'center',
                        fixed: 'left',
                        width: 40,
                        props: {
                            visible: this.checkboxVisible
                        }
                    },
                    {
                        prop: 'identifierNo', // 列数据字段key
                        title: this.i18n['编码'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'name',
                        title: this.i18n['名称'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'version',
                        title: this.i18n['版本'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n['生命周期状态'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n['上下文'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'createBy',
                        title: this.i18n['创建者'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'updateBy',
                        title: this.i18n['修改者'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'createTime',
                        title: this.i18n['创建时间'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'updateTime',
                        title: this.i18n['更新时间'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    }
                ];
            },
            hideOper() {
                return !(this.processStep === 'launcher' && this.activityId === 'start');
            },
            checkboxVisible() {
                return !this.hideOper;
            },
            // 审批页面获取最新业务对象
            initActivatorBusinessObject() {
                const processInstanceOId = this.$route.params?.processInstanceOId || this.processInfos.oid;
                const taskDefKey = this?.activityId || this.$route.query?.taskDefKey;
                const taskOId = this.$route.query?.taskOId;

                const pboOid = this.processInfos?.pboOId;
                const processDefinitionId = this.processInfos?.processDefinitionId;

                const reviewItemList = this.pboData?.businessForm?.reviewItemList || [];

                let className = '';
                if (_.isArray(reviewItemList) && reviewItemList.length) {
                    const [row] = reviewItemList;
                    className = row?.oid?.split(':')?.[1] || '';
                }
                return (
                    this.processStep === 'activator' &&
                    processInstanceOId &&
                    taskDefKey &&
                    pboOid &&
                    processDefinitionId &&
                    className && {
                        processInstanceOId,
                        taskDefKey,
                        taskOId,
                        pboOid,
                        processDefinitionId,
                        className
                    }
                );
            },
            // 发起页面，草稿页面获取最新业务对象
            initLauncherBusinessObject() {
                // this.customFormData为草稿数据
                // this.reviewObject为发起流程数据
                const tableData = this.customFormData.formJson || this.reviewObject || [];
                return this.processStep === 'launcher' && _.isArray(tableData) && tableData?.length && tableData;
            }
        },
        watch: {
            // 'pboData.businessForm.reviewItemDtos': {
            //     handler: function (nv) {
            //         if (_.isArray(nv)) {
            //             nv =
            //                 _.map(ErdcKit.deepClone(nv), (item) => {
            //                     return _.reduce(
            //                         item,
            //                         (prev, next) => {
            //                             !_.isArray(prev?.attrRawList)
            //                                 ? (prev.attrRawList = [])
            //                                 : prev.attrRawList.push(next);
            //                             prev[next?.attrName] = _.isObject(next?.value) ? next?.oid : next?.value;
            //                             return prev;
            //                         },
            //                         {}
            //                     );
            //                 }) || [];
            //             this.tableData = ErdcKit.deepClone(nv) || [];
            //         }
            //     },
            //     immediate: true
            // },
            initActivatorBusinessObject: {
                handler: function (nv) {
                    if (_.isObject(nv) && !_.isEmpty(nv)) {
                        this.getPboDetail(nv);
                    }
                },
                immediate: true
            },
            initLauncherBusinessObject: {
                handler: function (nv) {
                    if (_.isArray(nv)) {
                        this.initNewDetail(nv);
                    }
                },
                immediate: true
            }
        },
        created() {
            this.processDefinitionKey = this.$route?.params?.engineModelKey;
            // 注册提交前更改数据
            this.setBeforeSubmit();
        },
        activated() {
            // 注册提交前更改数据
            this.setBeforeSubmit();
        },
        methods: {
            initNewDetail(nv) {
                const oidList = _.map(nv, 'oid');
                this.getLatestObject(oidList)
                    .then((res) => {
                        if (res.success) {
                            const data = res?.data?.records || [];
                            this.tableData = _.map(data, (item) => {
                                return {
                                    ...item,
                                    ..._.reduce(
                                        item?.attrRawList,
                                        (prev, next) => {
                                            return {
                                                ...prev,
                                                [next.attrName]: next.displayName
                                            };
                                        },
                                        {}
                                    )
                                };
                            });
                        } else {
                            this.tableData = ErdcKit.deepClone(nv) || [];
                        }
                    })
                    .catch(() => {
                        this.tableData = ErdcKit.deepClone(nv) || [];
                    });
            },
            // 获取对象最新版本
            getLatestObject(oidList) {
                const [oid] = oidList || [];
                const className = oid?.split(':')?.[1];
                return this.$famHttp({
                    url: '/fam/search/by/oid',
                    method: 'post',
                    className,
                    data: {
                        oidList
                    }
                });
            },
            // 获取业务对象详情 PBO
            getPboDetail(data) {
                this.$famHttp({
                    url: `/bpm/workflow/findformdata/bypobandnodekey`,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: {
                        actionName: this.$store.getters.className('pbo'),
                        pboOid: data?.pboOid || '',
                        sessionId: data?.taskDefKey || '',
                        processDefinitionId: data?.processDefinitionId || '',
                        taskId: data?.taskOId || '',
                        executionId: data?.processInstanceOId || ''
                    },
                    className: data?.className || ''
                }).then((resp) => {
                    if (resp.success) {
                        const reviewItemList = resp?.data?.businessForm?.reviewItemList || [];
                        if (_.isArray(reviewItemList) && reviewItemList.length) {
                            this.initNewDetail(reviewItemList);
                        }
                    }
                });
            },
            viewDetails({ row }) {
                cbbUtils.goToDetail.call(
                    this,
                    { ...row, oid: row?.versionOid || row?.oid },
                    { query: { backButton: true }, skipMode: 'replace' }
                );
            },
            // 获取对象图标
            getObjectIcon({ row }) {
                let iconData = _.find(row?.attrRawList, (item) =>
                    new RegExp(`^(?!Link#).*icon$`).test(item?.attrName)
                )?.value;

                return iconData;
            },
            // 初始化表格取值
            formatterDisplayName({ cellValue, column, row }) {
                return (
                    _.find(row?.attrRawList, (item) => new RegExp(`${column?.field}$`).test(item?.attrName))
                        ?.displayName || cellValue
                );
            },
            // 收集相关对象
            collectReviewObject({ tableData, next }) {
                if (!tableData.length) {
                    return this.$message.info(this.i18n['请先选择要收集的评审对象']);
                }
                tableData = ErdcKit.deepClone(tableData) || [];

                _.each(tableData, (item) => {
                    item.attrRawList = _.filter(item?.attrRawList || [], (item) => {
                        return new RegExp(`^(?!Link#).*$`).test(item?.attrName);
                    });
                });

                tableData = _.map(tableData, (item) => {
                    return {
                        ...item,
                        ..._.reduce(
                            item?.attrRawList,
                            (prev, next) => {
                                return {
                                    ...prev,
                                    [next.attrName]: next?.displayName || '',
                                    [next.attrName?.split('#')?.reverse()?.[0]]: next?.displayName || ''
                                };
                            },
                            {}
                        )
                    };
                });

                for (let i = tableData.length - 1; i >= 0; i--) {
                    for (let j = 0; j < this.tableData.length; j++) {
                        if (tableData[i]?.oid === this.tableData[j]?.oid) {
                            tableData.splice(i, 1);
                        }
                    }
                }

                this.tableData = ErdcKit.deepClone(this.tableData).concat(tableData);

                _.isFunction(next) && next();

                this.$message.success(this.i18n['收集相关对象成功']);
            },
            // 移除评审对象
            removeReviewObject({ tableData, next }) {
                if (!tableData.length) {
                    return this.$message.info(this.i18n['请先选择要移除的评审对象']);
                }

                this.$confirm(this.i18n['确定要移除这些评审对象？'], this.i18n['提示'], {
                    confirmButtonText: this.i18n['确定'],
                    cancelButtonText: this.i18n['取消'],
                    type: 'warning'
                }).then(() => {
                    for (let i = 0; i < tableData.length; i++) {
                        for (let j = this.tableData.length - 1; j >= 0; j--) {
                            if (tableData[i]?.oid === this.tableData[j]?.oid) {
                                this.tableData.splice(j, 1);
                            }
                        }
                    }

                    _.isFunction(next) && next();

                    return this.$message.success(this.i18n['评审对象移除成功']);
                });
            },
            // 添加关联对象
            addReviewObject({ tableData, next }) {
                if (!_.isArray(tableData) || (_.isArray(tableData) && !tableData.length)) {
                    return next();
                }

                tableData = _.map(ErdcKit.deepClone(tableData));
                for (let i = tableData.length - 1; i >= 0; i--) {
                    for (let j = 0; j < this.tableData.length; j++) {
                        if (tableData[i]?.oid === this.tableData[j]?.oid) {
                            tableData.splice(i, 1);
                        }
                    }
                }

                this.tableData = ErdcKit.deepClone(this.tableData).concat(tableData);
                _.isFunction(next) && next();

                this.$message.success(this.i18n['添加相关对象成功']);
            },
            // 注册提交前更改数据
            setBeforeSubmit() {
                // 注册数据组装方式
                this.$store.dispatch('bpmProcessPanel/setBeforeSubmit', {
                    key: this.processStep,
                    func: this.assembleBaseFormData
                });
                // 注册处理人配置团队成员自定义选人
                this.$store.dispatch('bpmProcessPanel/setTeamMember', {
                    key: this.processStep,
                    func: this.getRoleInfo
                });
                // 注册自定义返回
                this.$store.dispatch('bpmProcessPanel/setCallback', {
                    type: 'goBack',
                    key: this.processStep,
                    func: () => {
                        this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                            this.$router.go(-1);
                        });
                    }
                });
                // 注册流程提交和另存为自定义跳转
                this.$store.dispatch('bpmProcessPanel/setCallback', {
                    type: 'successCallback',
                    key: this.processStep,
                    func: (isDraft) => {
                        const appName = 'erdc-portal-web';
                        const query = {
                            isRefresh: new Date().getTime().toString()
                        };
                        const path = isDraft ? '/biz-bpm/process/draft' : '/biz-bpm/process/todos';
                        this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                            if (window.__currentAppName__ === appName) {
                                this.$router.push({
                                    path,
                                    query
                                });
                            } else {
                                this.$router.go(-1);
                                // path组装query参数
                                let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(path, query)}`;
                                this.$nextTick(() => {
                                    window.open(url, appName);
                                });
                            }
                        });
                    }
                });
            },
            // 角色自定义选人
            getRoleInfo(row) {
                // eslint-disable-next-line no-async-promise-executor
                return new Promise(async (resolve) => {
                    if (row.memberType === 'ROLE') {
                        let result = await this.getRoleRequest();
                        resolve(result);
                    } else {
                        resolve([]);
                    }
                });
            },
            // 查询用户
            getRoleRequest() {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/user/list',
                        data: JSON.stringify({
                            keywords: '',
                            isGetDisable: false,
                            size: 20
                        }),
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then((resp) => {
                            let { success, data = {} } = resp || {},
                                userInfoList = [];
                            if (success) {
                                ({ userInfoList = [] } = data || {});
                            }
                            userInfoList = _.map(userInfoList, (item) => {
                                return {
                                    label: item?.displayName || '',
                                    value: item?.oid || '',
                                    code: item?.code,
                                    disabled: false
                                };
                            });
                            resolve(userInfoList);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            },
            // 组装baseForm数据
            assembleBaseFormData({ data }) {
                const reviewItemList =
                    _.map(JSON.parse(this.getData())?.formJson, (item) => {
                        return {
                            ..._.omit(item, (value, key) => {
                                return key?.split('#')?.length > 1;
                            }),
                            ..._.reduce(
                                item?.attrRawList,
                                (prev, next) => {
                                    return {
                                        ...prev,
                                        [next?.attrName?.split('#')?.reverse()[0]]: _.isObject(next.value)
                                            ? next?.oid
                                            : next.value
                                    };
                                },
                                {}
                            )
                        };
                    }) || [];

                return new Promise((resolve) => {
                    data.baseForm.businessFormClassName = businessFormClassName;
                    data.baseForm.businessForm.reviewItemList = reviewItemList;
                    data.baseForm.businessFormJsonStr = JSON.stringify(data?.baseForm?.businessForm || {});

                    if (_.isFunction(this?.[`${this.processStep}Submit`])) {
                        this[`${this.processStep}Submit`]({ resolve, data });
                    } else {
                        resolve(data);
                    }
                });
            },
            // 启动页面单独的baseForm数据
            launcherSubmit({ resolve, data }) {
                // 平台支持基本信息扩展，不需要放进baseForm里面
                // data.baseForm.businessForm.containerRef = data?.baseForm?.processBasicInfo?.containerRef || '';

                data.baseForm.actionName = actionName;

                // 应后端要求，部分参数调整
                delete data.baseForm.processBasicInfo.id;
                // 组装基本信息里面的上下文字段
                data.baseForm.processBasicInfo = {
                    ...data.baseForm.processBasicInfo,
                    extraInfoMap: {
                        containerRef: {
                            extraFiled: 'containerRef',
                            extraFiledCnName: this.i18n['上下文'],
                            extraFiledEnName: this.i18n['上下文'],
                            extraFiledValue: data?.baseForm?.processBasicInfo?.containerRef || ''
                        }
                    }
                };

                resolve(data);
            },
            // 校验
            validate() {
                return new Promise((resolve) => {
                    const data = this.getData();
                    resolve({
                        valid: !!JSON.parse(data)?.formJson?.length,
                        data,
                        message: this.i18n['评审对象不允许为空']
                    });
                });
            },
            // 获取数据
            getData() {
                const getData = this?.$refs?.reviewObjectListRef?.getData;
                return JSON.stringify({ formJson: _.isFunction(getData) ? getData() : [] });
            },
            addReviewObjectClick() {
                this.$refs.reviewObjectListRef.addReviewObject();
            },
            collectReviewObjectClick() {
                this.$refs.reviewObjectListRef.collectReviewObject();
            },
            removeReviewObjectClick() {
                this.$refs.reviewObjectListRef.removeReviewObject();
            }
        }
    };
});
