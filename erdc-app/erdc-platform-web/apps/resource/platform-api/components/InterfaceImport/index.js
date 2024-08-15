define([
    'text!' + ELMP.resource('platform-api/components/InterfaceImport/index.html'),
    'css!' + ELMP.resource('platform-api/components/InterfaceImport/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        template,
        props: {
            serviceList: {
                type: Array,
                require: true
            }
        },
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-api/views/ApiManagement/locale/index.js'),
                i18nMappingObj: {
                    interfaceFileImport: this.getI18nByKey('接口文件导入'),
                    interfaceType: this.getI18nByKey('接口类型'),
                    serviceName: this.getI18nByKey('服务名'),
                    versionNo: this.getI18nByKey('版本号'),
                    selectFile: this.getI18nByKey('选择文件'),
                    selectFileTip: this.getI18nByKey('请选择文件'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    importSuccess: this.getI18nByKey('导入成功'),
                    uploadTip: this.getI18nByKey('interface_doc_tips_upload_json')
                },

                visible: false,
                interfaceType: [
                    {
                        value: 'rest',
                        label: 'Rest'
                    },
                    {
                        value: 'dubbo',
                        label: 'Dubbo'
                    }
                ],

                formData: {
                    service: '',
                    interfaceType: 'rest',
                    version: '',
                    file: ''
                },
                fileList: [],
                appApiDetail: ''
            };
        },
        computed: {
            formConfig() {
                const { i18nMappingObj, toLowerCase, isEdit } = this;

                const formConfig = [
                    {
                        field: 'service',
                        label: i18nMappingObj.serviceName,
                        required: true,
                        slots: {
                            component: 'service'
                        }
                    },
                    {
                        field: 'interfaceType',
                        label: i18nMappingObj.interfaceType,
                        required: true,
                        slots: {
                            component: 'type'
                        }
                    },
                    {
                        field: 'version',
                        component: 'erd-input',
                        label: i18nMappingObj.versionNo,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.versionNo)}`
                        }
                    },
                    {
                        field: 'upload',
                        label: i18nMappingObj.selectFile,
                        slots: {
                            component: 'upload'
                        }
                    }
                ];
                return formConfig;
            },
            uploadUrl() {
                return `/common/apiauth/v1/doc/save/json/${this.formData.interfaceType}`;
            }
        },
        methods: {
            toLowerCase(str) {
                return String.prototype.toLowerCase.call(str);
            },
            show() {
                const self = this;
                this.formData = {
                    service: '',
                    interfaceType: 'rest',
                    version: '',
                    file: ''
                };
                this.fileList = [];
                this.visible = true;
                self.$nextTick(() => {
                    self.$refs.form?.clearValidate();
                });
            },
            confirm() {
                if (!this.fileList.length) {
                    this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj.selectFileTip
                    });
                    return;
                }

                this.$refs.form.submit().then(({ valid }) => {
                    if (valid) {
                        const { formData } = this;
                        const serviceId = formData.service;
                        const findService = this.serviceList.find((item) => item.id === serviceId);
                        if (findService) {
                            const appApiDetail = {
                                appName: findService.appName,
                                shortName: findService.appName,
                                entityAppName: findService.serviceName,
                                appVersion: formData.version
                            };

                            this.appApiDetail = appApiDetail;
                            this.fileUpload();
                        }
                    }
                });
            },
            cancel() {
                this.visible = false;
            },
            saveSuccess() {
                this.visible = false;
                this.$emit('saveSuccess');
            },
            fileUpload() {
                const { appApiDetail, i18nMappingObj, uploadUrl, formData } = this;
                this.$famHttp({
                    url: uploadUrl,
                    method: 'post',
                    data: appApiDetail,
                    params: {
                        fileId: formData.file
                    }
                });
                this.$message({
                    message: i18nMappingObj.systemImport,
                    type: 'success',
                    showClose: true,
                    dangerouslyUseHTMLString: true
                });
                this.saveSuccess();
            },
            onBeforeUpload(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (type !== '.json') {
                    this.$message({
                        message: this.i18nMappingObj.jsonDesc,
                        type: 'warning'
                    });
                    return false;
                }
            },
            handleRemove() {
                this.fileList = [];
                this.formData.file = '';
            },
            handleAppSuccess(file, response, fileList) {
                if (file.success) {
                    this.fileList = fileList;
                    this.formData.file = file.data;
                } else {
                    this.$message({
                        message: file.message,
                        type: 'error'
                    });
                    this.handleRemove();
                }
            }
        }
    };
});
