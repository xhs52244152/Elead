define([
    'text!' + ELMP.resource('project-budget/components/SubjectBudgetInfo/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-budget/utils/index.js'),
    ELMP.resource('project-budget/mixins/index.js'),
    ELMP.resource('ppm-utils/decimal.min.js'),
    'css!' + ELMP.resource('project-budget/components/SubjectBudgetInfo/style.css')
], function (template, ErdcKit, ppmStore, budgetUtils, mixin, Decimal) {
    return {
        template,
        mixins: [mixin],
        props: {
            // 接口数据
            resData: Object,
            // 是否编辑模式
            isEdit: {
                type: Boolean,
                default: false
            }
        },
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            AmountDetail: ErdcKit.asyncComponent(ELMP.resource('project-budget/components/AmountDetail/index.js')),
            TdInputNumber: ErdcKit.asyncComponent(ELMP.resource('project-budget/components/TdInputNumber/index.js'))
        },
        data() {
            return {
                // 启用国际化
                i18nPath: ELMP.resource('project-budget/locale/index.js'),
                unfold1: true,
                unfold2: true,
                baseData: {},
                computeData: {},
                tableData: []
            };
        },
        computed: {
            // 预算
            budgetClassName() {
                return ppmStore?.state?.classNameMapping?.budget;
            },
            // 阶段
            stageClassName() {
                return ppmStore?.state?.classNameMapping?.budgetStage;
            },
            // 预算科目
            subjectClassName() {
                return ppmStore?.state?.classNameMapping?.budgetSubject;
            },
            // 预算金额
            amountClassName() {
                return ppmStore?.state?.classNameMapping?.budgetAmount;
            },
            linkStatus() {
                return this.baseData[`${this.budgetLinkClassName}#budgetLinkStatus_value`];
            },
            // 是否可以编辑 预算 的相关功能
            isEditBudget() {
                // 编辑模式 && 不显示支出 && 配置了编辑的权限 && 当前数据状态允许编辑 && 没有子节点
                return (
                    this.isEdit &&
                    !this.isShowExpenses &&
                    this.mixin_perm.budgetAmount.edit &&
                    this.mixin_perm.budgetAmount.status[this.linkStatus] &&
                    !this.mixin_haveChild(this.baseData)
                );
            },
            // 是否可以显示 支出 的相关功能
            isShowExpenses() {
                // 处于[’已审批’]状态
                return ['APPROVED'].includes(this.linkStatus);
            },
            // 是否可以编辑 支出 的相关功能
            isEditExpenses() {
                // 编辑模式 && 显示支出的相关功能 && 配置了编辑的权限 && 当前数据状态允许编辑 && 没有子节点
                return (
                    this.isEdit &&
                    this.isShowExpenses &&
                    this.mixin_perm.expensesAmount.edit &&
                    this.mixin_perm.expensesAmount.status[this.linkStatus] &&
                    !this.mixin_haveChild(this.baseData)
                );
            },
            editConfig() {
                if (this.isSupportDetail) {
                    return {};
                }
                return { trigger: 'click', mode: 'cell', beforeEditMethod: this.beforeEditMethod };
            },
            // 表单字段
            formColumns() {
                return [
                    {
                        field: `${this.subjectClassName}#identifierNo`,
                        label: this.i18n['subjectCode'], // 科目编码
                        col: 8
                    },
                    {
                        field: `${this.subjectClassName}#name`,
                        label: this.i18n['subjectName'], // 科目名称
                        col: 8
                    },
                    {
                        field: `${this.subjectClassName}#category`,
                        label: this.i18n['subjectCategory'], // 科目类别
                        col: 8
                    },
                    {
                        field: `totalBudgetValue`,
                        label: this.i18n['totalCost'], // 总成本
                        col: 8
                    }
                ]
                    .concat(
                        this.isShowExpenses
                            ? [
                                  {
                                      field: `totalExpensesValue`,
                                      label: this.i18n['totalExpenses'], // 总支出
                                      col: 8
                                  },
                                  {
                                      field: `totalExpensesRate`,
                                      label: this.i18n['expensesRate'], // 支出占比
                                      col: 8
                                  }
                              ]
                            : []
                    )
                    .concat([
                        {
                            // 单个科目的预算状态（显示值）
                            field: `${this.budgetLinkClassName}#budgetLinkStatus`,
                            label: this.i18n['status'], // 状态
                            col: 8
                        },
                        {
                            field: `${this.subjectClassName}#description`,
                            label: this.i18n['description'], // 描述
                            labelWidth: 37.5 / 3 + '%',
                            col: 24
                        }
                    ]);
            },
            // 表格字段
            tableColumns() {
                return [
                    { type: 'seq', width: 50, align: 'center' },
                    // 阶段名称
                    {
                        prop: `${this.stageClassName}#name`,
                        title: this.i18n['stageName'],
                        minWidth: 130
                    },
                    // 预算
                    {
                        prop: `${this.mixin_prefixConfig.budget}${this.amountClassName}#value`,
                        title: this.i18n['budgetFy'],
                        minWidth: 130,
                        props: {
                            className: 'text-align-right'
                        },
                        editRender: this.isEditBudget ? {} : null, // 是否可编辑
                        isSlot: true // 内容是否通过插槽显示
                    }
                ].concat(
                    this.isShowExpenses
                        ? [
                              // 支出
                              {
                                  prop: `${this.mixin_prefixConfig.expenses}${this.amountClassName}#value`,
                                  title: this.i18n['expenses'],
                                  minWidth: 130,
                                  props: {
                                      className: 'text-align-right'
                                  },
                                  editRender: this.isEditExpenses ? {} : null, // 是否可编辑
                                  isSlot: true // 内容是否通过插槽显示
                              },
                              // 剩余
                              {
                                  prop: `${this.mixin_prefixConfig.surplus}${this.amountClassName}#value`,
                                  title: this.i18n['surplus'],
                                  minWidth: 130,
                                  props: {
                                      className: 'text-align-right'
                                  },
                                  isSlot: true // 内容是否通过插槽显示
                              }
                          ]
                        : []
                );
            },
            // 可编辑的字段插槽
            slotsNameEdit() {
                return this.tableColumns.filter((r) => !!r.editRender).map((r) => r.prop);
            },
            // 内容插槽
            slotsNameList() {
                return this.tableColumns.filter((r) => r.isSlot === true).map((r) => r.prop);
            },
            // 合计预算金额
            totalBudgetValue() {
                return (this.tableData || []).reduce((total, rowData) => {
                    return Decimal.add(
                        total,
                        Number(rowData[`${this.mixin_prefixConfig.budget}${this.amountClassName}#value`] || 0)
                    ).toNumber();
                }, 0);
            },
            // 合计支出金额
            totalExpensesValue() {
                return (this.tableData || []).reduce((total, rowData) => {
                    return Decimal.add(
                        total,
                        Number(rowData[`${this.mixin_prefixConfig.expenses}${this.amountClassName}#value`] || 0)
                    ).toNumber();
                }, 0);
            },
            // 支出占比
            totalExpensesRate() {
                if (!this.totalBudgetValue) {
                    return '';
                }
                let rate = this.mixin_calcExpensesRate(this.totalBudgetValue, this.totalExpensesValue);
                return rate + '%';
            },
            formData() {
                return {
                    ...this.baseData,
                    ...this.computeData
                };
            }
        },
        watch: {
            resData: {
                handler() {
                    // 初始化数据
                    this.initData();
                },
                immediate: true
            },
            // 预算总金额
            totalBudgetValue: {
                handler() {
                    this.$set(this.computeData, 'totalBudgetValue', this.totalBudgetValue);
                },
                immediate: true
            },
            // 支出总金额
            totalExpensesValue: {
                handler() {
                    this.$set(this.computeData, 'totalExpensesValue', this.totalExpensesValue);
                },
                immediate: true
            },
            totalExpensesRate: {
                handler() {
                    this.$set(this.computeData, 'totalExpensesRate', this.totalExpensesRate);
                },
                immediate: true
            }
        },
        created() {
            this.vm = this;
        },
        methods: {
            // 初始化数据
            async initData() {
                // 转换得到项目关联的预算对象信息，此方法里面会涉及到权限的计算属性值
                this.mixin_formatBudgetInfo(this.resData);
                // 转换获取得到表格数据
                let { tableData } = this.mixin_parseTableData(
                    this.resData,
                    {
                        isEditBudget: this.isEditBudget,
                        isShowExpenses: this.isShowExpenses,
                        isEditExpenses: this.isEditExpenses
                    },
                    true
                );
                this.baseData = tableData?.[0] || {};
                // 获取所有阶段
                let stageArr = (this.resData['stageList'] || []).map((r) => {
                    return ErdcKit.deserializeArray(r.attrRawList || [], {
                        valueKey: 'value'
                    });
                });
                this.tableData = stageArr.map((stage) => {
                    let row = {
                        leafNode: this.baseData['leafNode'], // 用于每行判断当前科目是否叶子节点
                        ...stage
                    };
                    // 预算值
                    row[`${this.mixin_prefixConfig.budget}${this.amountClassName}#value`] =
                        this.baseData[`${this.mixin_prefixConfig.budget}${stage[this.stageClassName + '#name']}`];
                    // 支出值
                    row[`${this.mixin_prefixConfig.expenses}${this.amountClassName}#value`] =
                        this.baseData[`${this.mixin_prefixConfig.expenses}${stage[this.stageClassName + '#name']}`];
                    return row;
                });
            },
            // 计算得到 每个阶段 剩余金额
            calcSurplus(rowData, prop) {
                prop = prop.replace(this.mixin_prefixConfig.surplus, '');
                let budgetValue = rowData[`${this.mixin_prefixConfig.budget + prop}`]; // 阶段的预算
                let expensesValue = rowData[`${this.mixin_prefixConfig.expenses + prop}`]; // 阶段的支出
                return Decimal.sub(Number(budgetValue || 0), Number(expensesValue || 0)).toNumber();
            },
            // 表格行内单元格编辑前事件
            beforeEditMethod(scope) {
                if (!scope?.row || !scope?.column?.property) {
                    return false;
                }
                let prop = scope.column.property;
                // 是否预算字段
                if (prop.includes(this.mixin_prefixConfig.budget)) {
                    return this.isEditBudget; // 是否可编辑
                }
                // 是否支出字段
                else if (prop.includes(this.mixin_prefixConfig.expenses)) {
                    return this.isEditExpenses; // 是否可编辑
                }
                return true;
            },
            // 点击金额
            onAmountDetail(rowData, prop) {
                // 是否不是 按阶段 模式展 || 是否不支持详细计划
                if (!this.isToStage || !this.isSupportDetail) {
                    return;
                }
                let {
                    isBudget, // 是否改动的为预算字段，false=支出字段
                    stageName // 阶段名称
                } = this.getAmountPropInfo(rowData, prop);
                // 获取对应阶段信息
                let stageInfo = this.mixin_getStageInfo(this.baseData, stageName);
                let subjectInfo = {}; // 科目信息
                Object.keys(this.baseData).forEach((key) => {
                    if (key.includes(this.subjectClassName)) {
                        subjectInfo[key] = this.baseData[key];
                    }
                });
                this.mixin_setAmountDetailDialog({
                    readonly: isBudget ? !this.isEditBudget : !this.isEditExpenses,
                    visible: true,
                    title: stageName,
                    isBudget: isBudget, // 是否点击的预算，false=支出
                    budgetLinkOid: this.baseData[`${this.budgetLinkClassName}#oid`],
                    subjectInfo: subjectInfo, // 科目信息
                    stageInfo: stageInfo // 阶段信息
                });
            },
            // 金额变动保存
            async onAmountChange(rowData, prop, newValue) {
                rowData[prop] = newValue || 0;
                let {
                    isBudget, // 是否改动的为预算字段，false=支出字段
                    stageName
                } = this.getAmountPropInfo(rowData, prop);
                // 获取对应阶段信息
                let stageInfo = this.mixin_getStageInfo(this.baseData, stageName);
                // 创建or修改金额
                await this.mixin_saveOrUpdateAmount({
                    isBudget,
                    stageInfo,
                    amountValue: rowData[prop],
                    subjectOid: this.baseData[`${this.subjectClassName}#oid`] // 科目oid
                });
                this.updatedDataAfter(false); // 修改数据后
            },
            // 根据字段名称获取预算or支出的相关信息
            getAmountPropInfo(rowData, prop) {
                let isBudget = prop.includes(this.mixin_prefixConfig.budget); // 是否改动的为预算字段，false=支出字段
                let stageName = rowData[`${this.stageClassName}#name`]; // 阶段名称
                return {
                    isBudget,
                    stageName
                };
            },
            // 修改预算数据后的操作（影响预算金额计算的相关操作）
            updatedDataAfter(isRefresh) {
                this.$emit('updatedData');
                isRefresh && this.refresh();
            },
            // 通用单个删除的方法，删除后默认执行vm.refresh方法，因此vm需要定义此方法
            refresh() {
                this.$emit('refresh');
            }
        }
    };
});
