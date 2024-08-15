define([
    'text!' + ELMP.resource('biz-bpm/portal-todo/components/BatchApproval/template.html'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    return {
        name: 'BatchApproval',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            BpmAvatar: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmAvatar/index.js'))
        },
        props: {
            taskIds: {
                type: Array,
                default() {
                    return [];
                },
                required: true
            },
            readonly: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/portal-todo/components/BatchApproval/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    '组件提示',
                    '移除',
                    '处理意见',
                    '已阅，同意',
                    '已阅，不同意',
                    '流程编码',
                    '流程名称',
                    '流程模板',
                    '节点名称',
                    '发起人',
                    '发起时间',
                    '处理结果',
                    '操作',
                    '请填写处理意见',
                    '路由为空，请选择路由后，提交流程',
                    '请勾选批量审批的任务',
                    '请选择路由',
                    '请勾选要移除的数据'
                ]),
                // 已选数据
                selectedData: [],
                // 表格数据
                tableData: [],
                // 源数据
                sourceData: [],
                form: {
                    textarea: ''
                }
            };
        },
        computed: {
            // 列
            column() {
                return [
                    {
                        type: 'checkbox',
                        fixed: 'left',
                        width: '40',
                        align: 'center'
                    },
                    {
                        prop: 'processNumber', // 列数据字段key
                        title: this.i18nMappingObj['流程编码'], // 列头部标题
                        minWidth: '120' // 列宽度
                    },
                    {
                        prop: 'processDefinitionName',
                        title: this.i18nMappingObj['流程模板'], // 列头部标题
                        minWidth: '160' // 列宽度
                    },
                    {
                        prop: 'processName',
                        title: this.i18nMappingObj['流程名称'], // 列头部标题
                        minWidth: '160' // 列宽度
                    },
                    {
                        prop: 'taskName',
                        title: this.i18nMappingObj['节点名称'], // 列头部标题
                        minWidth: '100' // 列宽度
                    },
                    {
                        prop: 'assignee',
                        title: this.i18nMappingObj['发起人'], // 列头部标题
                        minWidth: '120' // 列宽度
                    },
                    {
                        prop: 'launchTime',
                        title: this.i18nMappingObj['发起时间'], // 列头部标题
                        minWidth: '120' // 列宽度
                    },
                    {
                        prop: 'route',
                        title: this.i18nMappingObj['处理结果'], // 列头部标题
                        minWidth: '160' // 列宽度
                    },
                    {
                        prop: 'operation',
                        title: this.i18nMappingObj['操作'], // 列头部标题
                        width: '60' // 列宽度
                    }
                ];
            },
            dataList() {
                return [
                    {
                        field: 'textarea',
                        component: 'erd-input',
                        label: this.i18nMappingObj['处理意见'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 500,
                            type: 'textarea',
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['处理意见'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'approvalOpinion',
                        label: ' ',
                        required: false,
                        disabled: false,
                        hidden: false,
                        slots: {
                            component: 'approvalOpinion'
                        },
                        col: 24
                    }
                ];
            },
            // 处理意见列表
            textareaList() {
                return [
                    {
                        label: this.i18nMappingObj['已阅，同意'],
                        value: this.i18nMappingObj['已阅，同意']
                    },
                    {
                        label: this.i18nMappingObj['已阅，不同意'],
                        value: this.i18nMappingObj['已阅，不同意']
                    }
                ];
            }
        },
        mounted() {
            this.fetchGroupedApprovalObjects(this.taskIds).then((resp) => {
                let { success, data = [] } = resp || {};
                if (success) {
                    this.resolveTableData(data);
                }
            });
        },
        methods: {
            // 移除选中数据
            removeSelectClick() {
                if (!this.selectedData.length) {
                    return this.$message.info(this.i18nMappingObj['请勾选要移除的数据']);
                }
                this.removeClick(this.selectedData);
                this.selectedData = [];
            },
            // 移除单条数据
            removeClick(data) {
                for (let i = data.length - 1; i > -1; i--) {
                    let row = data[i] || {};
                    inter: for (let j = this.sourceData.length - 1; j > -1; j--) {
                        let { taskList = [] } = this.sourceData[j] || [];
                        let index = _.findIndex(taskList, row);
                        if (index !== -1) {
                            taskList.splice(index, 1);
                            break inter;
                        }
                    }
                }
                this.resolveTableData(this.sourceData);
            },
            // 复选框选中数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            },
            fetchGroupedApprovalObjects(taskIds) {
                return this.$famHttp({
                    url: '/bpm/task/queryBatchCompleteTaskList',
                    method: 'POST',
                    data: taskIds
                });
            },
            resolveTableData(data) {
                for (let index = 0; index < data.length; index++) {
                    let { taskList = [], formProperties = [] } = data[index] || {};
                    for (let sindex = 0; sindex < taskList.length; sindex++) {
                        let sitem = taskList[sindex] || {};
                        taskList[sindex] = {
                            ...sitem,
                            formDataMapList: !formProperties.length
                                ? []
                                : _.sortBy(formProperties[0]?.formDataMapList ?? [], 'sort'),
                            categoryGroup: index,
                            route: sitem.route || null,
                            selectUserFlag: sitem.selectUserFlag || 'N',
                            rowspan: sindex % taskList.length === 0 ? taskList.length : 0,
                            processPromoterInfo: (sitem.extendParam?.processPromoter || [])[sitem.processPromoter]
                        };
                    }
                }
                this.sourceData = data;
                this.tableData = _.flatten(_.map(data, 'taskList'), true);
            },
            spanMethod({ row, _rowIndex, column, visibleData }) {
                let fields = ['route'];
                let cellValue = row['procDefId'];
                if (cellValue && fields.includes(column.field)) {
                    let prevRow = visibleData[_rowIndex - 1];
                    let nextRow = visibleData[_rowIndex + 1];
                    if (prevRow && prevRow['procDefId'] === cellValue) {
                        return { rowspan: 0, colspan: 0 };
                    } else {
                        let countRowspan = 1;
                        while (nextRow && nextRow['procDefId'] === cellValue) {
                            nextRow = visibleData[++countRowspan + _rowIndex];
                        }
                        if (countRowspan > 1) {
                            return { rowspan: countRowspan, colspan: 1 };
                        }
                    }
                }
            },
            tableRowClassName({ row }) {
                if (row.selectUserFlag === 'Y') {
                    return {
                        color: 'red'
                    };
                }
                return '';
            },
            // 单条数据路由选择
            approvalResultsRoute({ categoryGroup, route }) {
                _.each(this.tableData, (item) => {
                    item.categoryGroup === categoryGroup && (item.route = route);
                });
                let taskIds = _.chain(this.tableData)
                    .filter((item) => item.categoryGroup === categoryGroup)
                    .map('taskId')
                    .value()
                    .join(',');
                this.batchApprovalWithRoute(taskIds, route).then((resp) => {
                    let { success, data = [] } = resp || {};
                    _.each(this.tableData, (item) => {
                        if (success && item.categoryGroup === categoryGroup && _.indexOf(data, item.taskId) !== -1) {
                            item.selectUserFlag = 'Y';
                        } else {
                            item.selectUserFlag = 'N';
                        }
                    });
                });
            },
            // 批量路由改变
            batchApprovalWithRoute(taskIds, routeFlag) {
                return this.$famHttp({
                    url: `/bpm/task/tasks/grouped/${taskIds}/${routeFlag}`,
                    method: 'GET'
                });
            },
            // 批量审批校验
            submitBatchApproval() {
                if (!this.form.textarea.trim()) {
                    return this.$message.error(this.i18n.pleaseFillInsSuggestion); // 请填写处理意见
                }
                if (!this.selectedData.length) {
                    return this.$message.error(this.i18n.pleaseCheckApproval); // 请勾选批量审批的任务
                }
                if (_.some(this.selectedData, (item) => item.formDataMapList.length && item.route === null)) {
                    return this.$message.error(this.i18n.pleaseSelectRoute); // 路由为空，请选择路由后，提交流程
                }
                // let completeTasks = _.filter(this.selectedData, (item) => item.selectUserFlag === 'N');
                // if (!completeTasks.length) {
                //     return this.$message.error(this.i18n.pleaseCheckApproval); // 请勾选批量审批的任务
                // }
                // 组装数据
                const completeTasks = this.setDataTree(this.selectedData);
                return {
                    valid: true,
                    data: completeTasks
                };
            },
            // 组装批量审批入参
            setDataTree(completeTasks) {
                let res = {};
                _.each(completeTasks, (item) => {
                    if (_.isEmpty(res[item.categoryGroup])) {
                        res[item.categoryGroup] = { taskIds: [], comment: null, routeFlag: null };
                    }
                    res[item.categoryGroup].taskIds.push(item.taskId);
                    res[item.categoryGroup].comment === null && (res[item.categoryGroup].comment = this.form.textarea);
                    res[item.categoryGroup].routeFlag === null && (res[item.categoryGroup].routeFlag = item.route);
                });
                return _.values(res);
            }
        }
    };
});
