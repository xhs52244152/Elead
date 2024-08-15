define([
    'text!' + ELMP.resource('platform-mfe/views/application/importModal/index.html'),
    ELMP.resource('platform-mfe/CONST.js'),
    ELMP.resource('platform-mfe/api.js'),
    'erdc-kit'
], function (tmpl, CONST, api, FamUtils) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template: tmpl,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-mfe/locale'),
                visible: false,
                CONST: CONST,
                fileList: [],
                loading: false
            };
        },
        methods: {
            show() {
                const self = this;
                this.visible = true;
                self.$nextTick(() => {
                    self.clearData();
                });
            },
            submit() {
                const { i18nMappingObj } = this;
                if (this.fileList.length > 0) {
                    const params = new FormData();
                    params.append('file', this.fileList[0].raw);
                    this.loading = true;
                    this.$famHttp({
                        url: '/file/file/site/storage/v1/upload',
                        method: 'post',
                        data: params,
                        params: {
                            className: 'erd.cloud.site.console.file.entity.FileInfo'
                        }
                    })
                        .then((res) => {
                            if (res.success) {
                                api.backMicro({
                                    fileId: res.data
                                });
                                this.$message({
                                    message: i18nMappingObj.systemImport,
                                    type: 'success',
                                    showClose: true,
                                    dangerouslyUseHTMLString: true
                                });
                                this.visible = false;
                            } else {
                                this.$message({
                                    message: res.message,
                                    type: 'error'
                                });
                                this.handleRemove();
                            }
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                } else {
                    this.$message({
                        type: 'warning',
                        message: i18nMappingObj.uploadTips
                    });
                }
            },
            clearData() {
                this.loading = false;
                this.fileList = [];
                this.$refs.importForm?.clearValidate();
            },
            cancel() {
                this.clearData();
                this.visible = false;
            },
            handleChange(file, fileList) {
                this.fileList = fileList;
            },
            handleRemove() {
                this.fileList = [];
            },
            handleExceed() {
                this.$message({
                    message: this.i18nMappingObj.fileExist,
                    type: 'warning'
                });
            },
            onBeforeUpload(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (type !== '.zip') {
                    this.$message({
                        message: this.i18nMappingObj.zipDesc,
                        type: 'warning'
                    });
                    return false;
                }
            },
            exportData() {
                api.copyMicro();
                this.$message({
                    type: 'success',
                    message: this.i18nMappingObj.exporting,
                    showClose: true,
                    dangerouslyUseHTMLString: true
                });
            }
        }
    };
});
