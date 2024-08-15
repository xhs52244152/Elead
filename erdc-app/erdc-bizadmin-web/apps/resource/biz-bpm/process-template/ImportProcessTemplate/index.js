define(['text!' + ELMP.resource('biz-bpm/process-template/ImportProcessTemplate/index.html')], function (template) {
    const _ = require('underscore');
    return {
        name: 'ImportProcessTemplate',
        template,
        props: {
            // 是否只读
            readonly: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    '组件提示',
                    '导入发布标识',
                    '导入节点配置',
                    '选择文件',
                    '导入成功',
                    '导入失败',
                    '请选择文件'
                ]),
                formDetails: {
                    fileList: [],
                    isReleased: '2'
                }
            };
        },
        computed: {
            // 按钮组合表单数据
            fromList() {
                return [
                    {
                        field: 'isReleased',
                        component: 'erd-switch',
                        label: this.i18nMappingObj['导入发布标识'],
                        required: false,
                        disabled: false,
                        hidden: false,
                        col: 24,
                        props: {
                            'active-value': '1',
                            'inactive-value': '2'
                        }
                    },
                    {
                        field: 'fileList',
                        component: 'fam-upload',
                        label: this.i18nMappingObj['选择文件'],
                        disabled: false,
                        required: false,
                        hidden: false,
                        props: {
                            'accept': '.zip',
                            'fileListType': 'default',
                            'btnConfig': {
                                disabled: false
                            },
                            'action': '/bpm/procmodel/import/config',
                            'data': _.omit(this.formDetails, 'fileList'),
                            'multiple': true,
                            'auto-upload': false,
                            'on-success': this.onImportSuccess,
                            'on-error': this.onImportError
                        },
                        slots: {
                            label: 'uploadFileLabel',
                            component: 'uploadTemplate'
                        },
                        col: 24
                    }
                ];
            }
        },
        methods: {
            // 上传成功
            onImportSuccess(resp, file, fileList) {
                if (resp.success) {
                    this.$message.success(this.i18nMappingObj['导入成功']);
                    this.$emit('on-import-success');
                } else {
                    this.onImportError(resp);
                }
            },
            // 上传失败
            onImportError(resp) {
                // this.$message.error(resp?.message || this.i18nMappingObj['导入失败']);
                this.$refs.famUpload.$refs['upload'].uploadFiles = [];
                this.$emit('on-import-error');
            },
            // 表单校验
            submitCopy(dialogObj) {
                const { dynamicForm } = this.$refs,
                    { submit, serializeEditableAttr } = dynamicForm;
                submit()
                    .then((res) => {
                        if (res.valid) {
                            if (_.isEmpty(this.$refs?.famUpload?.$refs['upload']?.uploadFiles)) {
                                return this.$message.error(this.i18nMappingObj['请选择文件']);
                            }
                            dialogObj.loading = true;
                            this.$refs?.famUpload?.$refs['upload']?.submit();
                        } else {
                            this.$emit('on-import-error');
                        }
                    })
                    .catch((err) => {
                        this.$emit('on-import-error');
                    });
            }
        }
    };
});
