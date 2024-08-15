define([
    'text!' + ELMP.resource('biz-signature/watermarkManage/watermarkForm/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (template, CONST) {
    const FamKit = require('erdc-kit');
    const defaultValue = {
        size: 14,
        opacity: 60,
        paveStyle: CONST.paveStyles[0].value,
        angle: 0
    };
    function isText(contentType) {
        return contentType === 'TEXT';
    }
    function isImage(contentType) {
        return contentType === 'IMAGE';
    }
    return {
        template: template,
        components: {
            FamUpload: FamKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            FamDynamicFormItem: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js')
            ),
            FamImgCropTool: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamImgCropTool/index.js`)),
            FamAdvancedForm: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamAdvancedForm/index.js`))
        },
        computed: {
            paveStyles: function () {
                let self = this;
                return CONST.paveStyles.map((i) => {
                    return {
                        value: i.value,
                        label: self.i18nMappingObj[i.lang]
                    };
                });
            },
            title: function () {
                return this.oid ? this.i18nMappingObj.editWatermark : this.i18nMappingObj.createWatermark;
            },
            isText: function () {
                return isText(this.formData?.contentType);
            },
            isImage: function () {
                return isImage(this.formData?.contentType);
            },
            schemaMapper() {
                const self = this;
                const { i18nMappingObj } = self;
                return {
                    content(schema) {
                        const message = self.isText ? i18nMappingObj.contentTip : i18nMappingObj.imageTip;
                        schema.validators = [{ required: true, message: message, trigger: ['blur', 'change'] }];
                    },
                    size(schema) {
                        schema.hidden = self.isText && self.formData.paveStyle === '1';
                    }
                };
            }
        },
        watch: {
            formData: function (val) {
                if (!_.isEmpty(val)) {
                    this.handleChangeContentType();
                }
            }
        },
        data: function () {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys(
                    [
                        'createWatermark',
                        'editWatermark',
                        'confirm',
                        'cancel',
                        'editSuccess',
                        'createSuccess',
                        'signatureFullScreen',
                        'signatureUpload',
                        'signaturePictureOnly',
                        'signaturePicture',
                        'signaturePictureZoom',
                        'signatureRefresh',
                        'imageTip',
                        'contentTip'
                    ].concat(CONST.paveStyles.map((i) => i.lang))
                ),
                formData: {},
                visible: false,
                oid: '',
                viewType: CONST.layoutKey.create,
                className: CONST.className.watermark,
                loading: false,
                watermarkForPreview: '',
                // 原始布局信息，用来根据不同的内容类型，切换不同的表单项
                originWidgetList: null,
                watermarkForPreviewLoading: false,
                widgetList: null,
                imageFileList: []
            };
        },
        methods: {
            loadWatermarkImage(data) {
                if (data.rawData?.contentType?.value === 'IMAGE' && data.rawData?.content?.value) {
                    this.$famHttp({
                        url: '/file/file/site/console/v1/file/info',
                        params: {
                            fileId: data.rawData?.content?.value
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            this.imageFileList.push(resp.data);
                        }
                    });
                }
            },
            handleExceed() {
                this.$message({
                    message: this.i18nMappingObj.imgExistTips,
                    type: 'warning'
                });
            },
            onSuccess(response) {
                this.$set(this.formData, 'content', response.data);
            },
            onRemove() {
                this.$set(this.formData, 'content', '');
            },
            resetData() {
                this.formData = {};
                this.widgetList = null;
                this.originWidgetList = null;
                this.imageFileList = [];
            },
            downloadImg() {
                FamKit.downloadImgFile(this.formData.content)
            },
            /**
             *
             * @param {String} oid 水印的oid
             * @param {String} viewType 表单视图的类型,对应类型管理-布局下面的内部名称
             */
            open: function (oid, viewType) {
                this.oid = oid;
                this.watermarkForPreview = '';
                this.viewType = viewType;
                this.visible = true;
                this.resetData();
            },
            closeForm: function () {
                this.visible = false;
            },
            handleFieldChange(field, value) {
                if (field.field === 'contentType') {
                    this.$set(this.formData, 'content', '');
                    if (value === 'IMAGE') {
                        this.$set(this.formData, 'size', '100');
                    } else if (value === 'TEXT') {
                        this.$set(this.formData, 'size', '14');
                    }
                    this.handleChangeContentType();
                }
            },
            /**
             * 高级表单里面获取到的布局数据,这里存储一份，是为了切换文本和图片两种类型
             */
            handleGetWidgetList() {
                // this.widgetList = widgetList;
                this.originWidgetList = FamKit.deepClone(this.widgetList);
                // 没有oid表明是在创建,创建给上默认值
                if (!this.oid) {
                    for (let key in defaultValue) {
                        this.$set(this.formData, key, defaultValue[key]);
                    }
                }

                // this.handleChangeContentType();
            },
            /**
             * 根据不同的内容类型，通过改变表单的 ‘widgetList’ 达到不同布局的情况
             */
            handleChangeContentType: function () {
                let self = this;
                if (isImage(self.formData?.contentType) && self.originWidgetList) {
                    let tempWidgetList = FamKit.TreeUtil.flattenTree2Array(FamKit.deepClone(self.originWidgetList), {
                        childrenField: 'widgetList'
                    });
                    tempWidgetList = tempWidgetList.filter((i) => {
                        i.widgetList = [];
                        if (i?.schema?.field === 'content') {
                            i.schema.label = self.i18nMappingObj.signaturePicture;
                            i.schema.nameI18nJson = {
                                value: self.i18nMappingObj.signaturePicture
                            };
                        }
                        if (i?.schema?.field === 'size') {
                            i.schema.label = self.i18nMappingObj.signaturePictureZoom;
                            i.schema.nameI18nJson = {
                                value: self.i18nMappingObj.signaturePictureZoom
                            };
                        }
                        if (i?.schema?.field === 'angle') {
                            i.schema.class = 'clear-left';
                        }
                        return !i.schema.field || (i.schema.field && i.schema.field !== 'color');
                    });
                    self.widgetList = FamKit.TreeUtil.buildTree(tempWidgetList, {
                        parentField: 'parentWidget',
                        childrenField: 'widgetList'
                    });
                } else {
                    self.widgetList = self.originWidgetList;
                }
            },
            previewWatermark: function () {
                var _this = this;
                _this.watermarkForPreviewLoading = true;
                this.$refs.layoutForm
                    .submit()
                    // 获取校验值
                    .then(function (result) {
                        if (result.valid) {
                            let baseForm = _this.$refs.layoutForm.serializeEditableAttr();
                            let data = {
                                className: 'erd.cloud.signature.entity.SignatureTmpl'
                            };
                            baseForm.forEach((i) => {
                                data[i.attrName] = i.value;
                            });
                            return _this
                                .$famHttp({
                                    url: '/doc/watermark/v1/preview',
                                    method: 'POST',
                                    data: data,
                                    responseType: 'blob'
                                })
                                .then((resp) => {
                                    return new Promise(function (resolve) {
                                        var reader = new FileReader();
                                        reader.readAsDataURL(resp.data);
                                        reader.onload = function (e) {
                                            resolve(e.target.result);
                                        };
                                    });
                                });
                        }
                        return Promise.reject();
                    })
                    .then(function (base64) {
                        _this.watermarkForPreview = base64;
                    })
                    .catch(function (e) {
                        console.error(e);
                    })
                    .finally(function () {
                        _this.watermarkForPreviewLoading = false;
                    });
            },
            onSubmit() {
                var self = this;
                this.$refs.layoutForm.submit().then((result) => {
                    if (result.valid) {
                        let apiPath = '/fam/create';
                        if (self.oid) {
                            apiPath = '/fam/update';
                        }
                        let baseForm = self.$refs.layoutForm.serializeEditableAttr();
                        this.$famHttp({
                            url: apiPath,
                            data: {
                                className: CONST.className.watermark,
                                oid: self.oid,
                                attrRawList: baseForm
                            },
                            method: 'post'
                        }).then((res) => {
                            if (res.code === '200') {
                                self.$message({
                                    message: self.oid
                                        ? self.i18nMappingObj.editSuccess
                                        : self.i18nMappingObj.createSuccess,
                                    type: 'success',
                                    showClose: true
                                });
                                self.closeForm();
                                self.$emit('done');
                            }
                        });
                    }
                });
            }
        }
    };
});
