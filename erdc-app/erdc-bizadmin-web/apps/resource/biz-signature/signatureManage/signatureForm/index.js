define([
    'text!' + ELMP.resource('biz-signature/signatureManage/signatureForm/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (template, CONST) {
    const FamKit = require('fam:kit');
    const ErdcloudKit = require('erdc-kit');
    return {
        name: 'SignatureForm',
        template: template,
        components: {
            FamParticipantSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js')),
            FamImgCropTool: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImgCropTool/index.js')),
            FamAdvancedForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            FamUpload: FamKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        computed: {
            imgSrc: function () {
                return this.imgSrcTmpl || this.imgSrcRemote;
            },
            isEdit: function () {
                return !!this.id;
            },
            title: function () {
                return this.isEdit ? this.i18nMappingObj.replaceSignature : this.i18nMappingObj.createSignature;
            },
            isPersonalType: function () {
                return this.formData.signType * 1 === CONST.contentTypes.signature_personal * 1;
            },
            isSystemType: function () {
                return this.formData.signType * 1 === CONST.contentTypes.signature_system * 1;
            },
            previewContainerStyle: function () {
                const containerWidth = '300px',
                    containerHeight = '300px';
                if (this.imgSize && this.position && !_.isEmpty(this.position)) {
                    var rx = parseInt(containerWidth) / this.position.width;
                    var ry = parseInt(containerHeight) / this.position.height;
                    let minR = Math.min(rx, ry);
                    let width = minR * this.position.width;
                    let height = minR * this.position.height;
                    let left = (parseInt(containerWidth) - width + 20) / 2;
                    let top = (parseInt(containerHeight) - height + 20) / 2;
                    return {
                        left: left + 'px',
                        top: top + 'px',
                        width: width + 'px',
                        height: height + 'px'
                    };
                } else if (this.isEdit) {
                    return {
                        width: containerWidth
                    };
                } else {
                    return {
                        display: 'none'
                    };
                }
            },
            previewStyle: function () {
                /**
                 * 不管是编辑还是新增，都是切割的优先级最高
                 */
                if (this.imgSize && this.position && !_.isEmpty(this.position)) {
                    var rx = parseInt(this.previewContainerStyle.width) / this.position.width;
                    // var ry = parseInt(this.previewContainerStyle.height) / this.position.height;
                    return {
                        width: Math.round(rx * this.imgSize.width) + 'px',
                        height: Math.round(rx * this.imgSize.height) + 'px',
                        marginLeft: '-' + Math.round(rx * this.position.left) + 'px',
                        marginTop: '-' + Math.round(rx * this.position.top) + 'px'
                    };
                } else if (this.isEdit) {
                    return {
                        width: '100%'
                    };
                } else {
                    return {
                        display: 'none'
                    };
                }
            },
            schemaMapper() {
                const self = this;
                const { i18nMappingObj } = self;
                return {
                    code(schema) {
                        const message = self.isPersonalType ? i18nMappingObj.userNameTip : i18nMappingObj.codeTip;
                        schema.validators = [{ required: true, message: message, trigger: ['blur', 'change'] }];
                    },
                    fileId(schema) {
                        schema.validators = [{ required: true, message: i18nMappingObj.uploadTip, trigger: 'change' }];
                    },
                    preview(schema) {
                        schema.hidden = !self.imgSrcTmpl;
                    }
                };
            }
        },
        data: function () {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'createSignature',
                    'replaceSignature',
                    'signaturePersonal',
                    'signatureSystem',
                    'confirm',
                    'cancel',
                    'editSuccess',
                    'signatureUpload',
                    'username',
                    'code',
                    'signaturePictureOnly',
                    'createSuccess',
                    'userNameTip',
                    'repeatCode',
                    'codeTip',
                    'uploadTip'
                ]),
                visible: false,
                loading: false,
                id: '',
                oid: '',
                formData: {
                    signType: ''
                },
                viewType: CONST.layoutKey.create,
                className: CONST.className.signature,
                //  后端返回的imgSrc地址
                imgSrcRemote: '',
                //  前端临时上传的图片base64
                imgSrcTmpl: '',
                // 裁剪框是裁剪后进行关闭的,还是直接点击右上角进行关闭的, 标识位
                imgCropDoneFlag: false,
                visibleForCrop: false,
                position: null,
                imgSize: null,
                customValidators: {
                    code: [
                        {
                            trigger: 'blur',
                            validator: (rule, value, callback) => {
                                // 只有创建系统签章时候才校验
                                if (!this.isEdit && this.isSystemType) {
                                    this.$famHttp({
                                        url: '/doc/signature/v1/picture/exist/code',
                                        params: {
                                            className: 'erd.cloud.signature.entity.SignatureTmpl',
                                            code: value,
                                            signType: this.formData.signType
                                        }
                                    }).then((resp) => {
                                        if (resp.data) {
                                            callback(new Error(this.i18nMappingObj.repeatCode));
                                        } else {
                                            callback();
                                        }
                                    });
                                } else {
                                    callback();
                                }
                            }
                        }
                    ]
                }
            };
        },
        methods: {
            handleStartCrop() {
                this.imgCropDoneFlag = false;
            },
            cropDone() {
                let result = this.$refs.imgCropTool.positionData();
                this.handleDone(result, this.$refs.imgCropTool.originSize);
            },
            cancelCrop() {
                this.imgCropDoneFlag = true;
                this.handleCloseForCrop();
            },
            handleDone(position, imgSize) {
                this.position = position;
                this.imgSize = imgSize;
                this.imgCropDoneFlag = true;
                this.handleCloseForCrop();
            },

            handleCloseForCrop() {
                this.visibleForCrop = false;
                if (!this.imgCropDoneFlag) {
                    this.imgSrcTmpl = '';
                }
            },
            handleCodeChange(value, data) {
                if (value && data && data.length) {
                    this.formData.name = data[0].displayName;
                } else {
                    this.formData.name = '';
                }
            },
            handleGetWidgetList(widgetList) {
                let self = this;
                // let tempWidgetList = FamKit.deepClone(widgetList);
                this.$nextTick(function () {
                    widgetList.forEach((i) => {
                        if (i?.schema?.field === 'code') {
                            let label = self.isPersonalType ? self.i18nMappingObj.username : self.i18nMappingObj.code;
                            i.schema.label = label;
                            i.schema.nameI18nJson = {
                                value: label
                            };
                            if (self.isEdit) {
                                if (self.isPersonalType) {
                                    i.schema.hidden = true;
                                } else if (self.isSystemType) {
                                    i.schema.readonly = true;
                                }
                            }
                        }
                        if (i?.schema?.field === 'name') {
                            if (self.isPersonalType && !self.isEdit) {
                                i.schema.hidden = true;
                            }
                        }
                    });
                });
            },
            onFileChange(file) {
                let self = this;
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (['.jpg', '.png'].indexOf(type) === -1) {
                    this.$message({
                        message: self.i18nMappingObj.imageTips,
                        type: 'warning'
                    });
                    return false;
                } else {
                    if (file && file.raw) {
                        var reader = new FileReader();
                        reader.readAsDataURL(file.raw);
                        this.value = '';
                        reader.onload = function () {
                            self.$set(self.formData, 'fileId', ErdcloudKit.uuid());
                            self.$refs.layoutForm.$refs.dynamicForm.clearValidate('fileId');
                            self.imgSrcTmpl = reader.result;
                            var img = new Image();
                            img.src = self.imgSrc;
                            img.onload = function () {
                                let width = this.width;
                                let height = this.height;
                                self.position = {
                                    left: 0,
                                    top: 0,
                                    width: width,
                                    height: height
                                };
                                self.imgSize = {
                                    width: width,
                                    height: height
                                };
                            };
                            // self.visibleForCrop = true;
                        };
                    }
                }
            },
            initData: function () {
                let viewInfo = this.$parent.$refs?.famViewTable?.viewInfo;
                let conditionDtos = viewInfo?.conditionDtos || [];
                let conditionDto = conditionDtos.find((i) => i.attrName === `${CONST.className.signature}#signType`);
                this.formData = {};
                this.position = null;
                this.imgSize = null;
                this.imgSrcRemote = '';
                this.imgSrcTmpl = '';
                this.formData.signType = conditionDto.value1;
                if (this.isEdit) {
                    this.$famHttp({
                        url: `/doc/signature/v1/picture/${this.id}`,
                        params: {
                            className: 'erd.cloud.signature.entity.SignatureTmpl'
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            this.$set(this.formData, 'name', resp.data.name);
                            this.$set(this.formData, 'code', resp.data.code);
                            this.$set(this.formData, 'fileId', resp.data.fileId);
                            let imgUrl = ErdcloudKit.urlServicePrefix(
                                `/file/file/site/storage/v1/img/${resp.data.fileId}/download`,
                                'erd.cloud.site.console.file.entity.FileInfo'
                            );
                            ErdcloudKit.getImgBase64(imgUrl).then((base64) => {
                                this.imgSrcTmpl = base64;
                            });
                        }
                    });
                }
            },
            /**
             * 提供上层打开当前编辑表单
             * @param {String} id 水印的oid
             * @param {String} viewType 表单视图的类型,对应类型管理-布局下面的内部名称
             */
            open: function (id, viewType, rowData) {
                rowData = rowData || {};
                this.id = id;
                this.oid = rowData.oid;
                this.viewType = viewType;
                this.visible = true;
            },
            /**
             * 关闭表单
             */
            closeForm: function () {
                this.visible = false;
            },
            /**
             * 保存模板
             */
            onSubmit() {
                this.loading = true;
                this.$refs.layoutForm
                    .submit()
                    .then((result) => {
                        if (result.valid) {
                            let url = '/doc/signature/v1/picture';
                            let data = JSON.parse(JSON.stringify(this.formData));
                            let code = data.code;
                            if (this.isPersonalType) {
                                if (_.isObject(code)) {
                                    code = code.value;
                                }
                                code = code.substring(code.lastIndexOf(':') + 1);
                                data.code = code;
                            }
                            /**
                             * 个人签章传递code，系统签章传递name
                             */
                            return this.$famHttp({
                                url,
                                data: Object.assign(
                                    data,
                                    {
                                        className: CONST.className.signature
                                    },
                                    this.imgSrcTmpl && this.position
                                        ? {
                                              base64String: this.imgSrcTmpl,
                                              width: this.position.width,
                                              height: this.position.height,
                                              x: this.position.left,
                                              y: this.position.top
                                          }
                                        : {}
                                ),
                                method: 'put'
                            })
                                .then((resp) => {
                                    this.$message({
                                        type: 'success',
                                        message: this.id
                                            ? this.i18nMappingObj.editSuccess
                                            : this.i18nMappingObj.createSuccess,
                                        showClose: true
                                    });
                                    this.$emit('done');
                                    this.closeForm();
                                })
                                .catch(() => {});
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    };
});
