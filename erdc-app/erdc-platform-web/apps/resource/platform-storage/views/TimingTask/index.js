define([
    'erdcloud.kit',
    ELMP.resource('platform-storage/api.js'),
    ELMP.resource('platform-storage/components/CreateTimeTask/index.js'),
    'text!' + ELMP.resource('platform-storage/views/TimingTask/index.html')
], function (erdcloudKit, api, CreateTimingTask, template) {
    return {
        template,
        components: {
            CreateTimingTask,
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys([
                        'back',
                        'name',
                        'state',
                        'startTime',
                        'lastRunTime',
                        'nextRunTime',
                        'description',
                        'cronExpression',
                        'modifyStatusSuccessTip',
                        'disableStatusConfirm',
                        'pause',
                        'startUp',
                        'tip',
                        'syncStrategy',
                        'run',
                        'onPause',
                        'pause'
                    ]),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    delete: this.getI18nByKey('删除'),
                    detail: this.getI18nByKey('详情'),
                    batchDelete: this.getI18nByKey('批量删除'),
                    selectTip: this.getI18nByKey('请选择数据'),
                    deleteTip: this.getI18nByKey('deleteTip'),
                    delSuccess: this.getI18nByKey('删除成功')
                },
                siteList: [],
                appList: []
            };
        },
        computed: {
            siteCode() {
                return this.$route?.query?.siteCode ?? '';
            },
            viewTableConfig() {
                const { i18nMappingObj, siteCode } = this;

                return {
                    firstLoad: true,
                    addSeq: true,
                    addCheckbox: true,
                    addOperationCol: false,
                    columns: [
                        {
                            attrName: 'jobName',
                            label: i18nMappingObj.name,
                            minWidth: 80,
                            width: 80
                        },
                        {
                            attrName: 'status',
                            label: i18nMappingObj.state,
                            width: 80
                        },
                        {
                            attrName: 'timeExpression',
                            label: i18nMappingObj.cronExpression,
                            minWidth: 100
                        },
                        // {
                        //     attrName: 'startTime',
                        //     label: i18nMappingObj.startTime
                        // },
                        // {
                        //     attrName: 'previousTime',
                        //     label: i18nMappingObj.lastRunTime
                        // },
                        // {
                        //     attrName: 'nextTime',
                        //     label: i18nMappingObj.nextRunTime
                        // },
                        {
                            attrName: 'detail',
                            label: i18nMappingObj.detail,
                            minWidth: '100px'
                        },
                        {
                            attrName: 'jobDescription',
                            label: i18nMappingObj.description,
                            minWidth: '120px'
                        },
                        {
                            attrName: 'operation',
                            label: '操作',
                            isDisable: true,
                            fixed: 'right',
                            showOverflow: false,
                            width: '150px'
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'detail',
                            type: 'default'
                        },
                        {
                            prop: 'status',
                            type: 'default'
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ],
                    tableBaseConfig: {
                        showOverflow: true, // 溢出隐藏显示省略号
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        rowConfig: {
                            keyField: 'id'
                        }
                    },
                    toolbarConfig: {
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        },
                        showConfigCol: true,
                        showMoreSearch: false,
                        mainBtn: {
                            label: i18nMappingObj.create,
                            onclick: () => {
                                this.create();
                            }
                        }
                        // secondaryBtn: [
                        //     {
                        //         label: i18nMappingObj.batchDelete,
                        //         onclick: () => {
                        //             this.handleBatchDelete();
                        //         }
                        //     }
                        // ]
                    },
                    tableRequestConfig: {
                        url: api.url.timingTask.list,
                        method: 'POST',
                        data: {
                            siteCode
                        },
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        transformResponse: [
                            function (data) {
                                let resData = data;
                                try {
                                    resData = data && JSON.parse(data);
                                    resData.data = {
                                        records: resData.data
                                    };
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    pagination: {
                        showPagination: false,
                        pageSize: 20
                    }
                };
            }
        },
        created() {
            this.$nextTick(() => {
                this.tableHeight = document.body.clientHeight - 188;
            });
            this.getAllSites();
            this.getAppList();
        },
        methods: {
            // 返回
            goBack() {
                this.$router.back();
            },
            refreshTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            create() {
                this.$refs.editRef.show();
            },
            handleEdit(data) {
                this.$refs.editRef.show(data);
            },
            /**
             * 批量删除
             */
            handleDelete(data) {
                const { i18nMappingObj } = this;

                this.$confirm(this.i18nMappingObj.deleteTip, this.i18nMappingObj.tip, {
                    confirmButtonText: i18nMappingObj.confirm,
                    cancelButtonText: i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.deletedRequest(data.id);
                });
            },
            deletedRequest(id) {
                api.timingTask.del(id).then((res) => {
                    if (res.code === '200') {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.delSuccess,
                            showClose: true
                        });
                        this.refreshTable();
                    }
                });
            },
            /**
             * 定时任务启用
             */
            handleTaskEnable(row) {
                api.timingTask
                    .setTaskEnable(row.id)
                    .then((res) => {
                        if (res.success) {
                            this.$message({
                                message: this.i18nMappingObj.modifyStatusSuccessTip,
                                type: 'success'
                            });
                            this.refreshTable();
                        }
                    })
                    .catch((res) => {
                        // this.$message({
                        //     message: res.data.message,
                        //     type: 'warning'
                        // });
                    });
            },
            /**
             * 定时任务禁用
             */
            handleTaskDisable(row) {
                const { i18nMappingObj } = this;

                this.$confirm(i18nMappingObj.disableStatusConfirm, i18nMappingObj.tip, {
                    confirmButtonText: i18nMappingObj.confirm,
                    cancelButtonText: i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    api.timingTask
                        .setTaskDisable(row.id)
                        .then((res) => {
                            if (res.success) {
                                this.$message({
                                    message: i18nMappingObj.modifyStatusSuccessTip,
                                    type: 'success',
                                    showClose: true
                                });
                                this.refreshTable();
                            }
                        })
                        .catch((res) => {
                            // this.$message({
                            //     message: res.data.message,
                            //     type: 'warning',
                            //     showClose: true,
                            // });
                        });
                });
            },
            getAllSites() {
                api.site.list().then((res) => {
                    if (res.success) {
                        this.siteList = res.data;
                    }
                });
            },
            getAppList() {
                api.app.list().then((res) => {
                    if (res.success) {
                        this.appList = res.data;
                    }
                });
            }
        }
    };
});
