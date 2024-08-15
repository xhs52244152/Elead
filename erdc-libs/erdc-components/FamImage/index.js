define([
    'text!' + ELMP.resource('erdc-components/FamImage/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamImage/style.css')
], function (template, utils) {
    return {
        template,
        props: {
            value: {
                type: [String, Array],
                default: ''
            },
            acceptList: {
                type: [String, Array],
                default: 'image/*'
            },
            limit: {
                type: [String, Number]
            },
            limitSize: {
                type: [String, Number]
            },
            disabled: {
                type: Boolean,
                default: false
            },
            readonly: {
                type: Boolean,
                default: false
            },
            canPreview: {
                type: Boolean,
                default: true
            },
            thumbnailSize: {
                type: String,
                default: '64px*64px'
            },
            tips: {
                type: String,
                default: ''
            },

            // 表单里面查看, 无数据时 '--'占位
            showNoDataMark: {
                type: Boolean,
                default: false
            },
            listType: {
                type: String,
                default: 'picture-card'
            },
            classList: {
                type: [Number, String],
                default: null
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamImage/locale/index.js'),
                i18nMappingObj: {
                    notImageTip: this.getI18nByKey('notImageTip'),
                    notCorrectFormatTip: this.getI18nByKey('notCorrectFormatTip'),
                    notIncludedSize: this.getI18nByKey('notIncludedSize')
                },
                fileList: [],
                thumbnailWidth: '64px',
                thumbnailHeight: '64px',
                isHandleChange: false
            };
        },
        computed: {
            innerAccept() {
                return Array.isArray(this.acceptList) ? this.acceptList.map((i) => `.${i}`).join(',') : this.acceptList;
            },
            requestHeader() {
                return utils.defaultHeaders();
            },
            isLessThenLimit() {
                if (this.limit) {
                    return this.fileList.length < Number(this.limit);
                }
                return true;
            },
            imageActionStyle() {
                let styleCss = {
                    fontSize: '20px',
                    backgroundColor: 'rgba(0,0,0,.5)'
                };
                if (parseInt(this.thumbnailWidth) < 80) {
                    styleCss.fontSize = '14px';
                }
                if (!this.canPreview && this.readonly) {
                    styleCss.backgroundColor = 'transparent';
                }
                return styleCss;
            },
            isPictureType() {
                return this.listType === 'picture-card';
            },
            showPictureAdd() {
                return this.isPictureType && !this.disabled && !this.readonly && this.isLessThenLimit;
            }
        },
        watch: {
            value: {
                handler(val) {
                    if (!this.isHandleChange) {
                        try {
                            let originFileList = Array.isArray(val) ? val : JSON.parse(val);
                            let tempFileList = [];
                            if (Array.isArray(originFileList)) {
                                originFileList.forEach((item) => {
                                    tempFileList.push({
                                        uid: item,
                                        src: utils.imgUrlCreator(item)
                                    });
                                });
                            }
                            this.fileList = tempFileList;
                        } catch (e) {
                            // intentionally empty
                        }
                    }
                },
                immediate: true
            },
            thumbnailSize(val) {
                const trimVal = val.trim();
                if (trimVal) {
                    const regExp = /^(\d+px\s*\*\s*\d+px)$/;
                    if (regExp.test(val)) {
                        const thumbnailSizeArr = val.split('*');
                        this.thumbnailWidth = thumbnailSizeArr[0];
                        this.thumbnailHeight = thumbnailSizeArr[1];
                    }
                }
            }
        },
        methods: {
            handleChange(resp) {
                // 有响应结果再进入处理
                if (resp?.response) {
                    if (!resp.response?.success) {
                        this.$message.error(resp?.response?.message || resp?.response || resp);
                    }
                }
            },
            beforeUpload(file) {
                if (this.$attrs['before-upload']) {
                    return this.$attrs['before-upload'](file);
                }
                if (file.type.split('/').shift() !== 'image') {
                    this.$message.error(this.i18nMappingObj.notImageTip);
                    return false;
                }
                if (!this.acceptList.includes('image/*') && !this.acceptList.includes(file.type.split('/').pop())) {
                    this.$message.error(this.$t('notCorrectFormatTip', { format: this.acceptList }));
                    return false;
                }
                if (this.limitSize) {
                    const isIncludedSize = file.size / 1024 / 1024 < this.limitSize;
                    if (!isIncludedSize) {
                        this.$message.error(this.$t('notIncludedSize', { limitSize: this.limitSize }));
                        return false;
                    }
                }
                return true;
            },
            handleSuccess(res, file) {
                if (this.$attrs['on-success']) {
                    this.$attrs['on-success'](res, file);
                    return;
                }
                this.fileList.push({
                    uid: res?.data,
                    src: utils.imgUrlCreator(res?.data)
                });
                this.changeModelValue();
            },
            handlePreview(file) {
                this.$refs[`erdImage_${file.uid}_0`][0].showViewer = true;
            },
            getPrivewIdList(index) {
                if (this.canPreview) {
                    // 所有图片地址
                    let tempImgList = this.fileList.map((item) => item.src);
                    if (index === 0) return tempImgList;

                    // 调整图片顺序，把当前图片放在第一位
                    let start = tempImgList.splice(index);
                    let remain = tempImgList.splice(0, index);

                    // 将当前图片调整成点击缩略图的那张图片
                    return start.concat(remain);
                } else {
                    return [];
                }
            },
            handleRemove(file) {
                this.fileList = this.fileList.filter((item) => item.uid !== file.uid);
                this.changeModelValue();
            },
            changeModelValue() {
                this.isHandleChange = true;

                // 避免更新value后, 立即监听到 避免数据重刷
                setTimeout(() => {
                    this.isHandleChange = false;
                }, 500);
                const dataIds = this.fileList.map((item) => item.uid);
                this.$emit('input', JSON.stringify(dataIds));
            }
        }
    };
});
