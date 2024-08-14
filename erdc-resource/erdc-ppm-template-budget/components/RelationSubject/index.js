define([
    'text!' + ELMP.resource('erdc-ppm-template-budget/components/RelationSubject/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    'erdcloud.kit',
    'css!' + ELMP.func('erdc-ppm-template-budget/components/RelationSubject/style.css')
], function (template, ppmStore, actions, ErdcKit) {
    return {
        template,
        name: 'RelationSubject',
        props: {
            // 关联的主对象oid（预算模板oid）
            relationOid: String,
            readonly: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                chooseSubjectVisible: false,
                // 启用国际化
                i18nPath: ELMP.resource('erdc-ppm-template-budget/locale/index.js'),
                selectData: [],
                parentSubjectOid: null, // 父科目oid，新增关联科目时使用
                // 查询科目父节点路径的配置
                findParentConfig: {
                    rootData: [], // 根数据
                    childField: 'children', // 子节点的字段名称
                    oidField: 'erd.cloud.ppm.budget.entity.BudgetLink#oid' // oid的字段名
                },
                treeConfig: {
                    childrenField: 'children',
                    expandAll: true
                    // iconOpen: 'erd-iconfont erd-icon-arrow-down',
                    // iconClose: 'erd-iconfont erd-icon-arrow-right'
                }
            };
        },
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            ChooseSubjectDialog: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/ChooseSubjectDialog/index.js')
            )
        },
        created() {
            this.vm = this;
        },
        computed: {
            // 关联科目
            className() {
                return ppmStore?.state?.classNameMapping?.budgetLink;
            },
            // 预算科目
            subjectClassName() {
                return ppmStore?.state?.classNameMapping?.budgetSubject;
            },
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.className}#rate`,
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
                return [
                    {
                        attrName: 'checkbox', // 列数据字段key
                        type: 'checkbox', // 特定类型 复选框[checkbox] 单选框[radio]
                        minWidth: '40', // 列宽度
                        width: '40',
                        align: 'center'
                    },
                    {
                        attrName: `${this.subjectClassName}#identifierNo`,
                        label: this.i18n['code'], // 编码,
                        minWidth: 100
                    },
                    {
                        attrName: `${this.subjectClassName}#name`,
                        label: this.i18n['name'], // 名称,
                        minWidth: 240
                    },
                    {
                        attrName: `${this.subjectClassName}#category`,
                        label: this.i18n['category'], // 类别
                        minWidth: 100
                    }
                ];
            },
            viewTableConfig() {
                return {
                    vm: this, // 用于表格toolbarConfig.actionConfig配置的按钮事件回调参数vm的值
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/ppm/budget/subject/tree', // 表格数据接口
                        params: {
                            contextOId: this.relationOid
                        },
                        data: {
                            contextOId: this.relationOid
                        },
                        method: 'post', // 请求方法（默认get）
                        transformResponse: [
                            (data) => {
                                // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                // 对接收的 data 进行任意转换处理
                                let resData;
                                try {
                                    resData = (data && JSON.parse(data)) || {};
                                    resData.data.records = this.deepFormatTableData(resData.data.records || []);
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
                            show: true, // 是否显示普通模糊搜索，默认显示
                            width: '200px'
                        },
                        basicFilter: {
                            show: false
                        },
                        actionConfig: !this.readonly
                            ? {
                                  name: 'PPM_BUDGET_TEMPLATE_LINK_SUBJECT_LIST',
                                  containerOid: '',
                                  className: this.className
                              }
                            : null
                    },
                    addSeq: true,
                    addIcon: false,
                    addCheckbox: false,
                    addOperationCol: !this.readonly, // 是否显示操作列
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
                        editConfig: { trigger: 'click', mode: 'cell' }, // 行内编辑配置
                        treeNode: `${this.subjectClassName}#name`, // 科目名称 放表格树的展开/收缩图标
                        // 表格树配置
                        treeConfig: this.treeConfig,
                        checkboxConfig: { checkStrictly: false } // checkStrictly是否不做父子强关联勾选，默认false
                    },
                    pagination: {
                        showPagination: false,
                        pageSize: 9999 // 树数据，一次性加载出来的
                    },
                    slotsField: this.slotsField,
                    columns: this.columns
                };
            }
        },
        methods: {
            // 递归遍历获取表格数据
            deepFormatTableData(subjectArr = []) {
                return subjectArr.map((r) => {
                    let rowData = ErdcKit.deserializeArray(
                        (r.attrRawList || []).concat(r['subjectInfo']?.attrRawList || []),
                        {
                            valueKey: 'displayName'
                        }
                    );
                    if (r['childList'] && r['childList'].length) {
                        rowData['children'] = this.deepFormatTableData(r['childList']);
                    }
                    return rowData;
                });
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_BUDGET_TEMPLATE_LINK_SUBJECT_OPER',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            // 打开关联科目弹窗（menu-actions.js有调用）,parentData=父科目数据
            handleAddRelation(parentData) {
                this.parentSubjectOid = null;
                this.findParentConfig.rootData = this.$refs['famTableRef'].tableData || [];
                // 是否有父节点数据
                if (parentData) {
                    this.parentSubjectOid = parentData[`${this.className}#oid`];
                }
                this.chooseSubjectVisible = true;
            },
            // 批量移除or单个移除
            async handleDelete(rowData) {
                let oidList = [];
                // 判断是否单个移除
                if (rowData) {
                    // 单个移除时，递归获取所有子科目oid
                    oidList = this.formatFlatten([rowData]).map((r) => r[`${this.className}#oid`]);
                }
                // 批量移除
                else {
                    let selectData = this.$refs['famTableRef'].getCheckboxRecords(); // 获取勾选的数据
                    oidList = selectData.map((r) => r[`${this.className}#oid`]);
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
                    className: this.className,
                    isRemove: this.i18n['isRemove'], // 是否移除该数据
                    confirmRemove: this.i18n['confirmRemoval'], // 确认移除
                    tip: this.i18n['removalSuccess'] // 移除成功
                });
            },
            /**
             * 递归获取父节点路径
             * @param {Array} dataArr 数据
             * @param {String} targetOid 目标oid
             * @param {Number} deepLevel 递归层级（节点的层级）
             * @param {Object} obj 实时的父节点路径信息，以及是否找到的标识
             * @returns
             */
            deepGetParentPath(dataArr, targetOid, deepLevel = 0, obj = { parentPaths: [], isEnd: false }) {
                if (obj.isEnd) {
                    return obj.parentPaths;
                }
                dataArr.forEach((r) => {
                    // 未结束时，才做处理
                    if (!obj.isEnd) {
                        obj.parentPaths = obj.parentPaths.slice(0, deepLevel); // 截取
                        obj.parentPaths[deepLevel] = r;
                        // 已找到
                        if (r[`${this.className}#oid`] === targetOid) {
                            obj.isEnd = true;
                        }
                        // 是否有子节点
                        else if (r[this.treeConfig.childrenField] && r[this.treeConfig.childrenField].length) {
                            this.deepGetParentPath(r[this.treeConfig.childrenField], targetOid, deepLevel + 1, obj);
                        }
                    }
                });
                return obj.parentPaths;
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
            // 通用单个删除的方法，删除后默认执行vm.refresh方法，因此vm需要定义此方法
            refresh() {
                this.$refs['famTableRef']?.fnRefreshTable();
            }
        }
    };
});
