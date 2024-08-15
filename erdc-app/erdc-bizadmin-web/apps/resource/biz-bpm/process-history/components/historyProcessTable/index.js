define([
    'text!' + ELMP.resource('biz-bpm/process-history/components/historyProcessTable/index.html'),
    'css!' + ELMP.resource('biz-bpm/process-history/components/historyProcessTable/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template: template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            BpmViewTask: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmViewTask/index.js')),
            BpmFlowchart: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BpmDueData: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmDueData/index.js')),
            BpmProcessStatus: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessStatus/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'FlowChart',
                    'FlowDiagram',
                    '查看任务',
                    '历史流程',
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
                            attrName: 'processStatus',
                            oper: 'EQ',
                            value1: 'LIFECYCLE_COMPLETED'
                        }
                    ]
                }
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
                    tableKey: 'historyProcess',
                    viewTableTitle: this.i18nMappingObj['历史流程'],
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
                            operation: '80px'
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
                    // 查看任务
                    BPM_PROCESS_INSTANCE_VIEW_TASK: this.viewTask
                };
                eventClick?.[type.name] && eventClick?.[type.name](row);
            },
            // 查看任务
            viewTask(row) {
                let { oid: processInstanceId } = row || {};
                this.viewTaskForm.processInstanceId = processInstanceId;
                this.popover({ field: 'viewTaskForm', title: this.i18nMappingObj['查看任务'], visible: true });
            },
            viewFlowChart(row) {
                let { processDefDtoName = this.i18nMappingObj['流程图解'] } = row || {};
                this.bpmFlowchart.processDefinitionId = row[`${this.$store.getters.className('processInstance')}#oid`];
                this.popover({ field: 'bpmFlowchart', title: processDefDtoName, visible: true });
            },
            getActionConfig(row) {
                return {
                    name: 'BPM_HISTORY_PROCESS',
                    objectOid: row.oid,
                    className: this.$store.getters.className('processDefinition')
                };
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
                return this.$router.push({
                    path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                    query: {
                        taskDefKey: '',
                        taskOId: ''
                    }
                });
            },
            viewTaskFormVisible(visible) {
                this.viewTaskForm.visible = visible;
            }
        }
    };
});
