define([
    'text!' + ELMP.resource('erdc-lightweight/views/list/index.html'),
    ELMP.resource('erdc-lightweight/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, viewConfig, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    // 图档类名
    const EPM_CLASSNAME = 'erd.cloud.pdm.epm.entity.EpmDocument';
    // 系统管理
    const SYS_APP_NAME = 'erdc-sysadmin-web';
    // 详情类型
    const DETAILS_TYPE = {
        HistoricalRecord: 'historicalRecord',
        TaskDetails: 'taskDetails'
    };

    return {
        name: 'LightweightList',
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js')),
            HistoricalRecord: ErdcKit.asyncComponent(
                ELMP.resource('erdc-lightweight/components/HistoricalRecord/index.js')
            ),
            TaskDetails: ErdcKit.asyncComponent(ELMP.resource('erdc-lightweight/components/TaskDetails/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-lightweight/locale/index.js'),
                // 实例
                vm: this,
                className: viewConfig?.lightweight?.className,
                defaultProps: {
                    label: 'taskStatusName',
                    value: 'taskStatus'
                },
                // 增加对象
                objectForm: {
                    visible: false,
                    // 增加对象只需要图文档一个类型
                    viewTypesList: (viewTypesList) => {
                        return _.filter(viewTypesList, (item) => item?.className === EPM_CLASSNAME);
                    }
                },
                // 任务详情/历史记录
                detailsForm: {
                    title: '',
                    visible: false,
                    type: '',
                    oid: ''
                },
                // 任务类型
                taskStatus: '',
                // 任务数据
                taskList: []
            };
        },
        computed: {
            columns() {
                return [
                    {
                        attrName: 'workerIdentifier',
                        label: this.i18n?.['工作机'],
                        fixed: 'left'
                    },
                    {
                        attrName: 'name',
                        label: this.i18n?.['任务名称'],
                        fixed: 'left'
                    },
                    {
                        attrName: 'taskType',
                        label: this.i18n?.['任务类型']
                    },
                    {
                        attrName: 'statusName',
                        label: this.i18n?.['任务状态']
                    },
                    {
                        attrName: 'identifierNo',
                        label: this.i18n?.['任务编号']
                    },
                    {
                        attrName: 'docName',
                        label: this.i18n?.['图文档名称']
                    },
                    {
                        attrName: 'docNumber',
                        label: this.i18n?.['图文档编号']
                    },
                    {
                        attrName: 'version',
                        label: this.i18n?.['版本']
                    },
                    {
                        attrName: 'containerName',
                        label: this.i18n?.['上下文']
                    },
                    {
                        attrName: 'promoterName',
                        label: this.i18n?.['用户']
                    },
                    {
                        attrName: 'updateTime',
                        label: this.i18n?.['更新时间']
                    },
                    {
                        attrName: 'historyRecords',
                        label: this.i18n?.['历史记录']
                    },
                    {
                        attrName: 'operation',
                        label: this.i18n?.['操作']
                    }
                ];
            },
            viewTableConfig() {
                return {
                    dataKey: 'res.data.records',
                    searchParamsKey: 'keyWord', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/viewer/derivedImageTask/task/taskList', // 表格数据接口
                        data: {
                            taskStatus: this.taskStatus
                        },
                        method: 'post',
                        className: this.className
                    },
                    isDeserialize: true, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: true, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            clearable: true,
                            width: '280',
                            placeholder: this.i18n?.['请输入名称或编号']
                        },
                        mainBtn: {
                            // 主要操作按钮
                            label: this.i18n?.['新增任务'],
                            icon: 'erd-iconfont erd-icon-create',
                            onclick: () => {
                                this.popover({ field: 'objectForm', visible: true });
                            }
                        },
                        secondaryBtn: [
                            {
                                label: this.i18n?.['任务设置'],
                                icon: 'erd-iconfont erd-icon-setting',
                                onclick: this.taskSetting
                            }
                        ], // 次要操作按钮
                        moreOperateList: [
                            // 更多操作按钮配置
                            {
                                label: this.i18n?.['删除'],
                                icon: 'erd-iconfont erd-icon-delete2',
                                onclick: () => {
                                    const selectData = this.$refs?.advancedTable?.fnGetCurrentSelection?.() || [];
                                    if (!selectData?.length) {
                                        return this.$message.warning(this.i18n?.['请勾选对象']);
                                    }
                                    this.deleteTask(selectData);
                                }
                            },
                            {
                                label: this.i18n?.['重启任务'],
                                icon: 'erd-iconfont erd-icon-reset',
                                onclick: () => {
                                    const selectData = this.$refs?.advancedTable?.fnGetCurrentSelection?.() || [];
                                    if (!selectData?.length) {
                                        return this.$message.warning(this.i18n?.['请勾选对象']);
                                    }
                                    this.restartTask(selectData);
                                }
                            }
                        ]
                    },
                    firstLoad: true,
                    addCheckbox: true,
                    addSeq: true,
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left', // 全局文本对齐方式
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true // 溢出隐藏显示省略号
                    },
                    slotsField: [
                        {
                            prop: 'name',
                            type: 'default'
                        },
                        {
                            prop: 'docName',
                            type: 'default'
                        },
                        {
                            prop: 'docNumber',
                            type: 'default'
                        },
                        {
                            prop: 'historyRecords',
                            type: 'default'
                        }
                    ],
                    pagination: {
                        indexKey: 'currPage'
                    },
                    columns: this.columns
                };
            }
        },
        created() {
            // 首次获取任务选框的备选值
            this.getTaskTypeList();
        },
        methods: {
            // 刷新表格
            fnRefreshTable() {
                return this.$refs?.advancedTable?.fnRefreshTable?.();
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '', callback }) {
                this[field].title = title;
                this[field].visible = visible;
                _.isFunction(callback) && callback();
            },
            // 获取任务状态
            getTaskTypeList() {
                this.$famHttp({
                    url: '/viewer/derivedImageTask/task/taskStatusList',
                    method: 'get',
                    className: this.className
                }).then((resp) => {
                    const taskList = resp?.res?.data || [];
                    this.taskList = taskList;
                });
            },
            // 查看任务详情
            viewTaskDetails({ row }) {
                this.popover({
                    field: 'detailsForm',
                    title: this.i18n?.['任务详情'],
                    visible: true,
                    callback: () => {
                        this.detailsForm.oid = row?.oid || '';
                        this.detailsForm.type = DETAILS_TYPE.TaskDetails;
                    }
                });
            },
            // 查看图文档详情
            viewEpmDetails({ row }) {
                cbbUtils.goToDetail.call(this, { oid: row?.docOid });
            },
            // 查看历史记录
            viewHistory({ row }) {
                this.popover({
                    field: 'detailsForm',
                    title: this.i18n?.['历史记录'],
                    visible: true,
                    callback: () => {
                        this.detailsForm.oid = row?.docOid || '';
                        this.detailsForm.type = DETAILS_TYPE.HistoricalRecord;
                    }
                });
            },
            // 增加对象提交前处理
            beforeSubmit(data) {
                const epmOids = _.map(data, 'oid');
                this.$famHttp({
                    url: '/viewer/derivedImageTask/task/insertTask',
                    method: 'post',
                    data: {
                        epmOids
                    },
                    className: this.className
                }).then(() => {
                    this.$message.success(this.i18n?.['新增成功']);
                    this.popover({
                        field: 'objectForm',
                        visible: false,
                        callback: () => {
                            this.fnRefreshTable();
                        }
                    });
                });
            },
            // 删除任务
            deleteTask(selectData) {
                this.$confirm(this.i18n?.['你确定要删除对象吗'], this.i18n?.['提示'], {
                    confirmButtonText: this.i18n?.['确定'],
                    cancelButtonText: this.i18n?.['取消'],
                    type: 'warning'
                }).then(() => {
                    const data = _.map(selectData, 'oid');
                    this.$famHttp({
                        url: '/viewer/derivedImageTask/task/deleteTaskRecord',
                        method: 'post',
                        data,
                        className: this.className
                    }).then(() => {
                        this.$message.success(this.i18n?.['删除成功']);
                        this.fnRefreshTable();
                    });
                });
            },
            // 重启任务
            restartTask(selectData) {
                const data = _.map(selectData, 'oid');
                this.$famHttp({
                    url: '/viewer/derivedImageTask/task/reStartTask',
                    method: 'post',
                    data,
                    className: this.className
                }).then(() => {
                    this.$message.success(this.i18n?.['重启成功']);
                    this.fnRefreshTable();
                });
            },
            // 任务设置
            taskSetting() {
                // 跳转到队列管理
                window.open('/erdc-app/erdc-sysadmin-web/index.html#/system-queue/queue', SYS_APP_NAME || window.__currentAppName__ || '');
            }
        }
    };
});
