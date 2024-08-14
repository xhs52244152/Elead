define([
    'text!' + ELMP.resource('erdc-ppm-template-budget/components/TemplateEdit/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.func('erdc-ppm-template-budget/components/TemplateEdit/style.css')
], function (template, ErdcKit, ppmStore, commonHttp) {
    return {
        template,
        components: {
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            RelationSubject: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-template-budget/components/RelationSubject/index.js')
            )
        },
        data() {
            return {
                formData: {},
                // 启用国际化
                i18nPath: ELMP.resource('erdc-ppm-template-budget/locale/index.js'),
                activeName: 'detail',
                isDraft: true, // 是否草稿状态
                isSaving: false,
                isSavingDraft: false
            };
        },
        computed: {
            // 预算模板
            className() {
                return ppmStore?.state?.classNameMapping?.budgetTemplate;
            },
            oid() {
                return this.$route.query.oid;
            },
            title() {
                return this.type === 'create'
                    ? this.i18n['createBudgetTemplate']
                    : this.type === 'update'
                      ? this.i18n['editBudgetTemplate']
                      : this.i18n['checkBudgetTemplate'];
            },
            // create=创建，update=修改，detail=详情
            type() {
                if (this.$route.path.includes('detail')) {
                    return 'detail';
                }
                return !this.oid ? 'create' : 'update';
            },
            // 是否创建
            isCreate() {
                return this.type === 'create';
            },
            // 是否修改
            isUpdate() {
                return this.type === 'update';
            },
            formId() {
                return this.isCreate ? 'CREATE' : this.isUpdate ? 'UPDATE' : 'DETAIL';
            },
            // 标签页信息
            tabs() {
                let arr = [
                    {
                        activeName: 'detail',
                        name: this.i18n['detailInfo']
                    }
                ];
                if (this.type !== 'create') {
                    arr.push({
                        activeName: 'subject',
                        name: this.i18n['subject']
                    });
                }
                return arr;
            }
        },
        watch: {
            activeName(newVal, oldVal) {
                // 修改状态 && 如果从“科目”切换到“详细信息” 则重新刷新详情数据（因为编辑科目后，模板状态会改为“草稿”，需要刷新数据）
                if (this.isUpdate && oldVal === 'subject' && newVal === 'detail') {
                    this.refresh(); // 重新获取数据
                }
            }
        },
        created() {
            this.vm = this;
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
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.formId
                        // }
                    ],
                    name: this.formId,
                    objectOid: this.oid
                };
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_BUDGET_TEMPLATE_OPER',
                    objectOid: row.oid,
                    className: this.className
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
                        // 类型
                        typeReference: (e) => {
                            return e.oid;
                        },
                        // 产品线
                        productLineReference: (e) => {
                            return e.oid;
                        }
                    }
                });
                // 是否“草稿”状态
                this.isDraft = this.formData['status'] == '0';
            },
            handleConfirm(isDraft) {
                let $formRef = this.$refs['form'][0];
                // 表单校验
                $formRef.submit(async ({ valid }) => {
                    if (!valid) {
                        return;
                    }
                    let formData = $formRef.serializeEditableAttr();
                    formData = formData.filter((r) => r.attrName !== 'status');
                    formData.push({
                        attrName: 'status', // 状态字段
                        value: isDraft === true ? '0' : '2' // 0=草稿，1=失效（未发布），2=已发布
                    });
                    // 创建时，增加编码参数
                    if (this.isCreate) {
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
                    this[isDraft === true ? 'isSavingDraft' : 'isSaving'] = true;
                    let requestFunc = this.isCreate ? commonHttp.commonCreate : commonHttp.commonUpdate;
                    // 调用通用创建接口
                    let res = await requestFunc({
                        data: params
                    });
                    this[isDraft === true ? 'isSavingDraft' : 'isSaving'] = false;
                    if (!res.success) {
                        return;
                    }
                    this.$message.success(isDraft === true ? this.i18n.saveSuccess : this.i18n.publishSuccess);
                    // 关闭当前页面
                    this.$store.dispatch('route/delVisitedRoute', this.$route);
                    this.goDetail(this.oid || res.data); // 跳转到详情
                });
            },
            goDetail(oid) {
                this.$router.push({
                    path: '/erdc-ppm-template-budget/template/detail',
                    query: {
                        oid
                    }
                });
            },
            goBack() {
                this.$router.push({
                    path: '/erdc-ppm-template-budget/template/list'
                });
            },
            // 预算模板详情页中，操作失效、发布等成功后会调用vm.refresh方法
            refresh() {
                this.queryDetail(this.oid); // 重新获取数据
            }
        }
    };
});
