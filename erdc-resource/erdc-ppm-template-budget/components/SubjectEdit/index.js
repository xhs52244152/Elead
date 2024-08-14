define([
    'text!' + ELMP.resource('erdc-ppm-template-budget/components/SubjectEdit/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-https/common-http.js')
], function (template, ErdcKit, ppmStore, commonHttp) {
    return {
        template,
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        props: {
            type: String, // 类型，create=创建，update=修改，detail=详情
            oid: String,
            title: String,
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                formData: {},
                // 启用国际化
                i18nPath: ELMP.resource('erdc-ppm-template-budget/locale/index.js'),
                isSaving: false
            };
        },
        computed: {
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            // 预算科目
            className() {
                return ppmStore?.state?.classNameMapping?.budgetSubject;
            },
            formId() {
                return this.type === 'create' ? 'CREATE' : this.type === 'update' ? 'UPDATE' : 'DETAIL';
            }
        },
        created() {
            this.initSetCode(); // 判断并初始化编码
            if (this.oid) {
                this.queryDetail(this.oid);
            }
        },
        methods: {
            // 判断并初始化编码
            async initSetCode() {
                if (this.type !== 'create') {
                    return;
                }
                this.formData['identifierNo'] = await commonHttp.getCodeByTypeName(this.className);
            },
            queryLayoutParams() {
                return {
                    name: this.formId,
                    objectOid: this.oid,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.formId
                        // }
                    ]
                };
            },
            // 查询详情
            async queryDetail(oid) {
                let res = await commonHttp.commonAttr({
                    data: {
                        oid
                    }
                });
                if (!res.success) {
                    return;
                }
                // 序列化
                this.formData = ErdcKit.deserializeAttr(res?.data?.rawData, {
                    valueMap: {
                        createBy: (e) => {
                            return e.displayName;
                        },
                        updateBy: (e) => {
                            return e.displayName;
                        }
                    }
                });
            },
            handleConfirm() {
                // 表单校验
                this.$refs.form.submit(async ({ valid }) => {
                    if (!valid) {
                        return;
                    }
                    let formData = this.$refs.form.serializeEditableAttr();
                    // 创建时，增加编码参数
                    if (this.type === 'create') {
                        formData.push({
                            attrName: 'identifierNo',
                            value: this.formData['identifierNo']
                        });
                    }
                    let params = {
                        className: this.className,
                        attrRawList: formData,
                        oid: this.oid
                    };
                    this.isSaving = true;
                    let requestFunc = this.type === 'create' ? commonHttp.commonCreate : commonHttp.commonUpdate;
                    // 调用通用创建接口
                    await requestFunc({
                        data: params
                    }).finally(() => {
                        this.isSaving = false;
                    });
                    this.$message.success(this.i18n.saveSuccess);
                    this.$emit('saveSuccess');
                    this.handleCancel();
                });
            },
            handleCancel() {
                this.dialogVisible = false;
            }
        }
    };
});
