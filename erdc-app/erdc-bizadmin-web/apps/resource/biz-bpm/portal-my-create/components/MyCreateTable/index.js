define([
    'text!' + ELMP.resource('biz-bpm/portal-my-create/components/MyCreateTable/index.html'),
    'css!' + ELMP.resource('biz-bpm/portal-my-create/components/MyCreateTable/index.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    return {
        template: template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            BpmFlowchart: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js')),
            BpmViewTask: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmViewTask/index.js')),
            BpmUrge: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-my-create/components/BpmUrge/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BpmDueData: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmDueData/index.js')),
            BpmProcessStatus: ErdcKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmProcessStatus/index.js')
            ),
            BpmTerminateForm: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmTerminateForm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/portal-my-create/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'flowChart',
                    'flowDiagram',
                    'all',
                    'running',
                    'pending',
                    'finish',
                    'exceptional',
                    'urging',
                    'termination',
                    'export',
                    'selectPersonnel',
                    'Notification',
                    'message',
                    'mail',
                    'content',
                    'enter',
                    'confirm',
                    'cancel',
                    'notes',
                    'enterRequired',
                    'urgedSuccessfully',
                    'terminatedSuccessfully',
                    '查看任务',
                    '催办失败',
                    '催办成功',
                    '终止成功',
                    '终止失败',
                    '请输入流程编码，流程名称'
                ]),
                // 流程图对象
                bpmFlowchart: {
                    visible: false,
                    title: '',
                    processDefinitionId: '',
                    processInstanceId: ''
                },
                // 查看任务对象
                viewTaskForm: {
                    visible: false,
                    title: '',
                    processInstanceId: ''
                },
                defaultParams: {
                    conditionDtoList: [
                        {
                            attrName: 'createBy',
                            oper: 'EQ',
                            value1: this.$store.state.app.user.id
                        }
                    ]
                },
                // 催办
                urgeForm: {
                    title: '',
                    processInstanceOid: '',
                    visible: false
                },
                // 终止
                terminateForm: {
                    title: '',
                    visible: false,
                    processInstanceOid: ''
                },
                activeForm: {
                    flowState: 'all',
                    flowIndex: 0
                },
                // 加载中
                loading: false,
                ProcessStateNumber: {}
            };
        },
        computed: {
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default'
                    },
                    // 操作
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.$store.getters.className('processInstance')}#dueDate`,
                        type: 'default'
                    },
                    {
                        prop: `${this.$store.getters.className('processInstance')}#processStatus`,
                        type: 'default'
                    }
                ];
            },
            viewTableConfig() {
                return {
                    tableKey: 'BpmLaunchRecordViewTable',
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableRequestConfig: {
                            defaultParams: this.defaultParams
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
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
                        slotsField: this.slotsField,
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
                    }
                };
            },
            leftButtonGroup() {
                let buttons = [
                    {
                        label: this.i18nMappingObj['all'],
                        state: 'all',
                        number: 0,
                        onclick: (data, index) => {
                            this.commonClick(data.state, index);
                        }
                    },
                    {
                        label: this.i18nMappingObj['running'],
                        state: 'LIFECYCLE_RUNNING',
                        number: this.ProcessStateNumber?.runningTotal || 0,
                        onclick: (data, index) => {
                            this.commonClick(data.state, index);
                        }
                    },
                    {
                        label: this.i18nMappingObj['pending'],
                        state: 'LIFECYCLE_SUSPENDED',
                        number: this.ProcessStateNumber?.suspendedTotal || 0,
                        onclick: (data, index) => {
                            this.commonClick(data.state, index);
                        }
                    },
                    {
                        label: this.i18nMappingObj['finish'],
                        state: 'LIFECYCLE_COMPLETED',
                        number: this.ProcessStateNumber?.completedTotal || 0,
                        onclick: (data, index) => {
                            this.commonClick(data.state, index);
                        }
                    },
                    {
                        label: this.i18nMappingObj['exceptional'],
                        state: 'LIFECYCLE_EXCEPTION',
                        number: this.ProcessStateNumber?.exceptionTotal || 0,
                        onclick: (data, index) => {
                            this.commonClick(data.state, index);
                        }
                    }
                ];
                return buttons;
            },
            // 插槽名称
            slotName() {
                return {
                    dueDate: `column:default:${this.$store.getters.className('processInstance')}#dueDate:content`,
                    processStatus: `column:default:${this.$store.getters.className(
                        'processInstance'
                    )}#processStatus:content`
                };
            }
        },
        created() {
            this.getProcessStateNumber();
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
            // 查看任务
            viewTask(row) {
                let { oid: processInstanceId } = row || {};
                this.viewTaskForm.processInstanceId = processInstanceId;
                this.popover({ field: 'viewTaskForm', title: this.i18nMappingObj['查看任务'], visible: true });
            },
            // 获取流程状态
            getStatus({ row }) {
                let { value: status } =
                    _.find(row.attrRawList, {
                        attrName: `${this.$store.getters.className('processInstance')}#processStatus`
                    }) || {};
                return status;
            },
            // 获取到期日期
            getDueDate({ row }) {
                let { value: dueDate } =
                    _.find(row.attrRawList, {
                        attrName: `${this.$store.getters.className('processInstance')}#dueDate`
                    }) || {};
                return dueDate;
            },
            onCommand(type, row) {
                const eventClick = {
                    // 流程图
                    BPM_PROCESS_INSTANCE_FLOW_DIAGRAM: this.viewFlowChart,
                    // 催办
                    BPM_PROCESS_INSTANCE_URGE: this.urging,
                    // 终止
                    BPM_PROCESS_INSTANCE_TERMINATE: this.termination,
                    // 导出
                    BPM_PROCESS_INSTANCE_EXPORT: this.export,
                    // 查看任务
                    BPM_PROCESS_INSTANCE_VIEW_TASK: this.viewTask
                };
                eventClick?.[type.name] && eventClick?.[type.name](row);
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'BPM_LAUNCH_RECORD_MORE',
                    objectOid: row.oid,
                    className: this.$store.getters.className('processDefinition')
                };
            },
            viewFlowChart(row) {
                let { processDefDtoName = this.i18nMappingObj['流程图解'] } = row || {};
                const oid = row[`${this.$store.getters.className('processInstance')}#oid`];
                this.bpmFlowchart.processDefinitionId = oid;
                this.bpmFlowchart.processInstanceId = oid;
                this.popover({ field: 'bpmFlowchart', title: processDefDtoName, visible: true });
            },
            // 打开弹窗
            popover({ field, visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            },
            // 查看处理记录
            viewProcessLog(row) {
                let { value: processInstanceOId } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('processInstance')}#oid` }) ||
                    {};
                let { value: taskDefKey } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('processInstance')}#nodeKey` }) || {};
                return this.$router.push({
                    path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                    query: {
                        taskDefKey,
                        taskOId: ''
                    }
                });
            },
            commonClick(state, index) {
                let conditionDtoList = this.defaultParams.conditionDtoList;
                if (conditionDtoList.length > 1 && state === 'all') {
                    conditionDtoList.splice(1, 1);
                } else if (state !== 'all') {
                    if (conditionDtoList.length === 1) {
                        conditionDtoList.push({
                            attrName: 'processStatus',
                            oper: 'EQ',
                            value1: state
                        });
                    } else {
                        conditionDtoList[1].value1 = state;
                    }
                }
                this.activeForm.flowState = state;
                this.activeForm.flowIndex = index;
                this.refreshTable();
            },
            // 催办
            urging(row) {
                this.urgeForm.processInstanceOid = row.oid || '';
                this.popover({ field: 'urgeForm', title: this.i18nMappingObj.urging, visible: true });
            },
            // 催办弹框确认
            urgeConfirm() {
                let { submit } = this.$refs?.bpmUrge || {};
                submit().then((resp) => {
                    let { valid, data = {} } = resp || {};
                    if (valid) {
                        data = {
                            ...data,
                            userOids: data.userOids.join(','),
                            processInstanceOid: this.urgeForm.processInstanceOid,
                            notifyWay: data.notifyWay.length === 2 ? '3' : data.notifyWay.join(',')
                        };
                        this.urgeConfirmApi(data)
                            .then((resp) => {
                                if (resp.success) {
                                    this.$message.success(resp?.message || this.i18nMappingObj['催办成功']);
                                    this.popover({ field: 'urgeForm' });
                                    this.refreshTable();
                                }
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    }
                });
            },
            // 催办接口
            urgeConfirmApi(data) {
                this.loading = true;
                return this.$famHttp({
                    url: '/bpm/task/urge',
                    data,
                    method: 'POST'
                });
            },
            termination(row) {
                this.terminateForm.processInstanceOid = row[`oid`] || '';
                this.popover({ field: 'terminateForm', title: this.i18nMappingObj['termination'], visible: true });
            },
            // 终止弹框确定
            terminationConfirm() {
                let { submit } = this.$refs?.terminateForm || {};
                submit().then((resp) => {
                    let { valid, data = {} } = resp || {},
                        formData = new FormData();
                    if (valid) {
                        data = { ...data, processInstanceOid: this.terminateForm.processInstanceOid };
                        _.each(data, (value, key) => {
                            formData.append(key, value);
                        });
                        this.terminationApi(formData)
                            .then((resp) => {
                                if (resp.success) {
                                    this.$message.success(resp?.message || this.i18nMappingObj['终止成功']);
                                    this.popover({ field: 'terminateForm' });
                                    this.getProcessStateNumber();
                                    this.refreshTable();
                                }
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    }
                });
            },
            // 终止接口
            terminationApi(data) {
                this.loading = true;
                return this.$famHttp({
                    url: '/bpm/task/stopTask',
                    data,
                    method: 'POST',
                    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                });
            },
            export(row) {
                // 说是用FAM的导出接口，但是FAM导出接口还没写，所以暂时不写
            },
            getProcessStateNumber() {
                this.$famHttp({
                    url: '/bpm/procinst/submitted/status/count',
                    params: {},
                    method: 'GET'
                }).then((res) => {
                    let { success, data = {} } = res || {};
                    success && (this.ProcessStateNumber = data || {});
                });
            },
            getActiveClass(btn, index) {
                return {
                    'active-button': this.activeForm.flowState === btn.state,
                    'color-primary': this.activeForm.flowState === btn.state,
                    'active-button-left': this.activeForm.flowIndex + 1 === +index,
                    'color-normal': this.activeForm.flowState !== btn.state
                };
            },
            // 刷新视图表格
            refreshTable() {
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            },
            viewTaskFormVisible(visible) {
                this.viewTaskForm.visible = visible;
            },
            // 点击刷新按钮触发
            fnControlIcon(type) {
                type === 'refresh' && this.getProcessStateNumber();
            }
        }
    };
});
