define(['text!' + ELMP.resource('biz-signature/components/importDialog/index.html')], function (tmpl) {
    const ErdcKit = require('erdc-kit');

    return {
        template: tmpl,
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        props: {
            action: {
                type: String,
                default: '/file/file/site/storage/v1/upload'
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-signature/locale'),
                visible: false,
                fileList: []
            };
        },
        methods: {
            show() {
                this.visible = true;
            },
            handleRemove() {
                this.fileList = [];
            },
            handleChange(file, fileList) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (type !== '.zip') {
                    this.fileList = [];
                    this.$message({
                        message: this.i18nMappingObj.zipDesc,
                        type: 'warning'
                    });
                    return false;
                } else {
                    this.fileList = fileList;
                }
            },
            handleExceed(file, fileList) {
                this.$message({
                    message: this.i18nMappingObj.fileExist,
                    type: 'warning'
                });
            },
            submit() {
                if(this.fileList.length <= 0) {
                    this.$message({
                        message: this.i18nMappingObj.noFile,
                        type: 'warning'
                    });
                } else {
                    const data = new FormData();
                    data.append('file', this.fileList[0].raw);
                    const params = {
                        className: 'erd.cloud.site.console.file.entity.FileInfo'
                    };
                    const isSign = this.action === '/file/signature/v1/picture/upload';
                    if(!isSign) {
                        this.$famHttp({
                            url: this.action,
                            method: 'post',
                            data: data,
                            params: params
                        });
                        this.$message({
                            message: this.i18nMappingObj.systemImport,
                            type: 'success',
                            showClose: true,
                            dangerouslyUseHTMLString: true
                        });
                    }
                    this.$emit('submitSucess', this.fileList[0].raw);
                    this.cancel();
                }
            },
            cancel() {
                this.fileList = [];
                this.visible = false;
            }
        }
    };
});
