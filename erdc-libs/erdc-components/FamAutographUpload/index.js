/**
 * 签名上传
 *
 vue组件components引入
 # 组件声明
 components: {
      FamAutographUpload: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAutographUpload/index.js'))
    }
 * **/
define([
    'text!' + ELMP.resource('erdc-components/FamAutographUpload/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamAutographUpload/style.css')
], function (template, ErdcKit) {
    return {
        template,
        props: {
            action: {
                type: String,
                default: '/file/file/site/storage/v1/upload'
            },
            value: {
                type: String,
                default() {
                    return '';
                }
            },
            readonly: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            // 上传按钮文字
            buttonText: String,
            // 提示文字
            tips: String,
            // 图片尺寸
            thumbnailSize: {
                type: String,
                default() {
                    return '64px*64px';
                }
            },
            clearable: {
                type: Boolean,
                default() {
                    return true;
                }
            }
        },
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/FamAutographUpload/locale/index.js'),
                showRemoveButton: false
            };
        },
        computed: {
            requestHeader() {
                return {
                    Authorization: localStorage.getItem('accessToken'),
                    'Tenant-Id': window.encodeURIComponent(JSON.parse(localStorage.getItem('tenantId')) || '')
                };
            },
            imageSize() {
                const thumbnailSize = this.thumbnailSize.trim();
                if (thumbnailSize) {
                    if (/^(\d+px\s*\*\s*\d+px)$/.test(thumbnailSize)) {
                        const thumbnailSizeArr = thumbnailSize.split('*');
                        return {
                            width: thumbnailSizeArr[0],
                            height: thumbnailSizeArr[1]
                        };
                    }
                }
                return {
                    width: 'auto',
                    height: 'auto'
                };
            },
            imageStyle() {
                return {
                    width: this.imageSize.width,
                    height: this.imageSize.height
                };
            },
            tip() {
                return [this.tips, this.clearable ? this.i18n.deleteTips : ''].filter(Boolean).join(', ');
            },
            innerValue() {
                return this.value ? ErdcKit.imgUrlCreator(this.value) : this.value;
            }
        },
        methods: {
            handleChange(resp) {
                // 有响应结果再进入处理
                if (resp?.response) {
                    if (resp?.response?.success) {
                        this.$emit('input', resp.response.data); // 保存文件id
                    } else {
                        this.$message({
                            type: 'error',
                            message: resp?.response?.message || resp?.response || resp
                        });
                    }
                }
            },
            handleRemove() {
                this.$confirm(this.i18n.confirmDelete, this.i18n.confirmTitle, {
                    type: 'warning'
                }).then(() => {
                    this.$emit('input', '');
                });
            },
            handleMouseEnter() {
                this.timer = setTimeout(() => {
                    this.timer = null;
                    this.showRemoveButton = true;
                }, 800);
            },
            handleMouseLeave() {
                if (this.timer) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }
                this.showRemoveButton = false;
            }
        }
    };
});
