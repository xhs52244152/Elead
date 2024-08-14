define([
    'text!' + ELMP.resource('project-budget/components/AmountDetail/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('project-budget/utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-utils/decimal.min.js'),
    'css!' + ELMP.resource('project-budget/components/AmountDetail/style.css')
], function (template, ErdcKit, ppmStore, ppmUtils, budgetUtils, actions, Decimal) {
    return {
        template,
        components: {
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            ChooseTask: ErdcKit.asyncComponent(ELMP.resource('project-budget/components/ChooseTask/index.js')),
            TdInputNumber: ErdcKit.asyncComponent(ELMP.resource('project-budget/components/TdInputNumber/index.js'))
        },
        props: {
            title: String,
            visible: {
                type: Boolean,
                default: false
            },
            // 预算信息，可为空
            budgetInfo: Object,
            useUnit: Object,
            // 是否只读
            readonly: {
                type: Boolean,
                default: true
            },
            // 是否为预算，false=支出
            isBudget: Boolean,
            // 单个科目预算的linkOid
            budgetLinkOid: String,
            // 科目信息
            subjectInfo: Object,
            // 阶段信息
            stageInfo: Object,
            // 金额类型oid-预算
            amountTypeOIdBudget: String,
            // 金额类型oid-支出
            amountTypeOIdExpenses: String
        },
        data() {
            return {
                formData: {},
                // 启用国际化
                i18nPath: ELMP.resource('project-budget/locale/index.js'),
                unfold1: true,
                unfold2: true,
                isSaving: false,
                slotsEditField: [], // 自定义编辑字段
                chooseTaskDialog: {
                    visible: false
                },
                // 字段增加前缀的配置
                prefixConfig: {
                    budget: 'BUDGET_PROP_', // 预算
                    expenses: 'EXPENSES_PROP_' // 实际支出
                },
                allData: [],
                isUpdated: false, // 记录整个弹窗页面是否有修改过任何数据，用于关闭弹窗后是否刷新的判断
                updateRecords: {} // 修改字段的记录
            };
        },
        computed: {
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    // 关闭弹窗时，判断有修改数据
                    if (!val && this.isUpdated) {
                        this.$emit('success');
                    }
                    this.$emit('update:visible', val);
                }
            },
            dialogTitle() {
                return this.title;
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
            // 任务
            taskClassName() {
                return ppmStore?.state?.classNameMapping?.task;
            },
            // 项目oid
            projectOid() {
                return this.$route.query.pid;
            },
            // 项目关联的containerRef
            containerRef() {
                let refObj = ppmStore.state?.projectInfo?.containerRef || {};
                return `OR:${refObj.key}:${refObj.id}`;
            },
            // 预算oid
            budgetOid() {
                return this.budgetInfo?.[`${this.budgetClassName}#oid`];
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
                        field: `${this.stageClassName}#name`,
                        label: this.i18n['stageName'], // 阶段名称
                        col: 8
                    },
                    {
                        field: `totalBudgetValue`,
                        label: this.i18n['totalBudgetValue'], // 合计预算金额
                        col: 8
                    }
                ].concat(
                    this.isBudget
                        ? []
                        : [
                              {
                                  field: `totalExpensesValue`,
                                  label: this.i18n['totalExpensesValue'], // 合计支出金额
                                  col: 8
                              }
                          ]
                );
            },
            // 合计预算金额
            totalBudgetValue() {
                return (this.allData || []).reduce((total, rowData) => {
                    return Decimal.add(
                        total,
                        Number(rowData[`${this.prefixConfig.budget}${this.amountClassName}#value`] || 0)
                    ).toNumber();
                }, 0);
            },
            // 合计支出金额
            totalExpensesValue() {
                return (this.allData || []).reduce((total, rowData) => {
                    return Decimal.add(
                        total,
                        Number(rowData[`${this.prefixConfig.expenses}${this.amountClassName}#value`] || 0)
                    ).toNumber();
                }, 0);
            },
            // 插槽字段
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.taskClassName}#identifierNo`, // 任务编码
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.prefixConfig.budget}${this.amountClassName}#value`, // 预算金额
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.prefixConfig.expenses}${this.amountClassName}#value`, // 支出金额
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            columns() {
                // 基础字段
                let baseColumns = [
                    // 任务编码
                    { attrName: `${this.taskClassName}#identifierNo`, label: this.i18n['taskCode'], minWidth: 130 },
                    // 任务名称
                    { attrName: `${this.taskClassName}#name`, label: this.i18n['taskName'], minWidth: 130 },
                    // 责任人
                    {
                        attrName: `${this.taskClassName}#responsiblePerson`,
                        label: this.i18n['personResponsible'],
                        minWidth: 100
                    },
                    // 预算费用
                    {
                        attrName: `${this.prefixConfig.budget}${this.amountClassName}#value`,
                        label: this.i18n['budgetAmount'],
                        minWidth: 100,
                        props: {
                            className: 'text-align-right'
                        },
                        ...(!this.readonly && this.isBudget
                            ? {
                                  // 是否行内编辑的配置判断
                                  editRender: {}
                              }
                            : {})
                    },
                    // 预算费用描述
                    {
                        attrName: `${this.prefixConfig.budget}${this.amountClassName}#description`,
                        label: this.i18n['budgetAmountDesc'],
                        minWidth: 100,
                        ...(!this.readonly && this.isBudget
                            ? {
                                  // 是否行内编辑的配置判断
                                  editRender: {}
                              }
                            : {})
                    }
                ];
                this.slotsEditField = [
                    `${this.prefixConfig.budget}${this.amountClassName}#value`,
                    `${this.prefixConfig.budget}${this.amountClassName}#description`
                ];
                // 支出
                if (!this.isBudget) {
                    // 支出费用
                    baseColumns.push({
                        attrName: `${this.prefixConfig.expenses}${this.amountClassName}#value`,
                        label: this.i18n['expensesAmount'],
                        minWidth: 100,
                        props: {
                            className: 'text-align-right'
                        },
                        ...(!this.readonly
                            ? {
                                  // 是否行内编辑的配置判断
                                  editRender: {}
                              }
                            : {})
                    });
                    // 支出费用描述
                    baseColumns.push({
                        attrName: `${this.prefixConfig.expenses}${this.amountClassName}#description`,
                        label: this.i18n['expensesAmountDesc'],
                        minWidth: 100,
                        ...(!this.readonly
                            ? {
                                  // 是否行内编辑的配置判断
                                  editRender: {}
                              }
                            : {})
                    });
                    this.slotsEditField.push(`${this.prefixConfig.expenses}${this.amountClassName}#value`);
                    this.slotsEditField.push(`${this.prefixConfig.expenses}${this.amountClassName}#description`);
                }
                // 拼接动态字段
                return baseColumns;
            },
            conditionDtoList() {
                return [
                    {
                        attrName: `${this.amountClassName}#contextRef`,
                        oper: 'EQ',
                        value1: this.budgetOid // 预算oid
                    },
                    {
                        attrName: `${this.amountClassName}#holderRef`,
                        oper: 'EQ',
                        value1: this.subjectInfo[`${this.subjectClassName}#oid`] // 科目oid
                    },
                    {
                        attrName: `${this.amountClassName}#stageRef`,
                        oper: 'EQ',
                        value1: this.stageInfo[`${this.stageClassName}#oid`] // 阶段oid
                    },
                    {
                        attrName: `${this.amountClassName}#objectRef`,
                        oper: 'IS_NOT_NULL'
                    }
                ];
            },
            viewTableConfig() {
                return {
                    vm: this, // 用于表格toolbarConfig.actionConfig配置的按钮事件回调参数vm的值
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/ppm/budget/stage/info', // 表格数据接口
                        data: {
                            className: this.amountClassName,
                            sortBy: 'asc',
                            orderBy: `${this.amountClassName}#identifierNo`,
                            tableKey: 'BudgetAmountListView',
                            baselined: false,
                            conditionDtoList: this.conditionDtoList
                        }, // 路径参数
                        method: 'post', // 请求方法（默认get）
                        transformResponse: [
                            (data) => {
                                // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                // 对接收的 data 进行任意转换处理
                                let resData;
                                this.updateRecords = {}; // 清空修改记录
                                try {
                                    resData = (data && JSON.parse(data)) || {};
                                    resData.data.records = this.formatTableData(resData.data.records); // 格式化表格数据
                                    this.allData = resData.data.records;
                                    // 主要考虑搜索后总金额前端计算有误，因此搜索后未命中的数据isShow=false，前端控制不显示，总金额计算时需要计入
                                    // 注：this.allData与resData.data.records元素对象需要引用同一个对象，否则金额改变后计算会有问题
                                    resData.data.records = resData.data.records.filter((r) => r.isShow !== false);
                                } catch (error) {
                                    resData = data && JSON.parse(data);
                                }
                                return resData;
                            }
                        ]
                    },
                    firstLoad: true,
                    // 视图的高级表格配置，使用继承方式，参考高级表格用法
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: true,
                        fuzzySearch: {
                            show: true // 是否显示普通模糊搜索，默认显示
                        },
                        basicFilter: {
                            show: false
                        },
                        actionConfig:
                            !this.readonly && this.isBudget
                                ? {
                                      name: 'PPM_BUDGET_OBJECT_AMOUNT_LIST',
                                      containerOid: '',
                                      objectOid: this.budgetLinkOid,
                                      className: this.budgetLinkClassName
                                  }
                                : null
                    },
                    addSeq: true,
                    addIcon: false,
                    addCheckbox: !this.readonly && this.isBudget,
                    addOperationCol: !this.readonly && this.isBudget, // 是否显示操作列
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left', // 全局文本对齐方式
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true, // 溢出隐藏显示省略号
                        ...(this.readonly
                            ? {}
                            : {
                                  editConfig: { trigger: 'click', mode: 'cell' } // 行内编辑配置
                              })
                    },
                    pagination: {
                        showPagination: false,
                        pageSize: 99999 // 一次性全部加载，任务唯一性判断以及合计金额计算需要所有数据
                    },
                    slotsField: this.slotsField,
                    columns: this.columns
                };
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
            // 预算总金额
            totalBudgetValue: {
                handler() {
                    this.$set(this.formData, 'totalBudgetValue', this.totalBudgetValue);
                },
                immediate: true
            },
            // 支出总金额
            totalExpensesValue: {
                handler() {
                    this.$set(this.formData, 'totalExpensesValue', this.totalExpensesValue);
                },
                immediate: true
            }
        },
        created() {
            this.vm = this;
        },
        methods: {
            // 打开弹窗时，初始化数据
            async initData() {
                this.formData = {};
                Object.keys(this.subjectInfo || {}).forEach((key) => {
                    this.$set(this.formData, key, this.subjectInfo[key]);
                });
                Object.keys(this.stageInfo || {}).forEach((key) => {
                    this.$set(this.formData, key, this.stageInfo[key]);
                });
            },
            // 格式化表格数据
            formatTableData(records) {
                return (records || []).map((r) => {
                    // 获取科目行数据
                    let row = ErdcKit.deserializeArray(r.attrRawList || [], {
                        valueMap: {
                            // 任务责任人
                            'erd.cloud.ppm.plan.entity.Task#responsiblePerson': (e) => {
                                return e.displayName;
                            },
                            // 项目信息
                            'erd.cloud.ppm.plan.entity.Task#projectRef': (e) => {
                                return {
                                    oid: e.oid,
                                    name: e.displayName
                                };
                            },
                            // 主计划
                            'erd.cloud.ppm.plan.entity.Task#collectRef': (e) => {
                                return e.oid;
                            }
                        }
                    });
                    // 预算的金额对象
                    let budgetRow = r.budgetValue && ErdcKit.deserializeArray(r.budgetValue.attrRawList || []);
                    // 支出的金额对象
                    let costRow = r.costValue && ErdcKit.deserializeArray(r.costValue.attrRawList || []);
                    row['BUDGET_INFO'] = budgetRow;
                    row['EXPENSES_INFO'] = costRow;
                    // 将预算金额字段放到主数据中
                    Object.keys(budgetRow || {}).forEach((key) => {
                        row[this.prefixConfig.budget + key] = budgetRow[key];
                    });
                    // 将支出金额字段放到主数据中
                    Object.keys(costRow || {}).forEach((key) => {
                        row[this.prefixConfig.expenses + key] = costRow[key];
                    });
                    let mainRow = JSON.parse(JSON.stringify(r));
                    delete mainRow['attrRawList'];
                    return {
                        ...row,
                        ...mainRow
                    };
                });
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_BUDGET_OBJECT_AMOUNT_OPER',
                    objectOid: this.budgetLinkOid,
                    className: this.budgetLinkClassName
                };
            },
            handleAdd() {
                this.chooseTaskDialog.visible = true;
            },
            // 选择任务后的回调
            async handleChooseTask(taskList, resolve) {
                if (!taskList?.length) {
                    resolve(false); // 只关闭loading，不关闭弹窗
                    return;
                }
                let baseOp = {
                    amountValue: 0,
                    description: undefined,
                    budgetOid: this.budgetOid, // 预算oid
                    subjectOid: this.subjectInfo[`${this.subjectClassName}#oid`], // 科目oid
                    stageOid: this.stageInfo[`${this.stageClassName}#oid`], // 阶段oid
                    typeReference: this.isBudget ? this.amountTypeOIdBudget : this.amountTypeOIdExpenses,
                    containerRef: this.containerRef
                };
                let params = [];
                let exsitTasks = []; // 获取已存在的任务
                let allTableData = this.$refs['famTableRef'].tableData || []; // 表格数据
                taskList.forEach((task) => {
                    const taskOid = task[`${this.taskClassName}#oid`]; // 任务oid
                    const taskName = task[`${this.taskClassName}#name`]; // 任务名称
                    // 已存在的判断
                    if (allTableData.some((r) => r[`${this.taskClassName}#oid`] === taskOid)) {
                        exsitTasks.push({
                            taskOid,
                            taskName
                        });
                    } else {
                        let row = { ...baseOp };
                        row['taskOid'] = taskOid; // 任务oid
                        row['taskName'] = taskName; // 任务oid
                        params.push(row);
                    }
                });
                // 某些task已存在
                if (exsitTasks?.length) {
                    let existTaskNames = exsitTasks.map((r) => `[${r.taskName}]`).join(',');
                    // 所有选择的任务已存在
                    if (!params.length) {
                        // 任务{taskNames}已存在，不可重复增加！
                        this.$message.info(
                            this.$t('addAmountTaskAllExistTip', {
                                taskNames: existTaskNames
                            })
                        );
                        resolve(false); // 只关闭loading，不关闭弹窗
                        return;
                    }
                    // 部分选择的任务已存在
                    else {
                        // 任务{taskNames}已存在，是否继续增加任务{addTaskNames}？
                        this.$confirm(
                            this.$t('addAmountTaskExistTip', {
                                taskNames: existTaskNames,
                                addTaskNames: params.map((r) => `[${r.taskName}]`).join(',')
                            }),
                            this.i18n['tip'],
                            {
                                type: 'warning',
                                confirmButtonText: this.i18n.confirm,
                                cancelButtonText: this.i18n.cancel
                            }
                        ).then(
                            () => {
                                this.callAddTask(params, resolve);
                            },
                            () => {
                                resolve(false); // 只关闭loading，不关闭弹窗
                            }
                        );
                    }
                } else {
                    this.callAddTask(params, resolve);
                }
            },
            async callAddTask(params, resolve) {
                // 批量创建金额对象
                let result = await budgetUtils.saveOrUpdateBudgetAmount(params).finally(() => {
                    resolve(false); // 只关闭loading，不关闭弹窗
                });
                if (!result) {
                    return;
                }
                resolve(true); // 关闭loading与弹窗
                this.$message.success(this.i18n.saveSuccess);
                this.isUpdated = true; // 标识有修改过数据
                this.refresh();
            },
            // 保存
            async handleSave() {
                let taskOidArr = Object.keys(this.updateRecords || {});
                if (!taskOidArr?.length) {
                    return this.$message.info(this.i18n['notUpdateDataTip']); // '暂未修改数据'
                }
                let baseOp = {
                    budgetOid: this.budgetOid, // 预算oid
                    subjectOid: this.subjectInfo[`${this.subjectClassName}#oid`], // 科目oid
                    stageOid: this.stageInfo[`${this.stageClassName}#oid`], // 阶段oid
                    containerRef: this.containerRef
                };
                let params = [];
                taskOidArr.forEach((taskOid) => {
                    // 是否有修改 预算 的金额对象
                    let budgetObj = this.parseParams('budget', taskOid);
                    if (budgetObj) {
                        params.push({
                            ...baseOp,
                            typeReference: this.amountTypeOIdBudget, // 预算类型
                            taskOid, // 任务oid
                            ...budgetObj
                        });
                    }
                    // 是否有修改 支出 的金额对象
                    let expensesObj = this.parseParams('expenses', taskOid);
                    if (expensesObj) {
                        params.push({
                            ...baseOp,
                            typeReference: this.amountTypeOIdExpenses, // 支出类型
                            taskOid, // 任务oid
                            ...expensesObj
                        });
                    }
                });
                this.isSaving = true;
                // 批量创建金额对象
                let result = await budgetUtils.saveOrUpdateBudgetAmount(params).finally(() => {
                    this.isSaving = false;
                });
                if (!result) {
                    return;
                }
                this.isUpdated = true; // 标识有修改过数据
                this.$message.success(this.i18n.saveSuccess);
                this.handleCancel();
            },
            parseParams(typeKey, taskOid) {
                let obj = this.updateRecords[taskOid]?.[typeKey];
                if (!obj) {
                    return;
                }
                return {
                    oid: obj['oid'], // 金额对象oid，空则为创建金额对象
                    amountValue: obj['value'],
                    description: obj['description']
                };
            },
            // 删除
            handleRemove(rowData) {
                let delData = [];
                // 是否勾选删除
                if (!rowData) {
                    // 获取勾选的数据
                    delData = this.$refs['famTableRef']?.fnGetCurrentSelection();
                    if (!delData?.length) {
                        return this.$message.info(this.i18n['pleaseSelectData']); // 请选择数据
                    }
                } else {
                    delData = [rowData];
                }
                let oidList = [];
                delData.forEach((r) => {
                    // 预算金额对象oid
                    if (r['BUDGET_INFO'] && r[`${this.prefixConfig.budget}${this.amountClassName}#oid`]) {
                        oidList.push({
                            oid: r[`${this.prefixConfig.budget}${this.amountClassName}#oid`]
                        });
                    }
                    // 支出金额对象oid
                    if (r['EXPENSES_INFO'] && r[`${this.prefixConfig.expenses}${this.amountClassName}#oid`]) {
                        oidList.push({
                            oid: r[`${this.prefixConfig.expenses}${this.amountClassName}#oid`]
                        });
                    }
                });
                // 通用批量删除的方法，会校验未勾选数据，删除后会调用vm.refresh方法刷新
                actions.batchDeleteItems(this, oidList, {
                    className: this.amountClassName,
                    // 成功的回调
                    callback: () => {
                        this.isUpdated = true; // 标识有修改过数据
                    }
                });
            },
            onAmountChange(rowData, prop, newValue) {
                rowData[prop] = newValue;
                // 触发依赖this.allData的数据监听
                this.allData?.forEach((row, index) => {
                    this.$set(this.allData, index, row);
                });
                this.onCellChange(rowData, prop);
            },
            // 字段变更
            onCellChange(rowData, prop) {
                if (rowData[prop] && typeof rowData[prop] === 'string') {
                    rowData[prop] = rowData[prop].trim();
                }
                // 以任务为主对象
                const mainObj = this.updateRecords[rowData[`${this.taskClassName}#oid`]] || {};
                // 判断是否修改的预算对象字段
                let isUpdateBudget = prop.includes(this.prefixConfig.budget);
                // 判断是否修改的支出对象字段
                let isUpdateExpenses = prop.includes(this.prefixConfig.expenses);
                // 修改的预算or支出对象字段
                if (isUpdateBudget || isUpdateExpenses) {
                    const mainKey = isUpdateBudget ? 'budget' : 'expenses';
                    const propPrefix = isUpdateBudget ? this.prefixConfig.budget : this.prefixConfig.expenses;

                    mainObj[mainKey] = mainObj[mainKey] || {};
                    // 获取金额对象的oid（没有则会去创建，有则修改）
                    mainObj[mainKey]['oid'] = rowData?.[`${propPrefix}${this.amountClassName}#oid`];
                    // 获取金额值
                    mainObj[mainKey]['value'] = rowData[`${propPrefix}${this.amountClassName}#value`];
                    // 获取金额对象的描述
                    mainObj[mainKey]['description'] = rowData[`${propPrefix}${this.amountClassName}#description`];
                }
                this.updateRecords[rowData[`${this.taskClassName}#oid`]] = mainObj;
            },
            getRowDisplay(rowData, prop) {
                return this.formatAmountUnit(rowData[prop]);
            },
            // 单位转换
            formatAmountUnit(value, noJoinUnit) {
                // 是否不拼接单位
                if (noJoinUnit) {
                    return value;
                }
                return budgetUtils.formatAmountUnit(value, this.useUnit?.label);
            },
            // 跳转任务详情
            onTaskDetail(row) {
                if (row[`${this.taskClassName}#name`] === '（安全信息）') {
                    return this.$message({
                        type: 'info',
                        message: this.i18n['noAuthCheckTask']
                    });
                }
                let projectOid = row[`${this.taskClassName}#projectRef`]?.oid;
                let collectId = row[`${this.taskClassName}#collectRef`];
                let query = {
                    pid: projectOid,
                    planOid: row[`${this.taskClassName}#oid`],
                    planTitle: row[`${this.taskClassName}#name`],
                    collectId: collectId || '',
                    baselined: false
                };
                this.handleCancel(); // 关闭弹窗
                // 跳转
                ppmUtils.openPage({
                    appName: 'erdc-project-web',
                    routeConfig: {
                        path: '/space/project-task/taskDetail',
                        query
                    }
                });
            },
            handleCancel() {
                this.dialogVisible = false;
            },
            // 通用单个删除的方法，删除后默认执行vm.refresh方法，因此vm需要定义此方法
            refresh() {
                this.$refs['famTableRef']?.fnRefreshTable();
            }
        }
    };
});
