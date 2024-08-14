define([
    'text!' + ELMP.resource('project-baseline/components/InfoCompare/components/relationObject/index.html'),
    'css!' + ELMP.resource('project-baseline/components/InfoCompare/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('CbbBaseline');
    const { mapGetters: infoCompareMapGetters } = createNamespacedHelpers('infoCompare');

    return {
        name: 'RelationObject',
        template,
        components: {
            FamAssociationObject: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAssociationObject/index.js')
            ),
            FamTableColSet: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-baseline/components/InfoCompare/locale/index.js'),
                activeName: 'erd.cloud.ppm.project.entity.Project',
                ProjectClassName: 'erd.cloud.ppm.project.entity.Project',
                projectTaskClassName: 'erd.cloud.ppm.plan.entity.Task',
                RequirementClassName: 'erd.cloud.ppm.require.entity.Requirement',
                milestoneClassName: 'erd.cloud.ppm.plan.entity.milestone',
                // 项目：名称、类型、项目经理、工期
                // 计划：名称、责任人、预计开始时间、预计结束时间
                // 需求：名称、类型、状态、责任人
                // 里程碑：名称、类型、是否阶段、责任人
                projectCols: ['name', 'typeReference', 'projectManager', 'duration'],
                projectTaskCols: [
                    'name',
                    'responsiblePerson',
                    'timeInfo.scheduledStartTime',
                    'timeInfo.scheduledEndTime'
                ],
                requirementCols: ['name', 'typeReference', 'lifecycleStatus.status', 'responsiblePerson'],
                milestoneCols: ['name', 'typeReference', 'stageFlag', 'responsiblePerson'],
                budgetCols: ['name', 'typeReference', 'lifecycleStatus.status', 'baselineMasterRef'],
                tabs: [
                    {
                        label: '项目',
                        key: 'erd.cloud.ppm.project.entity.Project',
                        options: [],
                        loading: true
                    },
                    {
                        label: '里程碑',
                        key: 'erd.cloud.ppm.plan.entity.milestone',
                        options: [],
                        loading: false
                    },
                    {
                        label: '计划',
                        key: 'erd.cloud.ppm.plan.entity.Task',
                        options: [],
                        loading: false
                    },
                    {
                        label: '需求',
                        key: 'erd.cloud.ppm.require.entity.Requirement',
                        options: [],
                        loading: false
                    },
                    {
                        label: '预算',
                        key: 'erd.cloud.ppm.budget.entity.Budget',
                        options: [],
                        loading: false
                    }
                ],
                gridOptions: {
                    border: true,
                    showOverflow: 'title',
                    showHeaderOverflow: 'title',
                    height: '',
                    columns: [],
                    data: [],
                    scrollY: {
                        enabled: true
                    },
                    scrollX: {
                        enabled: true
                    }
                },
                colSettingVisible: false, // 列配置是否显示
                columnSetList: [],
                defaultColumns: [],
                reset: true,
                searchStr: '',
                budgetData: []
            };
        },
        props: {
            settingColsData: {
                type: Object,
                default: function () {
                    return {};
                }
            },
            isOnlyDifferent: {
                type: Boolean,
                default: false
            },
            dataOids: {
                type: Array,
                default: () => []
            }
        },
        activated() {
            // 预算的接口与其它不统一,需单独做处理
            if (this.activeName === 'erd.cloud.ppm.budget.entity.Budget') {
                this.initBudgetData(this.activeName);
            } else {
                this.initData(this.activeName);
            }
        },
        computed: {
            ...mapGetters(['getViewTableMapping']),
            ...infoCompareMapGetters(['getCompareDataList']),
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: 'baseline' });
            },
            className() {
                return this.viewTableMapping?.className || '';
            },
            tableData() {
                return this.getCompareDataList(this.className) || [];
            },
            tableHeight() {
                return document.documentElement.clientHeight - 310;
            }
        },
        created() {
            this.initData();
        },
        methods: {
            handleClick(tab) {
                this.$emit('hideBtn', tab.name); // 将activeName传递到父组件判断是否要显示仅显示不同checkbox
                this.searchStr = '';
                // 预算的接口与其它不统一,需单独做处理
                if (tab.name === 'erd.cloud.ppm.budget.entity.Budget') {
                    this.initBudgetData(tab.name);
                } else {
                    this.initData(tab.name);
                }
            },
            uniqueFunc(arr, uniId) {
                const res = new Map();
                return arr.filter((item) => !res.has(item[uniId]) && res.set(item[uniId], 1));
            },
            replaceParentIdInTree(tree, newParentId) {
                // 遍历树的每个节点
                tree.forEach((node) => {
                    // 替换当前节点的 parentId
                    node.parentId = newParentId || -1;
                    // 如果节点有子节点，则递归替换它们的 parentId
                    if (Array.isArray(node.children)) {
                        this.replaceParentIdInTree(
                            node.children,
                            node['erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo']
                        );
                    }
                });

                // 返回修改后的树（如果需要的话，因为原始数组已被修改）
                return tree;
            },
            compareData(defaultData = [], compareArrData = [], identifierNo, differentData = [], sort) {
                let compareArr = JSON.parse(JSON.stringify(compareArrData));
                // 第一个和第三个个对比
                for (let i = 0; i < compareArr.length; i++) {
                    if (
                        defaultData.find(
                            (item) =>
                                item[identifierNo] === compareArr[i][identifierNo] &&
                                item.parentId === compareArr[i].parentId
                        )
                    ) {
                        //
                    } else {
                        // 将新增的数据值清空,parentIdId 和编码不要清空，后边转二维数据要用
                        for (let x in compareArr[i]) {
                            let ids = ['erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo', 'parentId'];
                            if (!ids.includes(x)) compareArr[i][x] = '';
                        }

                        compareArr[i].budgetType = 'add';
                        differentData.push(compareArr[i]);
                    }
                }
            },
            filterData(data, key = 'erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo') {
                // 移除child,将id重新赋值
                data.forEach((item) => {
                    delete item?.children;
                    item.id = item[key];
                    // 如果是新增的，将编码隐藏掉
                    // if (item.budgetType) {
                    //     item[key] = '';
                    // }
                });
            },
            // 对数据进行排序，最后调用
            sortData(data, transData, identifierNo) {
                let newSortData = [];
                data.forEach((item) => {
                    newSortData.push(item[identifierNo]);
                });
                let commonData = []; // 相同数据
                let diffData = []; // 不同数据
                newSortData.forEach((item) => {
                    let iData = transData.find((it) => it[identifierNo] === item);
                    if (iData) commonData.push(iData);
                });
                return [...commonData, ...diffData];
            },
            // 重新对数据排序，以newData数据排序问准进行排序
            sortListData(data, transData, identifierNo) {
                let newSortData = [];
                data.forEach((item) => {
                    let iData = transData.find(
                        (it) => it[identifierNo] === item[identifierNo] && it.parentId === item.parentId
                    );
                    newSortData.push(iData);
                });
                return newSortData;
            },
            initBudgetData(activeName, searchKey = '') {
                this.budgetData = []; // 如果不清空来回切换tab页,预算的树不会展开
                this.$famHttp({
                    url: '/ppm/baseline/budgetCompare',
                    method: 'POST',
                    data: {
                        isOnlyDifferent: this.isOnlyDifferent,
                        oids: [...this.tableData, ...this.dataOids] || [], //取仓库存的oids
                        optionList: ['baselineableObjMap'],
                        roleBTypeNameSet: [activeName],
                        attributeConfig: 'ppmBaselineCompareShowField',
                        searchKey: searchKey
                    },
                    className: 'erd.cloud.ppm.budget.entity.Budget'
                }).then((res) => {
                    let result = res.data;

                    let resultData = JSON.parse(JSON.stringify(result));
                    // 比较的逻辑， 以第一个为准，先第一个与第二个比较，如果第二个里边的数据第一个没有则把数据丢到第一个里边去，同理第一个与第三个也是
                    // 重新组装树结构.将parentId改为编码进行匹配
                    resultData.forEach((item) => {
                        this.replaceParentIdInTree(item.data || []);
                    });

                    // 打平树结构，arr是二维数组[[],[]]
                    let arr = [];
                    resultData.forEach((item) => {
                        let treeData = ErdcKit.TreeUtil.flattenTree2Array(item.data, {
                            childrenField: 'children'
                        });
                        arr.push(treeData);
                    });
                    // 对比基线id数组
                    let baselineOids = [...this.tableData, ...this.dataOids];
                    // 寻找差异化数据 包括第二个和第三个(如果有)基线的数据
                    let differentData = [];
                    let identifierNo = 'erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo';
                    // 第一个和第二个对比
                    if (baselineOids[1]) {
                        this.compareData(arr[0], arr[1], identifierNo, differentData);
                    }

                    // 第一个和第三个个对比
                    if (baselineOids[2]) {
                        this.compareData(arr[0], arr[2], identifierNo, differentData);
                    }
                    // 将差异化数据和第一个数据合并  differentData中包含第二个和第三个数据
                    let newData = [...arr[0], ...differentData];
                    // 过滤数组对象编码相同的值
                    // if (baselineOids[2]) {
                    //     newData = newData.filter(
                    //         (item, index, origin) =>
                    //             index ===
                    //             origin.findIndex((itemInner) => {
                    //                 return (
                    //                     itemInner[['erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo']] ===
                    //                     item[['erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo']]
                    //                 );
                    //             })
                    //     );
                    // }

                    // 移除child,将id重新赋值
                    this.filterData(newData);
                    // 将第二个与第一个进行对比
                    let twoDiffData = [];
                    let treeTwoData = []; // 第二个数据
                    if (baselineOids[1]) {
                        this.compareData(arr[1], newData, identifierNo, twoDiffData);
                        // 将差异化数据和第2个数据合并
                        let newTwoData = [...arr[1], ...twoDiffData];
                        // 移除child,将id重新赋值
                        this.filterData(newTwoData);
                        // 重新对数据排序，以newData数据排序问准进行排序
                        newTwoData = this.sortListData(newData, newTwoData, identifierNo);
                        treeTwoData = ErdcKit.TreeUtil.buildTree(newTwoData);
                    }

                    // 将第3个与第1个进行对比
                    let threeDiffData = [];
                    let treeThreeData = []; // 第三个数据
                    if (baselineOids[2]) {
                        this.compareData(arr[2], newData, identifierNo, threeDiffData);
                        let newThreeData = [...arr[2], ...threeDiffData];
                        // 移除child,将id重新赋值
                        this.filterData(newThreeData);
                        // 重新对数据排序，以newData数据排序问准进行排序
                        newThreeData = this.sortListData(newData, newThreeData, identifierNo);
                        treeThreeData = ErdcKit.TreeUtil.buildTree(newThreeData);
                    }

                    let treeData = ErdcKit.TreeUtil.buildTree(newData); // 第一个数据
                    console.log(treeData);
                    result.forEach((item, index) => {
                        let columns = item.columns;
                        columns.forEach((it) => {
                            if (it.field === 'erd.cloud.ppm.budget.entity.BudgetSubject#name') {
                                it.treeNode = true;
                                it.minWidth = 150;
                                it.fixed = 'left';
                            } else {
                                it.minWidth = 100;
                            }
                            if (it.field === 'erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo') {
                                it.visible = false;
                                it.minWidth = 130;
                            }
                        });
                        if (index === 0) {
                            item.data = treeData;
                        }
                        if (index === 1) {
                            item.data = this.sortData(treeData, treeTwoData, identifierNo);
                        }
                        if (index === 2) {
                            item.data = this.sortData(treeData, treeThreeData, identifierNo);
                        }

                        (item.treeConfig = {
                            expandAll: true,
                            reserve: true,
                            rowField: 'id',
                            iconOpen: 'erd-iconfont erd-icon-arrow-down',
                            iconClose: 'erd-iconfont erd-icon-arrow-right ',
                            parentField: 'parentId'
                        }),
                            (item.ref = 'vxeGridRef_' + index);
                        item.border = true;
                        item.showOverflow = 'title';
                        item.showHeaderOverflow = 'title';
                        item.height = this.tableHeight;
                        item.scrollY = {
                            enabled: true
                        };
                        item.scrollX = {
                            enabled: true
                        };
                    });
                    this.budgetData = result;
                });
            },
            checkData(columns, row, searchStr) {
                let flag = false;
                columns.forEach((property) => {
                    let msessageStr = row[property] || '';
                    msessageStr = msessageStr.replace(/[a-z]/g, function (m) {
                        return m.toUpperCase();
                    });
                    if (msessageStr.indexOf(searchStr) != -1) {
                        flag = true;
                    }
                });
                return flag;
            },
            fnSearch: _.debounce(function () {
                let searchStr = this.searchStr.trim().replace(/[a-z]/g, function (m) {
                    return m.toUpperCase();
                });
                if (this.activeName === 'erd.cloud.ppm.budget.entity.Budget') {
                    this.initBudgetData(this.activeName, searchStr);
                    return;
                }
                let options = this.getCurrentObjectData(this.activeName).options;
                if (searchStr) {
                    let num = options[0]?.data?.length || 0;
                    if (!num) return;
                    let children = this.currentColumn(this.activeName);
                    for (let index = 0; index < num; index++) {
                        let indexRowData = options.map((e) => e.data[index]);
                        let resultArr = [];
                        // 整行判断 其中有一个匹配到就显示这行
                        indexRowData.forEach((row) => {
                            resultArr.push(this.checkData(children, row, searchStr));
                        });
                        indexRowData.forEach((elem) => {
                            this.$set(elem, '_hide', !resultArr.some((ritem) => ritem));
                        });
                    }
                } else {
                    options.forEach((element) => {
                        element.data.forEach((rowData) => {
                            this.$set(rowData, '_hide', false);
                        });
                    });
                }
            }, 100),
            fnRefreshTable() {
                this.$nextTick(() => {
                    this.fnSearch();
                });
            },
            cellStyle({ row, rowIndex, column }, index) {
                if (index != 0 && this.$refs['vxeGridRef_0']) {
                    let rowData = this.$refs['vxeGridRef_0'].getData(rowIndex);
                    if (rowData[column.property] !== row[column.property]) {
                        return {
                            backgroundColor: '#fef5f5'
                        };
                    }
                }
            },
            // 预算对比样式  预算展示方式是树结构的，所以跟计划，需求的基线对比展示不一样
            cellStyleBudget({ row, column }, index) {
                if (index != 0 && this.$refs['vxeGridRef_0']) {
                    let budgetFirstData = ErdcKit.TreeUtil.flattenTree2Array(this.budgetData[0].data, {
                        childrenField: 'children'
                    });
                    if (row.budgetType === 'add')
                        return {
                            backgroundColor: '#fef5f5'
                        };
                    for (let item = 0; item < budgetFirstData.length; item++) {
                        if (
                            budgetFirstData[item]['erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo'] ===
                            row['erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo']
                        ) {
                            if (budgetFirstData[item][column.property] !== row[column.property]) {
                                return {
                                    backgroundColor: '#fef5f5'
                                };
                            }
                        }
                    }
                }
            },
            rowClassName({ row }) {
                return row._hide ? 'relation-object-row-hide' : '';
            },
            // 显示列配置弹框
            fnShowColSetting() {
                this.columnSetList = this.getCurrentObjectData(this.activeName).options[0]?.columns;
                let defaultColumns = ErdcKit.deepClone(this.columnSetList);
                this.defaultColumns = defaultColumns.filter((col) => col.isDisable || col.isSelected);
                this.colSettingVisible = true;
            },
            // 列配置提交回调函数
            fnColSettingSubmit(callResp) {
                let selectedColumns = callResp.selectedColumns?.map((ite) => ite) || [];
                if (selectedColumns.length) {
                    let options = this.getCurrentObjectData(this.activeName).options;
                    options.forEach((element) => {
                        let children = element.columns || [];
                        children.forEach((elem) => {
                            if (selectedColumns.findIndex((ite) => ite.field === elem.field) != -1) {
                                elem['isSelected'] = true;
                                elem['visible'] = true;
                            } else {
                                elem['isSelected'] = false;
                                elem['visible'] = false;
                            }
                        });
                    });
                }

                let children = this.currentColumn(this.activeName);
                let cols = selectedColumns
                    .filter((elem) => children.every((prop) => elem.field !== prop))
                    .map((e) => e.field);
                // 保存设置的列
                this.$emit('settingCols', {
                    key: this.activeName,
                    columns: cols
                });
                this.reset = false;
                this.$nextTick(() => {
                    this.reset = true;
                });
            },
            initData(activeName) {
                activeName = !activeName ? 'erd.cloud.ppm.project.entity.Project' : activeName;
                this.$emit('hideBtn', activeName); // 将activeName传递到父组件判断是否要显示仅显示不同checkbox
                let currentObjectData = this.getCurrentObjectData(activeName);
                currentObjectData.loading = true;
                let functions = [
                    this.$famHttp({
                        url: `/fam/compare`,
                        data: {
                            isOnlyDifferent: this.isOnlyDifferent,
                            oids: [...this.tableData, ...this.dataOids] || [], //取仓库存的oids
                            optionList: ['baselineableObjMap'],
                            roleBTypeNameSet: [activeName],
                            attributeConfig: 'ppmBaselineCompareShowField'
                        },
                        className: this.className,
                        method: 'POST'
                    }),
                    this.getListColumns(activeName)
                ];
                Promise.all(functions)
                    .then((resp) => {
                        let res = resp[0];
                        let resColumns = resp[1];
                        let baselineableObjMap = res?.data?.baselineableObjMap?.value || {};
                        let objects = res?.data?.objects?.value || [];
                        if (resColumns) {
                            let children = this.currentColumn(activeName);
                            // 设置列头
                            let cols = [];
                            children.forEach((property) => {
                                let findData = resColumns.find((ite) => ite.field === property);
                                if (findData) {
                                    findData.isDisable = true;
                                    findData.minWidth = 110;
                                    findData.width = '';
                                    findData.visible = true;
                                    if (property === 'name') {
                                        findData.fixed = 'left';
                                        // findData.width = 110;
                                    }
                                    cols.push(findData);
                                }
                            });
                            // 固定列移到最前
                            resColumns = resColumns.filter((item) => cols.every((e) => e.field != item.field));
                            resColumns.unshift(...cols);
                            let config = [];
                            // 当前相关对象的页签  已设置过的显示列
                            let isSelectedColumn = this.settingColsData[activeName] || [];
                            objects.map((element, i) => {
                                let copyColumns = ErdcKit.deepClone(resColumns);
                                if (isSelectedColumn.length) {
                                    copyColumns.forEach((c) => {
                                        if (isSelectedColumn.indexOf(c.field) != -1) {
                                            c.isSelected = true;
                                            c.visible = true;
                                        }
                                    });
                                }
                                let gridOptions = {
                                    headerTitle: element.caption,
                                    border: true,
                                    showOverflow: 'title',
                                    showHeaderOverflow: 'title',
                                    height: this.tableHeight,
                                    ref: 'vxeGridRef_' + i,
                                    columns: copyColumns,
                                    data: [],
                                    scrollY: {
                                        enabled: true
                                    },
                                    scrollX: {
                                        enabled: true
                                    }
                                };
                                config.push(gridOptions);
                            });
                            this.$set(currentObjectData, 'options', config);
                            switch (activeName) {
                                case 'erd.cloud.ppm.project.entity.Project':
                                    this.$set(currentObjectData, 'label', this.i18n.project);
                                    break;
                                case 'erd.cloud.ppm.plan.entity.Task':
                                    this.$set(currentObjectData, 'label', this.i18n.plan);
                                    break;
                                case 'erd.cloud.ppm.require.entity.Requirement':
                                    this.$set(currentObjectData, 'label', this.i18n.requirement);
                                    break;
                                case 'erd.cloud.ppm.plan.entity.milestone':
                                    this.$set(currentObjectData, 'label', this.i18n.milestone);
                                    break;
                            }
                        }
                        // 接口返回数据格式与组合数据特殊  重置结构中已有的
                        currentObjectData.options.forEach((ite) => {
                            ite.data = [];
                        });
                        // 显示tableData
                        let columnsList = currentObjectData.options[0]?.columns?.filter(
                            (col) => col.isDisable || col.isSelected
                        );
                        let isArraySame = (arr) => {
                            return arr.every((item) => item === arr[0]);
                        };
                        ['true', 'false'].forEach((k) => {
                            (baselineableObjMap[k] || []).forEach((rowData) => {
                                // true 情况下后台接口没有返回对应数据  需要填充
                                if (
                                    k == 'true' &&
                                    baselineableObjMap[k] &&
                                    baselineableObjMap[k].length &&
                                    objects.length > 1
                                ) {
                                    rowData.push(...this.fillInData(objects, rowData[0]));
                                }
                                objects.forEach((element, i) => {
                                    let row = {};
                                    // 仅显示不同
                                    if (this.isOnlyDifferent) {
                                        if (rowData.every((ritem) => !ritem)) {
                                            row['_ignore'] = true;
                                        } else {
                                            // 以当前显示的列来判断
                                            let compareResult = [];
                                            if (rowData.every((isData) => isData)) {
                                                columnsList.forEach((col) => {
                                                    let compareData = rowData.map((e) => e.attributeMap[col.field]);
                                                    compareResult.push(isArraySame(compareData));
                                                });
                                            } else {
                                                compareResult.push(false);
                                            }
                                            row['_ignore'] = compareResult.every((compareRes) => compareRes);
                                        }
                                    }
                                    if (rowData && rowData[i]) {
                                        Object.keys(rowData[i]?.attributeMap || {}).forEach((property) => {
                                            row[property] = rowData[i]?.attributeMap[property] || '';
                                        });
                                    }
                                    if (!row['_ignore']) {
                                        currentObjectData.options[i].data.push(row);
                                    }
                                });
                            });
                        });
                        this.reset = false;
                        this.$nextTick(() => {
                            this.reset = true;
                        });
                        currentObjectData.loading = false;
                    })
                    .catch(() => {
                        currentObjectData.loading = false;
                    });
            },
            fillInData(objects, row) {
                let num = objects.length - 1 > 1 ? 2 : 1;
                let result = [];
                for (let n = 0; n < num; n++) {
                    result.push(ErdcKit.deepClone(row));
                }
                return result;
            },
            loadAccessTypes(paramsData) {
                return this.$famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    method: 'GET',
                    data: paramsData,
                    appName: 'PPM'
                });
            },
            getCurrentObjectData(activeName) {
                return this.tabs.find((element) => element.key === activeName);
            },
            currentColumn(activeName) {
                let columns = [];
                activeName = !activeName ? 'erd.cloud.ppm.project.entity.Project' : activeName;
                switch (activeName) {
                    case 'erd.cloud.ppm.project.entity.Project':
                        columns = this.projectCols;
                        break;
                    case 'erd.cloud.ppm.plan.entity.Task':
                        columns = this.projectTaskCols;
                        break;
                    case 'erd.cloud.ppm.require.entity.Requirement':
                        columns = this.requirementCols;
                        break;
                    case 'erd.cloud.ppm.plan.entity.milestone':
                        columns = this.milestoneCols;
                        break;
                    case 'erd.cloud.ppm.budget.entity.Budget':
                        columns = this.budgetCols;
                        break;
                }
                return columns;
            },
            getListColumns(activeName) {
                return new Promise((resolve) => {
                    this.loadAccessTypes({
                        typeName: activeName,
                        accessControl: false,
                        containerRef: ''
                    }).then((respe) => {
                        let typeOids = respe?.data?.map((e) => e.typeName);
                        this.$famHttp({
                            url: `/fam/view/getFieldsByType?isAttrAddModelName=true`,
                            method: 'post',
                            data: typeOids
                        })
                            .then((resp) => {
                                let result = resp?.data || [];
                                // 过滤关系属性
                                let fieldData = result.filter((item) => item.attributeCategory !== 'RELATION');
                                let columns = fieldData.map((item) => {
                                    // 如果是禁止操作的，都是默认选中的字段
                                    item['title'] = item.label;
                                    item['field'] = item.attrName.split('#')[1];
                                    item['isDisable'] = item.disabled;
                                    item['isSelected'] = false;
                                    item['resizable'] = true;
                                    item['width'] = item.width || 100; // 默认宽度
                                    item['sort'] = item.sort || '';
                                    item['visible'] = false;
                                    return item;
                                });
                                resolve(columns);
                            })
                            .catch((err) => {
                                // this.$message({
                                //     type: 'error',
                                //     message: err?.data?.message || err?.data || err
                                // });
                            });
                    });
                });
            },
            gridScroll: _.debounce(function ({ scrollTop, scrollLeft }) {
                for (var key in this.$refs) {
                    if (key !== 'vxeGridRef_0') {
                        this.$refs[key].scrollTo(scrollLeft, scrollTop);
                    }
                }
            }, 10)
        }
    };
});
