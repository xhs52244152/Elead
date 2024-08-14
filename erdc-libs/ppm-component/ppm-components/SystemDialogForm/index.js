define([
    'text!' + ELMP.resource('ppm-component/ppm-components/SystemDialogForm/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('ppm-component/ppm-components/SystemDialogForm/style.css')
], function (template, ErdcKit, commonHttp) {
    return {
        template,
        props: {
            showFormDialog: {
                typeof: Boolean,
                default: false
            },
            title: {
                type: String,
                default: '创建'
            },
            layoutName: {
                type: String,
                default: 'CREATE'
            },
            className: {
                type: String,
                default: ''
            },
            visible: {
                type: Boolean,
                default: false
            },
            currentSelectTreeData: {
                type: Object,
                default: {}
            },
            editableAttrs: {
                type: Array,
                default: ['parentRef', 'status', 'category']
            },
            ruleCode: {
                type: String,
                default: 'productInfoCodeType'
            },
            // 对象oid
            oid: String,
            currentOid: String
        },
        data() {
            return {
                basicUnfold: true,
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/SystemDialogForm/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    edit: this.getI18nByKey('edit'),
                    saveDraft: this.getI18nByKey('saveDraft'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    moveTip: this.getI18nByKey('moveTip'),
                    moveTo: this.getI18nByKey('moveTo'),
                    save: this.getI18nByKey('save'),
                    selectObjType: this.getI18nByKey('selectObjType')
                },
                currentPosition: '',
                formClassName: '',
                formData: {
                    parentRef: '',
                    identifierNo: ''
                },
                isSaving: false
            };
        },
        created() {},
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            schemaMapper() {
                const _this = this;
                return {
                    // 创建、编辑一级对象不需要展示父产品
                    parentRef: function (schema) {
                        if (Object.keys(_this.currentSelectTreeData).length) {
                            if (_this.currentSelectTreeData?.level === 1) {
                                schema.hidden = _this.layoutName !== 'CREATE' ? true : false;
                            } else {
                                schema.hidden = false;
                            }
                        } else {
                            schema.hidden = true;
                        }
                    },
                    category: function (schema) {
                        schema.validators = [
                            { required: true, message: _this.i18nMappingObj.selectObjType, trigger: ['blur', 'change'] }
                        ];
                    }
                };
            }
        },
        watch: {
            oid: {
                async handler(nVal) {
                    if (nVal) {
                        setTimeout(() => {
                            this.getFormAttrData(nVal);
                        }, 300);
                    } else {
                        this.formData.identifierNo = await commonHttp.getCodeData(this.ruleCode);
                    }
                },
                immediate: true
            },
            currentOid: {
                handler(nVal) {
                    if (nVal) {
                        if (this.$route.path == '/erdc-ppm-products' || this.$route.path === '/erdc-ppm-heavy-team') {
                            setTimeout(async () => {
                                this.formData.parentRef = await this.getParentPath(this.currentOid);
                            }, 500);
                        }
                    }
                },
                immediate: true
            }
        },
        methods: {
            queryLayoutParams() {
                return {
                    objectOid: this.oid,
                    name: this.layoutName,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.layoutName
                        // }
                    ]
                };
            },
            handleEdit() {},
            // isDraft: 保存草稿
            saveInfo(obj, draft, tip) {
                if (this.isSaving) return;

                this.isSaving = true;
                this.$famHttp({
                    url: obj.oid ? '/cbb/update' : '/cbb/create',
                    data: obj,
                    className: this.className,
                    method: 'post'
                })
                    .then((res) => {
                        if (res.code === '200') {
                            this.$message({
                                message: tip || this.i18nMappingObj.success,
                                type: 'success',
                                showClose: true
                            });
                            this.innerVisible = false;

                            // 保存成功后抛出方法进行页面跳转
                            this.$emit('after-submit', res);
                        }
                    })
                    .catch(() => {})
                    .finally(() => {
                        this.isSaving = false;
                    });
            },
            getParentPath(id) {
                this.formData.parentRef = '';
                return new Promise((resolve) => {
                    this.$famHttp({
                        url:
                            this.$route.path === '/erdc-ppm-products'
                                ? '/cbb/productInfo/getParentPathName'
                                : '/cbb/heavyTeam/getParentPathName',
                        params: { oid: id },
                        className: this.className,
                        method: 'get'
                    }).then((res) => {
                        if (res.code === '200') {
                            let path = '';
                            if (res.data) {
                                let resoult = res.data.split('/');
                                if (this.oid) path = resoult.at(-1);
                                else path = this.currentSelectTreeData.name;
                                // path = res.data + '/' + `${this.currentSelectTreeData.name}` || '';
                            } else {
                                path = this.oid ? '' : this.currentSelectTreeData.name;
                            }
                            resolve(path || '');
                        }
                    });
                });
            },
            // 处理回显数据  n存在代表数据不需要单独处理
            async handleRenderData(data, n) {
                if (n) {
                    this.formData = ErdcKit.deserializeAttr(data);
                } else {
                    this.formData = data;
                }
                this.formData.parentRef = await this.getParentPath(this.currentOid);
            },
            // 查询接口请求
            fetchGetFormData(oid) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/cbb/attr',
                        className: this.className,
                        method: 'get',
                        data: {
                            oid: oid
                        }
                    })
                        .then((resp) => {
                            if (resp.code === '200') {
                                resolve(resp.data?.rawData || {});
                            } else {
                                reject();
                            }
                        })
                        .catch(() => {
                            reject();
                        });
                });
            },
            getFormAttrData(val) {
                let { handleRenderData } = this;
                // 查询表单信息
                if (val) {
                    this.fetchGetFormData(val).then((data) => {
                        // 处理数据回显, 如果数据需要处理的则去父组件外处理后在回调
                        if (this.$listeners['echo-data']) {
                            this.$emit('echo-data', data, handleRenderData);
                        } else {
                            this.handleRenderData(data, 1);
                        }
                    });
                }
            },
            getFormData() {
                // 详细信息(生成的布局)  check: 需要表单校验
                const { layoutForm } = this.$refs;
                // 获取详细信息数据
                return new Promise((resolve) => {
                    layoutForm
                        .submit()
                        .then(() => {
                            let formData = layoutForm?.serializeEditableAttr(undefined, undefined, true);
                            let obj = {
                                attrRawList: formData,
                                className: this.className
                            };
                            if (this.oid) {
                                obj.oid = this.oid;
                            }
                            resolve(obj);
                        })
                        .catch(() => {});
                });
            },
            handleConfirm() {
                if (this.isSaving) return;
                let { saveInfo } = this;
                this.getFormData().then((res) => {
                    if (this.$listeners['before-submit']) {
                        this.$emit('before-submit', res, saveInfo);
                    } else {
                        saveInfo(res);
                    }
                });
            },
            handleCancel() {
                this.innerVisible = false;
            },
            handleDraft(val) {
                if (this.isSaving) return;
                let { saveInfo } = this;
                this.getFormData().then((res) => {
                    if (this.$listeners['before-submit']) {
                        this.$emit('before-submit', res, saveInfo, val);
                    } else {
                        saveInfo(res, val);
                    }
                });
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        }
    };
});
