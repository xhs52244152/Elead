define([
    'text!' + ELMP.resource('biz-signature/docTmpl/docTmplDesign/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    'erdc-kit',
    ELMP.resource('biz-signature/mixins/lazyWatermark.js'),
    'file-saver',
    ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/mixin.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (template, CONST, FamUtils, watermarkMixin, saveAs, systemSignatureMixin) {
    const FamKit = require('fam:kit');

    return {
        name: 'SignatureDocTmplDesign',
        template: template,
        mixins: [watermarkMixin, systemSignatureMixin],
        components: {
            FamUpload: FamKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            PdfDesign: FamKit.asyncComponent(
                ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/PdfDesign/index.js')
            ),
            WordDesign: FamKit.asyncComponent(
                ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/WordDesign/index.js')
            ),
            ExcelDesign: FamKit.asyncComponent(
                ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/ExcelDesign/index.js')
            ),
            FamImgCropTool: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImgCropTool/index.js')),
            FamDynamicForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data: function () {
            return {
                i18nLocalePath: CONST.i18nPath,
                visible: false,
                // 当前正在编辑的版本的oid的后半截
                id: '',
                formData: {},
                loading: false,
                // defaultHeaders: CONST.defaultHeaders,
                pages: [],
                points: [],
                // 模板设计回显的文件列表
                fileList: [],
                // 是否是保存进行的关闭，标识位
                doneFlag: false,
                uploadLoading: false,
                mode: '' // 模式：查看模式
            };
        },
        computed: {
            isViewMode: function () {
                return this.mode === 'view';
            },
            /**
             * 用来判断滚动加载的数据里面是否已经存在当前选中的值,如果存在,默认的那个options就可以不要了,
             * 否则,默认的那个就隐藏存在
             * @returns {T}
             */
            isDefaultValueInOptions: function () {
                return this.watermarkOptions.find((i) => i.code === this.watermarkForm.code);
            },
            fileTypeData: function () {
                let result = CONST.docTmplFileType.find((i) => i.id === this.formData.fileType);
                return result || {};
            },
            isPdf: function () {
                return this.formData.fileType === CONST.fileTypes.pdf;
            },
            isWord: function () {
                return this.formData.fileType === CONST.fileTypes.word;
            },
            isExcel: function () {
                return this.formData.fileType === CONST.fileTypes.excel;
            },
            formConfigs: function () {
                return [
                    {
                        col: 24,
                        component: 'FamClassificationTitle',
                        props: {
                            unfold: true
                        },
                        label: this.i18nMappingObj.basicInfo,
                        nameI18nJson: {
                            value: this.i18nMappingObj.basicInfo,
                            zh_cn: ''
                        },
                        children: [
                            {
                                label: this.i18nMappingObj.code,
                                component: 'ErdInput',
                                readonly: true,
                                required: false,
                                props: {
                                    maxlength: 100,
                                    clearable: false
                                },
                                col: 12,
                                field: 'identifierNo',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.code
                                }
                            },
                            {
                                label: this.i18nMappingObj.classify,
                                component: 'FamDict',
                                readonly: true,
                                required: false,
                                props: {
                                    itemName: 'signatureClassify',
                                    clearable: false
                                },
                                col: 12,
                                field: 'tmplType',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.classify
                                }
                            },
                            {
                                label: this.i18nMappingObj.name,
                                component: 'ErdInput',
                                readonly: true,
                                required: false,
                                props: {
                                    maxlength: 100,
                                    clearable: false
                                },
                                col: 12,
                                field: 'name',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.name
                                }
                            },
                            {
                                label: this.i18nMappingObj.type,
                                component: 'ErdInput',
                                readonly: true,
                                required: false,
                                props: {
                                    maxlength: 100,
                                    clearable: false
                                },
                                col: 12,
                                field: 'fileType',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.type
                                }
                            },
                            {
                                label: this.i18nMappingObj.sheet,
                                component: 'ErdInput',
                                readonly: true,
                                required: false,
                                props: {
                                    maxlength: 100,
                                    clearable: false
                                },
                                col: 12,
                                field: 'mappableUnit',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.sheet
                                }
                            },
                            {
                                label: this.i18nMappingObj.versionNumber,
                                component: 'ErdInput',
                                readonly: true,
                                required: false,
                                props: {
                                    maxlength: 100,
                                    clearable: false
                                },
                                col: 12,
                                field: 'branchName',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.versionNumber
                                }
                            }
                        ]
                    },
                    {
                        col: 24,
                        component: 'FamClassificationTitle',
                        props: {
                            unfold: true,
                            tipsSlot: 'tmpl-design'
                        },
                        label: this.i18nMappingObj.signatureTmplDesign,
                        nameI18nJson: {
                            value: this.i18nMappingObj.signatureTmplDesign,
                            zh_cn: ''
                        },
                        children: [
                            {
                                component: 'Slot',
                                props: {
                                    name: 'watermark-slot',
                                    clearable: false
                                },
                                col: 12,
                                field: 'watermark',
                                nameI18nJson: {
                                    value: this.i18nMappingObj.watermark,
                                    zh_cn: ''
                                },
                                label: this.i18nMappingObj.watermark
                            }
                        ]
                            .concat(
                                this.isPdf
                                    ? [
                                          {
                                              component: 'Slot',
                                              props: {
                                                  name: 'background-color-slot',
                                                  clearable: false
                                              },
                                              col: 12,
                                              field: 'bgColor',
                                              nameI18nJson: {
                                                  value: this.i18nMappingObj.signatureBgColor,
                                                  zh_cn: ''
                                              },
                                              label: this.i18nMappingObj.signatureBgColor
                                          }
                                      ]
                                    : []
                            )
                            .concat([
                                {
                                    component: 'Slot',
                                    props: {
                                        name: 'file-slot',
                                        clearable: false
                                    },
                                    col: 24,
                                    field: 'file',
                                    nameI18nJson: {
                                        value: this.i18nMappingObj.template,
                                        zh_cn: ''
                                    },
                                    label: this.i18nMappingObj.template
                                },
                                {
                                    component: 'Slot',
                                    props: {
                                        name: 'design-slot',
                                        clearable: false
                                    },
                                    col: 24,
                                    field: '',
                                    nameI18nJson: {},
                                    label: ''
                                }
                            ])
                    }
                ];
            },
            title: function () {
                return this.i18nMappingObj.designTemplate;
            },
            signatureCopyable() {
                return (this.isPdf && this.pages?.length) || this.isWord || this.isExcel;
            }
        },
        mounted() {
            document.addEventListener('paste', this.pasteHandler);
        },
        destroyed() {
            document.removeEventListener('paste', this.pasteHandler);
        },
        methods: {
            handleColorChange(color) {
                this.formData = {
                    ...this.formData,
                    color
                };
            },
            transformDataToLocal: function (data) {
                this.formData.color = data.color;
                if (data.fileType === CONST.fileTypes.pdf) {
                    let pages = data.data.pages || [];
                    let points = data.data.points || [];
                    let pageMap = {};
                    pages.forEach((i) => {
                        pageMap[i.id] = i;
                    });
                    if (points && points.length) {
                        this.getPlaceholderData().then((localData) => {
                            let systemSignatureOptions = this.systemSignatureOptions;
                            let localPages = localData.pages;
                            let localPageMap = {},
                                systemSignatureOptionsMap = {};
                            localPages.forEach((i) => {
                                localPageMap[i.pageNum] = i;
                            });
                            systemSignatureOptions.forEach((i) => {
                                systemSignatureOptionsMap[i.code] = i;
                            });

                            points.forEach((i) => {
                                i.pageId = localPageMap[pageMap[i.pageId].pageNum]?.id;
                            });
                            points = points.filter((i) => i.pageId);
                            points = points.filter((i) => {
                                if (i.contentType === CONST.contentTypes.signature_system && i.code) {
                                    return !!systemSignatureOptionsMap[i.code];
                                }
                                return true;
                            });
                            this.points = points;
                        });
                    }
                } else {
                    let systemSignatureOptions = this.systemSignatureOptions;
                    let systemSignatureOptionsMap = {};
                    systemSignatureOptions.forEach((i) => {
                        systemSignatureOptionsMap[i.code] = i;
                    });
                    let points = data.data.points || [];
                    points = points.filter((i) => {
                        if (i.contentType === CONST.contentTypes.signature_system && i.defaultValue) {
                            return !!systemSignatureOptionsMap[i.defaultValue];
                        }
                        return true;
                    });
                    this.points = points;
                }
            },
            getPlaceholderData: function () {
                if (this.isPdf && this.$refs.pdfDesign) {
                    return this.$refs.pdfDesign
                        .submit()
                        .then((result) => {
                            if (result.valid) {
                                return {
                                    pages: result.data.pages || [],
                                    points: result.data.placeholders || []
                                };
                            }
                            return Promise.reject();
                        })
                        .then((designData) => {
                            return designData;
                        });
                } else if ((this.isWord && this.$refs.wordDesign) || (this.isExcel && this.$refs.excelDesign)) {
                    let designIns = this.$refs.wordDesign || this.$refs.excelDesign;
                    return designIns
                        .submit()
                        .then((result) => {
                            if (result.valid) {
                                return result.data;
                            }
                            return Promise.reject();
                        })
                        .then((designData) => {
                            return designData;
                        });
                }
                return Promise.reject();
            },
            copyPlaceholder: function () {
                this.getPlaceholderData()
                    .then((data) => {
                        let fileType = this.formData.fileType;
                        let color = this.formData.color;
                        let allData = {
                            fileType: fileType,
                            color: color,
                            data: data
                        };
                        FamUtils.copy(null, JSON.stringify(allData), this.i18n.copyTips);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            pasteHandler: function (event) {
                if (
                    this.formData.fileType === CONST.fileTypes.pdf &&
                    !this.formData.tmplFileId &&
                    !this.formData.docId
                ) {
                    this.$message({
                        message: this.i18n.fileNotExist,
                        type: 'info'
                    });
                    return;
                }
                let data = event.clipboardData.getData('text');
                try {
                    data = JSON.parse(data);
                    if (this.formData.fileType !== data.fileType) {
                        this.$message({
                            message: this.i18n.tmplTypeError,
                            type: 'info'
                        });
                        return;
                    }
                    this.transformDataToLocal(data);
                } catch (e) {
                    console.error(e);
                }
            },
            handleDownload: function (file) {
                FamUtils.downloadFile(file.fileId, this.authorizeCode);
            },
            resetFile: function (file) {
                let self = this;
                if (file.status === 'ready') {
                    if (this.fileList && this.fileList.length) {
                        this.$confirm(this.i18nMappingObj.sureToCover, this.i18nMappingObj.tips, {
                            confirmButtonText: this.i18nMappingObj.confirm,
                            cancelButtonText: this.i18nMappingObj.cancel,
                            type: 'warning'
                        })
                            .then(() => {
                                self.deleteDesignData();
                                self.fileList = [file];
                                self.$refs.fileUpload.$refs.upload.submit();
                            })
                            .catch(() => {
                                self.fileList = self.fileList.filter((i) => i.status === 'success').map((i) => i);
                            });
                    } else {
                        self.deleteDesignData();
                        self.fileList = [file];
                        self.$refs.fileUpload.$refs.upload.submit();
                    }
                } else if (file.status === 'success') {
                    this.fileList = [file];
                }
            },
            showUploadLoading: function () {
                this.uploadLoading = true;
            },
            fileUploadSuccess: function (response) {
                this.uploadLoading = false;
                if (this.isPdf) {
                    this.pages = response.data.docPages;
                    this.points = [];
                } else if (this.isWord) {
                    this.points = response.data.docPages;
                } else if (this.isExcel) {
                    this.points = response.data.docPages;
                }
                this.$set(this.formData, 'docId', response.data.docId);
            },
            handleOpened: function () {
                // do nothing
            },
            /**
             * 每次打开窗口,就重置一下数据
             */
            resetData: function () {
                this.doneFlag = false;
                this.fileList = [];
                this.formData = {};
                this.pages = [];
                this.points = [];
            },
            deleteDesignData: function () {
                this.fileList = [];
                this.pages = [];
                this.points = [];
                this.$set(this.formData, 'docId', '');
            },
            /**
             * 提供上层打开当前编辑表单
             * @param {String} id 水印的id
             * @param oid
             * @param mode
             */
            open: function (id, oid, mode) {
                this.id = id;
                this.oid = oid;
                this.visible = true;
                this.mode = mode || '';
                this.resetData();
                this.loadDocTmplDesignDetail().then((data) => {
                    let pages = data.pages || [];
                    let points = data.points || [];
                    this.authorizeCode = data.authorizeCode || '';
                    delete data.pages;
                    delete data.points;
                    this.formData = data;
                    this.formData.color = data.signatureBackgroundColor;
                    this.pages = pages;
                    if (data.tmplFileId && data.tmplFileName) {
                        this.fileList.push({
                            fileId: data.tmplFileId,
                            name: data.tmplFileName
                        });
                    }
                    if (this.formData.fileType === CONST.fileTypes.pdf) {
                        this.points = points.map((i) => {
                            return {
                                backgroundColor: i.backgroundColor,
                                code: i.code,
                                contentType: i.contentType,
                                pageId: i.parentId,
                                height: i.positionHeight,
                                width: i.positionWidth,
                                left: i.positionX,
                                top: i.positionY
                            };
                        });
                    } else {
                        this.points = points;
                    }
                    if (data.watermark) {
                        this.loadWatermarkDetail(data.watermark).then((watermarkDetail) => {
                            this.watermarkForm = {
                                name: watermarkDetail.name,
                                code: watermarkDetail.code
                            };
                        });
                    }
                });
                this.loadWatermarkPage().then((data) => {
                    this.watermarkOptions = data;
                });
            },
            /**
             * 关闭表单时候触发的事件
             */
            closeForm: function () {
                if (!this.isViewMode) {
                    this.$emit(this.doneFlag ? 'done' : 'cancel');
                }
            },

            loadDocTmplDesignDetail: function () {
                return this.$famHttp({
                    url: `/doc/signature/v1/tmpl/one/${this.id}`,
                    params: {
                        className: 'erd.cloud.signature.entity.SignatureTmpl'
                    }
                }).then((resp) => {
                    let result = {};
                    if (resp.success) {
                        return resp.data;
                    }
                    return result;
                });
            },

            /**
             * 保存模板
             */
            onSubmit(isDraft) {
                let self = this;
                this.loading = true;
                this.$refs.layoutForm
                    .submit()
                    .then((result) => {
                        if (result.valid) {
                            let data = {
                                id: self.id,
                                signatureBackgroundColor: self.formData.color,
                                tmplFileId: self.formData.docId,
                                watermark: self.formData.watermark
                            };
                            if (this.isPdf && this.$refs.pdfDesign) {
                                return this.$refs.pdfDesign
                                    .submit()
                                    .then((result) => {
                                        if (result.valid) {
                                            return {
                                                pages: result.data.pages || [],
                                                points: (result.data.placeholders || []).map((i) => {
                                                    return {
                                                        backgroundColor: i.backgroundColor,
                                                        code: i.code,
                                                        contentType: i.contentType,
                                                        parentId: i.pageId,
                                                        positionHeight: i.height,
                                                        positionWidth: i.width,
                                                        positionX: i.left,
                                                        positionY: i.top
                                                    };
                                                })
                                            };
                                        }
                                        return Promise.reject();
                                    })
                                    .then((designData) => {
                                        return this._saveData(Object.assign({}, data, designData));
                                    });
                            } else if (
                                (this.isWord && this.$refs.wordDesign) ||
                                (this.isExcel && this.$refs.excelDesign)
                            ) {
                                let designIns = this.$refs.wordDesign || this.$refs.excelDesign;
                                return designIns
                                    .submit()
                                    .then((result) => {
                                        if (result.valid) {
                                            return result.data;
                                        }
                                        return Promise.reject();
                                    })
                                    .then((designData) => {
                                        return this._saveData(Object.assign({}, data, designData));
                                    });
                            } else {
                                return this._saveData(Object.assign({}, data));
                            }
                        }
                        return Promise.reject();
                    })
                    .then(() => {
                        if (!isDraft && self.id) {
                            return self.$famHttp({
                                url: '/doc/common/checkin',
                                method: 'put',
                                params: {
                                    note: '更新检入',
                                    oid: self.oid,
                                    className: 'erd.cloud.signature.entity.SignatureTmpl'
                                }
                            });
                        } else {
                            return {
                                success: true
                            };
                        }
                    })
                    .then((resp) => {
                        if (resp.success) {
                            self.$message({
                                type: 'success',
                                message: this.id ? this.i18nMappingObj.editSuccess : this.i18nMappingObj.createSuccess,
                                showClose: true
                            });
                            this.doneFlag = true;
                            this.visible = false;
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            _saveData: function (data) {
                data.className = data.className || 'erd.cloud.signature.entity.SignatureTmpl';
                return this.$famHttp({
                    url: '/doc/signature/v1/tmpl/detail/save',
                    data: data,
                    method: 'post'
                });
            }
        }
    };
});
