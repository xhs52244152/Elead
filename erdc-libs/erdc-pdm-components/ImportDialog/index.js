define([
    'text!' + ELMP.resource('erdc-pdm-components/ImportDialog/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ImportDialog',
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
        data() {
            return {
                i18nPath: ELMP.resource('erdc-pdm-components/ImportDialog/locale/index.js'),
                formData: {
                    importMethod: false,
                    fileId: ''
                },
                fieList: [],
                importTypes: ''
            };
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
                        label: this.i18n.uploadFile,
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
                        label: this.i18n.importMethod,
                        disabled: this.importMethodDisabled,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18n.pleaseSelect,
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
                        name: this.i18n.onlyUpdateAndAppend,
                        value: false
                    },
                    {
                        name: this.i18n.replaceAll,
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
                default:
                    break;
            }
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
                        url: '/doc/doc/site/storage/v1/upload',
                        method: 'POST',
                        className: 'erd.cloud.doc.type.entity.TypeDefine',
                        data: formData
                    }).then((res) => {
                        if (res.success) {
                            this.$message({ type: 'success', message: this.i18n.fileUploadedSuccessfully });
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
                        default:
                            break;
                    }
                    this.$message({ type: 'error', message: this.i18n[messageFiled] });
                }
                return flag;
            }
        }
    };
});
