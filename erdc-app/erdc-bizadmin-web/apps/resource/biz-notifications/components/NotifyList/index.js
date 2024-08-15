define([
    'vue',
    'erdc-kit',
    'fam:store',
    'text!' + ELMP.resource('biz-notifications/components/NotifyList/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('biz-notifications/components/NotifyList/index.css'),
    'underscore'
], function (Vue, ErdcKit, store, template, utils) {
    const _ = require('underscore');
    const initFormData = {
        title: '',
        code: '',
        description: '',
        params: '',
        status: '1'
    };
    return {
        template,
        data: function () {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-notifications/locale/index.js'),
                i18nMappingObj: {
                    name: this.getI18nByKey('名称'),
                    nameTips: this.getI18nByKey('请输入名称'),
                    codeTips: this.getI18nByKey('请输入编码'),
                    create: this.getI18nByKey('创建'),
                    code: this.getI18nByKey('编码'),
                    status: this.getI18nByKey('状态'),
                    description: this.getI18nByKey('描述'),
                    operation: this.getI18nByKey('操作'),
                    pleaseEnter: this.getI18nByKey('请输入描述'),
                    save: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    enable: this.getI18nByKey('启用'),
                    template: this.getI18nByKey('模板'),
                    dndMode: this.getI18nByKey('免打扰设置'),
                    disable: this.getI18nByKey('禁用'),
                    exportAllTmpl: this.getI18nByKey('导出所有模板'),
                    exportUseTmpl: this.getI18nByKey('导出使用中的模板'),
                    exportUnUseTmpl: this.getI18nByKey('导出未使用中的模板'),
                    exportTmpl: this.getI18nByKey('导出'),
                    importTmpl: this.getI18nByKey('导入'),
                    uploadTitle: this.getI18nByKey('统一通知导入'),
                    upload: this.getI18nByKey('上传'),
                    tmpl: this.getI18nByKey('模板'),
                    download: this.getI18nByKey('下载'),
                    HalfCover: this.getI18nByKey('半覆盖'),
                    HalfCoverDetail: this.getI18nByKey('HalfCoverDetail'),
                    NoCover: this.getI18nByKey('不覆盖'),
                    NoCoverDetail: this.getI18nByKey('NoCoverDetail'),
                    FullCover: this.getI18nByKey('全覆盖'),
                    FullCoverDetail: this.getI18nByKey('FullCoverDetail'),
                    importMode: this.getI18nByKey('导入方式'),
                    importSuccess: this.getI18nByKey('导入成功'),
                    importError: this.getI18nByKey('导入失败'),
                    sendManage: this.getI18nByKey('发送类型管理'),
                    param: this.getI18nByKey('参数'),
                    success: this.getI18nByKey('成功'),
                    contentTips: this.getI18nByKey('请输入参数JSON'),
                    contentTipsError: this.getI18nByKey('参数需要为JSON格式'),
                    searchTips: this.getI18nByKey('请输入关键字'),
                    edit: this.getI18nByKey('编辑')
                },
                listData: [],
                searchVal: '',
                total: 0,
                pageSize: 20,
                currentPage: 1,
                visibleDropdown: false,
                loading: false,
                visibleDialog: false,
                dialogTitle: '',
                formData: Object.assign({}, initFormData),
                uploadVisible: false,
                uploadType: '0',
                currentSelected: null,
                oid: null
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            importModeOptions: function () {
                return [
                    {
                        label: this.i18nMappingObj.HalfCover,
                        value: '0'
                    },
                    {
                        label: this.i18nMappingObj.NoCover, //$.i18n.get('sys_import_no_cover'),
                        value: '1'
                    },
                    {
                        label: this.i18nMappingObj.FullCover,
                        value: '2'
                    }
                ];
            },
            uploadTitle: function () {
                return this.i18nMappingObj.uploadTitle;
            },
            uploadProps: function () {
                var self = this;
                return {
                    'on-success': function () {
                        if (
                            _.every(self.$refs.upload.uploadFiles, function (i) {
                                return i.status === 'success';
                            })
                        ) {
                            self.uploadVisible = false;
                            self.$message.success(self.i18nMappingObj.importSuccess);
                            self.loadData();
                        }
                    },
                    'on-error': function () {
                        self.$message.error(self.i18nMappingObj.importError);
                    },
                    'headers': ErdcKit.defaultHeaders(),
                    'auto-upload': false,
                    'multiple': true,
                    'name': 'files',
                    'accept': '.zip',
                    'action': `/message/notify/v1/upload/${this.uploadType}`
                };
            },
            formConfig: function () {
                var self = this;
                return [
                    {
                        required: true,
                        props: {
                            placeholder: this.i18nMappingObj.nameTips,
                            maxlength: 200
                        },
                        field: 'title',
                        label: this.i18nMappingObj.name,
                        labelLangKey: this.i18nMappingObj.name,
                        component: 'erd-input',
                        // component: 'FamI18nbasics',
                        col: 12
                    },
                    {
                        required: true,
                        props: {
                            placeholder: this.i18nMappingObj.codeTips,
                            maxlength: 100
                        },
                        field: 'code',
                        disabled: !!this.oid,
                        label: this.i18nMappingObj.code,
                        component: 'erd-input',
                        col: 12
                    },
                    {
                        required: true,
                        field: 'status',
                        component: 'fam-radio',
                        label: this.i18nMappingObj.status,
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj.enable,
                                    value: '1'
                                },
                                {
                                    label: this.i18nMappingObj.disable,
                                    value: '0'
                                }
                            ]
                        },
                        col: 24
                    },
                    {
                        field: 'description',
                        // component: 'FamI18nbasics',
                        component: 'erd-input',
                        label: this.i18nMappingObj.description,
                        col: 24,
                        props: {
                            placeholder: this.i18nMappingObj.pleaseEnter,
                            type: 'textarea',
                            maxlength: 300
                        }
                    },
                    {
                        required: true,
                        field: 'params',
                        label: this.i18nMappingObj.param,
                        col: 24,
                        validators: [
                            {
                                required: true,
                                trigger: ['submit'],
                                validator(rule, value, callback) {
                                    if (self.editor.getValue().trim()) {
                                        callback();
                                    } else {
                                        callback(new Error(self.i18nMappingObj.contentTips));
                                    }
                                }
                            }
                        ],
                        slots: {
                            component: 'param'
                        }
                    }
                ];
            },
            columns: function () {
                return [
                    {
                        minWidth: '40',
                        width: '40',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        attrName: 'seq',
                        prop: 'seq',
                        title: ' ',
                        minWidth: '48',
                        width: '48',
                        type: 'seq',
                        align: 'center'
                    },
                    {
                        prop: 'title', // 列数据字段key
                        title: this.i18nMappingObj.name, // 列头部标题
                        minWidth: '100' // 列宽度
                    },
                    {
                        prop: 'code', // 列数据字段key
                        title: this.i18nMappingObj.code, // 列头部标题
                        minWidth: '100'
                    },
                    {
                        prop: 'description', // 列数据字段key
                        title: this.i18nMappingObj.description, // 列头部标题
                        minWidth: '100'
                    },
                    {
                        prop: 'status', // 列数据字段key
                        title: this.i18nMappingObj.status, // 列头部标题
                        width: '80'
                    },
                    {
                        prop: 'operation', // 列数据字段key
                        title: this.i18nMappingObj.operation, // 列头部标题
                        width: '190',
                        fixed: 'right',
                        minWidth: 190
                    }
                ];
            }
        },
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamErdUploadTmpl: ErdcKit.asyncComponent(ELMP.resource('biz-notifications/UploadTmpl/index.js')),
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        created() {
            this.loadData();
        },
        methods: {
            gotoTmpl: function (row) {
                delete row.initNotify;
                this.$emit('switch-component', 'NotifyTemplate', row);
            },
            downloadFile: function (downLoadType) {
                let ids = _.pluck(this.currentSelected, 'id');
                if (ids.length > 0) {
                    ErdcKit.downFile({
                        url: `/message/notify/v1/download/${downLoadType}?ids=${ids.join()}`
                    });
                } else {
                    this.$message({
                        message: this.i18nMappingObj.exportTips,
                        type: 'warning'
                    });
                }
            },
            handleCheckboxChange: function (event) {
                this.currentSelected = event.records;
            },
            handleCheckAll: function (event) {
                this.currentSelected = event.records;
            },
            handleSave: function () {
                this.$refs.upload.submit();
            },
            handleUploadClosed: function () {
                this.$refs.upload.clearFiles();
            },
            updateData: function (data) {
                var rowList = [];
                _.each(data, function (value, key) {
                    rowList.push({
                        attrName: key,
                        value: value
                    });
                });
                var self = this;
                this.$refs.dynamicForm
                    .submit((validateResult) => {
                        if (validateResult.valid) {
                            this.$famHttp({
                                url: data.oid ? '/fam/update' : '/fam/create',
                                method: 'post',
                                data: {
                                    action: data.oid ? 'UPDATE' : 'CREATE',
                                    appName: 'plat',
                                    className: 'erd.cloud.notify.entity.MsgNotify',
                                    attrRawList: rowList,
                                    oid: data.oid
                                }
                            }).then(function (resp) {
                                if (resp.success) {
                                    self.$message.success({
                                        message: self.i18nMappingObj.success,
                                        duration: 2000,
                                        onClose: function () {
                                            if (!data.oid) {
                                                self.$emit(
                                                    'switch-component',
                                                    'NotifyTemplate',
                                                    Object.assign(
                                                        {
                                                            id: resp.data.substring(resp.data.lastIndexOf(':') + 1),
                                                            oid: resp.data,
                                                            initNotify: true
                                                        },
                                                        data
                                                    )
                                                );
                                            } else {
                                                self.close();
                                                self.loadData();
                                            }
                                        }
                                    });
                                } else {
                                    self.$message.error(resp.message);
                                }
                            });
                        }
                    })
                    .catch(function () {});
            },
            changeStatus: function (oid, status) {
                var rowList = [
                    {
                        attrName: 'oid',
                        value: oid
                    },
                    {
                        attrName: 'status',
                        value: status
                    }
                ];
                var self = this;
                this.$famHttp({
                    url: '/fam/update',
                    method: 'post',
                    data: {
                        action: 'UPDATE',
                        appName: 'plat',
                        className: 'erd.cloud.notify.entity.MsgNotify',
                        attrRawList: rowList,
                        oid: oid
                    }
                }).then(function (resp) {
                    if (resp.success) {
                        self.$message.success(self.i18nMappingObj.success);
                        self.loadData();
                    }
                });
            },
            close: function () {
                this.$refs.dynamicForm?.clearValidate();
                this.visibleDialog = false;
            },
            cancel: function () {
                this.close();
            },
            save: function () {
                var self = this;
                var data = Object.assign({}, this.formData);
                if (self.oid) {
                    data.oid = self.oid;
                }
                try {
                    var params = this.editor.getValue().trim();
                    if (!_.isObject(JSON.parse(params))) {
                        throw new Error(this.i18nMappingObj.contentTipsError);
                    }
                    data.params = params;
                } catch (e) {
                    this.$message.error(this.i18nMappingObj.contentTipsError);
                    return;
                }
                this.updateData(data);
            },
            operationBtn: function () {},
            loadData: function () {
                var self = this;
                var conditionDtoList = [];
                this.currentSelected = null;
                this.loading = true;
                this.$famHttp({
                    url: '/fam/search',
                    data: {
                        searchKey: this.searchVal,
                        appName: ['plat'],
                        className: 'erd.cloud.notify.entity.MsgNotify',
                        pageIndex: this.currentPage,
                        pageSize: this.pageSize,
                        conditionDtoList: conditionDtoList
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        const { data } = resp || [];
                        this.currentPage = data.pageIndex;
                        this.pageSize = data.pageSize;
                        this.total = Number(data.total);
                        this.listData = _.map(data.records || [], function (i) {
                            var item = {};
                            _.each(i.attrRawList, function (ii) {
                                item[ii.attrName] = ii.value;
                            });
                            item.id = i.id;
                            item.oid = i.oid;
                            item.tenantId = i.tenantId;
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
                        self.loading = false;
                    });
            },
            initMonaco: function (value) {
                value = value || '{}';
                var _this = this;
                if (this.editor) {
                    this.editor.setValue(value);
                } else {
                    this.$nextTick(function () {
                        require(['vs/editor/editor.main'], function (monaco) {
                            _this.editor = monaco.editor.create(_this.$refs['system-notify_form_param'], {
                                language: 'json',
                                value: value,
                                automaticLayout: true
                            });
                        });
                    });
                }
            },
            onCreate: function () {
                this.visibleDialog = true;
                this.dialogTitle = this.i18nMappingObj.create;
                this.formData = Object.assign({}, initFormData);
                this.oid = null;
                var self = this;
                this.initMonaco();
                this.$nextTick(function () {
                    self.$refs.dynamicForm.clearValidate();
                });
            },
            onUpdate: function (oid) {
                this.visibleDialog = true;
                this.oid = oid;
                var self = this;
                this.$famHttp({
                    url: '/fam/attr',
                    params: {
                        className: 'erd.cloud.notify.entity.MsgNotify',
                        oid: oid
                    }
                }).then(function (resp) {
                    if (resp.success) {
                        var formData = {};
                        self.formConfig.forEach(function (i) {
                            let rawData = resp.data.rawData;
                            if (rawData[i.field].attrName.includes('I18nJson')) {
                                formData[i.field] = {
                                    attrName: rawData[i.field].attrName,
                                    value: rawData[i.field].value
                                };
                            } else {
                                if (i.field === 'status') {
                                    formData[i.field] = rawData[i.field].value + '';
                                } else {
                                    formData[i.field] = rawData[i.field].value;
                                }
                            }
                        });

                        self.formData = formData;
                        self.dialogTitle = formData.title;
                        self.initMonaco(formData.params);
                    }
                });

                // this.initMonaco();
            },
            onInput: function () {
                utils.debounceFn(() => {
                    this.currentPage = 1;
                    this.loadData();
                }, 300);
            },
            sizeChange: function () {
                this.loadData();
            },
            currentChange: function () {
                this.loadData();
            }
        }
    };
});
