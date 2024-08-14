//  此组件适用于业务管理-重量级团队和产品信息模块

define([
    'text!' + ELMP.resource('erdc-ppm-review-library/component/libraryDialog/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('erdc-ppm-review-library/component/libraryDialog/style.css')
], function (template, ErdcKit, commonHttp) {
    return {
        template,
        props: {
            showDialog: {
                typeof: Boolean,
                default: false
            },
            showEdit: {
                typeof: Boolean,
                default: true
            },
            title: {
                typeof: String,
                default: '创建评审要素'
            },
            visible: {
                type: Boolean,
                default: false
            },
            layoutName: {
                type: String,
                default: 'CREATE'
            },
            ruleCode: {
                type: String,
                default: 'ReviewElementRule'
            },
            className: {
                type: String,
                default: ''
            },
            editableAttrs: {
                type: Array,
                default: []
            },
            oid: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-ppm-review-library/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    saveDraft: this.getI18nByKey('saveDraft'),
                    edit: this.getI18nByKey('edit')
                },
                isSaving: false,
                formData: {
                    identifierNo: ''
                }
            };
        },
        created() {},
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
            saveInfo(obj, draft, tip) {
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
            handleConfirm(isDraft) {
                if (this.isSaving) return;
                let { saveInfo } = this;
                this.getFormData().then((res) => {
                    let files = this.$refs.libraryFiles?.getTableData()?.originTableData || [];
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
                        this.$emit('before-submit', res, saveInfo, isDraft);
                    } else {
                        saveInfo(res, isDraft);
                    }
                });
            },
            handleCancel() {
                this.innerVisible = false;
            },
            handleDraft(val) {
                this.handleConfirm(val);
            }
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            Files: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/commonAttach/index.js'))
        }
    };
});
