define([
    'text!' + ELMP.resource('platform-mfe/components/uploadForm/index.html'),
    ELMP.resource('platform-mfe/CONST.js'),
    ELMP.resource('platform-mfe/api.js')
], function (tmpl, CONST, api) {
    const ErdcKit = require('erdcloud.kit');
    const formDefault = {
        appfile: '',
        desc: '',
        source: ''
    };

    return {
        template: tmpl,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-mfe/locale'),
                CONST: CONST,
                visible: false,
                formData: Object.assign({}, formDefault),
                appFileList: [],
                sourceFileList: []
            };
        },
        computed: {
            formConfigs() {
                const { i18nMappingObj } = this;
                const config = [
                    {
                        field: 'appfile',
                        label: i18nMappingObj.softPack,
                        required: true,
                        col: 24,
                        validators: [{ required: true, message: i18nMappingObj.softTips, trigger: 'change' }],
                        slots: {
                            component: 'appfile'
                        }
                    },
                    {
                        field: 'desc',
                        component: 'erd-input',
                        label: i18nMappingObj.versionDesc,
                        required: false,
                        col: 24,
                        props: {
                            type: 'textarea',
                            rows: 4,
                            maxlength: 1000
                        }
                    },
                    {
                        field: 'source',
                        label: i18nMappingObj.sourcePack,
                        required: false,
                        col: 24,
                        slots: {
                            component: 'source'
                        }
                    }
                ];
                return config;
            }
        },
        methods: {
            show() {
                this.formData = JSON.parse(JSON.stringify(formDefault));
                this.visible = true;
            },
            submit() {
                this.$refs.uploadForm.submit().then(() => {
                    let params = {
                        id: this.formData.appfile,
                        versionDesc: this.formData.desc
                    };
                    if (this.formData.source !== '') {
                        params.sourceCodeFileId = this.formData.source;
                    }
                    api.updateInform(params).then((resp) => {
                        if (resp.data) {
                            this.$message({
                                type: 'success',
                                message: '保存成功',
                                showClose: true
                            });
                            this.$emit('done');
                            this.$nextTick(() => {
                                this.clearData();
                            });
                            this.visible = false;
                        }
                    });
                });
            },
            clearData() {
                this.appFileList = [];
                this.sourceFileList = [];
                this.$refs.uploadForm?.clearValidate();
            },
            cancel() {
                this.clearData();
                this.visible = false;
            },
            // 微应用上传成功
            handleAppSuccess(file, response, fileList) {
                if (file.success) {
                    this.appFileList = fileList;
                    this.formData.appfile = file.data;
                } else {
                    this.$message({
                        message: file.message,
                        type: 'error'
                    });
                    this.handleRemoveApp();
                }
            },
            handleRemoveApp() {
                this.appFileList = [];
                this.formData.appfile = '';
            },
            onBeforeUploadApp(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (type !== '.tgz') {
                    this.$message({
                        message: this.i18nMappingObj.tgzTips,
                        type: 'warning'
                    });
                    return false;
                }
            },
            // 源码包上传成功
            handleSourceSuccess(file, response, fileList) {
                if (file.success) {
                    this.sourceFileList = fileList;
                    this.formData.source = file.data;
                } else {
                    this.$message({
                        message: file.message,
                        type: 'error'
                    });
                    this.handleRemoveSource();
                }
            },
            handleRemoveSource() {
                this.formData.source = '';
                this.sourceFileList = [];
            },
            onBeforeUploadSource(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (['.zip', '.tgz'].indexOf(type) === -1) {
                    this.$message({
                        message: this.i18nMappingObj.zipTips,
                        type: 'warning'
                    });
                    return false;
                }
            }
        }
    };
});
