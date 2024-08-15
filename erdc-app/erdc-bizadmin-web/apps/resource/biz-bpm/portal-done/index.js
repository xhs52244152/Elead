define(['text!' + ELMP.resource('biz-bpm/portal-done/template.html'), 'erdcloud.kit', 'underscore'], function (
    template
) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    return {
        name: 'processDone',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BpmFlowchart: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js')),
            CancelDelegationForm: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/portal-done/components/CancelDelegationForm/index.js')
            ),
            WithdrawForm: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-done/components/WithdrawForm/index.js')),
            BpmPriority: ErdcKit.asyncComponent(ELMP.resource('erdc-components/BpmPriority/index.js')),
            BpmDueData: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmDueData/index.js')),
            BpmProcessStatus: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessStatus/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/portal-done/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    '请输入流程编码，流程名称',
                    '操作',
                    '流程图',
                    '撤回',
                    '取消',
                    '流程图解',
                    '撤回',
                    '确定',
                    '请输入备注',
                    '任务回退成功',
                    '任务回退失败',
                    '取消委派',
                    '取消委派成功',
                    '取消委派失败'
                ]),
                // 流程图对象
                bpmFlowchart: {
                    visible: false,
                    title: '',
                    processDefinitionId: '',
                    processInstanceId: ''
                },
                // 撤回任务对象
                withdrawForm: {
                    visible: false,
                    title: '',
                    taskOId: ''
                },
                // 取消委派对象
                cancelDelegationForm: {
                    visible: false,
                    title: '',
                    workItemOid: ''
                },
                // 表格额外入参
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
                            value1: 'LIFECYCLE_COMPLETED'
                        }
                    ]
                },
                // 加载中
                loading: false
            };
        },
        computed: {
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: 'BpmTaskDoneView', // UserViewTable productViewTable
                    tableConfig: this.tableConfig
                };
            },
            // 视图表格配置
            tableConfig() {
                return {
                    tableRequestConfig: {
                        defaultParams: this.defaultParams
                    },
                    toolbarConfig: {
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        basicFilter: {
                            show: true
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            this.viewProcessLog(row);
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
            // 功能按钮点击事件
            actionClick(type, row) {
                const eventClick = {
                    // 流程图
                    BPM_TASK_PROCESS_IMG: this.viewFlowChart,
                    // 撤回
                    BPM_TASK_DONE_BACK: this.rollback,
                    // 取消
                    BPM_TASK_DONE_CANCLE: this.cancelDelegate
                };
                eventClick?.[type.name] && eventClick?.[type.name](row);
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'BPM_TASK_DONE_MORE',
                    objectOid: row.oid,
                    className: this.$store.getters.className('workItem')
                };
            },
            // 查看处理记录
            viewProcessLog(row) {
                let taskOId = row.oid || '';
                let { value: taskDefKey } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#nodeKey` }) || {};
                const { oid: processInstanceOId } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#processRef` }) ||
                    {};
                return this.$router.push({
                    path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                    query: {
                        taskDefKey,
                        taskOId
                    }
                });
            },
            // 获取选中数据
            getSelectedData() {
                let { fnGetCurrentSelection } = this.$refs['famViewTable'] || {};
                return fnGetCurrentSelection();
            },
            // 取消
            cancelDelegate(row) {
                this.cancelDelegationForm.workItemOid = row.oid || '';
                this.popover({ field: 'cancelDelegationForm', title: this.i18nMappingObj['取消委派'], visible: true });
            },
            // 确定取消
            cancelDelegateHandleClick() {
                let { cancelDelegationForm } = this.$refs || {},
                    { submit } = cancelDelegationForm || {};
                submit()
                    .then((resp) => {
                        let { valid, data: params } = resp || {};
                        if (valid) {
                            params.workItemOid = this.cancelDelegationForm.workItemOid;
                            this.cancelDelegateApi(params)
                                .then((res) => {
                                    if (res.success) {
                                        this.$message.success(this.i18nMappingObj['取消委派成功']);
                                        this.popover({ field: 'cancelDelegationForm' });
                                        this.refreshTable();
                                    }
                                })
                                .finally(() => {
                                    this.loading = false;
                                });
                        }
                    })
                    .catch(() => {
                        this.$message.error(this.i18nMappingObj['请输入备注']);
                    });
            },
            // 取消委派接口
            cancelDelegateApi(params) {
                this.loading = true;
                return this.$famHttp({
                    url: '/bpm/task/transferdelegate/cancle',
                    method: 'GET',
                    params
                });
            },
            // 打开弹窗
            popover({ field, visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            },
            // 撤回
            rollback(row) {
                let { value: taskOId } =
                    _.find(row.attrRawList, {
                        attrName: `${this.$store.getters.className('workItem')}#oid`
                    }) || {};
                this.withdrawForm.taskOId = taskOId || '';
                this.popover({ field: 'withdrawForm', title: this.i18nMappingObj['撤回'], visible: true });
            },
            // 确定撤回
            rollbackHandleClick() {
                let { withdrawForm } = this.$refs || {},
                    { submit } = withdrawForm || {};
                submit()
                    .then((resp) => {
                        let { valid, data: formData } = resp || {},
                            data = new FormData();
                        if (valid) {
                            formData = { ...formData, taskOId: this.withdrawForm.taskOId };
                            _.each(formData, (value, key) => {
                                data.append(key, value);
                            });
                            this.rollbackApi(data)
                                .then((res) => {
                                    if (res.success) {
                                        this.$message.success(this.i18nMappingObj['任务回退成功']);
                                        this.popover({ field: 'withdrawForm' });
                                        this.refreshTable();
                                    }
                                })
                                .finally(() => {
                                    this.loading = false;
                                });
                        }
                    })
                    .catch(() => {
                        this.$message.error(this.i18nMappingObj['请输入备注']);
                    });
            },
            // 撤回接口
            rollbackApi(data) {
                this.loading = true;
                return this.$famHttp({
                    url: '/bpm/task/rollback',
                    method: 'POST',
                    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                    data
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
