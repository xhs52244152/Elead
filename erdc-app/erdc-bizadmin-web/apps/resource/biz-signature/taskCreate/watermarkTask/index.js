define([
    'text!' + ELMP.resource('biz-signature/taskCreate/watermarkTask/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    ELMP.resource('biz-signature/mixins/lazyWatermark.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (tmpl, CONST, watermarkMixin) {
    const FamKit = require('fam:kit');
    return {
        template: tmpl,
        mixins: [watermarkMixin],
        components: {
            FamErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamDynamicForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        computed: {
            formConfigs: function () {
                return [
                    {
                        col: 24,
                        component: 'FamClassificationTitle',
                        props: {
                            unfold: true
                        },
                        label: this.i18nMappingObj.taskDetail,
                        nameI18nJson: {
                            value: this.i18nMappingObj.taskDetail
                        },
                        children: [
                            {
                                component: 'Slot',
                                props: {
                                    name: 'file-slot',
                                    clearable: false
                                },
                                col: 24,
                                required: true,
                                field: 'file',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.watermarkFile,
                                    zh_cn: ''
                                },
                                label: this.i18nMappingObj.watermarkFile
                            },

                            {
                                label: this.i18nMappingObj.taskName,
                                component: 'ErdInput',
                                readonly: false,
                                required: true,
                                props: {
                                    maxlength: 100,
                                    clearable: false,
                                    placeholder: this.i18nMappingObj.taskNameTips
                                },
                                col: 12,
                                field: 'taskName',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.taskName
                                }
                            },

                            {
                                label: this.i18nMappingObj.addWatermark,
                                component: 'Slot',
                                readonly: false,
                                required: true,
                                props: {
                                    name: 'watermark-slot'
                                },
                                col: 12,
                                field: 'watermark',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.addWatermark
                                }
                            }
                        ]
                    }
                ];
            }
        },
        data() {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'taskDetail',
                    'taskName',
                    'addWatermark',
                    'taskNameTips',
                    'createSuccess',
                    'pdfFileTips',
                    'fileExist',
                    'view',
                    'signatureUpload',
                    'watermarkFile'
                ]),
                formData: {},

                // 签名模板可选项
                signatureTmplOptions: [],
                // 签名模板对应的版本号可选项
                signatureTmplVersionsOptions: [],
                CONST: CONST
            };
        },
        methods: {
            onFileUploadSuccess: function (response, file) {
                this.$set(this.formData, 'file', response.data);
                this.$set(this.formData, 'taskName', file.name);
            },
            resetFileData: function () {
                this.$set(this.formData, 'file', '');
                this.$set(this.formData, 'taskName', '');
            },
            handleExceed: function () {
                this.$message({
                    message: this.i18nMappingObj.fileExist,
                    type: 'warning'
                });
            },
            onBeforeUpload(file) {
                const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
                if (type !== 'pdf') {
                    this.$message({
                        message: this.i18nMappingObj.pdfFileTips,
                        type: 'warning'
                    });
                    return false;
                }
            },
            submit: function () {
                return this.$refs.layoutForm.submit().then((result) => {
                    if (result.valid) {
                        return this.$famHttp({
                            url: '/doc/watermark/v1/task',
                            method: 'post',
                            data: {
                                sourceFileId: this.formData.file,
                                taskName: this.formData.taskName,
                                code: this.formData.watermark,
                                className: 'erd.cloud.signature.entity.SignatureTmpl'
                            }
                        }).then((resp) => {
                            if (resp.success) {
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj.createSuccess,
                                    showClose: true
                                });
                            }
                        });
                    } else {
                        return Promise.reject();
                    }
                });
            }
        },
        mounted() {
            this.queryWatermark();
        }
    };
});
