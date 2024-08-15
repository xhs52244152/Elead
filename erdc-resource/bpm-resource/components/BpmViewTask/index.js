define([
    'text!' + ELMP.resource('bpm-resource/components/BpmViewTask/template.html'),
    'css!' + ELMP.resource('bpm-resource/components/BpmViewTask/index.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    return {
        name: 'BpmViewTask',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BpmDelegateForm: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmDelegateForm/index.js')),
            BpmPriority: ErdcKit.asyncComponent(ELMP.resource('erdc-components/BpmPriority/index.js')),
            BpmDueData: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmDueData/index.js')),
            BpmProcessStatus: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessStatus/index.js'))
        },
        props: {
            // 流程实例oid
            processInstanceId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmViewTask/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    '请输入流程编码，流程标题，流程名称',
                    '取消',
                    '确定',
                    '知会任务无需处理！',
                    '询问我的任务不能被委派！',
                    '任务委派成功',
                    '任务委派失败',
                    '委派'
                ]),
                // 委派对象
                delegateForm: {
                    title: '',
                    taskOId: [],
                    visible: false
                },
                // 加载中
                loading: false
            };
        },
        computed: {
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: 'BpmProcessTaskView', // UserViewTable productViewTable
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
                            show: false, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18nMappingObj['请输入流程编码，流程标题，流程名称'], // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '320'
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
            },
            // 额外参数
            defaultParams() {
                return {
                    conditionDtoList: [
                        {
                            attrName: `${this.$store.getters.className('workItem')}#processRef`,
                            oper: 'EQ',
                            value1: this.processInstanceId
                        }
                    ]
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
                    // 处理
                    BPM_TASK_TODO_OPERATE: this.dealWith,
                    // 委派
                    BPM_TASK_TODO_DELEGATE: this.delegate
                };
                eventClick?.[type.name] && eventClick?.[type.name](row);
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'BPM_PROCESS_TASK_OPERATE',
                    objectOid: row.oid,
                    className: this.$store.getters.className('workItem')
                };
            },
            // 处理
            dealWith(row) {
                const { oid: taskOId } = row || {};
                const taskDefKey = row[`${this.$store.getters.className('workItem')}#nodeKey`] || '';
                const { oid: processInstanceOId } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#processRef` }) ||
                    {};
                this.$emit('close-dialog', false);
                return this.$router.push({
                    path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                    query: {
                        taskDefKey,
                        taskOId
                    }
                });
            },
            // 查看处理记录
            viewProcessLog(row) {
                this.dealWith(row);
            },
            // 委派
            delegate(row) {
                let { value } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#taskType` }) ||
                    {};
                if (value === 'informed') {
                    return this.$message.warning(this.i18nMappingObj['知会任务无需处理！']);
                }
                if (value === 'inquire' || !!row.parentTaskId) {
                    return this.$message.warning(this.i18nMappingObj['询问我的任务不能被委派！']);
                }
                // ({ value = '' } = _.find(row.attrRawList, { attrName: `${this.$store.getters.className('workItem')}#assignedTaskId` }) || {});
                // this.delegateForm.taskOId = [value];
                this.delegateForm.taskOId = [row['oid']];
                this.popover({ field: 'delegateForm', title: this.i18nMappingObj['委派'], visible: true });
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
            // 确定委派
            delegateHandleClick() {
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
                                } else {
                                    this.$message.error(this.i18nMappingObj['任务委派失败']);
                                }
                            })
                            .catch(() => {
                                this.$message.error(this.i18nMappingObj['任务委派失败']);
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    }
                });
            },
            // 打开弹窗
            popover({ field, visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            },
            // 刷新表格
            refreshTable() {
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            }
        }
    };
});
