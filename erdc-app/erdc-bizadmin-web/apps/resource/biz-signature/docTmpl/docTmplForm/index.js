define([
    'text!' + ELMP.resource('biz-signature/docTmpl/docTmplForm/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    ELMP.resource('biz-signature/mixins/lazyWatermark.js')
], function (template, CONST, watermarkMixin) {
    const FamKit = require('fam:kit');
    return {
        name: 'SignatureDocTmplForm',
        template: template,
        mixins: [watermarkMixin],
        components: {
            FamCodeGenerator: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamCodeGenerator/index.js`)),
            FamAdvancedForm: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamAdvancedForm/index.js`))
        },
        computed: {
            /**
             * 用来判断滚动加载的数据里面是否已经存在当前选中的值,如果存在,默认的那个options就可以不要了,
             * 否则,默认的那个就隐藏存在
             * @returns {T}
             */
            isDefaultValueInOptions: function () {
                return this.watermarkOptions.find((i) => i.code === this.watermarkForm.code);
            },
            isEdit: function () {
                return !!this.oid;
            },
            title: function () {
                return this.oid ? this.i18nMappingObj.editDocTmpl : this.i18nMappingObj.createDocTmpl;
            },
            fileTypes: function () {
                let self = this;
                return CONST.docTmplFileType.map((i) => {
                    return Object.assign({}, i, {
                        desc: self.i18nMappingObj[i.desc]
                    });
                });
            }
        },
        data: function () {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'createDocTmpl',
                    'editWatermark',
                    'confirm',
                    'cancel',
                    'editSuccess',
                    'signature_design_upload_pdf_tip',
                    'signature_design_upload_word_tip',
                    'signature_design_upload_excel_tip',
                    'createSuccess',
                    'editDocTmpl',
                    'createSuccess'
                ]),
                visible: false,
                loading: false,
                oid: '',
                formData: {},
                viewType: CONST.layoutKey.create,
                className: CONST.className.docTmpl,
                classNameMaster: CONST.className.docTmplMaster,
                fileTypesColumns: [
                    {
                        label: '类型',
                        key: 'label',
                        width: 100
                    },
                    {
                        label: '说明',
                        key: 'desc',
                        width: 500
                    }
                ]
                // waterPageIndex: 1,
                // waterTotal: 0,
                // waterPageSize: 10,
                // watermarkOptions: [],
                // watermarkForm: {}
            };
        },
        methods: {
            loadWaterForm: function (data) {
                // this.$nextTick(() => {
                //     this.loadDocTmplDesignDetail(this.oid.substring(this.oid.lastIndexOf(':') + 1)).then((data) => {
                //         delete data.pages;
                //         delete data.points;
                //         this.formData = data;
                //         if (data.watermark) {
                //             this.loadWatermarkDetail(data.watermark).then((watermarkDetail) => {
                //                 this.watermarkForm = {
                //                     name: watermarkDetail.name,
                //                     code: watermarkDetail.code
                //                 };
                //             });
                //         }
                //     });
                // });
            },
            /**
             * 兼容一下现在表格选择有问题的情况
             */
            compatibleTableSelect: function () {
                if (this.$refs.tableSelect) {
                    this.$refs.tableSelect.$el.parentNode.style.overflow = 'initial';
                } else {
                    setTimeout(this.compatibleTableSelect, 300);
                }
            },
            handleOpened: function () {
                this.compatibleTableSelect();
                this.queryWatermark();
            },
            /**
             * 提供上层打开当前编辑表单
             * @param {String} oid 水印的oid
             * @param {String} viewType 表单视图的类型,对应类型管理-布局下面的内部名称
             */
            open: function (oid, viewType) {
                this.oid = oid;
                this.viewType = viewType;
                this.visible = true;
                this.resetData();
                this.loadWatermarkPage().then((data) => {
                    this.watermarkOptions = data;
                });
            },
            resetData: function () {
                this.formData = {};
            },
            loadWatermarkDetail: function (watermarkCode) {
                return this.$famHttp({
                    url: '/fam/search',
                    method: 'post',
                    data: {
                        className: CONST.className.watermark,
                        conditionDtoList: [
                            {
                                attrName: 'code',
                                oper: 'EQ',
                                value1: watermarkCode
                            }
                        ]
                    }
                }).then((resp) => {
                    let result = {};
                    if (resp.success) {
                        let records = resp.data.records || [];
                        if (records && records.length) {
                            let data = records[0];
                            let attrRawList = data.attrRawList || [];
                            delete data.attrRawList;
                            result = Object.assign(
                                data,
                                FamKit.deserializeArray(attrRawList, {
                                    valueKey: 'displayName',
                                    isI18n: true
                                })
                            );
                        }
                    }
                    return result;
                });
            },
            loadDocTmplDesignDetail: function (id) {
                return this.$famHttp({
                    url: `/doc/signature/v1/tmpl/one/${id}`,
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
            onSubmit() {
                let self = this;
                this.loading = true;
                this.$refs.layoutForm
                    .submit()
                    .then((result) => {
                        if (result.valid) {
                            let url = '/fam/create';
                            if (self.oid) {
                                url = '/fam/update';
                            }
                            let baseForm = self.$refs.layoutForm.serializeEditableAttr();
                            baseForm.forEach((i) => {
                                if (i.attrName === 'fileType') {
                                    if (_.isArray(i.value)) {
                                        i.value = i.value[0].id;
                                    } else if (_.isObject(i.value)) {
                                        i.value = i.value.id;
                                    }
                                }
                            });
                            baseForm.push({
                                attrName: 'securityDate',
                                value: window.dayjs().format('YYYY-MM-DD HH:mm:ss')
                            });
                            return this.$famHttp({
                                url,
                                data: {
                                    className: self.oid ? CONST.className.docTmplMaster : CONST.className.docTmpl,
                                    oid: self.oid,
                                    attrRawList: baseForm
                                },
                                method: 'post'
                            })
                                .then((resp) => {
                                    this.$message({
                                        type: 'success',
                                        message: this.oid
                                            ? this.i18nMappingObj.editSuccess
                                            : this.i18nMappingObj.createSuccess,
                                        showClose: true
                                    });
                                    this.$emit('done');
                                    this.visible = false;
                                })
                                .catch(() => {});
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        },
        mounted() {}
    };
});
