define([
    'text!' + ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/PdfDesign/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    ELMP.resource('biz-signature/docTmpl/docTmplDesign/components/mixin.js')
], function (template, CONST, mixin) {
    const FamKit = require('fam:kit');
    const ErdcloudKit = require('erdcloud.kit');
    function px2percent(value, total) {
        var result = value / total;
        return result.toFixed(6);
    }
    return {
        name: 'SignatureDocTmplDesignForPdf',
        template: template,
        mixins: [mixin],
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            pages: {
                type: [Array, String],
                default: () => {
                    return [];
                }
            },
            placeholders: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            formData: Object
        },
        watch: {
            pages: {
                handler: function (val) {
                    if (_.isString(val)) {
                        this.innerPages = val.split(',').map((i, index) => {
                            return {
                                id: ErdcloudKit.uuid(),
                                previewId: i,
                                pageNum: ++index
                            };
                        });
                    } else if (_.isArray(val) && val !== this.innerPages) {
                        this.innerPages = JSON.parse(JSON.stringify(val));
                    }
                    this.activePage = null;
                },
                immediate: true
            },
            placeholders: {
                handler: function (val) {
                    this.resetPlaceholderEdit();
                    let placeholders = JSON.parse(JSON.stringify(val));
                    // 把后端的百分比的width放到正确的widthPercent字段上
                    placeholders = placeholders.map((i) => {
                        let result = Object.assign({}, i, {
                            topPercent: i.top,
                            leftPercent: i.left,
                            widthPercent: i.width,
                            heightPercent: i.height
                        });
                        delete result.top;
                        delete result.left;
                        delete result.width;
                        delete result.height;
                        return result;
                    });
                    this.innerPlaceholders = placeholders;
                },
                immediate: true
            }
        },
        components: {
            FamDynamicFormItem: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js')
            ),
            FamImgCropTool: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImgCropTool/index.js'))
        },
        computed: {
            isActiveEditTool: function () {
                return this.toolName === 'crop';
            },
            isActiveDragTool: function () {
                return this.toolName === 'drag';
            },
            currentActivePage: function () {
                if (this.activePage) {
                    return this.activePage;
                } else if (this.innerPages && this.innerPages.length) {
                    return this.innerPages[0];
                } else {
                    return null;
                }
            },
            calcPlaceholders: function () {
                let self = this;
                if (this.scale && this.currentActivePage && this.currentActivePage.originSize) {
                    return this.innerPlaceholders
                        .filter((i) => {
                            return self.currentActivePage.id === i.pageId;
                        })
                        .map((i) => {
                            i.left = i.left || i.leftPercent * this.currentActivePage.originSize.width;
                            i.top = i.top || i.topPercent * this.currentActivePage.originSize.height;
                            i.width = i.width || i.widthPercent * this.currentActivePage.originSize.width;
                            i.height = i.height || i.heightPercent * this.currentActivePage.originSize.height;
                            return Object.assign({}, i, {
                                left: i.left * self.scale.scaleX + 'px',
                                top: i.top * self.scale.scaleY + 'px',
                                width: i.width * self.scale.scaleX + 'px',
                                height: i.height * self.scale.scaleY + 'px'
                            });
                        });
                }
                return [];
            }
        },
        data: function () {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'signatureBasicInfo',
                    'signatureTmplDesign',
                    'confirm',
                    'cancel',
                    'signaturePictureOnly',
                    'signatureUpload',
                    'signature_page_rule',
                    'signature_doc_tmpl_page_tips_single',
                    'signature_doc_tmpl_page_tips_reverse',
                    'signature_doc_tmpl_page_tips_single_reverse',
                    'signature_doc_tmpl_page_tips_multi',
                    'signature_doc_tmpl_page_tips_multi_and',
                    'signature_doc_tmpl_page_tips_multi_from_to',
                    'signature_doc_tmpl_page_tips_multi_last',
                    'signature_doc_tmpl_page_tips_multi_from_to_last',
                    'signature_doc_tmpl_page_tips_multi_from_to_last_num',
                    'signature_doc_tmpl_page_tips_even',
                    'signature_doc_tmpl_page_tips_odd',
                    'signature_doc_tmpl_page_tips_all',
                    'signature_page_rule',
                    'codeRequired',
                    'codeRepeat'
                ]),
                // formData: {},
                loading: false,
                innerPlaceholders: [],
                // 根据placeholders计算而来的用于展示的位置数据
                // calcPlaceholders: [],
                // 工具条上面 => 签名位置类型
                type: CONST.contentTypes.signature_personal,
                // 签名位置的编码
                code: '',
                codeMsg: '',
                // 签名位置的背景色
                position_bg: '',
                // 签名位置的可选类型
                contentTypeOptions: CONST.contentTypeOptions.map((i) => {
                    return {
                        label: i.name,
                        value: i.id
                    };
                }),
                // 系统签章可选项 --- 通过混入了
                // systemSignatureOptions: [],
                innerPages: [],
                // innerPoints: [],
                activePage: null,
                CONST: CONST,
                activePlaceholder: null,
                activePlaceholderIndex: -1,
                // pdf裁剪工具当前正在启用的工具按钮的key
                toolName: '',
                // 设计器的图片缩放比例
                scale: null
            };
        },
        methods: {
            // _calcPlaceholders: function () {
            //
            // },
            beforeHideTool: function (hideTooCallback) {
                if (!this.codeMsg) {
                    hideTooCallback();
                }
            },
            handleDone: function (result, originSize) {
                let self = this;
                function checkCodeUniq() {
                    let result = self.innerPlaceholders.find((i, index) => {
                        return (
                            i.pageId === self.currentActivePage.id &&
                            i.code === self.code &&
                            index !== self.activePlaceholderIndex
                        );
                    });
                    return !result;
                }
                function checkCodeUniqAndType() {
                    return self.innerPlaceholders.find((i) => {
                        return i.code === self.code && i.contentType !== self.type;
                    });
                }
                if (!this.code) {
                    this.codeMsg = this.i18nMappingObj.codeRequired;
                    return;
                }
                if (!checkCodeUniq()) {
                    this.codeMsg = this.i18nMappingObj.codeRepeat;
                    return;
                }
                let codeUniqType = checkCodeUniqAndType();
                if (codeUniqType) {
                    let pageInfo = this.innerPages.find((i) => i.id === codeUniqType.pageId);
                    let contentTypeInfo = CONST.contentTypeOptions.find((i) => i.id === codeUniqType.contentType);
                    this.codeMsg = this.$t(this.i18nMappingObj.codeAndTypeUniq, {
                        code: this.code,
                        positionType: this.i18nMappingObj[contentTypeInfo.lang],
                        pageNo: pageInfo.pageNum
                    });
                    return;
                }
                let item = {
                    code: this.code,
                    contentType: this.type,
                    left: result.left,
                    leftPercent: px2percent(result.left, originSize.width),
                    top: result.top,
                    topPercent: px2percent(result.top, originSize.height),
                    width: result.width,
                    widthPercent: px2percent(result.width, originSize.width),
                    height: result.height,
                    heightPercent: px2percent(result.height, originSize.height),
                    backgroundColor: this.position_bg,
                    pageId: this.currentActivePage.id
                };
                if (this.activePlaceholder) {
                    this.innerPlaceholders.splice(this.activePlaceholderIndex, 1, item);
                } else {
                    this.innerPlaceholders.push(item);
                }
                this.resetPlaceholderEdit();
            },
            resetPlaceholderEdit: function () {
                this.code = '';
                this.type = CONST.contentTypes.signature_personal;
                this.position_bg = '';
                this.activePlaceholder = null;
                this.activePlaceholderIndex = -1;
                this.codeMsg = '';
            },
            editPlaceholder: function (placeholder) {
                if (!this.isActiveEditTool) return;
                this.activePlaceholder = placeholder;
                let innerPlaceholderIndex = this.innerPlaceholders.findIndex((i) => i.code === placeholder.code);
                let innerPlaceholder = this.innerPlaceholders[innerPlaceholderIndex];
                this.activePlaceholderIndex = innerPlaceholderIndex;
                this.code = innerPlaceholder.code;
                this.type = innerPlaceholder.contentType;
                this.position_bg = innerPlaceholder.backgroundColor;
                if (this.$refs.imgCropTool.jcropApi) {
                    this.$refs.imgCropTool.jcropApi.release();
                    var react = innerPlaceholder;
                    var scaleX = this.scale.scaleX;
                    var scaleY = this.scale.scaleY;
                    var x = react.left * scaleX,
                        y = react.top * scaleY,
                        w = react.width * scaleX,
                        h = react.height * scaleY;
                    var x2 = x + w,
                        y2 = y + h;
                    this.$refs.imgCropTool.jcropApi.setSelect([x, y, x2, y2]);
                }
            },
            handleScaleDone: function (scale, originSize) {
                this.scale = scale;
                if (this.currentActivePage) {
                    this.$set(this.currentActivePage, 'originSize', originSize);
                }
            },
            handleMoveDone: function () {
                // this._calcPlaceholders();
            },
            deletePage: function (index, page) {
                if (this.currentActivePage === page) {
                    this.resetPlaceholderEdit();
                    this.activePage = null;
                }
                this.innerPlaceholders = this.innerPlaceholders.filter((i) => i.pageId !== page.id);
                this.innerPages.splice(index, 1);
            },
            designPage: function (page) {
                this.activePage = page;
            },
            submit() {
                let self = this;
                return new Promise((resolve) => {
                    resolve({
                        valid: true,
                        data: {
                            pages: self.innerPages,
                            placeholders: self.innerPlaceholders.map((i) => {
                                return Object.assign({}, i, {
                                    width: i.widthPercent,
                                    height: i.heightPercent,
                                    left: i.leftPercent,
                                    top: i.topPercent
                                });
                            })
                        }
                    });
                });
            },
            getPlaceholderStyle: function (placeholder) {
                return {
                    left: placeholder.left,
                    top: placeholder.top,
                    width: placeholder.width,
                    height: placeholder.height,
                    backgroundColor: placeholder.backgroundColor || this.formData?.color,
                    lineHeight: placeholder.height
                };
            },
            handleActiveTool: function (toolName) {
                this.toolName = toolName;
            },
            deletePlaceholder: function (index) {
                this.innerPlaceholders.splice(index, 1);
            },
            copyPlaceholder: function (index) {
                let copyPlaceholder = JSON.parse(JSON.stringify(this.innerPlaceholders[index]));
                copyPlaceholder.code = copyPlaceholder.code + '_copy';
                copyPlaceholder.left += 30;
                copyPlaceholder.top += 30;
                this.innerPlaceholders.push(copyPlaceholder);
                this.$nextTick(() => {
                    this.editPlaceholder(copyPlaceholder);
                });
            }
        },
        mounted() {}
    };
});
