define([
    'vue',
    'erdcloud.kit',
    'fam:store',
    'text!' + ELMP.resource('biz-notifications/components/NotifyTemplate/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('biz-notifications/components/NotifyTemplate/index.css'),
    'underscore'
], function (Vue, erdcloudKit, store, template, utils) {
    const _ = require('underscore');
    const erdcloudI18n = require('erdcloud.i18n');
    const initFormData = {
        schemeType: 'freemarker',
        sendTypeCode: '',
        title: '',
        content: '',
        // notifyId: '', //所属通知
        status: 1,
        version: 1,
        lang: erdcloudI18n.currentLanguage()
    };
    return {
        template,
        props: ['row'],
        data: function () {
            return {
                tenantId: JSON.parse(window.LS.get('tenantId')),
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-notifications/locale/index.js'),
                i18nMappingObj: {
                    grammar: this.getI18nByKey('语法'),
                    language: this.getI18nByKey('语言'),
                    state: this.getI18nByKey('状态'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('禁用'),
                    version: this.getI18nByKey('版本'),
                    VersionDesc: this.getI18nByKey('版本描述'),
                    sentType: this.getI18nByKey('发送类型'),
                    edit: this.getI18nByKey('编辑'),
                    title: this.getI18nByKey('标题'),
                    save: this.getI18nByKey('确定'),
                    more: this.getI18nByKey('更多'),
                    cancel: this.getI18nByKey('取消'),
                    appName: this.getI18nByKey('应用'),
                    upgradeDec: this.getI18nByKey('升级版本描述'),
                    template: this.getI18nByKey('模板'),
                    status: this.getI18nByKey('状态'),
                    back: this.getI18nByKey('返回'),
                    create: this.getI18nByKey('创建'),
                    upgrade: this.getI18nByKey('升级'),
                    copy: this.getI18nByKey('复制'),
                    success: this.getI18nByKey('成功'),
                    moreAction: this.getI18nByKey('更多操作'),
                    operation: this.getI18nByKey('操作'),
                    titleTips: this.getI18nByKey('请输入标题'),
                    content: this.getI18nByKey('内容'),
                    contentTips: this.getI18nByKey('请输入内容'),
                    paramTips: this.getI18nByKey('内容对应的参数格式如下')
                },
                listData: [],
                total: 0,
                pageSize: 20,
                currentPage: 1,
                visibleDropdown: false,
                // 40(头高度) + 24(外容器内边距) + 32(容器内边距) + 16(返回高度) + 16(搜索margin-top) + 32(搜索高度) + 16(表格margin-top) + 28(分页条高度) + 16(分页条margin-top)
                tableHeight: $(window).height() - 40 - 24 - 32 - 16 - 16 - 32 - 16 - 28 - 16,
                loading: false,
                visibleDialog: false,
                visibleDialogForUpgrade: false,
                dialogTitle: '',
                dialogTitleForUpgrade: '',
                formData: Object.assign({}, initFormData),
                formDataForUpgrade: {
                    versionDesc: ''
                },
                sendType: [],
                // applications: [],
                currentSelected: null,

                applicationVal: _.some(this.$store.state.app.appNames, (i) => {
                    return i.identifierNo === 'plat';
                })
                    ? 'plat'
                    : this.$store.state.app.appNames[0]
                      ? this.$store.state.app.appNames[0].identifierNo
                      : '',
                languageVal: '',
                saveLoading: false,
                oid: ''
            };
        },
        computed: {
            applications: function () {
                var currentLan = window.LS.get('lang_current');
                return _.map(this.$store.state.app.appNames || [], function (i) {
                    return {
                        code: i.identifierNo,
                        name: i.nameI18nJson[currentLan] ? i.nameI18nJson[currentLan] : i.displayName
                    };
                });
            },
            params: function () {
                return this.i18nMappingObj.paramTips + ':\r\n' + this.row.params;
            },
            language: function () {
                let langs = store.state.i18n.languages;
                return langs.map((i) => {
                    return {
                        language: i.language.toLowerCase(),
                        displayName: i.displayName
                    };
                });
            },
            languageMap: function () {
                var map = {};
                this.language.forEach(function (i) {
                    map[i.language] = i;
                });
                return map;
            },
            formConfigForCopy: function () {
                return [
                    {
                        required: true,
                        field: 'appName',
                        label: this.i18nMappingObj.appName,
                        slots: {
                            component: 'appName'
                        },
                        col: 24
                    },
                    {
                        required: true,
                        field: 'lang',
                        label: this.i18nMappingObj.language,
                        slots: {
                            component: 'lang'
                        },
                        col: 24
                    }
                ];
            },
            formConfigForUpgrade: function () {
                return [
                    {
                        required: true,
                        props: {
                            type: 'textarea'
                        },
                        field: 'versionDesc',
                        label: this.i18nMappingObj.upgradeDec,
                        component: 'erd-input',
                        col: 24
                    }
                ];
            },

            formConfig: function () {
                var self = this;
                return [
                    {
                        required: true,
                        disabled: true,
                        readonly: true,
                        props: {
                            disabled: true
                        },
                        field: 'schemeType',
                        label: this.i18nMappingObj.grammar,
                        component: 'erd-input',
                        col: 12
                    },
                    {
                        disabled: !!self.oid,
                        required: true,
                        field: 'sendTypeCode',
                        label: this.i18nMappingObj.sentType,
                        slots: {
                            component: 'sendTypeCode'
                        },
                        col: 12
                    },
                    {
                        required: true,
                        field: 'title',
                        props: {
                            placeholder: this.i18nMappingObj.titleTips,
                            maxlength: 200
                        },
                        component: 'erd-input',
                        label: this.i18nMappingObj.title,
                        col: 12
                    },
                    {
                        disabled: !!self.oid,
                        required: true,
                        field: 'lang',
                        component: 'erd-select',
                        label: this.i18nMappingObj.language,
                        col: 12,
                        slots: {
                            component: 'lang'
                        }
                    },
                    {
                        field: 'content',
                        label: this.i18nMappingObj.content,
                        col: 24,
                        required: true,
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
                            component: 'content'
                        }
                    }
                ];
            },
            columns: function () {
                return [
                    // {
                    //     minWidth: '40',
                    //     width: '40',
                    //     type: 'radio',
                    //     align: 'center'
                    // },
                    {
                        prop: 'title', // 列数据字段key
                        title: this.i18nMappingObj.title, // 列头部标题
                        minWidth: 100
                    },
                    {
                        prop: 'sentTypeName', // 列数据字段key
                        title: this.i18nMappingObj.sentType, // 列头部标题
                        minWidth: '100'
                    },
                    {
                        prop: 'schemeType', // 列数据字段key
                        title: this.i18nMappingObj.grammar, // 列头部标题
                        width: '100'
                    },
                    {
                        prop: 'status', // 列数据字段key
                        title: this.i18nMappingObj.status, // 列头部标题
                        width: '80'
                    },
                    {
                        prop: 'langName', // 列数据字段key
                        title: this.i18nMappingObj.language, // 列头部标题
                        width: '80'
                    },
                    {
                        prop: 'version', // 列数据字段key
                        title: this.i18nMappingObj.version, // 列头部标题
                        width: '80'
                    },
                    {
                        prop: 'versionDesc', // 列数据字段key
                        title: this.i18nMappingObj.VersionDesc, // 列头部标题
                        minWidth: '100'
                    },
                    {
                        prop: 'operation', // 列数据字段key
                        title: this.i18nMappingObj.operation, // 列头部标题
                        width: '150'
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
            } else {
                this.$emit('switchComponent', 'NotifyList');
            }
        },
        mounted() {
            if (this.row.initNotify) {
                this.onCreate();
            }
        },
        beforeDestroy() {
            this.editor.dispose();
        },
        methods: {
            handleCommand: function (command, row) {
                if (command === 'copy') {
                    this.onCopy(row);
                } else if (command === 'status') {
                    this.changeStatus(row.id, row.status == 1 ? 0 : 1);
                }
            },
            changeStatus: function (id, status) {
                var self = this;
                this.$famHttp({
                    url: `/message/notify/v1/tmpl/${id}/${status}`,
                    method: 'put'
                }).then((resp) => {
                    if (resp.success) {
                        self.$message.success(self.i18nMappingObj.success);
                        self.loadData();
                    }
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
            onUpgrade: function (row) {
                var self = this;
                this.dialogTitleForUpgrade = this.i18nMappingObj.upgrade;
                this.currentSelected = row;
                this.formDataForUpgrade.versionDesc = '';
                this.visibleDialogForUpgrade = true;
                this.$nextTick(function () {
                    self.$refs.dynamicFormForUpgrade?.clearValidate();
                });
            },
            onCopy(row) {
                this.saveLoading = true;
                this.$famHttp({
                    url: `/message/notify/v1/tmpl/copy/${row.id}`,
                    method: 'PUT'
                })
                    .then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18nMappingObj.success);
                            this.loadData();
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: err.message
                        // });
                    })
                    .finally(() => {
                        this.saveLoading = false;
                    });
            },
            handleLanguageChange: function () {
                this.loadData();
            },
            handleApplicationChange: function () {
                this.loadData();
            },
            initMonaco: function (value) {
                value = value || '{}';
                var _this = this;
                if (this.editor) {
                    this.editor.setValue(value);
                } else {
                    this.$nextTick(function () {
                        require(['vs/editor/editor.main'], function (monaco) {
                            _this.editor = monaco.editor.create(_this.$refs['system-notify_tmpl_form_param'], {
                                language: 'json',
                                value: value,
                                automaticLayout: true
                            });
                        });
                    });
                }
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
                this.$famHttp({
                    url: data.oid ? '/fam/update' : '/fam/create',
                    method: 'post',
                    data: {
                        action: data.oid ? 'UPDATE' : 'CREATE',
                        appName: 'plat',
                        className: 'erd.cloud.notify.entity.MsgNotifyTmpl',
                        attrRawList: rowList,
                        oid: data.oid
                    }
                }).then(function (resp) {
                    if (resp.success) {
                        self.close();
                        self.loadData();
                    }
                });
            },
            sendTypeName(sendTypeCode) {
                const findSendType = this.sendType.find((item) => item.value === sendTypeCode);

                return findSendType ? findSendType.description : '';
            },
            // disable: function (oid) {
            //     this.changeStatus(id, 0);
            // },
            // enable: function (oid) {
            //     this.updateData({
            //         oid: oid,
            //         status: 1
            //     });
            // },
            close: function () {
                this.$refs.dynamicForm?.clearValidate();
                this.visibleDialog = false;
            },
            closeForUpgrade: function () {
                this.$refs.dynamicFormForUpgrade?.clearValidate();
                this.visibleDialogForUpgrade = false;
            },
            cancel: function () {
                this.close();
            },
            saveForUpgrade: function () {
                var self = this;
                this.$refs?.dynamicFormForUpgrade?.submit((validateResult) => {
                    if (validateResult.valid) {
                        self.saveLoading = true;
                        this.$famHttp({
                            url: `/message/notify/v1/tmpl/upgrade/${this.currentSelected.id}`,
                            data: '"' + this.formDataForUpgrade.versionDesc + '"',
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            }
                        })
                            .then(function (resp) {
                                if (resp.success) {
                                    self.$message.success(self.i18nMappingObj.success);
                                    self.visibleDialogForUpgrade = false;
                                    self.loadData();
                                }
                            })
                            .finally(() => {
                                self.saveLoading = false;
                            });
                    }
                });
            },
            save: function () {
                var self = this;
                this.$refs.dynamicForm
                    .submit((validateResult) => {
                        if (validateResult.valid) {
                            self.saveLoading = true;
                            if (this.oid) {
                                this.$famHttp({
                                    url: `/message/notify/v1/tmpl/${this.id}`,
                                    data: {
                                        appName: this.applicationVal,
                                        action: 'UPDATE',
                                        content: this.editor.getValue().trim(),
                                        id: this.id,
                                        lang: this.formData.lang,
                                        notifyId: this.row.id,
                                        schemeType: this.formData.schemeType,
                                        sendTypeCode: this.formData.sendTypeCode,
                                        status: this.formData.status,
                                        title: this.formData.title
                                    },
                                    method: 'put'
                                })
                                    .then(function (resp) {
                                        if (resp.success) {
                                            self.$message.success(self.i18nMappingObj.success);
                                            self.close();
                                            self.loadData();
                                        } else {
                                            self.$message.error(resp.message);
                                        }
                                    })
                                    .catch(function (error) {
                                        // self.$message.error(error.data && error.data.message ? error.data && error.data.message : error.message)
                                    })
                                    .finally(() => {
                                        self.saveLoading = false;
                                        // loading.close();
                                    });
                            } else {
                                this.$famHttp({
                                    url: '/message/notify/v1/tmpl',
                                    data: {
                                        action: 'CREATE',
                                        appName: this.applicationVal,
                                        content: this.editor.getValue().trim(),
                                        id: this.id,
                                        lang: this.formData.lang,
                                        notifyId: this.row.id,
                                        schemeType: this.formData.schemeType,
                                        sendTypeCode: this.formData.sendTypeCode,
                                        status: this.formData.status,
                                        title: this.formData.title
                                    },
                                    method: 'POST'
                                })
                                    .then(function (resp) {
                                        if (resp.success) {
                                            self.$message.success(self.i18nMappingObj.success);
                                            self.close();
                                            self.loadData();
                                        } else {
                                            self.$message.error(resp.message);
                                        }
                                    })
                                    .catch(function (error) {
                                        // self.$message.error(error.data && error.data.message ? error.data && error.data.message : error.message)
                                    })
                                    .finally(() => {
                                        self.saveLoading = false;
                                    });
                            }
                        }
                    })
                    .catch(() => {});
            },
            operationBtn: function () {},
            loadData: function () {
                var self = this;
                this.currentSelected = null;
                var conditionDtoList = [
                    {
                        attrName: 'notifyId',
                        oper: 'EQ',
                        value1: this.row.id
                    }
                ];
                if (this.languageVal) {
                    conditionDtoList.push({
                        attrName: 'lang',
                        oper: 'EQ',
                        value1: this.languageVal
                    });
                }
                if (this.applicationVal) {
                    conditionDtoList.push({
                        attrName: 'appName',
                        oper: 'EQ',
                        value1: this.applicationVal
                    });
                }
                this.$famHttp({
                    url: '/fam/search',
                    data: {
                        appName: ['plat'],
                        className: 'erd.cloud.notify.entity.MsgNotifyTmpl',
                        pageIndex: this.currentPage,
                        pageSize: this.pageSize,
                        conditionDtoList: conditionDtoList,
                        orderBy: 'version'
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
                            item.langName = self.languageMap[item.lang.toLowerCase()]
                                ? self.languageMap[item.lang].displayName
                                : item.lang;
                            item.version = 'V' + item.version;
                            item.id = i.id;
                            item.oid = i.oid;
                            item.tenantId = i.tenantId;
                            return item;
                        });
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: (error && error.data && error.data.message) || '获取列表失败'
                        // });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            onCreate: function () {
                var self = this;
                this.visibleDialog = true;
                this.dialogTitle = this.i18nMappingObj.create;
                this.formData = Object.assign({}, initFormData, {
                    sendTypeCode: this.sendType[0] && this.sendType[0].code
                });
                self.oid = '';
                self.id = '';
                this.initMonaco();
                this.$nextTick(function () {
                    self.$refs.dynamicForm?.clearValidate();
                });
            },
            // handleOpened: function () {
            //     this.$refs.system-notify_params.$refs.textarea.style.height = '388px';
            // },
            onUpdate: function (oid, row) {
                this.visibleDialog = true;
                this.dialogTitle = row.title;
                var self = this;
                this.$famHttp({
                    url: '/fam/attr',
                    params: {
                        className: 'erd.cloud.notify.entity.MsgNotifyTmpl',
                        oid: oid
                    }
                }).then(function (resp) {
                    if (resp.success) {
                        var formData = {};
                        self.formConfig.forEach(function (i) {
                            if (_.isObject(self.formData[i.field])) {
                                formData[i.field] = {
                                    attrName: resp.data.rawData[i.field].attrName,
                                    value: resp.data.rawData[i.field].value
                                };
                            } else {
                                formData[i.field] = resp.data.rawData[i.field].value;
                            }
                        });
                        formData.status = resp.data.rawData.status.value;
                        self.formData = formData;
                        self.initMonaco(formData.content);
                        self.oid = oid;
                        self.id = row.id;
                        self.$nextTick(function () {
                            self.$refs.dynamicForm?.clearValidate();
                        });
                    }
                });
            },
            onInput: function () {
                utils.debounceFn(() => {
                    this.currentPage = 1;
                    this.loadData();
                }, 300);
            },
            sizeChange: function () {},
            currentChange: function () {}
        }
    };
});
