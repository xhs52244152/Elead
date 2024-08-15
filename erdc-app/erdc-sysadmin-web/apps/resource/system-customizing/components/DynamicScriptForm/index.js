define(['text!' + ELMP.resource('system-customizing/components/DynamicScriptForm/index.html'), 'erdc-kit'], function (
    template,
    ErdcKit
) {
    return {
        template,
        props: {
            dialogType: {
                type: String,
                default: 'create'
            },
            detailInfo: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-customizing/views/CustomScripting/locale/index.js'),
                i18nMappingObj: {
                    ApiPlaceholder: this.getI18nByKey('ApiPlaceholder'),
                    apiCallPlaceholder: this.getI18nByKey('apiCallPlaceholder'),
                    introduceScript: this.getI18nByKey('introduceScript'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    pleaseSelectFile: this.getI18nByKey('请选择文件'),
                    ok: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    createSucess: this.getI18nByKey('创建成功'),
                    updateSucess: this.getI18nByKey('更新成功'),
                    deleteOrNot: this.getI18nByKey('是否删除'),
                    confirmDelete: this.getI18nByKey('是否删除附件'),
                    exceedsLimit: this.getI18nByKey('exceedsLimit')
                },
                form: {
                    displayName: '',
                    name: '',
                    appName: '',
                    groovyType: '',
                    functionName: '',
                    description: '',
                    fileList: []
                },
                editable: false,
                uploadedFileList: []
            };
        },
        watch: {
            detailInfo: {
                handler(val) {
                    if (this.dialogType === 'update' && val) {
                        const {
                            id,
                            displayName,
                            name,
                            appName,
                            serviceName,
                            groovyType,
                            functionName,
                            description,
                            fileId,
                            fileName,
                            contentId
                        } = val;
                        this.form = {
                            id,
                            displayName,
                            name,
                            appName,
                            serviceName,
                            groovyType,
                            functionName,
                            description,
                            fileList: [contentId]
                        };
                        this.uploadedFileList = [
                            {
                                name: fileName,
                                fileId
                            }
                        ];
                    }
                },
                immediate: true
            }
        },
        computed: {
            formLayout() {
                const ENABLED = 1;
                let self = this;
                const res = [
                    {
                        field: 'displayName',
                        component: 'erd-input',
                        label: '名称',
                        required: true,
                        validators: [],
                        props: {
                            placeholder: '请输入',
                            clearable: false
                        },
                        col: 24
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: '内部名称',
                        labelLangKey: 'internalName',
                        disabled: this.isDisabled,
                        required: true,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: function (rule, value, callback) {
                                    if (value === '') {
                                        callback(new Error('请输入内部名称'));
                                    } else if (value.match(/[^a-zA-Z0-9_.\- ]/gi)) {
                                        callback(new Error('请输入大小写字母、"_"、."'));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['ApiPlaceholder'],
                            placeholderLangKey: '请输入'
                        },
                        col: 24
                    },
                    {
                        field: 'serviceName',
                        component: 'custom-select',
                        label: '所属服务',
                        labelLangKey: 'componentType',
                        disabled: this.isDisabled,
                        required: true,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/platform/service/list',
                                    viewProperty: 'displayName',
                                    valueProperty: 'shortName'
                                }
                            }
                        },
                        listeners: {
                            callback: async (data) => {
                                this.setAppName(data);
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'groovyType',
                        component: 'custom-select',
                        label: '使用场景',
                        labelLangKey: 'component',
                        disabled: this.isDisabled,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj.pleaseSelect,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/dictionary/tree/groovyCode',
                                    viewProperty: 'displayName',
                                    valueProperty: 'identifierNo',
                                    params: {
                                        status: ENABLED
                                    }
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'functionName',
                        component: 'erd-input',
                        label: '调用方法',
                        required: false,
                        validators: [],
                        props: {
                            placeholder: this.i18nMappingObj.apiCallPlaceholder,
                            clearable: false
                        },
                        col: 24
                    },
                    {
                        field: 'description',
                        component: 'erd-input',
                        label: '描述',
                        labelLangKey: 'description',
                        required: false,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.introduceScript,
                            placeholderLangKey: '请选择',
                            type: 'textarea',
                            i18nName: '描述'
                        },
                        col: 24
                    },
                    {
                        field: 'fileList',
                        component: 'fam-upload',
                        label: '上传文件',
                        required: true,
                        props: {
                            'limit': 1,
                            'accept': '.txt',
                            'fileListType': 'none',
                            'fileList': this.uploadedFileList,
                            'btnConfig': {
                                disabled: false
                            },
                            'className': 'erd.cloud.groovy.entity.GroovyScript',
                            'on-preview': (file) => {
                                if (
                                    file.fileId &&
                                    self.detailInfo.authorizeCode &&
                                    self.detailInfo.authorizeCode[file.fileId]
                                ) {
                                    ErdcKit.downloadFile(file.fileId, self.detailInfo.authorizeCode[file.fileId]);
                                }
                            },
                            'before-remove': async () => {
                                return await new Promise((resolve) => {
                                    this.$confirm(
                                        this.i18nMappingObj['confirmDelete'],
                                        this.i18nMappingObj['deleteOrNot'],
                                        {
                                            confirmButtonText: this.i18nMappingObj['ok'],
                                            cancelButtonText: this.i18nMappingObj['cancel'],
                                            type: 'warning'
                                        }
                                    ).then(() => {
                                        this.form.fileList = [];
                                        this.uploadedFileList = [];
                                        resolve(true);
                                    });
                                });
                            },
                            'on-exceed': () => {
                                this.$message.warning(this.i18nMappingObj['exceedsLimit']);
                            }
                        },
                        col: 24
                    }
                ];
                return res;
            },
            isDisabled() {
                return this.dialogType === 'update' && Boolean(this.detailInfo.enabled);
            }
        },
        methods: {
            setAppName(data) {
                this.form.appName = data.selected?.appName;
            },
            submit(callback) {
                this.$refs.dynamicForm.submit().then(() => {
                    if (!this.form.fileList?.length) {
                        this.$message.error(this.i18nMappingObj['pleaseSelectFile']);
                        return;
                    }
                    let data = {
                        ...this.form,
                        contentId: this.form.fileList?.[0],
                        description: this.form.description,
                        action: this.dialogType
                    };
                    delete data.fileList;
                    this.$famHttp({
                        url: '/common/groovy/import',
                        method: 'POST',
                        data
                    })
                        .then((resp) => {
                            if (resp.success) {
                                this.$emit('changeDialogStatus', false);
                                callback && callback();
                                const msgI18n =
                                    this.i18nMappingObj[this.dialogType === 'create' ? 'createSucess' : 'updateSucess'];
                                this.$message.success(msgI18n);
                            }
                        })
                        .catch(() => {})
                        .finally(() => {});
                });
            }
        }
    };
});
