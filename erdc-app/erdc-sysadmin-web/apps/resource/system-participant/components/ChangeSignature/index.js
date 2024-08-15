define([
    'text!' + ELMP.resource('system-participant/components/ChangeSignature/index.html'),
    '/erdc-thirdparty/platform/jquery-plugins/jSignature.min.js',
    'css!' + ELMP.resource('system-participant/components/MemberForm/style.css')
], function (template) {
    const FamKit = require('fam:kit');
    return {
        template,
        components: {
            FamImgCropTool: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImgCropTool/index.js')),
            FamDynamicForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            let lan = localStorage.getItem('lang_current') || 'zh-cn';
            let tenantId = '';
            try {
                tenantId = JSON.parse(localStorage.getItem('tenantId'));
            } catch (e) {
                console.error(e);
            }
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'inputSignature',
                    'handSignature',
                    'imgSignature',
                    'ok',
                    'cancel',
                    'handSigTips',
                    'imgSigTips',
                    'manualEntry',
                    'signaturePlease',
                    'wrongRest',
                    'fam_signature_type',
                    'fam_signature_preview',
                    'fam_signature_type_write',
                    'fam_signature_type_image',
                    'fam_signature_type_write_tips',
                    'fam_signature_type_image_tips',
                    'reset'
                ]),
                changeSignatureVisible: false,
                // desc: '',
                handSignatureVisible: false,
                defaultHeaders: FamKit.defaultHeaders(),
                visibleForCrop: false,
                imgData: '', // 裁剪图片的base64
                imgSize: null, //裁剪图片的宽高
                position: {},
                cropDoneFlag: false,
                loading: false,
                form: {
                    type: 'image'
                }
                // cropDoneImgData: ''
            };
        },
        computed: {
            formConfig: function () {
                return [
                    {
                        field: 'type',
                        component: 'erd-ex-select',
                        label: this.i18nMappingObj.fam_signature_type,
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj.fam_signature_type_image,
                                    value: 'image'
                                },
                                {
                                    label: this.i18nMappingObj.fam_signature_type_write,
                                    value: 'write'
                                }
                            ]
                        }
                    },
                    {
                        field: 'tips',
                        label: this.i18nMappingObj.fam_signature_preview,
                        slots: {
                            component: 'tips'
                        }
                    },
                    {
                        field: 'preview',
                        slots: {
                            component: 'preview'
                        }
                    }
                ];
            },
            previewContainerStyle: function () {
                const containerWidth = '300px';
                if (this.imgSize && this.position && !_.isEmpty(this.position)) {
                    const rx = parseInt(containerWidth) / this.position.width;
                    return {
                        width: containerWidth,
                        height: rx * this.position.height + 'px'
                    };
                } else {
                    return {
                        width: containerWidth
                    };
                }
            },
            previewStyle: function () {
                /**
                 * 不管是编辑还是新增，都是切割的优先级最高
                 */
                if (this.imgSize && this.position && !_.isEmpty(this.position)) {
                    const rx = parseInt(this.previewContainerStyle.width) / this.position.width;
                    // var ry = parseInt(this.previewContainerStyle.height) / this.position.height;
                    return {
                        width: Math.round(rx * this.imgSize.width) + 'px',
                        height: Math.round(rx * this.imgSize.height) + 'px',
                        marginLeft: '-' + Math.round(rx * this.position.left) + 'px',
                        marginTop: '-' + Math.round(rx * this.position.top) + 'px'
                    };
                } else {
                    return {
                        width: '100%'
                    };
                }
            }
        },
        methods: {
            handleCropDone(position, imgSize) {
                this.position = position;
                this.imgSize = imgSize;
                this.cropDoneFlag = true;
                this.visibleForCrop = false;
            },
            cropDialogClosed() {
                if (!this.cropDoneFlag) {
                    this.imgData = '';
                    // if(this.form.type === 'write') {
                    //     this.handSignature()
                    // }
                }
            },
            handleFieldChange(field, fieldValue) {
                if (field.field === 'type') {
                    this.imgData = '';
                    if (fieldValue === 'write') {
                        this.handSignature();
                    }
                }
            },
            fileUploadChange(file) {
                let self = this;
                const reader = new FileReader();
                reader.readAsDataURL(file.raw);
                reader.onload = function () {
                    // self.changeSignatureVisible = false;
                    self.imgData = reader.result;
                    self.imgCropDoneFlag = false;
                    self.visibleForCrop = true;
                };
            },
            show() {
                this.changeSignatureVisible = true;
                this.imgData = ''; // 裁剪图片的base64
                this.imgSize = null; //裁剪图片的宽高
                this.position = {};
                this.cropDoneFlag = false;
                this.form.type = 'image';
            },

            handSubmit() {
                if (this.cropDoneFlag && this.position && this.imgData) {
                    this.savePersonSignature(this.position);
                } else {
                    this.$message.warning('还没有裁剪数据');
                }
            },
            handReset() {
                this.imgData = '';
                this.imgSize = '';
                this.position = null;
                if (this.form.type === 'write') {
                    this.handSignature();
                }
            },
            handCancel() {
                this.cropDoneFlag = false;
                this.changeSignatureVisible = false;
            },
            changeSignatureDone() {
                if (this.cropDoneFlag) {
                    this.$emit('done');
                }
            },
            savePersonSignature(position) {
                let self = this;
                this.loading = true;
                return this.$famHttp({
                    url: '/doc/signature/v1/picture/me',
                    method: 'put',
                    data: {
                        className: 'erd.cloud.signature.entity.SignatureTmpl',
                        base64String: self.imgData,
                        height: position.height,
                        width: position.width,
                        x: position.left,
                        y: position.top
                    }
                })
                    .then((resp) => {
                        if (resp.success) {
                            this.cropDoneFlag = true;
                            this.visibleForCrop = false;
                            this.changeSignatureVisible = false;
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // onMouseEnter(opt) {
            //     if (opt === 'hand') {
            //         this.desc = 'handSigTips';
            //     } else {
            //         this.desc = 'imgSigTips';
            //     }
            // },
            handleFullscreen() {
                const body = document.querySelector('.my_signature-input-body');
                const data = $(body).jSignature('getData');
                if (data) {
                    this.$nextTick(() => {
                        $('.my_signature-input-body').replaceWith('<div class="my_signature-input-body"></div>');
                        const body = document.querySelector('.my_signature-input-body');
                        $(body).jSignature({
                            'width': '100%',
                            'height': 300,
                            'color': '#000',
                            'background-color': '#e7dddd',
                            'lineWidth': 4,
                            'cssClass': ''
                        });
                        $(body).jSignature('importData', data);
                    });
                }
            },
            handSignature() {
                // this.changeSignatureVisible = false;
                // this.handSignatureVisible = true;
                this.$nextTick(() => {
                    $('.my_signature-input-body').replaceWith('<div class="my_signature-input-body"></div>');
                    const body = document.querySelector('.my_signature-input-body');
                    $(body).jSignature({
                        'width': '100%',
                        'height': 300,
                        'color': '#000',
                        'background-color': '#e7dddd',
                        'lineWidth': 4,
                        'cssClass': ''
                    });
                });
            },
            writeCrop() {
                const body = document.querySelector('.my_signature-input-body');
                this.imgData = $(body).jSignature('getData');
                this.visibleForCrop = true;
                this.imgCropDoneFlag = false;
            }
        }
    };
});
