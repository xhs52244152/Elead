define([
    'text!' + ELMP.resource('project-budget/components/ChooseTemplate/index.html'),
    'erdcloud.kit',
    'dayjs',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-budget/utils/index.js'),
    'css!' + ELMP.resource('project-budget/components/ChooseTemplate/style.css')
], function (template, ErdcKit, dayjs, ppmStore, budgetUtils) {
    return {
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            TemplateSelectTable: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-template-budget/components/SelectTable/index.js')
            ),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            title: String,
            visible: {
                type: Boolean,
                default: false
            },
            // 是否允许关闭弹窗
            canClose: {
                type: Boolean,
                default: true
            },
            // 预算信息，可为空
            budgetInfo: Object
        },
        data() {
            return {
                // 表单数据
                formData: {
                    templateOid: null,
                    decomposeMode: null,
                    planFlag: null,
                    timeRange: null
                },
                // 记录初始化的表单数据
                oldFormData: {},
                // 启用国际化
                i18nPath: ELMP.resource('project-budget/locale/index.js'),
                isSaving: false,
                unfold1: true,
                unfold2: true,
                unfold3: true,
                stageTableData: [],
                labelWidth: '106px'
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
            // 预算
            budgetClassName() {
                return ppmStore?.state?.classNameMapping?.budget;
            },
            // 阶段
            stageClassName() {
                return ppmStore?.state?.classNameMapping?.budgetStage;
            },
            dialogTitle() {
                return this.title || this.i18n['setBudgetTitle'];
            },
            // 项目oid
            projectOid() {
                return ppmStore.state?.projectInfo?.oid;
            },
            // 项目关联的containerRef
            containerRef() {
                return ppmStore.state?.projectInfo?.containerRef || {};
            },
            // 预算oid
            budgetOid() {
                return this.budgetInfo?.[`${this.budgetClassName}#oid`];
            },
            stageTableColumns() {
                return [
                    {
                        prop: 'name',
                        title: this.i18n['stageName'], // 阶段名称
                        minWidth: '300',
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'operation',
                        title: this.i18n['operation'], // '操作',
                        width: '70',
                        sort: false, // 是否需要排序
                        fixed: 'right'
                    }
                ];
            },
            // 选择模板的表单配置
            formConfigs1() {
                return [
                    {
                        field: 'templateOid',
                        component: '',
                        label: this.i18n['templateName'],
                        required: true,
                        props: {},
                        slots: {
                            component: 'chooseComponent' // 自定义组件
                        },
                        col: 12
                    }
                ];
            },
            // 基本信息的表单配置
            formConfigs2() {
                return [
                    {
                        field: 'decomposeMode', // 分解模式（模板维度）
                        component: 'erd-radio',
                        label: this.i18n['templateDimension'],
                        defaultValue: 'stageMode',
                        props: {},
                        slots: {
                            component: 'radioComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'planFlag', // 是否需要详细计划
                        component: 'erd-radio',
                        label: this.i18n['isDetailedPlan'],
                        defaultValue: true,
                        hidden: this.hiddenDetailedPlan, // 是否隐藏该字段
                        class: 'long-custom-form-item', // 自定义class
                        props: {},
                        slots: {
                            component: 'radioPlanComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'timeRange', // 按年月时的年月区间
                        component: 'erd-date-picker',
                        label: this.i18n['selectInterval'],
                        hidden: this.hiddenTimeRange, // 是否隐藏该字段
                        required: !this.hiddenTimeRange,
                        props: {},
                        slots: {
                            component: 'timeRangeComponent'
                        },
                        col: 12
                    }
                ];
            },
            // 是否隐藏【是否需要详细计划】字段
            hiddenDetailedPlan() {
                return this.formData['decomposeMode'] !== 'stageMode';
            },
            // 是否隐藏【选择区间】字段
            hiddenTimeRange() {
                return this.formData['decomposeMode'] !== 'dateMode';
            },
            // 是否隐藏【编辑阶段】步骤
            hiddenEditStage() {
                return this.hiddenDetailedPlan;
            }
        },
        watch: {
            dialogVisible: {
                handler(visible) {
                    // 打开弹窗时
                    if (visible) {
                        this.initData();
                    }
                },
                immediate: true
            },
            formData: {
                handler() {
                    // 表单数据发生变化时，clear校验信息
                    this.$refs['formRef1']?.clearValidate();
                    this.$refs['formRef2']?.clearValidate();
                },
                deep: true
            }
        },
        methods: {
            // 打开弹窗时，初始化数据
            async initData() {
                this.formData['templateOid'] = this.budgetInfo?.[`${this.budgetClassName}#holderRef`]; // 预算模板oid
                this.formData['decomposeMode'] = this.budgetInfo?.[`${this.budgetClassName}#decomposeMode`]; // 分解模式（模板维度）
                this.formData['planFlag'] = this.budgetInfo?.[`${this.budgetClassName}#planFlag`]; // 是否需要详细计划
                let startDate = this.budgetInfo?.[`${this.budgetClassName}#stageStartDate`];
                let endDate = this.budgetInfo?.[`${this.budgetClassName}#stageEndDate`];
                this.formData['timeRange'] = (startDate && endDate && [startDate, endDate]) || null; // 按年月时的年月区间
                this.oldFormData = JSON.parse(JSON.stringify(this.formData));
                this.stageTableData =
                    this.budgetInfo?.['ALL_STAGES']?.map((r) => {
                        return {
                            oid: r[`${this.stageClassName}#oid`],
                            name: r[`${this.stageClassName}#name`]
                        };
                    }) || [];
            },
            // 表单属性值change事件
            valueChange(prop) {
                // 分解模式（模板维度）
                if (prop === 'decomposeMode') {
                    this.stageTableData = []; // 清空阶段的表格数据
                    this.formData['timeRange'] = null; // 清空年月数据
                }
            },
            // 判断是否会重置预算数据，返回true=会
            isResetBudgetData() {
                // 如果预算对象还未创建
                if (!this.budgetOid) {
                    return false;
                }
                // 任意一个值被修改即会重置的字段集合：模板名称、模板维度
                let baseProps = ['templateOid', 'decomposeMode'];
                let isCan = baseProps.some((prop) => this.oldFormData[prop] !== this.formData[prop]);
                if (isCan) {
                    return true;
                }
                // 如果模板维度值为：“按阶段”
                if (this.formData['decomposeMode'] === 'stageMode') {
                    // 是否需要详细计划的值有变化
                    if (this.oldFormData['planFlag'] !== this.formData['planFlag']) {
                        return true;
                    }
                }
                // 如果模板维度值为：“按年月”
                else {
                    // 由于按年月时，哪怕选择的时间区间没有变化，也会重置数据，因此返回true
                    return true;
                }
                return false;
            },
            // 创建一行
            handleAddRow() {
                this.stageTableData.push({});
            },
            // 删除当前行
            handleRowDelete(scope) {
                this.stageTableData.splice(scope.$rowIndex, 1);
            },
            // 保存处理
            async handleSave() {
                // 校验并获取数据
                let data = await this.getData();
                if (!data) {
                    return;
                }
                // 判断是否会重置预算数据
                let isCan = this.isResetBudgetData();
                if (isCan) {
                    // '即将重置预算数据，是否继续？'
                    this.$confirm(this.i18n['resetBudgetTip'], this.i18n['confirmReset'], {
                        distinguishCancelAndClose: true,
                        confirmButtonText: this.i18n.confirm,
                        cancelButtonText: this.i18n.cancel,
                        type: 'warning'
                    }).then(() => {
                        this.callSaveReq(data); // 保存
                    });
                } else {
                    this.callSaveReq(data); // 保存
                }
            },
            // 保存处理
            async callSaveReq(data) {
                let budgetInfo = {
                    name: +new Date(), // 预算名称，目前没有用，创建时随便传入
                    decomposeMode: data['decomposeMode'], // 分解模式：阶段、年月
                    planFlag: data['planFlag'], // 是否显示详细计划
                    holderRef: data['templateOid'], // 预算模板ID
                    contextRef: this.projectOid // 项目ID
                };
                // 阶段数据
                let stageList = [];
                // 按阶段 模式
                if (this.formData['decomposeMode'] === 'stageMode') {
                    stageList = data.stageData;
                }
                // 按年月 模式
                else if (this.formData['decomposeMode'] === 'dateMode') {
                    budgetInfo.planFlag = false; // 不显示详细计划
                    // 获取开始日期和结束日期
                    const startDate = dayjs(data['timeRange'][0]);
                    const endDate = dayjs(data['timeRange'][1]);

                    // 获取某个时间段的所有年月数据
                    const monthsBetween = budgetUtils.getAllMonths(startDate, endDate);
                    stageList = monthsBetween.map((month) => {
                        return {
                            name: month.format('YYYY-MM')
                        };
                    });
                }
                let params = {
                    className: this.budgetClassName,
                    associationField: 'contextRef',
                    containerRef: `OR:${this.containerRef.key}:${this.containerRef.id}`,
                    attrRawList: Object.keys(budgetInfo).map((prop) => {
                        return {
                            attrName: prop,
                            value: budgetInfo[prop]
                        };
                    }),
                    // 关联的阶段数据
                    relationList: stageList.map((r) => {
                        let stageInfo = {
                            name: r['name'],
                            description: r['description']
                        };
                        if (r['oid']) {
                            stageInfo['oid'] = r['oid'];
                        }
                        return {
                            action: stageInfo['oid'] ? 'UPDATE' : 'CREATE',
                            className: this.stageClassName,
                            oid: stageInfo['oid'],
                            attrRawList: Object.keys(stageInfo).map((prop) => {
                                return {
                                    attrName: prop,
                                    value: stageInfo[prop]
                                };
                            })
                        };
                    })
                };
                const isCreate = !this.budgetOid; // 是否创建预算
                this.isSaving = true;
                const res = await this.$famHttp({
                    url: isCreate ? '/ppm/create' : '/ppm/update',
                    method: 'post',
                    className: this.budgetClassName,
                    data: isCreate
                        ? params
                        : {
                              ...params,
                              oid: this.budgetOid
                          }
                }).finally(() => {
                    this.isSaving = false;
                });
                if (!res.success) {
                    return;
                }
                this.$message.success(this.i18n.saveSuccess);
                this.$emit('success');
                this.handleCancel();
            },
            // 校验并获取数据
            async getData() {
                return new Promise((resolve) => {
                    this.$refs['formRef1']
                        .submit((form1) => {
                            if (!form1.valid) {
                                return resolve(false);
                            }
                            this.$refs['formRef2']
                                .submit(async (form2) => {
                                    if (!form2.valid) {
                                        return resolve(false);
                                    }
                                    let stageData;
                                    // 判断是否显示阶段
                                    if (!this.hiddenEditStage) {
                                        // 校验阶段
                                        stageData = await this.validStageData();
                                        if (!stageData) {
                                            return resolve(false);
                                        }
                                    }
                                    return resolve({
                                        ...form1.data,
                                        ...form2.data,
                                        stageData
                                    });
                                })
                                .catch(() => {}); // 主要解决校验失败时，控制台报错的问题：Uncaught (in promise)
                        })
                        .catch(() => {}); // 主要解决校验失败时，控制台报错的问题：Uncaught (in promise)
                });
            },
            // 校验阶段数据，至少有一行有效数据
            validStageData() {
                // 空列表
                if (!this.stageTableData || !this.stageTableData.length) {
                    this.$message.error(this.i18n['stageNotNullTip']); // 阶段数据不能为空
                    return false;
                }
                let newStageData = []; // 过滤掉阶段名称为空的数据
                let isEmpty = false;
                this.stageTableData.forEach((r) => {
                    if (r['name']) {
                        newStageData.push(r);
                    } else {
                        isEmpty = true;
                    }
                });
                // 判断是否无有效数据
                if (!newStageData.length) {
                    this.$message.error(this.i18n['stageNotNullTip']); // 阶段数据不能为空
                    return false;
                }
                // 存在字段值空的情况
                if (isEmpty) {
                    this.$message.error(this.i18n['stageNameNotNullTip']); // 阶段名称不能为空
                    return false;
                }
                return newStageData;
            },
            stageNameInput(row, prop) {
                this.$set(row, prop, (row[prop] || '').trim());
            },
            handleCancel() {
                this.dialogVisible = false;
            }
        }
    };
});
