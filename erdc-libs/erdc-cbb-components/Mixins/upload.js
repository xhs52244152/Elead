define([], function () {
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        props: {
            // 类名
            className: {
                type: String,
                required: true
            },
            // 自定义上传路径
            uploadAttachUrl: String
        },
        data() {
            return {
                // 默认新增附件url
                defaultUploadAttachUrl: '/fam/content/file/upload'
            };
        },
        computed: {
            innerUploadAttachUrl() {
                return this.uploadAttachUrl || this.defaultUploadAttachUrl;
            }
        },
        methods: {
            // 自定义上传
            httpRequest(option) {
                let formData = new FormData();
                if (option.data) {
                    Object.keys(option.data).forEach(function (key) {
                        formData.append(key, option.data[key]);
                    });
                }
                formData.append(option.filename, option.file, option.file.name);
                return this.$famHttp({
                    url: this.innerUploadAttachUrl,
                    method: 'post',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    className: this.className
                });
            }
        }
    };
});
