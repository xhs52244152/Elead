define(['text!' + ELMP.resource('biz-bpm/process-involved/template.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'processInvolved',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BpmFlowchart: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js'))
        },
        data() {
            return {
                className: this.$store.getters.className('processRecord'),
                // 流程图对象
                bpmFlowchart: {
                    visible: false,
                    title: '',
                    processDefinitionId: '',
                    processInstanceId: ''
                }
            };
        },
        computed: {
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: 'BpmProcessRecordView',
                    viewTableTitle: this.i18n.processRecords,
                    saveAs: false, // 是否显示另存为
                    tableConfig: this.tableConfig
                };
            },
            // 高级表格配置
            tableConfig() {
                return {
                    tableRequestConfig: {
                        defaultParams: {
                            conditionDtoList: [
                                {
                                    children: [
                                        {
                                            isCondition: true,
                                            logicalOperator: 'AND',
                                            sortOrder: 0,
                                            attrName: `${this.className}#createBy`,
                                            oper: 'EQ',
                                            value1: this.$store.state.app.user.id
                                        },
                                        {
                                            isCondition: true,
                                            logicalOperator: 'OR',
                                            sortOrder: 1,
                                            attrName: `${this.className}#userRef`,
                                            oper: 'EQ',
                                            value1: this.$store.state.app.user.oid
                                        }
                                    ],
                                    isCondition: false,
                                    logicalOperator: 'AND',
                                    sortOrder: 0
                                }
                            ]
                        }
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
                            this.viewProcessRecords(row);
                        }
                    },
                    slotsField: [
                        {
                            prop: 'icon',
                            type: 'default'
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ]
                };
            }
        },
        methods: {
            // 表格空数据赋值为'--'
            handlerData(tableData, callback) {
                tableData = _.map(tableData, (item) => ErdcKit.deepClone(item));
                _.each(tableData, (item) => {
                    _.each(item, (value, key) => {
                        typeof value !== 'object' && (value === '' || value === undefined) && (item[key] = '--');
                    });
                });
                callback(tableData);
            },
            // 查看流程记录
            viewProcessRecords(row) {
                let { oid: processInstanceOId } =
                    _.find(row.attrRawList, {
                        attrName: `${this.className}#procInstRef`
                    }) || '';
                return this.$router.push({
                    path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                    query: {
                        taskDefKey: '',
                        taskOId: ''
                    }
                });
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'BPM_PROCESS_RECORD_MORE',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            // 功能按钮点击事件
            actionClick(type, data) {
                const eventClick = {
                    // 流程图
                    BPM_PROCESS_INSTANCE_FLOW_DIAGRAM: this.viewFlowChart
                };
                eventClick[type.name] && eventClick[type.name](data);
            },
            // 查看流程图
            viewFlowChart(row = {}) {
                let processDefName = row[`${this.className}#procDefRef`] || this.i18n.flowChart;
                this.bpmFlowchart.title = processDefName;
                let { oid: processInstanceOId } =
                    _.find(row.attrRawList, {
                        attrName: `${this.className}#procInstRef`
                    }) || '';
                this.bpmFlowchart.processDefinitionId = processInstanceOId;
                this.bpmFlowchart.processInstanceId = processInstanceOId;
                this.popover({ field: 'bpmFlowchart', title: processDefName, visible: true });
            },
            // 打开弹窗
            popover({ field, visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            }
        }
    };
});
