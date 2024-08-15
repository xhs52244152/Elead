define([
    'text!' + ELMP.resource('biz-import-export/CreateOrEditForm/index.html'),
    'fam:store',
    'erdc-kit',
    'css!' + ELMP.resource('biz-import-export/CreateOrEditForm/style.css')
], function (template, store, erdcKit) {
    const EXAMPLE_TYPE_MAPPING = {
        EXCEL: '.xlsx',
        XML: '.xml'
    };

    const EXAMPLE_FILE_ID_MAPPING = {
        EXCEL: '4f88fa96126862cceb38c228ef37bd1e'
    };

    return {
        template,
        props: {
            editRow: {
                type: Object,
                default() {
                    return null;
                }
            },
            editTemplate: {
                type: Object,
                default() {
                    return null;
                }
            },
            formType: {
                type: String,
                default: ''
            },
            readonly: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                categoryFormData: {},
                templateBaseInfoData: {},
                templateDocFormData: {},
                unfold: true,
                unfold2: true,
                exampleTemplate: 'EXCEL'
            };
        },
        computed: {
            appNameOptions() {
                return store.state.app.appNames || [];
            },
            className() {
                return this.$store.getters.className('exportBusinessInfo');
            },
            isCreateForm() {
                return this.formType === 'templateCategory' ? !this.editRow : !this.editTemplate;
            },
            categoryFormConfig() {
                const formConfig = [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: '业务编码',
                        required: this.isCreateForm,
                        disabled: !this.isCreateForm,
                        readonly: !this.isCreateForm,
                        props: {
                            clearable: true,
                            maxLength: 100
                        },
                        validators: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (!value || value.trim() === '') {
                                        callback('请输入业务编码');
                                    } else if (value.match(/[^a-zA-Z0-9_.]/gi)) {
                                        callback('请输入大小写字母数字、"_"、"."');
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: 'blur'
                            }
                        ],
                        col: 24
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: '名称',

                        required: true,
                        labelLangKey: 'name',
                        props: {
                            clearable: true,
                            placeholder: '请输入',
                            max: 100
                        },
                        col: 24
                    },
                    {
                        field: 'appName',
                        component: 'custom-select',
                        label: '所属应用',
                        labelLangKey: 'componentType',
                        required: true,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'identifierNo', // 显示value的key
                                referenceList: this.appNameOptions
                            }
                        },
                        slots: {
                            readonly: 'appNameReadonly'
                        },
                        col: 24
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: '描述',
                        labelLangKey: 'internalName',
                        required: false,
                        props: {
                            clearable: false,
                            placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter',
                            i18nName: '描述',
                            type: 'textarea',
                            max: 300
                        },
                        col: 24
                    }
                ];
                return formConfig;
            },
            templateBaseInfoFormConfig() {
                const formConfig = [
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: '名称',
                        required: true,
                        labelLangKey: 'name',
                        props: {
                            clearable: true,
                            placeholder: '请输入',
                            max: 100
                        },
                        col: 24
                    },
                    {
                        field: 'enable',
                        component: 'FamRadio',
                        label: '状态',
                        labelLangKey: 'status',
                        required: true,
                        props: {
                            options: [
                                {
                                    label: '启用',
                                    value: true
                                },
                                {
                                    label: '禁用',
                                    value: false
                                }
                            ]
                        },
                        col: 12
                    },
                    {
                        field: 'exportType',
                        component: 'custom-select',
                        label: '下载模板格式',
                        labelLangKey: 'componentType',
                        required: true,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/enumDataList?realType=erd.cloud.core.export.enums.ExportType',
                                    method: 'POST',
                                    viewProperty: 'name',
                                    valueProperty: 'name'
                                }
                            }
                        },
                        col: 12
                    }
                ];
                return formConfig;
            },
            templateDocFormFormConfig() {
                let self = this;
                const formConfig = [
                    {
                        field: 'templateType',
                        component: 'custom-select',
                        label: '配置模板文件格式',
                        labelLangKey: 'componentType',
                        required: true,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/enumDataList?realType=erd.cloud.core.export.enums.TemplateType',
                                    method: 'POST',
                                    viewProperty: 'name',
                                    valueProperty: 'name'
                                }
                            }
                        },
                        listeners: {
                            callback: (data) => {
                                this.handlerChangeTemplateType(data.value);
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'contentSet',
                        component: 'fam-upload',
                        label: '上传配置文件',
                        required: true,
                        validators: [
                            {
                                trigger: ['blur'],
                                validator: (rule, value, callback) => {
                                    if (_.isEmpty(value)) {
                                        return callback(new Error('请上传配置文件'));
                                    }
                                    callback();
                                }
                            }
                        ],
                        props: {
                            'accept': EXAMPLE_TYPE_MAPPING[this.exampleTemplate] || '*',
                            'fileListType': 'default',
                            'btnConfig': {
                                disabled: false
                            },
                            'multiple': false,
                            'limit': 1,
                            'className': this.className,
                            'on-preview': (file) => {
                                if (
                                    file.fileId &&
                                    self.templateDocFormData.authorizeCode &&
                                    self.templateDocFormData.authorizeCode[file.fileId]
                                ) {
                                    erdcKit.downloadFile(
                                        file.fileId,
                                        self.templateDocFormData.authorizeCode[file.fileId]
                                    );
                                }
                            },
                            'before-remove': (file) => {
                                return new Promise((resolve, reject) => {
                                    this.$confirm('是否删除配置文件', '是否删除', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                    })
                                        .then(() => {
                                            this.templateDocFormData.contentSet =
                                                this.templateDocFormData.contentSet.filter((item) => item !== file.id);
                                            resolve();
                                        })
                                        .catch(() => {
                                            reject();
                                        });
                                });
                            },
                            'tips': self.categoryFormData.templateFileId
                                ? `查看模板样例${EXAMPLE_TYPE_MAPPING[this.exampleTemplate] || ''}`
                                : '',
                            'tipsClass': 'color-primary cursor-pointer',
                            'tips-click-callback': () => {
                                this.handlerDownloadTemplate();
                            }
                        },
                        col: 12
                    }
                ];
                return formConfig;
            }
        },
        watch: {
            editRow: {
                immediate: true,
                deep: true,
                handler(val) {
                    if (val) {
                        this.getAttr(val);
                    } else {
                        this.$set(this, 'categoryFormData', {});
                    }
                }
            },
            editTemplate: {
                immediate: true,
                deep: true,
                handler(val) {
                    this.formatFormData(val);
                }
            }
        },
        methods: {
            getAttr(row) {
                this.$famHttp({
                    url: '/fam/attr',
                    method: 'GET',
                    data: {
                        oid: row.oid
                    }
                }).then((res) => {
                    const {
                        nameI18nJson = {},
                        descriptionI18nJson = {},
                        appName = {},
                        authorizeCode = {},
                        fileList = {}
                    } = res?.data?.rawData || {};
                    this.$set(this, 'categoryFormData', {
                        ...row,
                        appName: appName.value,
                        nameI18nJson,
                        descriptionI18nJson,
                        authorizeCode: authorizeCode.value || {},
                        templateFileId: fileList.value && fileList.value[0] ? fileList.value[0].fileId : ''
                    });
                });
            },
            handlerChangeTemplateType(type) {
                this.exampleTemplate = type;
            },
            formatFormData(data) {
                if (data) {
                    const templateBaseInfoData = {
                        nameI18nJson: data.nameI18nJson.value,
                        enable: data.enable.value,
                        exportType: data.exportType.value
                    };
                    this.$set(this, 'templateBaseInfoData', templateBaseInfoData);

                    const attachments = data.contentSet.value.attachmentDataVoList.map((item) => item.id);
                    const templateDocFormData = {
                        templateType: data.templateType.value,
                        contentSet: attachments,
                        authorizeCode: data?.authorizeCode?.value || {}
                    };
                    this.$set(this, 'templateDocFormData', templateDocFormData);
                    this.exampleTemplate = data.templateType.value;
                } else {
                    this.$set(this, 'templateBaseInfoData', {
                        exportType: 'EXCEL',
                        enable: false
                    });
                    this.$set(this, 'templateDocFormData', {
                        templateType: 'EXCEL'
                    });
                }
            },
            validate() {
                if (this.formType === 'templateCategory') {
                    this.$refs.templateCategoryForm.submit((res) => {
                        if (res.valid) {
                            const formData = this.$refs.templateCategoryForm.serialize().map((item) => {
                                if (item.attrName === 'nameI18nJson') {
                                    item.value = item.value.value;
                                }
                                return item;
                            });
                            this.$emit('handler-submit', this.isCreateForm, formData);
                        }
                    });
                } else {
                    this.$refs.templateBaseInfoForm.submit((res) => {
                        if (res.valid) {
                            const templateBaseInfoForm = this.$refs.templateBaseInfoForm.serialize().map((item) => {
                                if (item.attrName === 'nameI18nJson') {
                                    item.value = item.value.value;
                                }
                                return item;
                            });
                            this.$refs.templateDocForm.submit((resp) => {
                                if (resp.valid) {
                                    const templateDocForm = this.$refs.templateDocForm.serialize();
                                    const attrRawList = templateBaseInfoForm;
                                    const templateType = templateDocForm.find((item) => {
                                        return item.attrName === 'templateType';
                                    });
                                    attrRawList.push(templateType);
                                    attrRawList.push({
                                        attrName: 'businessRef',
                                        value: this.editRow.oid
                                    });
                                    const contentSetAttr = templateDocForm.find((item) => {
                                        return item.attrName === 'contentSet';
                                    });
                                    const contentSet = contentSetAttr?.value.map((item) => {
                                        return {
                                            actionFlag: 1,
                                            id: item,
                                            source: 0,
                                            role: 'PRIMARY'
                                        };
                                    });
                                    const formData = {
                                        attrRawList,
                                        contentSet
                                    };
                                    this.$emit('handler-submit', this.isCreateForm, formData);
                                }
                            });
                        }
                    });
                }
            },
            handlerDownloadTemplate() {
                let authorizeCode = this.categoryFormData.authorizeCode;
                if (
                    this.categoryFormData.templateFileId &&
                    authorizeCode &&
                    authorizeCode[this.categoryFormData.templateFileId]
                ) {
                    erdcKit.downloadFile(
                        this.categoryFormData.templateFileId,
                        authorizeCode[this.categoryFormData.templateFileId]
                    );
                }
            }
        }
    };
});
