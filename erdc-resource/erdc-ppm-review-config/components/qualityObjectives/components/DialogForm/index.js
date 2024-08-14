define([
    'text!' + ELMP.resource('erdc-ppm-review-config/components/qualityObjectives/components/DialogForm/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('erdc-ppm-review-config/components/qualityObjectives/components/DialogForm/style.css')
], function (template, ErdcKit) {
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
            // 对象oid
            oid: String
        },
        data() {
            return {
                basicUnfold: true,
                i18nLocalePath: ELMP.resource(
                    'erdc-ppm-review-config/components/qualityObjectives/components/DialogForm/locale/index.js'
                ),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    edit: this.getI18nByKey('edit'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    save: this.getI18nByKey('save'),
                    selectReviewRole: this.getI18nByKey('selectReviewRole'),
                    selectRole: this.getI18nByKey('selectRole')
                },
                editableAttrs: ['status'],
                formData: {},
                isSaving: false
            };
        },
        created() {},
        mounted() {},
        computed: {
            operationConfigName() {
                return this.layoutName !== 'DETAIL'
                    ? 'REVIEW_ATTACH_PER_FULL_OP_MENU'
                    : 'REVIEW_ATTACH_DETAIL_FULL_OP_MENU';
            },
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
                    responsibilityRoleRef: function (schema) {
                        schema.validators = [
                            { required: true, message: _this.i18nMappingObj.selectRole, trigger: ['blur', 'change'] }
                        ];
                    },
                    reviewRoleRef: function (schema) {
                        schema.validators = [
                            {
                                required: true,
                                message: _this.i18nMappingObj.selectReviewRole,
                                trigger: ['blur', 'change']
                            }
                        ];
                    }
                };
            }
        },
        watch: {
            oid: {
                handler(nVal) {
                    if (nVal) {
                        setTimeout(() => {
                            this.getFormAttrData(nVal);
                        }, 300);
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
            handleEdit() {
                this.$emit('edit', this.oid);
            },
            // isDraft: 保存草稿
            saveInfo(obj, tip) {
                if (this.isSaving) return;
                this.isSaving = true;
                this.$famHttp({
                    url: obj.oid ? '/element/update' : '/element/create',
                    data: obj,
                    className: this.className,
                    method: 'post'
                })
                    .then((res) => {
                        if (res.code === '200') {
                            this.$message({
                                message: tip || this.i18nMappingObj['success'],
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
            // 处理回显数据  n存在代表数据不需要单独处理
            async handleRenderData(data, n) {
                if (n) {
                    this.formData = ErdcKit.deserializeAttr(data);
                } else {
                    this.formData = data;
                }
            },
            // 查询接口请求
            fetchGetFormData(oid) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/element/attr',
                        method: 'get',
                        className: this.className,
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
                    let files = this.$refs.deliverFiles?.getTableData()?.originTableData || [];
                    if (files && files.length) {
                        res.contentSet = [];
                        _.each(files, (item) => {
                            res.contentSet.push({
                                id: item.id,
                                actionFlag: item.actionFlag,
                                source: 0,
                                role: 'SECONDARY'
                            });
                        });
                    }
                    if (this.$listeners['before-submit']) {
                        this.$emit('before-submit', res, saveInfo);
                    } else {
                        saveInfo(res);
                    }
                });
            },
            handleCancel() {
                this.innerVisible = false;
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            Files: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/commonAttach/index.js'))
        }
    };
});
