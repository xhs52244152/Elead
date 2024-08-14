define(['text!' + ELMP.resource('ppm-component/ppm-components/ImportDialog/index.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            visible: Boolean,
            importMethodDisabled: {
                type: Boolean,
                default: false
            },
            importType: String
        },
        computed: {
            showDialog: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            formConfig() {
                return [
                    {
                        field: 'uploadFile',
                        label: this.i18nMappingObj.uploadFile,
                        component: 'erd-radio',
                        disabled: false,
                        required: false,
                        validators: [],
                        slots: {
                            component: 'uploadFile'
                        },
                        col: 24
                    },
                    {
                        field: 'importMethod',
                        component: 'custom-select',
                        label: this.i18nMappingObj.importMethod,
                        disabled: this.importMethodDisabled,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj.pleaseSelect,
                            placeholderLangKey: 'pleaseEnter',
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'name', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.importMethods
                            }
                        },
                        col: 24
                    }
                ];
            },
            importMethods() {
                return [
                    {
                        name: this.i18nMappingObj.onlyUpdateAndAppend,
                        value: false
                    },
                    {
                        name: this.i18nMappingObj.replaceAll,
                        value: true
                    }
                ];
            },
            confirmDisabled() {
                return !this.formData.fileId;
            }
        },
        created() {
            switch (this.importType) {
                case 'excel':
                    this.importTypes = '.xlsx';
                    break;
                case 'mpp':
                    this.importTypes = '.mpp';
                    break;
                default:
                    this.importTypes = '.xlsx';
                    break;
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/ImportDialog/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    clickUpload: this.getI18nByKey('clickUpload'),
                    import: this.getI18nByKey('import'),
                    onlyUpdateAndAppend: this.getI18nByKey('onlyUpdateAndAppend'),
                    replaceAll: this.getI18nByKey('replaceAll'),
                    importTipsInfo: this.getI18nByKey('importTipsInfo'),
                    uploadFile: this.getI18nByKey('uploadFile'),
                    importMethod: this.getI18nByKey('importMethod'),
                    fileUploadedSuccessfully: this.getI18nByKey('fileUploadedSuccessfully'),
                    excelFileTypeError: this.getI18nByKey('excelFileTypeError'),
                    pressDeleteToDeleteFile: this.getI18nByKey('pressDeleteToDeleteFile')
                },
                formData: {
                    importMethod: false,
                    fileId: ''
                },
                fieList: [],
                importTypes: ''
            };
        },
        methods: {
            confirm() {
                this.$emit('before-submit', this.formData);
            },
            uploadFile(file) {
                let flag = this.isFileType(file);
                if (flag) {
                    let formData = new FormData();
                    formData.append('file', file.raw);
                    this.$famHttp({
                        url: '/file/file/site/storage/v1/upload',
                        method: 'POST',
                        data: formData
                    }).then((res) => {
                        if (res.success) {
                            this.$message({ type: 'success', message: this.i18nMappingObj.fileUploadedSuccessfully });
                            this.fieList = [file];
                            this.formData.fileId = res.data;
                        }
                    });
                } else {
                    this.fieList = this.fieList.length ? this.fieList.splice(0, 1) : [];
                }
            },
            handleRemove() {
                this.formData.fileId = '';
                this.fieList = [];
            },
            // 判断文件类型
            isFileType(file) {
                let fileType = file.name.split('.');
                let fileTypeArr = this.importTypes.split(',');
                let flag = false;
                fileTypeArr.forEach((item) => {
                    if (fileType[fileType.length - 1] === item.replace('.', '')) {
                        flag = true;
                    }
                });
                if (!flag) {
                    let messageFiled = '';
                    switch (this.importType) {
                        case 'excel':
                            messageFiled = 'excelFileTypeError';
                            break;
                        case 'mpp':
                            messageFiled = 'mppFileTypeError';
                            break;
                        default:
                            messageFiled = 'fileTypeError';
                            break;
                    }
                    this.$message({ type: 'error', message: this.i18n[messageFiled] });
                }
                return flag;
            }
        }
    };
});
