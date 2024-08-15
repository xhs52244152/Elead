define([
    'text!' + ELMP.resource('biz-bpm/process-interface/components/ImportInterface/index.html')
], function (template) {
    const _ = require('underscore');
    return {
        name: 'ImportInterface',
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
                formDetails: {
                    fileList: []
                }
            };
        },
        computed: {
            // 按钮组合表单数据
            fromList() {
                return [
                    {
                        field: 'fileList',
                        component: 'fam-upload',
                        label: this.i18n['选择文件'],
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
                    this.$message.success(this.i18n['导入成功']);
                    this.$emit('on-import-success');
                } else {
                    this.onImportError(resp);
                }
            },
            // 上传失败
            onImportError() {
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
                                return this.$message.error(this.i18n['请选择文件']);
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
