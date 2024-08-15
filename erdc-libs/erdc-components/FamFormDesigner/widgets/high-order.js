define([], function () {
    return function ({ getConfigurations }) {
        return [
            {
                key: 'FamDynamicFormSlot',
                name: '插槽',
                category: 'high-order',
                disabled: false,
                nolabel: true,
                fixed: true,
                schema: {
                    component: 'slot',
                    props: {
                        name: 'default'
                    },
                    col: 12
                },
                configurations: getConfigurations([
                    'field',
                    'slotName',
                    'slotComponent',
                    'ref',
                    'label',
                    'placeholder',
                    'tooltip',
                    'required',
                    'props.clearable',
                    'disabled',
                    'readonly',
                    'hidden'
                ])
            },
            {
                key: 'FamDynamicFormPlaceholder',
                name: '占位组件',
                category: 'high-order',
                disabled: false,
                nolabel: true,
                fixed: true,
                schema: {
                    component: 'FamDynamicFormPlaceholder',
                    col: 12
                },
                configurations: getConfigurations(['columnNumber'])
            },
            {
                key: 'FamClassificationTitle',
                name: '分类标题',
                category: 'high-order',
                container: true,
                nolabel: true,
                fixed: true,
                block: true,
                schema: {
                    col: 24,
                    component: 'fam-classification-title',
                    props: {
                        unfold: true
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'label',
                    'tooltip',
                    'FamClassificationTitle/autoExpand',
                    'hidden'
                ])
            },
            {
                key: 'FamErdTabs',
                name: '标签页',
                category: 'high-order',
                fixed: true,
                container: true,
                block: true,
                lifecycle: {
                    clone(widget) {
                        const tabs = [...widget.schema.tabs];
                        widget.widgetList = tabs.map((tab = {}) => ({
                            key: widget.id + '-FamErdTabPane',
                            container: true,
                            block: true,
                            name: '标签页面板',
                            category: 'high-order',
                            schema: {
                                col: 24,
                                component: 'FamErdTabPane',
                                props: {
                                    activated: tab.name === widget.schema.props.activeTab,
                                    ...tab
                                }
                            },
                            widgetList: []
                        }));
                    }
                },
                schema: {
                    col: 24,
                    component: 'FamErdTabs',
                    tabs: [
                        {
                            label: {
                                value: {
                                    value: '标签1'
                                }
                            },
                            name: 'tab1'
                        }
                    ],
                    props: {
                        type: 'border-card',
                        activeTab: 'tab1'
                    }
                },
                configurations: getConfigurations([
                    'FamErdTabs/tabs',
                    'hidden',
                    'FamErdTabs/refreshTab',
                    'FamErdTabs/type'
                ])
            },

            {
                key: 'FamViewTable',
                name: '视图表格',
                nolabel: true,
                category: 'high-order',
                preventLoading: true,
                schema: {
                    col: 24,
                    component: 'FamViewTable',
                    props: {
                        vm: null,
                        isAdaptiveHeight: false,
                        isRelationalView: false,
                        viewTableHeight: 200,
                        viewTableConfig: {
                            tableKey: '',
                            saveAs: false, // 是否显示另存为
                            tableConfig: {
                                sortFixRight: true, // 排序图标右对齐
                                // 限制仅能控制能否显示分页，分页对应参数暂时不可修改
                                pagination: {
                                    showPagination: true,
                                    indexKey: 'pageIndex',
                                    sizeKey: 'pageSize'
                                },
                                toolbarConfig: {
                                    fuzzySearch: {
                                        show: false, // 是否显示普通模糊搜索，默认显示
                                        placeholder: '请输入', // 输入框提示文字，默认请输入
                                        clearable: true,
                                        width: '280'
                                    },
                                    // 基础筛选
                                    basicFilter: {
                                        show: false, // 是否显示基础筛选，默认不显示
                                        maxNumber: 4
                                    },
                                    actionConfig: {
                                        name: ''
                                    }
                                },
                                actionPulldownConfig: {
                                    name: ''
                                }
                            }
                        }
                    }
                },
                configurations: getConfigurations(
                    [
                        'FamViewTable/field',
                        'component',
                        'ref',
                        'label',
                        'FamViewTable/tableKey',
                        'FamViewTable/isRelationalView',
                        // 'FamViewTable/viewMenuDataKey',
                        'FamViewTable/viewMenuHiddenNavBar',
                        'FamViewTable/showNavbar',
                        'FamViewTable/viewTableHeight',
                        'FamViewTable/maxLine',
                        // 'FamViewTable/saveAs',
                        'FamViewTable/addSeq',
                        'FamViewTable/addRadio',
                        'FamViewTable/addCheckbox',
                        'FamViewTable/fieldLink',
                        'FamViewTable/fieldLinkName',
                        'FamViewTable/showPagination',
                        // 'FamViewTable/indexKey',
                        // 'FamViewTable/sizeKey',
                        'FamViewTable/showConfigCol',
                        'FamViewTable/showRefresh',
                        // 'FamViewTable/fuzzySearchShow',
                        'FamViewTable/placeholder',
                        'FamViewTable/basicFilterShow',
                        'FamViewTable/maxNumber',
                        'FamViewTable/showMoreSearch',
                        'FamViewTable/actionConfigName',
                        // 'FamViewTable/actionConfigContainer',
                        'FamViewTable/addOperationCol',
                        'FamViewTable/actionPulldownName',
                        'syncToChild',
                        'listeners'
                    ],
                    function customize(name, config) {
                        // customize 用于动态修改配置项
                        switch (name) {
                            case 'FamViewTable/actionPulldownName':
                                config.hidden = (schema) => {
                                    return !schema?.props?.viewTableConfig?.tableConfig?.addOperationCol;
                                };
                                break;
                            case 'FamViewTable/maxNumber':
                                config.hidden = (schema) => {
                                    return !schema?.props?.viewTableConfig?.tableConfig?.toolbarConfig?.basicFilter
                                        ?.show;
                                };
                                break;
                            case 'FamViewTable/fieldLinkName':
                                config.hidden = (schema) => {
                                    return !schema?.props?.viewTableConfig?.tableConfig?.fieldLinkConfig?.fieldLink;
                                };
                                break;
                            case 'FamViewTable/placeholder':
                                config.hidden = (schema) => {
                                    return !schema?.props?.viewTableConfig?.tableConfig?.toolbarConfig?.fuzzySearch
                                        ?.show;
                                };
                                break;
                            // case 'FamViewTable/showNavbar':
                            //     config.hidden = (schema) => {
                            //         return schema?.props?.viewTableConfig?.viewMenu?.hiddenNavBar;
                            //     };
                            //     break;
                            // case 'FamViewTable/indexKey':
                            //     config.hidden = (schema) => {
                            //         return !schema?.props?.viewTableConfig?.tableConfig?.pagination?.showPagination;
                            //     };
                            //     break;
                            // case 'FamViewTable/sizeKey':
                            //     config.hidden = (schema) => {
                            //         return !schema?.props?.viewTableConfig?.tableConfig?.pagination?.showPagination;
                            //     };
                            //     break;
                            default:
                                break;
                        }
                        return config;
                    }
                ),
                mappers: [
                    function (data) {
                        const { widget, vm, formData, oid } = data;
                        if (widget.schema.props) {
                            widget.schema.props.formOid = oid || formData?.oid || null;
                        }
                        if (widget?.schema?.props?.viewTableConfig) {
                            if (widget.schema.props.viewTableConfig.tableConfig) {
                                widget.schema.props.viewTableConfig.tableConfig.vm = vm;
                            }
                        }
                        if (widget?.schema?.field) {
                            widget.schema.props.isRelationalView = true;
                        }

                        return widget;
                    }
                ],
                events: [
                    {
                        name: 'link-click',
                        label: '超链接点击事件',
                        description: 'linkClick 事件',
                        disabled: false,
                        arguments: [
                            {
                                name: 'data',
                                description: '当前行数据',
                                type: 'object'
                            }
                        ]
                    },
                    {
                        name: 'action-click',
                        label: '表格功能按钮点击事件',
                        description: 'actionClick 事件',
                        disabled: false,
                        arguments: [
                            {
                                name: 'botton',
                                description: '按钮信息',
                                type: 'object'
                            },
                            {
                                name: 'data',
                                description: '列表选中数据',
                                type: 'array'
                            }
                        ]
                    },
                    {
                        name: 'action-pulldown-click',
                        label: '操作列点击事件',
                        description: 'actionPulldownClick 事件',
                        disabled: false,
                        arguments: [
                            {
                                name: 'botton',
                                description: '按钮信息',
                                type: 'object'
                            },
                            {
                                name: 'data',
                                description: '列表选中数据',
                                type: 'object'
                            }
                        ]
                    }
                ]
            }
        ];
    };
});
