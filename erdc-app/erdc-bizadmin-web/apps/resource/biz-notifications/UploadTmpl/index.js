define([
    'text!' + ELMP.resource('biz-notifications/UploadTmpl/index.html'),
    'css!' + ELMP.resource('biz-notifications/UploadTmpl/index.css'),
    'underscore'
], function (template) {
    return {
        name: 'FamErdUploadTmpl',
        template: template,
        props: {
            title: String,
            uploadProps: {
                type: Object,
                default: () => {}
            },
            visible: Boolean
        },
        data: function () {
            return {
                i18nLocalePath: ELMP.resource('biz-notifications/locale/index.js'),
                i18nMappingObj: {
                    name: this.getI18nByKey('请按格式填写模板'),
                    save: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    tmpl: this.getI18nByKey('模板'),
                    upload: this.getI18nByKey('上传'),
                    download: this.getI18nByKey('下载')
                }
            };
        },
        computed: {
            dialogListeners: function () {
                var self = this;
                return Object.assign({}, this.$listeners, {
                    closed: self.onClosed
                });
            },
            localUploadProps: function () {
                var self = this;

                return Object.assign({}, this.uploadProps);
            }
        },
        methods: {
            onClosed: function () {
                this.$refs.upload && this.$refs.upload.clearFiles();
                this.$emit('closed');
            },
            downloadFile: function () {
                this.downloadUrl && $.el.download(this.downloadUrl);
            },
            save: function () {
                if (this.$refs.upload && this.localUploadProps.action) {
                    this.$refs.submit();
                }
                this.$emit('submit');
            },
            cancel: function () {
                this.$emit('update:visible', false);
            }
        }
    };
});
