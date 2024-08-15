define([
    'text!' + ELMP.resource('system-queue/components/QueueList/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('system-queue/components/QueueList/style.css')
], function (template, utils) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            // 显示隐藏
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },

            // oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },

            // data
            data: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            QueueForm: ErdcKit.asyncComponent(ELMP.resource('system-queue/components/QueueForm/index.js')),
            InstanceList: ErdcKit.asyncComponent(ELMP.resource('system-queue/components/InstanceList/index.js'))
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-queue/locale/index.js'),
                searchVal: '',
                listData: [],
                total: 0,
                pageSize: 20,
                currentPage: 1,
                visibleDropdown: false,
                tableHeight: $(window).height() - 224,
                visible: false,
                visibleInstanceList: false,
                formTitle: '创建',
                jobId: '',
                type: 'create',
                instanceData: {},
                pulldownList: [],
                loading: false
            };
        },
        watch: {
            oid: function (n, o) {
                if (n) {
                    this.currentPage = 1;
                    this.refresh();
                }
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            columns() {
                return [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'id',
                        title: this.i18n.queueId,
                        minWidth: '160',
                        width: '120'
                    },
                    {
                        prop: 'jobName',
                        title: this.i18n.queueName,
                        minWidth: '160'
                    },
                    {
                        prop: 'jobDescription',
                        title: this.i18n.queueDescription,
                        minWidth: '160',
                        width: '160'
                    },
                    {
                        prop: 'timingName',
                        title: this.i18n.timingInformation,
                        minWidth: '160',
                        width: '160'
                    },
                    {
                        prop: 'executeTypeName',
                        title: this.i18n.executeType,
                        minWidth: '120',
                        width: '120'
                    },
                    {
                        prop: 'statusName',
                        title: this.i18n.status,
                        minWidth: '100',
                        width: '100'
                    },
                    {
                        prop: 'instanceCount',
                        title: this.i18n.instanceCount,
                        minWidth: '100',
                        width: '100'
                    },
                    {
                        prop: 'errorInstanceCount',
                        title: this.i18n.errorInstanceCount,
                        minWidth: '100',
                        width: '100'
                    },
                    {
                        prop: 'serviceDisplayName',
                        title: this.i18n.serviceName,
                        minWidth: '160',
                        width: '160'
                    },
                    {
                        prop: 'oper',
                        title: this.i18n.operation,
                        fixed: 'right',
                        minWidth: '70',
                        width: '70'
                    }
                ];
            },
            formData() {
                return this.data;
            }
        },
        mounted() {
            // this.refresh();
        },
        methods: {
            // 刷新列表
            refresh() {
                this.getListData();
            },
            getListData() {
                this.loading = true;
                this.$famHttp({
                    url: '/fam/job/listJob',
                    data: {
                        appNames: this.data.appNames || [],
                        appName: this.data.identifierNo || null,
                        index: this.currentPage,
                        pageSize: this.pageSize,
                        keyword: this.searchVal
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        const { data } = resp || [];
                        this.currentPage = data.index;
                        this.pageSize = data.pageSize || 20;
                        this.total = Number(data.totalItems);

                        this.listData = data.data.map((item) => {
                            item.visibleDropdown = false;
                            return item;
                        });
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || '获取列表失败'
                        });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            sizeChange(val) {
                this.pageSize = val;
                this.currentPage = 1;
                this.refresh();
            },
            currentChange(val) {
                this.currentPage = val;
                this.refresh();
            },
            visibleChange(visible, data) {
                const { row } = data;
                this.$set(row, 'visibleDropdown', visible);
                const pulldownList = [
                    {
                        label: this.i18n.edit,
                        actionName: 'edit',
                        disabled: false,
                        hide: false
                    },
                    {
                        label: this.i18n.running,
                        actionName: 'running',
                        disabled: false,
                        hide: false
                    },
                    {
                        label: this.i18n.enable,
                        actionName: 'enable',
                        disabled: false,
                        hide: row.status == '1' ? true : false
                    },
                    {
                        label: this.i18n.stop,
                        actionName: 'stop',
                        disabled: false,
                        hide: row.status == '1' ? false : true
                    },
                    {
                        label: this.i18n.taskList,
                        actionName: 'list-instance',
                        disabled: false,
                        hide: false,
                        divided: true
                    },
                    {
                        label: this.i18n.copy,
                        actionName: 'copy',
                        disabled: false,
                        hide: false
                    },
                    {
                        label: this.i18n.delete,
                        actionName: 'delete',
                        disabled: false,
                        hide: false
                    }
                ];
                this.$set(row, 'pulldownList', pulldownList);
            },
            onCommand(command, data) {
                const commandEdit = {
                    'edit': this.onEdit,
                    'running': this.onRun,
                    'enable': this.onEnable,
                    'stop': this.onStop,
                    'list-instance': this.onInstance,
                    'copy': this.onCopy,
                    'delete': this.onDelete
                };

                commandEdit[command](data);
            },
            onInput() {
                utils.debounceFn(() => {
                    this.currentPage = 1;
                    this.refresh();
                }, 300);
            },
            onCreate() {
                this.formTitle = this.i18n.create;
                this.visible = true;
                this.type = 'create';
                this.jobId = '';
            },
            onEdit(data) {
                const { row } = data;
                this.formTitle = this.i18n.edit;
                this.type = 'update';
                this.visible = true;
                this.jobId = row.id || '';
            },
            onRun(data) {
                const { row } = data;
                this.$famHttp({
                    url: '/fam/job/run' + `?jobId=${row.id}`,
                    method: 'POST'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18n.runningSuccessfully,
                            showClose: true
                        });
                        this.refresh();
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || this.i18n.runningFailed,
                            showClose: true
                        });
                    });
            },
            onEnable(data) {
                const { row } = data;
                this.$famHttp({
                    url: '/fam/job/enableJob' + '?jobId=' + row.id,
                    method: 'POST'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18n.enableSuccessfully,
                            showClose: true
                        });
                        this.refresh();
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || this.i18n.enableFailed,
                            showClose: true
                        });
                    });
            },
            onStop(data) {
                const { row } = data;
                this.$famHttp({
                    url: '/fam/job/disableJob' + '?jobId=' + row.id,
                    method: 'POST'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18n.stopSuccessfully,
                            showClose: true
                        });
                        this.refresh();
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || this.i18n.stopFailed,
                            showClose: true
                        });
                    });
            },
            onInstance(data) {
                const { row } = data;
                this.visibleInstanceList = true;
                this.instanceData = row;
            },
            onCopy(data) {
                const { row } = data;
                this.formTitle = this.i18n.copy;
                this.type = 'copy';
                this.visible = true;
                this.jobId = row.id || '';
            },
            onDelete(data) {
                const { row } = data;

                this.$confirm(this.i18n.confirmDelete, this.i18n.confirmDelete, {
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    type: 'warning'
                }).then((_) => {
                    this.$famHttp({
                        url: '/fam/job/deleteJob',
                        params: {
                            jobId: row.id
                        },
                        method: 'DELETE'
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.i18n.deletedSuccessfully,
                                showClose: true
                            });
                            this.refresh();
                        })
                        .catch((error) => {
                            this.$message({
                                type: 'error',
                                message: error?.data?.message || this.i18n.deleteFailed,
                                showClose: true
                            });
                        });
                });
            },
            onSubmit(data) {
                this.refresh();
            }
        }
    };
});
