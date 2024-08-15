define([
    'text!' + ELMP.resource('platform-mfe/components/uploadSource/index.html'),
    ELMP.resource('platform-mfe/CONST.js')
], function (tmpl, CONST) {
    return {
        template: tmpl,
        components: {},
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            uploadUrl: {
                type: String,
                default: '/file/file/site/storage/v1/upload'
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-mfe/locale'),
                CONST: CONST,
                fileList: [],
                fileId: ''
            };
        },
        methods: {
            handleRemove() {
                this.fileList = [];
                this.fileId = '';
            },
            handleSuccess(file, fileList) {
                this.fileList = fileList;
                this.fileId = file.data;
            },
            handleExceed() {
                this.$message({
                    message: '文件已存在，请删除后重新上传',
                    type: 'warning'
                });
            },
            onBeforeUpload(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (['.zip', '.tgz'].indexOf(type) === -1) {
                    this.$message({
                        message: '只能上传zip或tgz文件',
                        type: 'warning'
                    });
                    return false;
                }
            },
            submitSource() {
                this.$emit('save', this.fileId);
            },
            cancelSource() {
                this.$emit('cancel');
            }
        }
    };
});
