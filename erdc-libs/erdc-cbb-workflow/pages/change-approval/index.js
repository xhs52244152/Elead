define([
    'text!' + ELMP.func('change-approval/index.html'),
    ELMP.resource('erdc-cbb-workflow/index.js'),
    ELMP.func('erdc-change/store.js'),
    ELMP.func('erdc-change/actions.js'),
    'erdc-kit',
    'vuex',
    'underscore'
], function (template, registerWorkflow, store, changeActions, ErdcKit) {
    registerWorkflow();
    // 初始化store
    const ErdcStore = require('erdcloud.store');
    ErdcStore.registerModule('Change', store);
    ErdcStore.dispatch('registerActionMethods', changeActions);

    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('cbbWorkflowStore');

    return {
        name: 'ChangeApproval',
        template,
        components: {
            ObjectList: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/AffectedObjectList/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/RelatedObject/index.js')),
            ImpactAnalysis: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/ImpactAnalysis/index.js')),
            ChangeNotice: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/ChangeNotice/index.js')),
            ChangeTask: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/ChangeTask/index.js')),
            TaskObject: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/TaskObject/index.js'))
        },
        props: {
            // 当前节点
            activityId: String,
            // 回显数据
            customFormData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 发起还是审批页面launcher, activator
            processStep: String
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-cbb-workflow/pages/change-approval/locale/index.js'),
                // 表格展示数据
                innerTableData: [],
                // 是否隐藏收集相关对象按钮（启动节点不隐藏，其他节点隐藏）
                hideCollect: false,
                unfold: true,
                vm: this
            };
        },
        computed: {
            ...mapGetters(['getReviewObject']),
            reviewObject() {
                const reviewObject = this.getReviewObject({
                    processDefinitionKey: this.$route?.params?.engineModelKey,
                    activityId: this.activityId
                });
                return this.reassembleTableData({ tableData: reviewObject, field: 'displayName', deletePrefix: true });
            },
            containerRef() {
                return this.getReviewObject({ processDefinitionKey: 'containerRef' });
            },
            oid() {
                return this?.customFormData?.formJson?.[0]?.oid || '';
            },
            className() {
                return this?.oid?.split(':')[1] || '';
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
                        prop: `identifierNo`, // 列数据字段key
                        title: this.i18n['编码'] // 列头部标题
                    },
                    {
                        prop: `name`,
                        title: this.i18n['名称'] // 列头部标题
                    },
                    {
                        prop: `version`,
                        title: this.i18n['版本'] // 列头部标题
                    },
                    {
                        prop: `lifecycleStatus.status`,
                        title: this.i18n['生命周期状态'] // 列头部标题
                    },
                    {
                        prop: `containerRef`,
                        title: this.i18n['上下文'] // 列头部标题
                    },
                    {
                        prop: `createBy`,
                        title: this.i18n['创建者'] // 列头部标题
                    },
                    {
                        prop: `updateBy`,
                        title: this.i18n['修改者'] // 列头部标题
                    },
                    {
                        prop: `createTime`,
                        title: this.i18n['创建时间'] // 列头部标题
                    },
                    {
                        prop: `updateTime`,
                        title: this.i18n['更新时间'] // 列头部标题
                    }
                ];
            },
            tableData() {
                return this?.customFormData?.formJson || this?.reviewObject || [];
            },
            hideOper() {
                return this.processStep === 'activator' && this.activityId === 'start';
            },
            checkboxVisible() {
                return !this.hideOper;
            },
            isIssue() {
                const bool = this.className === 'erd.cloud.cbb.change.entity.EtChangeIssue';
                return bool;
            },
            isRequest() {
                const bool = this.className === 'erd.cloud.cbb.change.entity.EtChangeRequest';
                return bool;
            },
            isOrder() {
                const bool = this.className === 'erd.cloud.cbb.change.entity.EtChangeOrder';
                return bool;
            },
            isActivity() {
                const bool = this.className === 'erd.cloud.cbb.change.entity.EtChangeActivity';
                return bool;
            },
            isEcrCreateEco() {
                return this.activityId === 'ecr_create_eco';
            },
            isEcoCreateEca() {
                return this.activityId === 'eco_create_eca1';
            },
            typeName() {
                let value = 'PR';
                if (this.isOrder) value = 'ECR';
                if (this.isActivity) value = 'ECA';
                return value;
            },
            relateObjectTitle() {
                let title = this.isOrder || this.isActivity ? '关联的变更对象' : '关联的PR对象';
                return title;
            }
        },
        watch: {
            tableData: {
                handler: function (nv) {
                    this.innerTableData = ErdcKit.deepClone(nv) || [];
                },
                immediate: true
            }
        },
        created() {
            // 注册提交前更改数据
            this.setBeforeSubmit();
        },
        activated() {
            // 注册提交前更改数据
            this.setBeforeSubmit();
        },
        methods: {
            // 移除评审对象
            removeReviewObject({ tableData }) {
                if (!tableData.length) {
                    return this.$message.info(this.i18n['请先选择要移除的评审对象']);
                }

                this.$confirm(this.i18n['确定要移除这些评审对象？'], this.i18n['提示'], {
                    confirmButtonText: this.i18n['确定'],
                    cancelButtonText: this.i18n['取消'],
                    type: 'warning'
                }).then(() => {
                    for (let i = 0; i < tableData.length; i++) {
                        for (let j = this.innerTableData.length - 1; j >= 0; j--) {
                            if (tableData[i]?.oid === this.innerTableData[j]?.oid) {
                                this.innerTableData.splice(j, 1);
                            }
                        }
                    }

                    // 清空所选数据
                    this.$refs?.reviewObjectListRef?.checkboxAll({ records: [] });

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
                    for (let j = 0; j < this.innerTableData.length; j++) {
                        if (tableData[i]?.oid === this.innerTableData[j]?.oid) {
                            tableData.splice(i, 1);
                        }
                    }
                }

                tableData = ErdcKit.deepClone(this.innerTableData).concat(tableData);
                this.innerTableData = this.reassembleTableData({ tableData, field: 'displayName', deletePrefix: true });
                this.$message.success(this.i18n['添加相关对象成功']);
                next();
            },
            // 重新组装表格数据（显示displayName，提交value）
            reassembleTableData({ tableData = [], field, deletePrefix, deleteAttrRawList }) {
                // tableData 数据源
                // field 替换的字段
                // deletePrefix 是否删除#前缀
                // deleteAttrRawList 是否删除attrRawList
                tableData = ErdcKit.deepClone(tableData) || [];
                tableData = _.map(tableData, (item) => {
                    _.each(item?.attrRawList, (sitem) => {
                        if (sitem?.attrName && sitem?.[field]) {
                            item[sitem.attrName.split('#').reverse()[0]] = _.isObject(sitem?.[field])
                                ? sitem?.[field]?.oid
                                : sitem?.[field];
                        }
                    });

                    deleteAttrRawList && item?.attrRawList && delete item.attrRawList;

                    if (deletePrefix) {
                        _.each(item, (value, key) => {
                            key && key.split('#').length > 1 && delete item[key];
                        });
                    }
                    return item;
                });
                return tableData;
            },
            // 注册提交前更改数据
            setBeforeSubmit() {
                this.$store.dispatch('bpmProcessPanel/setBeforeSubmit', {
                    key: this.processStep,
                    func: this.assembleBaseFormData
                });
            },
            // 组装baseForm数据
            assembleBaseFormData({ data }) {
                const reviewItemList = JSON.parse(this.getData())?.formJson || [];
                return new Promise((resolve) => {
                    // data.baseForm.actionName = actionName;
                    // data.baseForm.businessFormClassName = businessFormClassName;
                    data.baseForm.businessForm.reviewItemList = reviewItemList;
                    data.baseForm.businessFormJsonStr = JSON.stringify(data?.baseForm?.businessForm || {});

                    if (_.isFunction(this?.[`${this.processStep}Submit`])) {
                        this[`${this.processStep}Submit`]({ resolve, data });
                    } else {
                        resolve(data);
                    }
                });
            },
            // 校验
            validate() {
                return new Promise((resolve) => {
                    const data = this.getData();
                    let valid = true;
                    let message = null;
                    if (this.isEcrCreateEco) {
                        // const noticeData = this.$refs?.changeNotice?.tableData || [];
                        // valid = !!noticeData.length;
                        // message = this.i18n['变更通告列表数据不能为空'];
                    }
                    if (this.isEcoCreateEca) {
                        const taskData = this.$refs?.changeTask?.tableData || [];
                        valid = !!taskData.length;
                        message = this.i18n['变更任务列表数据不能为空'];
                    }

                    resolve({ valid, data, message });
                });
            },
            // 获取数据
            getData() {
                const getData = [{ oid: this.oid }];
                return JSON.stringify({ formJson: getData });
            },
            // 处理变更通告流程创建变更任务
            handleEca(data) {
                const className = 'erd.cloud.cbb.change.entity.IncludedIn';
                // const relationOid = data?.filter((item) => item.relationOid)?.map((item) => item.relationOid);
                const ids = data?.filter((item) => !item.relationOid)?.map((item) => item.oid);
                let params = {
                    className,
                    rawDataVoList: []
                };
                if (ids.length) {
                    ids?.forEach((oid) => {
                        params.rawDataVoList.push({
                            attrRawList: [
                                {
                                    attrName: 'roleAObjectRef',
                                    value: this.oid
                                },
                                {
                                    attrName: 'roleBObjectRef',
                                    value: oid
                                }
                            ]
                        });
                    });
                    ErdcKit.debounceFn(() => {
                        this.$famHttp({
                            url: '/change/saveOrUpdate',
                            method: 'POST',
                            data: params
                        }).then(() => {});
                    }, 300);
                }
            }
        }
    };
});
