define([
    'text!' + ELMP.resource('biz-bpm/portal-todo/template.html'),
    'css!' + ELMP.resource('biz-bpm/portal-todo/index.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'processTodo',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            DetailLayout: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-todo/components/DetailLayout/index.js')),
            BpmFlowchart: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js')),
            BpmDelegateForm: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmDelegateForm/index.js')),
            BatchApproval: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/portal-todo/components/BatchApproval/index.js')
            ),
            BpmPriority: ErdcKit.asyncComponent(ELMP.resource('erdc-components/BpmPriority/index.js')),
            BpmDueData: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmDueData/index.js')),
            BpmProcessStatus: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessStatus/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/portal-todo/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'layout',
                    'tableView',
                    'detailView',
                    'application',
                    'batchProcessing',
                    'delegate',
                    '请勾选要批量委派的数据！',
                    '知会任务无需处理！',
                    '询问任务无法批量处理！',
                    '询问我的任务不能被委派！',
                    '确定',
                    '取消',
                    '任务委派成功',
                    '任务委派失败',
                    'handle',
                    'flowchart',
                    '流程图解',
                    '请输入流程编码，流程名称',
                    '批量处理成功',
                    '批量处理失败'
                ]),
                // 加载中
                loading: false,
                // 详情布局对象
                detailedLayout: {
                    // 是否显示
                    visible: false,
                    // 高度
                    height: 600,
                    // 加载中
                    loading: false
                },
                // 当前应用
                appName: '',
                // 当前布局
                layout: 'tableLayout',
                // 流程图对象
                bpmFlowchart: {
                    visible: false,
                    title: '',
                    processDefinitionId: '',
                    processInstanceId: ''
                },
                // 委派弹窗对象
                delegateForm: {
                    title: '',
                    taskOId: [],
                    visible: false
                },
                // 批量处理弹窗对象
                batchApproval: {
                    title: '',
                    taskIds: [],
                    visible: false
                },
                defaultParams: {
                    conditionDtoList: [
                        {
                            attrName: `${this.$store.getters.className('workItem')}#completedByRef`,
                            oper: 'CURRENT_USER',
                            value1: this.$store.state.app.user.oid
                        },
                        {
                            attrName: `${this.$store.getters.className('workItem')}#status`,
                            oper: 'EQ',
                            value1: 'LIFECYCLE_RUNNING'
                        }
                    ]
                },
                // 详情布局选中数据
                selected: []
                // 表格固定高度
            };
        },
        computed: {
            // 视图表格左侧按钮列表
            leftButtonList() {
                return [
                    {
                        id: 'layout',
                        label: this.i18nMappingObj['layout'],
                        disabled: this.getVxeTableData(),
                        value: this.layout,
                        handleClick: (val) => {
                            this.layout = val;
                        },
                        options: this.layoutList
                    }
                ];
            },
            // 布局下拉列表
            layoutList() {
                return [
                    {
                        label: this.i18nMappingObj['tableView'],
                        value: 'tableLayout'
                    },
                    {
                        label: this.i18nMappingObj['detailView'],
                        value: 'detailLayout'
                    }
                ];
            },
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: 'BpmTaskToDoView', // UserViewTable productViewTable
                    tableConfig: this.tableConfig
                };
            },
            // 视图表格配置
            tableConfig() {
                return {
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        defaultParams: this.defaultParams // body参数
                    },
                    toolbarConfig: {
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        basicFilter: {
                            show: true
                        },
                        actionConfig: {
                            name: 'BPM_TASK_TODO_OPERATE',
                            containerOid: this.$store.state.space?.context?.oid || '',
                            className: this.$store.getters.className('workItem')
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            this.dealWith(row, 'false');
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: '60px'
                    },
                    slotsField: [
                        {
                            prop: 'icon',
                            type: 'default'
                        },
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        },
                        {
                            prop: `${this.$store.getters.className('workItem')}#priority`,
                            type: 'default'
                        },
                        {
                            prop: `${this.$store.getters.className('workItem')}#dueDate`,
                            type: 'default'
                        },
                        {
                            prop: `${this.$store.getters.className('workItem')}#processStatus`,
                            type: 'default'
                        }
                    ],
                    tableBaseEvent: {
                        scroll: _.throttle(() => {
                            let arr =
                                _.chain(this.$refs)
                                    .pick((value, key) => key.indexOf('FamActionPulldown') > -1)
                                    .values()
                                    .value() || [];
                            this.$nextTick(() => {
                                _.each(arr, (item) => {
                                    let [sitem = {}] = item?.$refs?.actionPulldowm || [];
                                    sitem.hide && sitem.hide();
                                });
                            });
                        }, 100)
                    }
                };
            },
            // 插槽名称
            slotName() {
                return {
                    priority: `column:default:${this.$store.getters.className('workItem')}#priority:content`,
                    dueDate: `column:default:${this.$store.getters.className('workItem')}#dueDate:content`,
                    processStatus: `column:default:${this.$store.getters.className('workItem')}#processStatus:content`
                };
            }
        },
        watch: {
            '$route.query.isRefresh': {
                handler: function (n) {
                    n && this.refreshTable();
                },
                immediate: true
            },
            // 当前应用
            'appName'(newVal) {
                if (newVal) {
                    if (
                        _.some(this.defaultParams.conditionDtoList, {
                            attrName: `${this.$store.getters.className('workItem')}#appName`
                        })
                    ) {
                        let obj =
                            _.find(this.defaultParams.conditionDtoList, {
                                attrName: `${this.$store.getters.className('workItem')}#appName`
                            }) || {};
                        obj.value1 = newVal;
                    } else {
                        this.defaultParams.conditionDtoList.push({
                            attrName: `${this.$store.getters.className('workItem')}#appName`,
                            oper: 'EQ',
                            value1: newVal
                        });
                    }
                } else {
                    this.defaultParams.conditionDtoList = _.filter(
                        this.defaultParams.conditionDtoList,
                        (item) => item.attrName !== `${this.$store.getters.className('workItem')}#appName`
                    );
                }
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            },
            // 当前布局
            'layout'(n) {
                this.detailedLayout.visible = n === 'detailLayout';
            }
        },
        methods: {
            // 表格空数据赋值为'--'
            handlerData(tableData, callback) {
                tableData = _.map(tableData, (item) => ErdcKit.deepClone(item)) || [];
                _.each(tableData, (item) => {
                    _.each(item, (value, key) => {
                        typeof value !== 'object' && (value === '' || value === undefined) && (item[key] = '--');
                    });
                });
                callback(tableData);
            },
            // 详情布局列表数据选中改变
            updateSelected(selected) {
                this.selected = selected;
            },
            // 详情布局分页切换改变
            currentChange(pageIndex) {
                let { fnCurrentPageChange } =
                    this.$refs?.famViewTable?.getTableInstance('advancedTable', 'instance') || {};
                this.selected = [];
                fnCurrentPageChange(pageIndex);
            },
            // 获取流程状态
            getStatus({ row }) {
                let { value: status } =
                    _.find(row.attrRawList, {
                        attrName: `${this.$store.getters.className('workItem')}#processStatus`
                    }) || {};
                return status;
            },
            // 获取到期日期
            getDueDate({ row }) {
                let { value: dueDate } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#dueDate` }) || {};
                return dueDate;
            },
            // 获取优先级
            getPriority({ row }) {
                let title = row[`${this.$store.getters.className('workItem')}#priority`] || '';
                let { value: priority } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#priority` }) ||
                    {};
                priority = +(priority ?? 0);
                return {
                    title,
                    priority
                };
            },
            // 获取表格数据
            getVxeTableData() {
                return false;
            },
            // 功能按钮点击事件
            actionClick(type, row) {
                const eventClick = {
                    // 批量处理
                    BPM_TASK_TODO_BATCH_OPERATE: this.batchProcessing,
                    // 批量委派
                    BPM_TASK_TODO_DELEGATE: this.batchDelegation,
                    // 流程图
                    BPM_TASK_PROCESS_IMG: this.viewFlowChart,
                    // 处理
                    BPM_TASK_TODO_OPERATE: this.dealWith
                };
                eventClick?.[type.name] && eventClick?.[type.name](row);
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'BPM_TASK_TODO_MORE',
                    objectOid: row.oid,
                    className: this.$store.getters.className('workItem')
                };
            },
            // 获取选中数据
            getSelectedData() {
                let { fnGetCurrentSelection } = this.$refs['famViewTable'] || {};
                return fnGetCurrentSelection();
            },
            // 批量处理
            batchProcessing() {
                let ids = this.getSelectedData();
                if (this.detailedLayout.visible) {
                    ids = this.selected;
                }
                if (!ids.length) {
                    let { getTableInstance } = this.$refs['famViewTable'] || {};
                    let { instance } = getTableInstance('vxeTable') || {};
                    ({ tableData: ids } = instance || {});
                    ids = _.filter(ids, (row) => {
                        let { value } =
                            _.find(row.attrRawList, {
                                attrName: `${this.$store.getters.className('workItem')}#taskType`
                            }) || {};
                        return !(value === 'informed' || value === 'inquire');
                    });
                }
                if (
                    _.some(ids, (row) => {
                        let { value } =
                            _.find(row.attrRawList, {
                                attrName: `${this.$store.getters.className('workItem')}#taskType`
                            }) || {};
                        return value === 'informed';
                    })
                ) {
                    return this.$message.warning(this.i18nMappingObj['知会任务无需处理！']);
                }
                if (
                    _.some(ids, (row) => {
                        let { value } =
                            _.find(row.attrRawList, {
                                attrName: `${this.$store.getters.className('workItem')}#taskType`
                            }) || {};
                        return value === 'inquire';
                    })
                ) {
                    return this.$message.warning(this.i18nMappingObj['询问任务无法批量处理！']);
                }
                this.batchApproval.taskIds = _.map(ids, (row) => {
                    let { value } =
                        _.find(row.attrRawList, {
                            attrName: `${this.$store.getters.className('workItem')}#assignedTaskId`
                        }) || {};
                    return value;
                });
                this.popover({ field: 'batchApproval', title: this.i18nMappingObj['batchProcessing'], visible: true });
            },
            // 确定批量处理
            batchApprovalClick() {
                let { batchApproval = {} } = this.$refs || {},
                    { submitBatchApproval } = batchApproval;
                let { valid, data = {} } = submitBatchApproval() || {};
                if (valid) {
                    this.submitBatchApproval(data)
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success(this.i18nMappingObj['批量处理成功']);
                                this.popover({ field: 'batchApproval' });
                                this.refreshTable();
                            }
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                }
            },
            // 批量审批接口
            submitBatchApproval(data) {
                this.loading = true;
                return this.$famHttp({
                    url: '/bpm/task/batchCompleteTask',
                    method: 'POST',
                    data
                });
            },
            // 批量委派
            batchDelegation() {
                let ids = this.getSelectedData();
                if (this.detailedLayout.visible) {
                    ids = this.selected;
                }
                if (!ids.length) {
                    // "请勾选要批量委派的数据！"
                    return this.$message.warning(this.i18nMappingObj['请勾选要批量委派的数据！']);
                }
                if (
                    _.some(ids, (row) => {
                        let { value } =
                            _.find(row.attrRawList, {
                                attrName: `${this.$store.getters.className('workItem')}#taskType`
                            }) || {};
                        return value === 'informed';
                    })
                ) {
                    return this.$message.warning(this.i18nMappingObj['知会任务无需处理！']);
                }
                // if (_.some(ids, row => {
                //     let { value } = _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#taskType` }) || {};
                //     return value === 'inquire' || !!row.parentTaskId;
                // })) {
                //     return this.$message.warning(this.i18nMappingObj['询问我的任务不能被委派！']);
                // }
                // this.delegateForm.taskOId = _.map(ids, row => {
                //     let { value } = _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#assignedTaskId` }) || {};
                //     return value;
                // });
                this.delegateForm.taskOId = _.map(ids, 'oid');
                this.popover({ field: 'delegateForm', title: this.i18nMappingObj['delegate'], visible: true });
            },
            // 委派前校验
            delegateCheck() {
                let { delegateForm = {} } = this.$refs || {},
                    { submit } = delegateForm;
                submit().then((resp) => {
                    if (resp.valid) {
                        this.commitDelegate({ ...resp.data, taskOId: this.delegateForm.taskOId })
                            .then((resp) => {
                                if (resp.success) {
                                    this.$message.success(this.i18nMappingObj['任务委派成功']);
                                    this.popover({ field: 'delegateForm' });
                                    this.refreshTable();
                                }
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    }
                });
            },
            // 提交委派
            commitDelegate(data) {
                this.loading = true;
                return this.$famHttp({
                    url: '/bpm/task/transferDelegate',
                    method: 'POST',
                    data
                });
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            },
            // 处理
            dealWith(row, readonly = 'false') {
                let taskOId = row.oid || '';
                let { oid: processInstanceOId } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#processRef` }) ||
                    {};
                let { value: taskDefKey } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#nodeKey` }) || {};
                return this.$router.push({
                    path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                    query: {
                        taskDefKey,
                        taskOId,
                        readonly: readonly
                    }
                });
            },
            // 查看流程图
            viewFlowChart(row) {
                let { oid: processDefinitionId } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#processRef` }) ||
                    {};
                let { displayName = this.i18nMappingObj['流程图解'] } =
                    _.find(row.attrRawList, {
                        attrName: `${this.$store.getters.className('workItem')}#processDefRef`
                    }) || {};
                this.bpmFlowchart.processDefinitionId = processDefinitionId;
                this.bpmFlowchart.processInstanceId = processDefinitionId;
                this.popover({ field: 'bpmFlowchart', title: displayName, visible: true });
            },
            // 刷新视图表格
            refreshTable() {
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            }
        }
    };
});
