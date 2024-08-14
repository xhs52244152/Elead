define([
    'text!' + ELMP.resource('erdc-ppm-template-budget/views/list/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.func('erdc-ppm-template-budget/views/list/style.css')
], function (template, ErdcKit, ppmStore) {
    return {
        template,
        name: 'budgetTemplateList',
        data() {
            return {
                // 启用国际化
                // i18nPath: ELMP.resource('erdc-ppm-template-budget/locale/index.js'),
            };
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            FamInfoTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamInfo/FamInfoTitle.js'))
        },
        created() {
            this.vm = this;
        },
        computed: {
            // 预算模板
            className() {
                return ppmStore?.state?.classNameMapping?.budgetTemplate;
            },
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: this.className + '#name',
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            viewTableConfig() {
                let config = {
                    tableKey: 'BudgetTemplateView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: this,
                        searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            url: '/ppm/view/table/page', // 表格数据接口
                            params: {}, // 路径参数
                            data: {
                                tableKey: 'BudgetTemplateView',
                                orderBy: 'identifierNo',
                                sortBy: 'asc',
                                className: this.className
                            }, // body参数
                            method: 'post' // 请求方法（默认get）
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true, // 是否显示普通模糊搜索，默认显示
                                width: '200px'
                            },
                            basicFilter: {
                                show: false
                            },
                            actionConfig: {
                                name: 'PPM_BUDGET_TEMPLATE_LIST',
                                containerOid: '',
                                className: this.className
                            }
                        },

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
                            showOverflow: true // 溢出隐藏显示省略号
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            }
        },
        methods: {
            getActionConfig(row) {
                return {
                    name: 'PPM_BUDGET_TEMPLATE_OPER',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            onDetail(row) {
                this.$router.push({
                    path: 'erdc-ppm-template-budget/template/detail',
                    query: {
                        oid: row.oid
                    }
                });
            },
            // 通用单个删除的方法，删除后默认执行vm.refresh方法，因此vm需要定义此方法
            refresh() {
                this.$refs['famViewTable']?.refreshTable();
            }
        }
    };
});
