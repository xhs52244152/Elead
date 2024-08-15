define([], function () {
    const FamKit = require('fam:kit');

    const getTableDataWcd = function (name, onChange) {
        return {
            name,
            label: '',
            i18n: { CN: '', EN: '' },
            type: 'table',
            components: {
                TableData: FamKit.asyncComponent(
                    ELMP.resource('erdc-components/FamFormDesigner/configurations/_table-data.js')
                )
            },
            formItem: {
                props: {
                    columns: [
                        {
                            header: '参数名',
                            i18n: { CN: '参数名', EN: 'Param Name' },
                            field: 'key',
                            width: '',
                            component: 'erd-input'
                        },
                        {
                            header: '参数值',
                            i18n: { CN: '参数值', EN: 'Param Value' },
                            field: 'value',
                            component: 'erd-input'
                        },
                        {
                            header: '',
                            field: 'oper',
                            component: 'erd-button',
                            props: {
                                type: 'icon',
                                icon: 'erd-iconfont erd-icon-delete'
                            },
                            listeners: {
                                click: `
                                    return function onClick($event, data, vm) {
                                        vm.removeRow(data.rowIndex);
                                    };
                                `
                            }
                        }
                    ],
                    rowSchema: `
                        var length = this.tableData.length + 1;
                        return {
                            key: 'param' + length,
                            value: ''
                        };
                    `
                },
                listeners: {
                    change: onChange
                }
            }
        };
    };

    const getUrlWcd = function (name) {
        return {
            name,
            label: '请求地址',
            i18n: { CN: '请求地址', EN: 'Request Address' },
            type: 'string',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    deferred: true,
                    clearable: true
                }
            }
        };
    };

    const getAjaxMethodWcd = function (name) {
        return {
            name,
            label: '请求方法',
            i18n: { CN: '请求方法', EN: 'Request Method' },
            type: 'select',
            defaultValue: 'GET',
            formItem: {
                component: 'custom-select',
                props: {
                    required: true,
                    treeSelect: false,
                    row: {
                        referenceList: [
                            {
                                id: 'GET',
                                value: 'GET',
                                name: 'GET'
                            },
                            {
                                id: 'POST',
                                value: 'POST',
                                name: 'POST'
                            }
                        ]
                    }
                }
            }
        };
    };

    return {
        ref: {
            name: 'ref',
            label: 'Ref',
            i18n: { CN: 'Ref', EN: 'Slot Name' },
            type: 'string',
            defaultValue: '',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    tooltip: '设置一个 Reference Key，使得应用上下文可以获取到对应组件实例',
                    tooltipI18nJson: {
                        zh_cn: '设置一个 Reference Key，使得应用上下文可以获取到对应组件实例',
                        en_us: 'Set a Reference key so that the code context can obtain corresponding component instance.'
                    }
                }
            }
        },
        slotName: {
            name: 'props.name',
            label: '插槽名称',
            i18n: { CN: '插槽名称', EN: 'Slot Name' },
            type: 'string',
            defaultValue: 'default',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: 'default'
                },
                listeners: {
                    input: `
                        return function onInput(value) {
                            var ErdKit = require('erdcloud.kit');
                            this.schema.props.name = ErdKit.hyphenate(value);
                        }
                    `
                }
            }
        },
        'props.clearable': {
            name: 'props.clearable',
            label: '可清空',
            i18n: { CN: '可清空', EN: 'Clearable' },
            type: 'boolean',
            defaultValue: false,
            formItem: {
                component: 'erd-checkbox'
            }
        },
        disabled: {
            name: 'disabled',
            label: '是否禁用',
            i18n: { zh_cn: '是否禁用', en_us: 'Disabled' },
            type: 'boolean',
            defaultValue: false,
            formItem: {
                component: 'erd-checkbox',
                listeners: {
                    change: `
                        return function onChange(value, vm) {
                            // 同步到props.disabled
                            var props = vm.widget.schema.props;
                            vm.$set(props, 'disabled', vm.schema.disabled);
                            vm.setSchemaValue('props', props);
                        }
                    `
                }
            }
        },
        'custom-select/url': getUrlWcd('props.row.requestConfig.url'),
        'custom-select/method': getAjaxMethodWcd('props.row.requestConfig.method'),
        'custom-select/data': getTableDataWcd(
            'props.row.requestConfig.dataTable',
            `
            return function onChange (value, vm) {
                var props = vm.schema.props || {};
                var row = props.row || {};
                var requestConfig = _.clone(row.requestConfig) || {};
                requestConfig.data = _.reduce(value, function(prev, item) {
                    prev[item.key] = item.value;
                    return prev;
                }, {});
                vm.setDeepValue('props.row.requestConfig.data', requestConfig.data);
                vm.$set(row, 'requestConfig', requestConfig);
                vm.$set(props, 'row', row);
                vm.setSchemaValue('props', props);
            };
        `
        ),
        'custom-select/enum': {
            name: 'props.row.enumClass',
            label: '枚举类',
            i18n: { CN: '枚举类', EN: 'Enum Class' },
            type: 'string',
            formItem: {
                component: 'CustomSelect',
                props: {
                    filterable: true,
                    clearable: true,
                    row: {
                        componentName: 'virtual-select',
                        clearNoData: false,
                        requestConfig: {
                            url: '/fam/type/component/enumDataList',
                            viewProperty: 'targetClass',
                            valueProperty: 'targetClass'
                        }
                    }
                },
                listeners: {
                    change() {
                        const props = this.schema?.props || {};
                        const row = props?.row || {};
                        row.componentName = 'custom-virtual-enum-select';
                        this.setSchemaValue('props', props);
                    }
                }
            }
        },
        'props.treeSelect': {
            name: 'props.treeSelect',
            label: '树形选择',
            i18n: { CN: '树形选择', EN: 'is TreeSelect' },
            type: 'boolean',
            defaultValue: false,
            formItem: {
                component: 'erd-checkbox'
            }
        },
        'props.treeProps.children': {
            name: 'props.treeProps.children',
            label: '子节点字段',
            i18n: { CN: '子节点字段', EN: 'Children Field' },
            type: 'string',
            defaultValue: 'children',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: 'children'
                }
            }
        },
        'props.ajax.url': getUrlWcd('props.ajax.url'),
        'props.ajax.method': getAjaxMethodWcd('props.ajax.method'),
        'props.ajax.data': getTableDataWcd('props.ajax.data'),
        'FamViewTable/viewMenuDataKey': {
            name: 'props.viewTableConfig.viewMenu.dataKey',
            label: '导航栏字段配置',
            i18n: { CN: '导航栏字段配置', EN: 'Navigation bar field configuration' },
            type: 'string',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: '导航栏字段配置',
                    tooltip: '导航栏对应后端字段，可以是一个多层级的字段',
                    tooltipI18nJson: {
                        zh_cn: '导航栏对应后端字段，可以是一个多层级的字段',
                        en_us: 'The navigation bar corresponds to the back-end field, which can be a multi-level field.'
                    }
                }
            }
        },
        'FamViewTable/viewMenuHiddenNavBar': {
            name: 'props.viewTableConfig.viewMenu.hiddenNavBar',
            label: '是否隐藏导航栏',
            i18n: { CN: '是否隐藏导航栏', EN: 'Whether to hide the navigation bar.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否隐藏导航栏'
                }
            }
        },
        'FamViewTable/saveAs': {
            name: 'props.viewTableConfig.saveAs',
            label: '是否显示另存为',
            i18n: { CN: '是否显示另存为', EN: 'Whether to hide the navigation bar.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示另存为'
                }
            }
        },
        'FamViewTable/addSeq': {
            name: 'props.viewTableConfig.tableConfig.addSeq',
            label: '是否显示序号',
            i18n: { CN: '是否显示序号', EN: 'Whether to add serial number.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示序号'
                }
            }
        },
        'FamViewTable/addRadio': {
            name: 'props.viewTableConfig.tableConfig.addRadio',
            label: '是否显示单选框',
            i18n: { CN: '是否显示单选框', EN: 'Whether to add an option box.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示单选框'
                }
            }
        },
        'FamViewTable/addCheckbox': {
            name: 'props.viewTableConfig.tableConfig.addCheckbox',
            label: '是否显示多选框',
            i18n: { CN: '是否显示多选框', EN: 'Whether to add an option box.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示多选框'
                }
            }
        },
        'FamViewTable/fieldLink': {
            name: 'props.viewTableConfig.tableConfig.fieldLinkConfig.fieldLink',
            label: '是否显示超链接',
            i18n: { CN: '是否显示超链接', EN: 'Whether show hyperlinks.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示超链接'
                }
            }
        },
        'FamViewTable/fieldLinkName': {
            name: 'props.viewTableConfig.tableConfig.fieldLinkConfig.fieldLinkName',
            label: '超链接字段',
            i18n: { CN: '超链接字段', EN: 'Hyperlink field.' },
            type: 'string',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: '超链接字段'
                }
            }
        },
        'FamViewTable/showPagination': {
            name: 'props.viewTableConfig.tableConfig.pagination.showPagination',
            label: '是否显示分页器',
            i18n: { CN: '是否显示分页器', EN: 'Display page or not.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示分页器'
                }
            }
        },
        'FamViewTable/indexKey': {
            name: 'props.viewTableConfig.tableConfig.pagination.indexKey',
            label: '分页器下标字段',
            i18n: { CN: '分页器下标字段', EN: 'Page subscript field.' },
            type: 'string',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: '分页器下标字段'
                }
            }
        },
        'FamViewTable/sizeKey': {
            name: 'props.viewTableConfig.tableConfig.fieldLinkConfig.sizeKey',
            label: '分页器页码字段',
            i18n: { CN: '分页器页码字段', EN: 'Pager page number field.' },
            type: 'string',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: '分页器页码字段'
                }
            }
        },
        'FamViewTable/showConfigCol': {
            name: 'props.viewTableConfig.tableConfig.toolbarConfig.showConfigCol',
            label: '是否显示操作列配置',
            i18n: { CN: '是否显示操作列配置', EN: 'Whether to display the operation column configuration.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示操作列配置'
                }
            }
        },
        'FamViewTable/showRefresh': {
            name: 'props.viewTableConfig.tableConfig.toolbarConfig.showRefresh',
            label: '是否显示刷新按钮',
            i18n: { CN: '是否显示刷新按钮', EN: 'Whether to display a refresh button.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示刷新按钮'
                }
            }
        },
        'FamViewTable/fuzzySearchShow': {
            name: 'props.viewTableConfig.tableConfig.toolbarConfig.fuzzySearch.show',
            label: '是否显示搜索',
            i18n: { CN: '是否显示搜索', EN: 'Show search or not.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示搜索'
                }
            }
        },
        'FamViewTable/placeholder': {
            name: 'props.viewTableConfig.tableConfig.toolbarConfig.fuzzySearch.placeholder',
            label: '搜索栏提示',
            i18n: { CN: '搜索栏提示', EN: 'Search bar prompt.' },
            type: 'string',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: '搜索栏提示'
                }
            }
        },
        'FamViewTable/basicFilterShow': {
            name: 'props.viewTableConfig.tableConfig.toolbarConfig.basicFilter.show',
            label: '是否显示基础筛选',
            i18n: { CN: '是否显示基础筛选', EN: 'Whether to display base filters.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示基础筛选'
                }
            }
        },
        'FamViewTable/maxNumber': {
            name: 'props.viewTableConfig.tableConfig.toolbarConfig.basicFilter.maxNumber',
            label: '基础筛选显示最大数量',
            i18n: { CN: '基础筛选显示最大数量', EN: 'Base filter shows the maximum number.' },
            type: 'number',
            formItem: {
                component: 'erd-input-number',
                props: {
                    required: false,
                    min: 0,
                    placeholder: '基础筛选显示最大数量'
                }
            }
        },
        'FamViewTable/showMoreSearch': {
            name: 'props.viewTableConfig.tableConfig.toolbarConfig.showMoreSearch',
            label: '是否显示高级筛选',
            i18n: { CN: '是否显示高级筛选', EN: 'Whether to display advanced filtering.' },
            type: 'boolean',
            formItem: {
                component: 'erd-checkbox',
                props: {
                    required: false,
                    placeholder: '是否显示高级筛选'
                }
            }
        },
        'FamViewTable/actionConfigName': {
            name: 'props.viewTableConfig.tableConfig.toolbarConfig.actionConfig.name',
            label: '表头操作按钮key',
            i18n: { CN: '表头操作按钮key', EN: '表头操作按钮key.' },
            type: 'string',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: '表头操作按钮key'
                }
            }
        },
        'FamViewTable/actionConfigContainer': {
            name: 'props.viewTableConfig.tableConfig.toolbarConfig.actionConfig.containerOid',
            label: '表头按钮配置容器oid',
            i18n: { CN: '表头按钮配置容器oid', EN: 'Header button configuration container oid.' },
            type: 'string',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: '表头按钮配置容器oid'
                }
            }
        },
        'FamViewTable/actionPulldownName': {
            name: 'props.viewTableConfig.tableConfig.actionPulldownConfig.name',
            label: '列表操作按钮key',
            i18n: { CN: '列表操作按钮key', EN: 'List the key operation button.' },
            type: 'string',
            formItem: {
                component: 'erd-input',
                props: {
                    required: false,
                    placeholder: '列表操作按钮key'
                }
            }
        }
    };
});
