define([
    'vue',
    'erdcloud.kit',
    'fam:store',
    'text!' + ELMP.resource('biz-notifications/components/NotDisturb/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('biz-notifications/components/NotDisturb/index.css'),
    'underscore'
], function (Vue, erdcloudKit, store, template, utils) {
    const _ = require('underscore');
    const initFormData = {
        code: '',
        contextId: 'SYSTEM_ID',
        contextType: 1,
        enabled: true,
        silenceMax: '',
        silenceMin: '',
        DNDTime: null
    };
    return {
        template,
        props: ['row'],
        data: function () {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-notifications/locale/index.js'),
                i18nMappingObj: {
                    sendType: this.getI18nByKey('发送类型'),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    status: this.getI18nByKey('状态'),
                    DNDTime: this.getI18nByKey('免打扰时间'),
                    startTime: this.getI18nByKey('开始时间'),
                    endTime: this.getI18nByKey('结束时间'),
                    rangeSeparator: this.getI18nByKey('至'),
                    contextType: this.getI18nByKey('上下文类型'),
                    systemType: this.getI18nByKey('系统级别'),
                    projectType: this.getI18nByKey('项目级别'),
                    userType: this.getI18nByKey('用户级别'),
                    isDeleteConfirm: this.getI18nByKey('是否删除该配置'),
                    ok: this.getI18nByKey('确定'),
                    operation: this.getI18nByKey('操作'),
                    tips: this.getI18nByKey('提示'),
                    save: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    delete: this.getI18nByKey('删除'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('禁用'),
                    success: this.getI18nByKey('成功'),
                    dndMode: this.getI18nByKey('免打扰设置'),
                    back: this.getI18nByKey('返回')
                },
                listData: [],
                visibleDropdown: false,
                // 40(头高度) + 24(外容器内边距) + 32(容器内边距) + 20(返回高度) + 16(表格margin-top)
                tableHeight: document.body.clientHeight - 40 - 24 - 32 - 32 - 16,
                loading: false,
                visibleDialog: false,
                dialogTitle: '',
                formData: Object.assign({}, initFormData),
                sendType: [],
                currentRow: null
            };
        },
        computed: {
            // contextType: function () {
            //     return [
            //         {
            //             text: this.i18nMappingObj.systemType,
            //             value: 1
            //         },
            //         {
            //             text: this.i18nMappingObj.projectType,
            //             value: 2
            //         },
            //         {
            //             text: this.i18nMappingObj.userType,
            //             value: 3
            //         }
            //     ];
            // },
            formConfig: function () {
                return [
                    {
                        required: true,
                        field: 'code',
                        label: this.i18nMappingObj.sendType,
                        component: 'erd-input',
                        slots: {
                            component: 'sendType'
                        },
                        col: 24
                    },
                    // {
                    //     field: 'contextType',
                    //     label: this.i18nMappingObj.contextType,
                    //     // component: 'erd-input',
                    //     slots: {
                    //         component: 'contextType'
                    //     },
                    //     col: 24
                    // },
                    {
                        required: true,
                        field: 'DNDTime',
                        component: 'erd-time-picker',
                        label: this.i18nMappingObj.DNDTime,
                        col: 24,
                        props: {
                            'picker-options': {
                                format: 'HH:mm'
                            },
                            'format': 'HH:mm',
                            'value-format': 'HH:mm',
                            'is-range': true,
                            'range-separator': this.i18nMappingObj.rangeSeparator,
                            'start-placeholder': this.i18nMappingObj.startTime,
                            'end-placeholder': this.i18nMappingObj.endTime
                        }
                    }
                ];
            },
            columns: function () {
                return [
                    {
                        prop: 'seq', // 列数据字段key
                        title: ' ', // 列头部标题
                        minWidth: '48',
                        width: '48',
                        type: 'seq'
                    },
                    {
                        prop: 'sendType', // 列数据字段key
                        title: this.i18nMappingObj.sendType, // 列头部标题
                        minWidth: '100' // 列宽度
                    },
                    {
                        prop: 'enable', // 列数据字段key
                        title: this.i18nMappingObj.status, // 列头部标题
                        minWidth: '80'
                    },
                    {
                        prop: 'DNDTime', // 列数据字段key
                        title: this.i18nMappingObj.DNDTime, // 列头部标题
                        minWidth: '100'
                    },
                    {
                        prop: 'operation', // 列数据字段key
                        title: this.i18nMappingObj.operation, // 列头部标题
                        width: '130'
                    }
                ];
            }
        },
        components: {
            FamErdTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        created() {
            if (this.row && this.row.oid) {
                this.loadEnableSendType().then(this.loadData);
                // this.loadSendType().then(this.loadData);
            } else {
                this.$emit('switch-component', 'NotifyList');
            }
        },
        methods: {
            changeStatus: function (row, status) {
                var self = this;
                this.$famHttp({
                    url: '/message/notify/v1/config/config',
                    data: {
                        contextId: row.contextId,
                        code: row.code,
                        contextType: row.contextType,
                        enabled: status,
                        notifyId: this.row.id,
                        silenceMax: row.silenceMax,
                        silenceMin: row.silenceMin
                    },
                    method: 'POST'
                }).then(function (resp) {
                    if (resp.success) {
                        self.$message.success(self.i18nMappingObj.success);
                        self.loadData();
                    }
                });
            },
            returnTop: function () {
                this.$emit('switch-component', 'NotifyList');
            },
            deleteDND: function (row) {
                var self = this;
                this.$confirm(this.i18nMappingObj.isDeleteConfirm, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                }).then(() => {
                    self.$famHttp({
                        url: '/message/notify/v1/config/config',
                        data: {
                            code: row.code,
                            contextId: row.contextId,
                            contextType: row.contextType,
                            notifyId: self.row.id
                        },
                        method: 'delete'
                    }).then(function (resp) {
                        if (resp.success) {
                            self.$message.success(self.i18nMappingObj.success);
                            self.loadData();
                        }
                    });
                });
            },
            loadEnableSendType: function () {
                return this.$famHttp.post('/message/notify/v1/main/sendType').then((resp) => {
                    if (resp.success) {
                        let data = resp.data || [];
                        data.forEach((i) => {
                            i.value = i.code;
                            i.description = erdcloudKit.translateI18n(i.i18n);
                        });
                        this.sendType = data;
                    }
                });
            },
            close: function () {
                this.visibleDialog = false;
            },
            cancel: function () {
                this.close();
            },
            save: function () {
                var self = this;
                this.$refs.dynamicForm
                    .submit((validateResult) => {
                        if (validateResult.valid) {
                            this.formData.silenceMin = this.formData.DNDTime[0];
                            this.formData.silenceMax = this.formData.DNDTime[1];
                            const loading = this.$loading({
                                body: true,
                                fullscreen: true,
                                lock: true
                            });
                            this.$famHttp({
                                url: '/message/notify/v1/config/config',
                                data: {
                                    contextId: this.formData.contextId,
                                    code: this.formData.code,
                                    contextType: this.formData.contextType,
                                    enabled: this.formData.enabled,
                                    notifyId: this.row.id,
                                    silenceMax: this.formData.silenceMax,
                                    silenceMin: this.formData.silenceMin
                                },
                                method: 'POST'
                            })
                                .then(function (resp) {
                                    if (resp.success) {
                                        self.visibleDialog = false;
                                        self.$message.success(self.i18nMappingObj.success);
                                        self.loadData();
                                    } else {
                                        self.$message.error(resp.message);
                                    }
                                })
                                .finally(() => {
                                    loading.close();
                                });
                        }
                    })
                    .catch(() => {});
            },
            loadData: function () {
                var self = this;
                this.loading = true;
                this.$famHttp({
                    url: '/message/notify/v1/config/page',
                    params: {
                        appName: 'plat',
                        notifyId: self.row.id,
                        pageIndex: this.currentPage,
                        pageSize: this.pageSize
                    }
                })
                    .then((res) => {
                        var data = res.data.records || [];

                        if (data.length === 0) {
                            res.data.records = [];
                        } else {
                            if (Object.keys(data[0].json.configs).length !== 0) {
                                var contextId = data[0].contextId;
                                var contextType = data[0].contextType;
                                var obj = $.extend({}, data[0].json.configs);
                                var index = 0;
                                for (var k in obj) {
                                    obj[k]['code'] = k;
                                    obj[k]['contextId'] = contextId;
                                    obj[k]['contextType'] = contextType;
                                    self.sendType.forEach(function (item) {
                                        if (item.code === k || item.id === k || item.value === k) {
                                            obj[k]['sendType'] = item.title || item.description;
                                        }
                                    });
                                    data[index] = obj[k];
                                    index++;
                                }
                                self.listData = data;
                            } else {
                                self.listData = [];
                            }
                        }
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
            onCreate: function () {
                var self = this;
                this.visibleDialog = true;
                this.currentRow = null;
                this.dialogTitle = this.i18nMappingObj.create;
                this.formData = Object.assign({}, initFormData, {
                    code: this.sendType[0] && this.sendType[0].code
                });

                this.$nextTick(function () {
                    self.$refs.dynamicForm?.clearValidate();
                });
            },
            onUpdate: function (row) {
                this.currentRow = row;
                this.dialogTitle = row.sendType;
                for (var key in this.formData) {
                    this.formData[key] = row[key];
                }
                this.formData.DNDTime = [row.silenceMin, row.silenceMax];
                this.visibleDialog = true;
            },
            onInput: function () {
                utils.debounceFn(() => {
                    this.loadData();
                }, 300);
            }
        }
    };
});
