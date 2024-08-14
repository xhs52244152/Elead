define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-budget/utils/index.js'),
    ELMP.resource('ppm-utils/decimal.min.js')
], function (ErdcKit, ppmStore, budgetUtils, Decimal) {
    return {
        data() {
            return {
                // 启用国际化
                i18nPath: ELMP.resource('project-budget/locale/index.js'),
                budgetInfo: null, // 项目关联的预算对象信息（储存内部值）
                budgetDisplayInfo: null, // 项目关联的预算对象信息（储存显示值）
                budgetOid: null, // 项目关联的预算对象Oid
                budgetState: '', // 项目关联的预算对象状态，DRAFT=草稿，PENDING_SUBMIT=待提交，IN_APPROVAL=审批中，APPROVED=已审批
                isSupportDetail: false, // 是否需要详细计划
                // 单位，1=元，10000=万元
                useUnit: {
                    value: '1',
                    label: ''
                },
                mixin_amountTypeOIdBudget: '', // 金额类型oid：预算
                mixin_amountTypeOIdExpenses: '', // 金额类型oid：支出
                // 配置的权限
                mixin_perm: {
                    // 预算金额对象权限
                    budgetAmount: {
                        // 是否有编辑权限
                        edit: false,
                        // 根据科目link状态判断，是否有编辑权限
                        status: {
                            // PENDING_SUBMIT: true
                        }
                    },
                    // 支出金额对象权限
                    expensesAmount: {
                        // 是否有编辑权限
                        edit: false,
                        // 根据科目link状态判断，是否有编辑权限
                        status: {
                            // PENDING_SUBMIT: false
                        }
                    }
                },
                // 动态字段增加前缀的配置
                mixin_prefixConfig: {
                    budget: '_BUDGET__', // 预算
                    expenses: '_EXPENSES__', // 实际支出
                    surplus: '_SURPLUS__' // 剩余
                },
                // 按阶段金额详情弹窗信息
                mixin_amountDetailDialog: {
                    visible: false,
                    title: '',
                    readonly: true, // 是否只读
                    isBudget: true, // 是否点击的预算字段
                    budgetLinkOid: null, // 单个科目预算的linkOid
                    subjectInfo: null, // 对应的科目信息
                    stageInfo: null // 阶段信息
                }
            };
        },
        computed: {
            containerRef() {
                let refObj = ppmStore.state?.projectInfo?.containerRef || {};
                return `OR:${refObj.key}:${refObj.id}`;
            },
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
            // 预算关联科目对象
            budgetLinkClassName() {
                return ppmStore?.state?.classNameMapping?.budgetLink;
            },
            // 预算金额
            amountClassName() {
                return ppmStore?.state?.classNameMapping?.budgetAmount;
            },
            // 是否 按阶段 的模式展示
            isToStage() {
                return this.budgetInfo[`${this.budgetClassName}#decomposeMode`] === 'stageMode';
            },
            treeConfig() {
                return {
                    childrenField: 'children',
                    expandAll: true
                };
            }
        },
        async created() {
            // 初始化金额类型
            let typeArr = await budgetUtils.findAmountType();
            typeArr.forEach((r) => {
                // 预算类型
                if (r.typeName === 'erd.cloud.ppm.budget.entity.BudgetValue') {
                    this.mixin_amountTypeOIdBudget = r.typeOid;
                }
                // 支出类型
                else if (r.typeName === 'erd.cloud.ppm.budget.entity.CostValue') {
                    this.mixin_amountTypeOIdExpenses = r.typeOid;
                }
            });
        },
        methods: {
            /**
             * 转换得到表格数据
             * @param {Object} data 接口数据
             * @param {Boolean} isEditBudget=是否可以编辑预算
             * @param {Boolean} isShowExpenses=是否可以显示支出相关的信息
             * @param {Boolean} isEditExpenses=是否可以编辑支出相关的信息
             * @param {Boolean} flag 是否不需要获取动态字段
             * @returns
             */
            mixin_parseTableData(data = {}, { isEditBudget, isShowExpenses, isEditExpenses }, flag) {
                let tableData = [];
                let dynamicOp = {};
                if (!flag) {
                    // 设置动态字段，该处理会导致表格滚动条重置，因此flag=true时不需要调用
                    dynamicOp = this.mixin_getDynamicColumns(data, {
                        isEditBudget,
                        isShowExpenses,
                        isEditExpenses
                    });
                }
                tableData = this.mixin_formatTableData(data, { isShowExpenses }); // 设置表格数据
                return {
                    tableData,
                    dynamicColumns: dynamicOp.dynamicColumns,
                    dynamicHeaderSlotNames: dynamicOp.dynamicHeaderSlotNames
                };
            },
            // 预算对象信息
            mixin_formatBudgetInfo(data) {
                // 获取该预算对象信息（内部值）
                this.budgetInfo = ErdcKit.deserializeArray(data?.attrRawList || [], {
                    valueMap: {
                        // 关联的预算模板OID
                        'erd.cloud.ppm.budget.entity.Budget#holderRef': (valueObj) => {
                            return valueObj.oid;
                        },
                        // 单位
                        'erd.cloud.ppm.budget.entity.Budget#unit': (valueObj) => {
                            return {
                                value: valueObj.value,
                                label: valueObj.displayName
                            };
                        }
                    }
                });
                // 获取该预算对象信息（显示值）
                this.budgetDisplayInfo = ErdcKit.deserializeArray(data.attrRawList || [], {
                    valueKey: 'displayName'
                });
                // 预算oid
                this.budgetOid = this.budgetInfo?.[`${this.budgetClassName}#oid`] || null;
                // 如果项目还没有关联预算，则必须先创建预算
                if (!this.budgetOid) {
                    return false;
                }
                // 设置权限
                this.mixin_setPerms(data?.aclInfo);
                // 预算状态
                this.budgetState = this.budgetInfo?.[`${this.budgetClassName}#lifecycleStatus.status`] || '';
                // 预算单元（元、万元）
                this.useUnit = this.budgetInfo?.[`${this.budgetClassName}#unit`] || {};
                // 是否支持显示详细计划
                this.isSupportDetail = this.isToStage && this.budgetInfo?.[`${this.budgetClassName}#planFlag`] === true;
                // 封装所有阶段数据到预算信息对象
                this.budgetInfo['ALL_STAGES'] = (data['stageList'] || []).map((rowData) => {
                    return ErdcKit.deserializeArray(rowData.attrRawList || [], {
                        valueKey: 'value'
                    });
                });
                return true;
            },
            // 系统配置的权限
            mixin_setPerms(aclInfo) {
                this.mixin_perm.budgetAmount.status = aclInfo?.budgetAcl?.status || {};
                this.mixin_perm.expensesAmount.status = aclInfo?.costAcl?.status || {};
                // 预算 整体的编辑权限：任意一个link数据的状态有编辑权限时，认为有整体的编辑权限
                this.mixin_perm.budgetAmount.edit = Object.values(this.mixin_perm.budgetAmount.status).some(
                    (val) => val === true
                );
                // 支出 整体的编辑权限：任意一个link数据的状态有编辑权限时，认为有整体的编辑权限
                this.mixin_perm.expensesAmount.edit = Object.values(this.mixin_perm.expensesAmount.status).some(
                    (val) => val === true
                );
            },
            // 根据阶段获取需要的动态字段
            mixin_getDynamicColumns(data, { isEditBudget, isShowExpenses, isEditExpenses }) {
                let dynamicColumns = [];
                let dynamicHeaderSlotNames = [];
                // 获取所有阶段or所有时间段的数据
                let dynamicArr = (data['stageList'] || []).map((rowData) => {
                    return ErdcKit.deserializeArray(rowData.attrRawList || [], {
                        valueKey: 'value'
                    });
                });
                // 动态字段
                dynamicArr.forEach((r, index) => {
                    let budgetAttrName = this.mixin_getStageProp(r, 'budget'); // xx的预算字段
                    dynamicColumns.push({
                        attrName: budgetAttrName, // 阶段的预算字段
                        label: r[`${this.stageClassName}#name`],
                        minWidth: isShowExpenses ? 120 : 100,
                        props: {
                            className: `${index % 2 === 0 ? 'bg-stage-cell' : ''} text-align-right`,
                            headerClassName: `${index % 2 === 0 ? 'bg-stage-cell' : ''}`
                        },
                        ...(isEditBudget
                            ? {
                                  // 是否支持行内编辑 与 表头显示可编辑的图标
                                  editRender: {}
                                  //   className: 'editIcon'
                              }
                            : {})
                    });
                    // 是否显示支出信息
                    if (isShowExpenses) {
                        dynamicHeaderSlotNames.push(budgetAttrName); // 预算
                        let expensesAttrName = this.mixin_getStageProp(r, 'expenses'); // xx的支出字段
                        dynamicHeaderSlotNames.push(expensesAttrName);
                        dynamicColumns.push({
                            attrName: expensesAttrName, // xx的支出字段
                            label: r[`${this.stageClassName}#name`],
                            minWidth: 120,
                            props: {
                                className: `${index % 2 === 0 ? 'bg-stage-cell' : ''} text-align-right`,
                                headerClassName: `${index % 2 === 0 ? 'bg-stage-cell' : ''}`
                            },
                            ...(isEditExpenses
                                ? {
                                      // 是否支持行内编辑 与 表头显示可编辑的图标
                                      editRender: {}
                                      //   className: 'editIcon'
                                  }
                                : {})
                        });
                        let surplusAttrName = this.mixin_getStageProp(r, 'surplus'); // xx的剩余字段
                        dynamicHeaderSlotNames.push(surplusAttrName);
                        dynamicColumns.push({
                            attrName: surplusAttrName, // xx的剩余字段
                            label: r[`${this.stageClassName}#name`],
                            minWidth: 120,
                            props: {
                                className: `${index % 2 === 0 ? 'bg-stage-cell' : ''} text-align-right`,
                                headerClassName: `${index % 2 === 0 ? 'bg-stage-cell' : ''}`
                            }
                        });
                    }
                });
                return {
                    dynamicColumns,
                    dynamicHeaderSlotNames
                };
            },
            // 设置表格数据
            mixin_formatTableData(data, { isShowExpenses }) {
                let tableData = deepFormatTableData(this, data?.subjects || [], { isShowExpenses }); // 递归获取表格基本数据
                return tableData;
            },

            // 根据 获取阶段名称(or时间段值)对应预算or支出字段的名称，type=‘budget’为获取预算字段，type=‘expenses’为获取支出字段
            mixin_getStageProp(rowData, type = 'budget') {
                let val = rowData[`${this.stageClassName}#name`];
                return this.mixin_prefixConfig[type] + val;
            },
            // 判断是否有子节点
            mixin_haveChild(rowData) {
                // 通过leafNode来判断是否叶子节点，不能通过children，因为搜索非叶子节点时，返回的children为空，但是leafNode应该为false
                return !rowData.leafNode;
            },
            // 单位转换
            mixin_formatAmountUnit(value, noJoinUnit) {
                // 是否不拼接单位
                if (noJoinUnit) {
                    return value;
                }
                return budgetUtils.formatAmountUnit(value, this.useUnit?.label);
            },
            // 计算得到 每个阶段 剩余金额
            mixin_calcSurplus(rowData, prop) {
                prop = prop.replace(this.mixin_prefixConfig.surplus, '');
                let budgetValue = rowData[`${this.mixin_prefixConfig.budget + prop}`]; // 阶段的预算
                let expensesValue = rowData[`${this.mixin_prefixConfig.expenses + prop}`]; // 阶段的支出
                return Decimal.sub(Number(budgetValue || 0), Number(expensesValue || 0)).toNumber();
            },
            // 计算得到 总支出占比
            mixin_calcExpensesRate(totalBudget, totalExpenses) {
                // 如果总预算为0
                if (!Number(totalBudget)) {
                    return '';
                }
                // 支出总占比赋值
                let expensesRate = Number(totalExpenses) / Number(totalBudget);
                return Math.round(expensesRate * 10000) / 100;
            },
            // 按阶段金额详情弹窗信息
            mixin_setAmountDetailDialog(op = {}) {
                this.mixin_amountDetailDialog = op;
            },
            // 获取对应阶段信息（注：此为带BUDGET_INFO、EXPENSES_INFO值的阶段信息）
            mixin_getStageInfo(rowData, stageName) {
                return rowData['STAGES_INFO'].find((r) => r[`${this.stageClassName}#name`] === stageName);
            },
            async mixin_saveOrUpdateAmount({ isBudget, stageInfo, amountValue, subjectOid }) {
                // 获取金额对象信息
                let amountObj = stageInfo?.[isBudget ? 'BUDGET_INFO' : 'EXPENSES_INFO'] || {};
                // 金额对象OID
                let amountOid = amountObj[`${this.amountClassName}#oid`];
                let isCreate = !amountOid; // 是否为创建
                let params = {
                    amountValue: amountValue || 0,
                    description: undefined,
                    budgetOid: this.budgetOid, // 预算oid
                    subjectOid: subjectOid, // 科目oid
                    stageOid: stageInfo[`${this.stageClassName}#oid`], // 阶段oid
                    taskOid: null
                };
                // 没有金额对象，则 创建金额对象
                if (!amountOid) {
                    // 创建金额
                    amountOid = await budgetUtils.createBudgetAmount({
                        ...params,
                        typeReference: isBudget ? this.mixin_amountTypeOIdBudget : this.mixin_amountTypeOIdExpenses,
                        containerRef: this.containerRef
                    });
                } else {
                    // 修改金额对象
                    // 修改金额
                    amountOid = await budgetUtils.updateBudgetAmount({
                        ...params,
                        amountOid: amountOid
                    });
                }
                // 创建or修改成功
                if (amountOid) {
                    // 创建
                    if (isCreate) {
                        amountObj = {};
                        amountObj[`${this.amountClassName}#oid`] = amountOid; // 同步oid
                        amountObj[`${this.amountClassName}#value`] = amountValue; // 同步金额
                        stageInfo[isBudget ? 'BUDGET_INFO' : 'EXPENSES_INFO'] = amountObj; // 阶段信息赋值
                    }
                    // 修改
                    else {
                        amountObj[`${this.amountClassName}#value`] = amountValue; // 同步金额
                    }
                }
                return {
                    isCreate,
                    amountOid,
                    amountObj
                };
            }
        }
    };

    // 递归获取表格基本数据
    function deepFormatTableData(vm, subjects, { isShowExpenses }, rootNode) {
        let tableData = [];
        subjects.forEach((subject) => {
            let subjectAttrRawList = (subject.attrRawList || []).concat(subject.subjectInfo?.attrRawList || []);
            let statusAtrr = subjectAttrRawList.find(
                (r) => r.attrName === `${vm.budgetLinkClassName}#budgetLinkStatus`
            );
            // 单个科目预算的状态（内部值）
            subjectAttrRawList.push({
                ...(statusAtrr || {}),
                attrName: `${vm.budgetLinkClassName}#budgetLinkStatus_value`,
                displayName: statusAtrr?.value || 'PENDING_SUBMIT'
            });
            // 获取科目行数据
            let subjectRow = ErdcKit.deserializeArray(subjectAttrRawList, {
                valueKey: 'displayName'
            });
            let sRootNode = rootNode || subjectRow; // 根节点数据
            let rowData = {
                ...subjectRow,
                leafNode: subject.leafNode, // 是否叶子节点
                // 行数据的oid，按钮的后置任务校验会用到该字段
                oid: subjectRow[`${vm.budgetLinkClassName}#oid`],
                // 根节点的linkOid（根节点的linkOid是它自己）
                rootLinkOid: sRootNode[`${vm.budgetLinkClassName}#oid`],
                // 根节点的科目Oid（根节点的科目Oid是它自己）
                rootSubjectOid: sRootNode[`${vm.subjectClassName}#oid`],
                // 根节点link的唯一值（oid在流程结束打快照后会变，该code不能变）
                rootLinkCode: sRootNode[`${vm.budgetLinkClassName}#code`]
            };
            rowData.STAGES_INFO = [];
            let stagesArr = subject?.stages || [];
            // 该科目下所有阶段（时间区间）的值
            stagesArr.forEach((stage) => {
                // 获取阶段数据
                let stageRow = ErdcKit.deserializeArray(stage.attrRawList || []);
                rowData.STAGES_INFO.push(stageRow); // 字段值
                // 获取预算数据
                let budgetValueRow = ErdcKit.deserializeArray(stage.budgetValue?.attrRawList || []);
                stageRow.BUDGET_INFO = budgetValueRow; // 保存该阶段的预算行数据
                // 当前阶段字段的预算赋值
                rowData[vm.mixin_getStageProp(stageRow, 'budget')] = budgetValueRow[`${vm.amountClassName}#value`];
                // 预算是否显示支出信息
                if (isShowExpenses) {
                    // 获取支出数据
                    let expensesValueRow = ErdcKit.deserializeArray(stage.costValue?.attrRawList || []);
                    stageRow.EXPENSES_INFO = expensesValueRow; // 保存该阶段的支出到行数据
                    // 当前阶段字段的支出赋值
                    rowData[vm.mixin_getStageProp(stageRow, 'expenses')] =
                        expensesValueRow[`${vm.amountClassName}#value`];
                }
            });
            // 子数据
            if (subject['childList'] && subject['childList'].length) {
                rowData[vm.treeConfig.childrenField] = deepFormatTableData(
                    vm,
                    subject['childList'],
                    {
                        isShowExpenses
                    },
                    sRootNode
                );
            }
            tableData.push(rowData);
        });
        return tableData;
    }
});
