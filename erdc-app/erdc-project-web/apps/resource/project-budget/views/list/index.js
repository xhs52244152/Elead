define([
    'text!' + ELMP.resource('project-budget/views/list/index.html'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('project-budget/mixins/index.js'),
    ELMP.resource('ppm-utils/decimal.min.js'),
    'erdcloud.kit',
    'css!' + ELMP.resource('project-budget/views/list/style.css')
], function (template, ppmUtils, actions, mixin, Decimal, ErdcKit) {
    return {
        template,
        name: 'budgetList',
        mixins: [mixin],
        props: {
            // 是否是基线对比引入
            baselined: {
                type: Boolean,
                default: false
            },
            masterRef: {
                type: String,
                default: ''
            },
            // 预算流程业务对象的项目oid
            businessProjectOid: String,
            // 限制包含指定根节点link的code编码集合才显示，code编码也是唯一值（如：预算发起流程，在可编辑预算的流程节点（重新提交节点）时，需要按根节点link的code编码限制显示
            // PS：不用linkOid限制的原因是因为流程结束后会打快照，此时linkOid会变）
            includeRootLinkCodes: Array,
            // 限制不包含指定根节点link的code编码集合才显示
            excludeRootLinkCodes: Array,
            // 表格是否在流程中使用，基线详情也使用了部分
            isProcess: {
                type: Boolean,
                default: false
            },
            // 表格是否在流程中使用，并且允许编辑
            isProcessEdit: Boolean,
            // 当前激活的页签名称，budgetInfo=预算编制，checkInfo=核算信息
            activeName: {
                type: String,
                default: 'budgetInfo'
            },
            // 查询条件
            conditionData: Object,
            // 查询条件DtoList
            conditionDtoList: Array,
            // 自定义过滤表格数据的方法
            customFilterTableDataFn: Function,
            // 最大显示行数
            maxLine: Number,
            tableMaxHeight: String | Number,
            viewTableHeight: String | Number,
            isAdaptiveHeight: Boolean,
            changeTableConfig: Function
        },
        data() {
            return {
                isInitLoaded: false, // 是否已初始化加载接口
                virtualValue: null,
                templateDialogVisible: false, // 选择模板的弹窗
                // 选择科目弹窗
                chooseSubject: {
                    visible: false,
                    isAddRoot: false // 标识是否增加根节点
                },
                canClose: true, // 是否可以关闭预算模板的弹窗
                showSetStateDialog: false,
                editStatusData: {}, // 被设置状态的数据
                dynamicColumns: [], // 动态字段，阶段、时间等
                dynamicHeaderSlotNames: [], // 动态表头插槽字段
                parentSubjectOid: null, // 父科目oid，新增关联科目时使用
                pagination: {
                    showPagination: false,
                    pageSize: 99999
                },
                baselineOid: '',
                // 查询科目父节点路径的配置
                findParentConfig: {
                    rootData: [], // 根数据
                    childField: 'children', // 子节点的字段名称
                    oidField: 'erd.cloud.ppm.budget.entity.BudgetLink#oid' // oid的字段名
                },
                latestOid: ''
            };
        },
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            ChooseTemplate: ErdcKit.asyncComponent(ELMP.resource('project-budget/components/ChooseTemplate/index.js')),
            AmountDetail: ErdcKit.asyncComponent(ELMP.resource('project-budget/components/AmountDetail/index.js')),
            CommonSetState: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SetState/index.js')),
            TdInputNumber: ErdcKit.asyncComponent(ELMP.resource('project-budget/components/TdInputNumber/index.js')),
            ChooseSubjectDialog: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/ChooseSubjectDialog/index.js')
            ),
            BaselineSelect: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/BaselineSelect/index.js')
            )
        },
        created() {
            this.vm = this;
        },
        computed: {
            // 项目oid
            projectOid() {
                // 此处不能用ppmStore.state?.projectInfo?.oid，因为如果项目之间切换时，还未切到最新项目
                return this.businessProjectOid || this.$route.query.pid;
            },
            showBaselineSelect() {
                if (this.$route.path === '/space/project-budget/budget' && this.isBudgetInfoPage) return true;
                return false;
            },
            // 是否“预算编制”页面
            isBudgetInfoPage() {
                return this.activeName === 'budgetInfo';
            },
            // 是否“核算信息”页面
            isCheckInfoPage() {
                return this.activeName === 'checkInfo';
            },
            // 是否可以编辑 预算编制 的相关功能
            isEditBudget() {
                // 所属预算编制 && 不显示支出 && 配置了编辑的权限 && 非流程页面嵌套中
                return (
                    this.isBudgetInfoPage &&
                    !this.isShowExpenses &&
                    this.mixin_perm.budgetAmount.edit &&
                    (!this.isProcess || this.isProcessAndEdit)
                );
            },
            // 是否可以显示 支出 的相关功能
            isShowExpenses() {
                // 所属 核算信息
                return this.isCheckInfoPage;
            },
            // 是否可以编辑 支出 的相关功能
            isEditExpenses() {
                // 所属 核算信息 && 配置了编辑的权限 && 非流程页面嵌套中
                return this.isCheckInfoPage && this.mixin_perm.expensesAmount.edit && !this.isProcess;
            },
            // 在流程中 && 可编辑
            isProcessAndEdit() {
                return this.isProcess && this.isProcessEdit;
            },
            // 表头插槽
            headerSlotNames() {
                return [].concat(this.dynamicHeaderSlotNames || []);
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
                        prop: `${this.subjectClassName}#identifierNo`, // 科目编码
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.budgetClassName}#totalBudget`, // 总预算
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.budgetClassName}#totalExpenses`, // 总支出
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.budgetClassName}#expensesRate`, // 支出占比
                        type: 'default' // 显示字段内容插槽
                    }
                ].concat(
                    (this.dynamicColumns || []).map((r) => {
                        return {
                            prop: r.attrName,
                            type: 'default'
                        };
                    })
                );
            },
            slotsNameList() {
                return this.slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            columns() {
                // 基础字段
                let baseColumns = [
                    { attrName: 'checkbox', type: 'checkbox', width: 40, align: 'center' },
                    // 科目编码
                    {
                        attrName: `${this.subjectClassName}#identifierNo`,
                        label: this.i18n['subjectCode'],
                        minWidth: 130
                    },
                    // 科目名称
                    { attrName: `${this.subjectClassName}#name`, label: this.i18n['subjectName'], minWidth: 130 },
                    // 科目类别
                    { attrName: `${this.subjectClassName}#category`, label: this.i18n['subjectCategory'], minWidth: 80 }
                ]
                    .concat(
                        this.isBudgetInfoPage
                            ? [
                                  {
                                      // 单个科目的预算状态（显示值）
                                      attrName: `${this.budgetLinkClassName}#budgetLinkStatus`,
                                      label: this.i18n['status'], // 状态
                                      minWidth: 80
                                  }
                              ]
                            : []
                    )
                    .concat([
                        {
                            attrName: `${this.budgetClassName}#totalBudget`,
                            label: this.i18n['totalCost'], // 总成本
                            minWidth: 100,
                            props: {
                                className: `text-align-right`
                            }
                        }
                    ]);
                // 预算是否显示支出相关的信息
                if (this.isShowExpenses) {
                    // 添加【总支出】字段
                    baseColumns.push({
                        attrName: `${this.budgetClassName}#totalExpenses`,
                        label: this.i18n['totalExpenses'], // 总支出
                        minWidth: 100,
                        props: {
                            className: `text-align-right`
                        }
                    });
                    // 添加【支出占比】字段
                    baseColumns.push({
                        attrName: `${this.budgetClassName}#expensesRate`,
                        label: this.i18n['expensesRate'], // 支出占比,
                        minWidth: 140, // 考虑到"已超标"图标的长度
                        props: {
                            className: `text-align-right`
                        }
                    });
                }
                // 拼接动态字段
                return baseColumns.concat(this.dynamicColumns || []);
            },
            actionConfig() {
                if (this.baselined) return null; // 基线里边引用不需要表头操作列
                if (!this.isProcess && this.isInitLoaded && this.isBudgetInfoPage) {
                    return {
                        name: 'PPM_BUDGET_LIST',
                        containerOid: '',
                        objectOid: this.budgetOid,
                        className: this.budgetClassName,
                        // 扩展参数
                        extractParamMap: {
                            isBpmNodeEdit: !!this.isProcessAndEdit // 标识是否在特定流程节点页面允许编辑
                        },
                        /**
                         * virtualValue为虚拟属性，主要用于触发监听机制，使查询按钮配置的接口重新请求。
                         * 由于一些数据变化后按钮的权限变化了，因此需要重新请求，比如状态变化后（设置状态）按钮权限会大变
                         */
                        virtualValue: this.virtualValue
                    };
                }
                return null;
            },
            operationCol() {
                if (this.baselined) return false; // 基线里边引用不需要操作列
                if ((!this.isProcess || this.isProcessAndEdit) && this.isBudgetInfoPage) return true;
                return false;
            },
            viewTableConfig() {
                let { changeTableConfig } = this;
                let searchParamsKey = 'searchKey';
                let requestParams = this.requestData(); // 参数
                let tableConfig = {
                    vm: this, // 用于表格toolbarConfig.actionConfig配置的按钮事件回调参数vm的值
                    searchParamsKey: searchParamsKey, // 模糊搜索参数传递key
                    beforeRequest: (config) => {
                        // 抛出加载预算列表数据的参数
                        this.$emit('onLoadListBefore', { data: config.data, searchParamsKey });
                        this.virtualValue = +new Date();
                        config.errorMessage = false;
                        return Promise.resolve(config);
                    },
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/ppm/budget/info', // 表格数据接口
                        params: {
                            contextOId: this.projectOid // 项目oid
                        }, // 路径参数
                        data: requestParams, // 路径参数
                        method: 'post', // 请求方法（默认get）
                        transformResponse: [
                            (data) => {
                                this.isInitLoaded = true;
                                // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                // 对接收的 data 进行任意转换处理
                                let resData;
                                try {
                                    resData = (data && JSON.parse(data)) || {};
                                    if (!resData.success) {
                                        return resData;
                                    }
                                    // 转换得到项目关联的预算对象信息，此方法里面会涉及到权限的计算属性值
                                    let haveBudget = this.mixin_formatBudgetInfo(resData.data);
                                    // 项目是否已经创建了预算对象
                                    if (haveBudget) {
                                        // 对外抛出预算相关信息
                                        this.$emit('getBudgetInfo', {
                                            budgetInfo: this.budgetInfo,
                                            budgetDisplayInfo: this.budgetDisplayInfo,
                                            budgetState: this.budgetState
                                        });
                                        // 对外抛出 是否查询的是基线数据
                                        this.$emit('isBaselineData', requestParams.baselined === true);
                                        // 转换获取得到表格数据
                                        let { tableData, dynamicColumns, dynamicHeaderSlotNames } =
                                            this.parseTableData(resData) || [];
                                        this.dynamicColumns = dynamicColumns;
                                        this.dynamicHeaderSlotNames = dynamicHeaderSlotNames;
                                        resData.data = {
                                            records: tableData || []
                                        };
                                        console.log('-======表格字段与数据======', this.columns, tableData);
                                    } else {
                                        resData.data = {
                                            records: []
                                        };
                                    }
                                } catch (error) {
                                    console.error('预算数据异常', error);
                                    resData = data && JSON.parse(data);
                                }
                                // 对外抛出 是否查询完数据
                                this.$emit('onLoadedData', resData?.data?.records || []);
                                return resData;
                            }
                        ]
                    },
                    firstLoad: true,
                    useCodeConfig: true, // 优先使用前端代码的配置
                    // 视图的高级表格配置，使用继承方式，参考高级表格用法
                    toolbarConfig: !this.isProcess
                        ? {
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
                              // 添加this.isInitLoaded的判断，防止初始化页面时this.budgetOid的多次变化导致按钮的query请求多次
                              actionConfig: this.actionConfig,
                              // actionConfig按钮后置校验的参数
                              beforeValidatorQuery: {
                                  className: this.budgetClassName
                              }
                          }
                        : {
                              showRefresh: true
                          },
                    addSeq: true,
                    addIcon: false,
                    addCheckbox: this.operationCol,
                    addOperationCol: this.operationCol, // 是否显示操作列
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
                        // 是否允许行内编辑与相关的配置
                        ...(!this.isSupportDetail && (this.isEditBudget || this.isEditExpenses)
                            ? {
                                  'edit-config': {
                                      trigger: 'click',
                                      mode: 'cell',
                                      beforeEditMethod: this.beforeEditMethod
                                  }
                              }
                            : {}),
                        treeNode: `${this.subjectClassName}#name`, // 科目名称 放表格树的展开/收缩图标
                        // 表格树配置
                        treeConfig: this.treeConfig,
                        checkboxConfig: { checkStrictly: false }, // checkStrictly是否不做父子强关联勾选，默认false
                        maxLine: this.maxLine
                    },
                    pagination: this.pagination,
                    slotsField: this.slotsField,
                    columns: this.columns
                };
                return _.isFunction(changeTableConfig) ? changeTableConfig(tableConfig) : tableConfig;
            }
        },
        activated() {
            this.refresh();
        },
        methods: {
            requestData() {
                let params = {
                    contextOId: this.projectOid, // 项目oid
                    conditionDtoList: this.conditionDtoList || [] // 条件
                };
                // 是否显示支出的相关信息
                if (this.isShowExpenses) {
                    // 过滤得到根科目预算为“已审批”状态的数据
                    params.conditionDtoList = params.conditionDtoList.concat([
                        {
                            attrName: `${this.budgetLinkClassName}#rootLinkState`,
                            oper: 'IN',
                            value1: 'APPROVED'
                        }
                    ]);
                }
                // 基线-详情-相关对象用到
                if (this.baselined || this.baselineOid) {
                    params.baselined = true;
                    params.conditionDtoList = params.conditionDtoList.concat([
                        {
                            attrName: `${this.budgetClassName}#baselineMasterRef`,
                            oper: 'EQ',
                            value1: this.masterRef || this.baselineOid
                        }
                    ]);
                }
                // 是否查对应流程的快照数据
                else if (this.conditionData?.processInstanceOid) {
                    params.extendMessage = this.conditionData.processInstanceOid;
                }
                return {
                    ...params,
                    conditionDtoList: params.conditionDtoList?.length ? params.conditionDtoList : undefined
                };
            },
            // 判断行数据是否可以编辑预算
            isEditBudgetByRow(rowData) {
                let statusValue = rowData[`${this.budgetLinkClassName}#budgetLinkStatus_value`];
                // 可编辑预算 && 没有子节点 && ((非流程中 && 当前行数据状态允许编辑) || (在流程中 && 流程中允许编辑))
                return (
                    this.isEditBudget &&
                    !this.mixin_haveChild(rowData) &&
                    ((!this.isProcess && this.mixin_perm.budgetAmount.status[statusValue]) ||
                        (this.isProcess && this.isProcessEdit))
                );
            },
            // 判断行数据是否可以编辑支出
            isEditExpensesByRow(rowData) {
                let statusValue = rowData[`${this.budgetLinkClassName}#budgetLinkStatus_value`];
                // 可编辑支出 && 没有子节点 && 当前行数据状态允许编辑
                return (
                    this.isEditExpenses &&
                    !this.mixin_haveChild(rowData) &&
                    this.mixin_perm.expensesAmount.status[statusValue]
                );
            },
            // （外部组件调用）获取表格数据
            getTableData() {
                return this.$refs['famTableRef'].tableData || [];
            },
            // 基线切换刷新列表
            changeBaseline({ value, latestOid }) {
                this.baselineOid = value;
                this.latestOid = latestOid || ''; //操作选择基线对比时用到
                this.refresh();
            },
            // 封装表格数据
            parseTableData(res, flag) {
                // 注：在此之前权限变量要计算正确
                let result = this.mixin_parseTableData(
                    res.data,
                    {
                        isEditBudget: this.isEditBudget,
                        isShowExpenses: this.isShowExpenses,
                        isEditExpenses: this.isEditExpenses
                    },
                    flag
                );
                // 是否有限制根节点link的code编码数据（注：支持includeRootLinkCodes配置为空数组，即不显示列表数据）
                if (Array.isArray(this.includeRootLinkCodes) && this.includeRootLinkCodes.length === 0) {
                    result.tableData = [];
                } else {
                    result.tableData = result.tableData?.filter((r) => {
                        let pass = true;
                        let linkCode = r[`${this.budgetLinkClassName}#code`];
                        // 包含 指定需要的
                        if (Array.isArray(this.includeRootLinkCodes)) {
                            pass = this.includeRootLinkCodes.includes(linkCode);
                        }
                        // 不包含 指定排除的
                        if (Array.isArray(this.excludeRootLinkCodes)) {
                            pass = !this.excludeRootLinkCodes.includes(linkCode);
                        }
                        return pass;
                    });
                }
                // 自定义过滤表格数据的方法
                if (typeof this.customFilterTableDataFn === 'function') {
                    // 不能支出异步方法
                    result.tableData = this.customFilterTableDataFn.call(this, result.tableData);
                }
                return result;
            },
            // 表格接口请求错误后的处理
            handlerError(error) {
                // 判断显示的是当前页面（因为多页签时可能会导致非当前页面也加载） && 项目没有设置预算，请先维护预算信息
                if (this.$route.name.includes('budgetInfo') && error.code == '31311001') {
                    // 设置延时器再给出提示的原因：需要等预算dialog弹窗之后再提示，因为提示的z-index需要比dialog弹窗高
                    setTimeout(() => {
                        this.$message.error(error.message);
                    }, 500);
                    // 打开设置预算弹窗
                    this.openChooseTemplate();
                } else {
                    this.$message.error(error.message);
                }
            },
            // 计算得到 总成本（总预算）
            calcTotalBudget(rowData) {
                return Object.keys(rowData).reduce((sumValue, prop) => {
                    // 是否为阶段（or时间段）的预算值字段
                    if (
                        prop.includes(this.mixin_prefixConfig.budget) &&
                        ['string', 'number'].includes(typeof rowData[prop])
                    ) {
                        return Decimal.add(Number(sumValue || 0), Number(rowData[prop] || 0)).toNumber();
                    }
                    return sumValue || 0;
                }, 0);
            },
            // 计算得到 总支出
            calcTotalExpenses(rowData) {
                return Object.keys(rowData).reduce((sumValue, prop) => {
                    // 是否为阶段（or时间段）的支出值字段
                    if (
                        prop.includes(this.mixin_prefixConfig.expenses) &&
                        ['string', 'number'].includes(typeof rowData[prop])
                    ) {
                        return Decimal.add(Number(sumValue || 0), Number(rowData[prop] || 0)).toNumber();
                    }
                    return sumValue || 0;
                }, 0);
            },
            // 计算得到 总支出占比
            calcExpensesRate(rowData) {
                let totalBudget = this.calcTotalBudget(rowData); // 总预算
                // 如果总预算为0
                if (!Number(totalBudget)) {
                    return '';
                }
                let totalExpenses = this.calcTotalExpenses(rowData); // 总支出
                // 支出总占比赋值
                let expensesRate = this.mixin_calcExpensesRate(totalBudget, totalExpenses);
                let flag = expensesRate > 100 ? 'exceed' : '';
                this.$set(rowData, '_EXPENSES_RATE_TYPE', flag);
                return expensesRate + '%';
            },
            // 表头tag的名称
            formatHeaderTag(prop) {
                if (prop.includes(this.mixin_prefixConfig.budget)) {
                    return this.i18n['budgetFy']; // 预算
                } else if (prop.includes(this.mixin_prefixConfig.expenses)) {
                    return this.i18n['expenses']; // '支出';
                } else if (prop.includes(this.mixin_prefixConfig.surplus)) {
                    return this.i18n['surplus']; // '剩余';
                }
                return '';
            },
            // 打开选择预算模板的页面（menu-actions.js有调用）
            openChooseTemplate() {
                this.canClose = true;
                this.templateDialogVisible = true;
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_BUDGET_OPER',
                    objectOid: row[`${this.budgetLinkClassName}#oid`],
                    className: this.budgetLinkClassName,
                    // 扩展参数
                    extractParamMap: {
                        isBpmNodeEdit: !!this.isProcessAndEdit // 标识是否在特定流程节点页面允许编辑
                    }
                };
            },
            // 删除科目与预算的关联关系，rowData不为空=单个删除，rowData为空=批量删除
            async handleDeleteLink(rowData) {
                let oidList = [];
                // 单个删除
                if (rowData) {
                    // 单个删除时，递归获取所有子科目oid
                    oidList = this.formatFlatten([rowData]).map((r) => r[`${this.budgetLinkClassName}#oid`]);
                }
                // 批量删除
                else {
                    const selectList = this.$refs['famTableRef'].fnGetCurrentSelection();
                    oidList = selectList.map((r) => r[`${this.budgetLinkClassName}#oid`]);
                }
                if (!oidList?.length) {
                    return this.$message.info(this.i18n['pleaseSelectData']); // 请选择数据
                }
                let dataArr = oidList.map((oid) => {
                    return {
                        oid: oid
                    };
                });
                // 通用批量删除的方法，会校验未勾选数据，删除后会调用vm.refresh方法刷新
                actions.batchDeleteItems(this, dataArr, {
                    className: this.budgetLinkClassName,
                    callback: () => {
                        this.updatedDataAfter(false);
                    }
                });
            },
            // 树结构的数据扁平化
            formatFlatten(treeData, newData = []) {
                treeData = JSON.parse(JSON.stringify(treeData));
                treeData.forEach((r) => {
                    // 是否有子节点
                    if (r[this.treeConfig.childrenField] && r[this.treeConfig.childrenField].length) {
                        let childData = r[this.treeConfig.childrenField];
                        delete r[this.treeConfig.childrenField];
                        newData.push(r);
                        return this.formatFlatten(childData, newData);
                    } else {
                        newData.push(r);
                    }
                });
                return newData;
            },
            /**
             * 增加科目
             * @param {Object} rowData 行数据，无=增加root数据
             * @param {Boolean} isChild 是否增加子级，true=增加子级，false=增加同级
             */
            handleAddSubjectLink(rowData, isChild = false) {
                this.findParentConfig.rootData = this.$refs['famTableRef'].tableData || [];
                // 如果是增加root数据
                if (!rowData) {
                    this.parentSubjectOid = null;
                }
                // 如果是创建同级节点
                else if (!isChild) {
                    // 获取父节点
                    let parentData = this.getParentNode(
                        rowData[`${this.budgetLinkClassName}#oid`],
                        this.$refs['famTableRef'].tableData || [],
                        null
                    );
                    this.parentSubjectOid = parentData?.[`${this.budgetLinkClassName}#oid`] || null;
                }
                // 创建子级
                else {
                    this.parentSubjectOid = rowData[`${this.budgetLinkClassName}#oid`];
                }
                this.chooseSubject.isAddRoot = !this.parentSubjectOid; // 是否增加root节点数据
                this.chooseSubject.visible = true;
            },
            // 获取父节点信息
            getParentNode(budgetLinkOid, data = [], dataParent, obj = { isEnd: false, parentNode: null }) {
                if (obj.isEnd) {
                    return obj.parentNode;
                }
                data.forEach((r) => {
                    if (!obj.isEnd) {
                        if (r[`${this.budgetLinkClassName}#oid`] === budgetLinkOid) {
                            obj.isEnd = true;
                            obj.parentNode = dataParent;
                        } else if (r[this.treeConfig.childrenField] && r[this.treeConfig.childrenField].length) {
                            this.getParentNode(budgetLinkOid, r[this.treeConfig.childrenField], r, obj);
                        }
                    }
                });
                return obj.parentNode;
            },
            // 增加科目节点成功之后的回调
            addSubjectSuccess(data, resData) {
                // 是否增加的根节点
                if (this.chooseSubject.isAddRoot) {
                    this.$emit('addRootNodeAfter', resData?.rawDataVoList || []);
                }
                // $nextTick中刷新，主要为了流程页面监听addRootNodeAfter事件后，先处理this.businessData[0].rootLinkCodes的赋值，然后更新后按此值过滤
                this.$nextTick(() => {
                    this.updatedDataAfter(true);
                });
            },
            // 根据字段名称获取预算or支出的相关信息
            getAmountPropInfo(prop) {
                let isBudget = true; // 是否改动的为预算字段，false=支出字段
                let stageName = ''; // 阶段名称
                // 是否预算字段
                if (prop.includes(this.mixin_prefixConfig.budget)) {
                    isBudget = true;
                    stageName = prop.replace(this.mixin_prefixConfig.budget, '');
                }
                // 是否支出字段
                else if (prop.includes(this.mixin_prefixConfig.expenses)) {
                    isBudget = false;
                    stageName = prop.replace(this.mixin_prefixConfig.expenses, '');
                }
                return {
                    isBudget,
                    stageName
                };
            },
            // 表格行内单元格编辑前事件
            beforeEditMethod(scope) {
                if (!scope?.row || !scope?.column?.property) {
                    return false;
                }
                let prop = scope.column.property;
                // 是否预算字段
                if (prop.includes(this.mixin_prefixConfig.budget)) {
                    return this.isEditBudgetByRow(scope?.row); // 是否可编辑
                }
                // 是否支出字段
                else if (prop.includes(this.mixin_prefixConfig.expenses)) {
                    return this.isEditExpensesByRow(scope?.row); // 是否可编辑
                }
                return true;
            },
            // 金额变动保存
            async onAmountChange(rowData, prop, newValue) {
                rowData[prop] = newValue || 0;
                let {
                    isBudget, // 是否改动的为预算字段，false=支出字段
                    stageName
                } = this.getAmountPropInfo(prop);
                // 获取对应阶段信息
                let stageInfo = this.mixin_getStageInfo(rowData, stageName);
                // 创建or修改金额
                await this.mixin_saveOrUpdateAmount({
                    isBudget,
                    stageInfo,
                    amountValue: rowData[prop],
                    subjectOid: rowData[`${this.subjectClassName}#oid`] // 科目oid
                });
                this.updatedDataAfter(false); // 修改数据后
                this.refreshData(); // 只更新表格已有oid对应的数据（父节点的金额数据会变）
            },
            // 点击科目编码
            onSubjectDetail(rowData) {
                // 触发跳转页面的事件，当前页面如果是弹窗，可监听该事件关闭弹窗
                this.$emit('jumpPage');
                // 跳转
                ppmUtils.openPage({
                    appName: 'erdc-project-web',
                    routeConfig: {
                        path: '/space/project-budget/subjectBudgetEdit',
                        query: {
                            pid: this.projectOid,
                            oid: rowData[`${this.budgetLinkClassName}#oid`] || '',
                            activeName: 'detail'
                        }
                    }
                });
            },
            // 点击金额
            onAmountDetail(rowData, prop) {
                // 是否不是 按阶段 模式 || 是否不支持详细计划
                if (!this.isToStage || !this.isSupportDetail) {
                    return;
                }
                let {
                    isBudget, // 是否改动的为预算字段，false=支出字段
                    stageName // 阶段名称
                } = this.getAmountPropInfo(prop);
                // 获取对应阶段信息
                let stageInfo = this.mixin_getStageInfo(rowData, stageName);
                let subjectInfo = {}; // 科目信息
                Object.keys(rowData).forEach((key) => {
                    if (key.includes(this.subjectClassName)) {
                        subjectInfo[key] = rowData[key];
                    }
                });
                this.mixin_setAmountDetailDialog({
                    readonly: isBudget ? !this.isEditBudgetByRow(rowData) : !this.isEditExpensesByRow(rowData),
                    visible: true,
                    title: stageName,
                    isBudget: isBudget, // 是否点击的预算，false=支出
                    budgetLinkOid: rowData[`${this.budgetLinkClassName}#oid`],
                    subjectInfo: subjectInfo, // 科目信息
                    stageInfo: stageInfo // 阶段信息
                });
            },
            // 发起流程（后端会校验数据的准确性）
            handleStartBudgetWorkflow() {
                // 获取选中数据
                let selectedData = this.getSelectedData(true);
                if (selectedData === false) {
                    return;
                }
                // 获取选中数据的根节点link的code编码集合
                let rootLinkCodes = _.uniq(selectedData.map((r) => r['rootLinkCode']));
                actions.startProcess(this, {
                    businessData: [
                        {
                            oid: this.budgetOid,
                            projectOid: this.$route.query.pid,
                            rootLinkCodes,
                            componentKey: +new Date() // 每次发起流程都改变对应值，这样发起流程页面就会刷掉上一个缓存的数据。配合流程配置页面需要配置props属性businessKey: 'componentKey'
                        }
                    ],
                    containerRef: this.containerRef
                });
            },
            // （外部流程组件也有调用）获取选中数据集合
            getSelectedData(isValid) {
                // 选择的数据code编码集合
                let selectedData = this.$refs['famTableRef'].fnGetCurrentSelection() || [];
                if (!selectedData?.length) {
                    isValid && this.$message.info(this.i18n['pleaseSelectData']); // 请选择数据
                    return false;
                }
                return selectedData;
            },
            // 设置科目预算对象的状态
            handleSetStatus(row) {
                this.editStatusData = {
                    state: row[`${this.budgetLinkClassName}#budgetLinkStatus`], // 状态的显示值
                    oid: this.budgetOid, // 由于科目预算的状态使用的是预算对象的状态，因此设置状态时查询预算对象的所有状态为列表选项
                    linkOid: row[`${this.budgetLinkClassName}#oid`]
                };
                this.showSetStateDialog = true;
            },
            // 设置状态 确认事件
            setStateConfirm(value) {
                let params = {
                    attrRawList: [
                        {
                            attrName: 'budgetLinkStatus',
                            value: value
                        }
                    ],
                    oid: this.editStatusData.linkOid,
                    className: this.budgetLinkClassName,
                    containerRef: this.containerRef
                };
                this.$famHttp({
                    url: '/ppm/update',
                    method: 'POST',
                    data: params
                }).then((resp) => {
                    if (resp.code === '200') {
                        this.$message({
                            type: 'success',
                            message: this.i18n['setStateSuccess']
                        });
                        this.showSetStateDialog = false;
                        this.refresh();
                    }
                });
            },
            // 设置状态 取消
            setStateCancel() {
                this.showSetStateDialog = false;
            },
            // 递归更新表格数据的属性值
            deepUpdateTableData(useDataArr = [], newDataArr = []) {
                useDataArr.forEach((useRow) => {
                    const newRow = newDataArr.find(
                        (newRow) =>
                            newRow[`${this.budgetLinkClassName}#oid`] === useRow[`${this.budgetLinkClassName}#oid`]
                    );
                    // 是否有子节点
                    if (useRow[this.treeConfig.childField]?.length && newRow[this.treeConfig.childField]?.length) {
                        const useChildren = useRow[this.treeConfig.childField];
                        const newChildren = newRow[this.treeConfig.childField];
                        delete useRow[this.treeConfig.childField];
                        delete newRow[this.treeConfig.childField];
                        // 除children外，其余属性全部深拷贝
                        $.extend(true, useRow, newRow);
                        // 递归
                        useRow[this.treeConfig.childField] = this.deepUpdateTableData(useChildren, newChildren);
                    } else {
                        delete useRow[this.treeConfig.childField]; // 删除原有子节点数据
                        $.extend(true, useRow, newRow);
                    }
                });
                return useDataArr;
            },
            // 修改预算数据后的操作（影响预算金额计算的相关操作）
            updatedDataAfter(isRefresh) {
                this.$emit('updatedData');
                isRefresh && this.refresh();
            },
            /**
             * 只更新表格已有oid对应的数据，不刷新表格数据（新增、删除的数据不会更新），不做滚动条重置，不显示loading
             */
            async refreshData() {
                const res = await this.$famHttp({
                    url: '/ppm/budget/info', // 表格数据接口
                    params: {
                        contextOId: this.projectOid // 项目oid
                    }, // 路径参数
                    data: {
                        contextOId: this.projectOid, // 项目oid
                        pageIndex: 1,
                        pageSize: this.pagination.pageSize,
                        searchKey: this.$refs['famTableRef']?.searchStr
                    }, // 路径参数
                    method: 'post', // 请求方法（默认get）
                    className: this.budgetClassName
                });
                if (!res?.success) {
                    return;
                }
                // 新查询出来的表格数据
                let { tableData } = this.parseTableData(res, true) || [];
                // 表格使用的数据
                let useTableData = this.$refs['famTableRef'].tableData || [];
                // 递归更新表格数据的属性值
                this.deepUpdateTableData(useTableData, tableData);
            },
            // 通用单个删除的方法，删除后默认执行vm.refresh方法，因此vm需要定义此方法
            refresh(op) {
                this.$refs['famTableRef']?.fnRefreshTable(op);
            }
        }
    };
});
