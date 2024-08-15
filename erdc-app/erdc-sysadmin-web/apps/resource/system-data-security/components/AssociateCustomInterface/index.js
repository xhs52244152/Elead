define(['text!' + ELMP.resource('system-data-security/components/AssociateCustomInterface/index.html')], function (
    template
) {
    const erdcloudKit = require('erdcloud.kit');
    return {
        template,
        components: {
            FamBasicFilter: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamBasicFilter/index.js')),
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        props: {
            interfaceType: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'system-data-security'),
                basicFilter: [
                    {
                        attrName: 'associated',
                        oper: 'EQ',
                        value1: false,
                        logicalOperator: 'AND',
                        isCondition: true
                    }
                ]
            };
        },
        computed: {
            className() {
                return this.$store.getters.className('EtOperationApi');
            },
            viewTableConfig() {
                return {
                    firstLoad: true,
                    tableRequestConfig: {
                        url: '/message/search',
                        data: this.tableRequestConfigData,
                        method: 'post',
                        isFormData: false,
                        transformResponse: [
                            (data) => {
                                let resData = data;
                                try {
                                    resData = data && JSON.parse(data);
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    tableBaseConfig: {
                        rowConfig: {
                            keyField: 'oid'
                        },
                        showOverflow: true,
                        columnConfig: {
                            resizable: true
                        }
                    },
                    columns: [
                        {
                            attrName: 'serverCode',
                            label: this.i18n.microService
                        },
                        {
                            attrName: 'packagePath',
                            label: this.i18n.packagePath
                        },
                        {
                            attrName: 'className',
                            label: this.i18n.APIName
                        },
                        {
                            attrName: 'methodName',
                            label: this.i18n.functionName
                        },
                        {
                            attrName: 'methodParams',
                            label: this.i18n.methodParams,
                            width: '200'
                        },
                        {
                            attrName: 'displayName',
                            label: this.i18n.remarks,
                            width: '200'
                        }
                    ],
                    toolbarConfig: {
                        showMoreSearch: false,
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        }
                    },
                    addSeq: true,
                    addCheckbox: true,
                    isDeserialize: true,
                    pagination: {
                        showPagination: true
                    }
                };
            },
            tableRequestConfigData() {
                let configData = {
                    className: this.className,
                    pageIndex: 1,
                    pageSize: 20,
                    searchKey: this.basicFilter.find((item) => item.attrName === 'searchKey')?.value1 || ''
                };
                configData.conditionDtoList = [
                    {
                        attrName: 'interfaceType',
                        oper: 'EQ',
                        value1: this.interfaceType,
                        logicalOperator: 'AND',
                        isCondition: true
                    },
                    ...this.basicFilter.filter((item) => {
                        if (this.interfaceType === 'BASIC_BEHAVIOR' && item.attrName === 'associated') {
                            return false;
                        }
                        return item.attrName !== 'searchKey';
                    })
                ];
                return configData;
            },
            columnsList() {
                let columnsList = [
                    {
                        componentName: 'CustomVirtualSelect',
                        operator: 'eq',
                        options: [],
                        value: '',
                        label: this.i18n.microService, // 使用typeName
                        attrName: 'serverCode',
                        componentJson: JSON.stringify({
                            props: {
                                row: {
                                    componentName: 'virtual-select',
                                    viewProperty: 'displayName', // 显示的label的key
                                    valueProperty: 'identifierNo', // 显示value的key
                                    requestConfig: {
                                        url: '/platform/service/getAllServiceInfoVo'
                                    }
                                }
                            }
                        })
                    },
                    {
                        componentName: 'custom-select',
                        operator: 'eq',
                        options: [],
                        value: '',
                        label: this.i18n.associationStatus,
                        attrName: 'associated',
                        componentJson: JSON.stringify({
                            props: {
                                row: {
                                    componentName: 'constant-select',
                                    viewProperty: 'displayName',
                                    valueProperty: 'value',
                                    referenceList: [
                                        {
                                            displayName: this.i18n.associated,
                                            value: true
                                        },
                                        {
                                            displayName: this.i18n.notAssociated,
                                            value: false
                                        }
                                    ]
                                }
                            }
                        })
                    },
                    {
                        componentName: 'erdInput',
                        operator: 'like',
                        options: [],
                        value: '',
                        label: this.i18n.keyword,
                        attrName: 'searchKey'
                    }
                ];
                if (this.interfaceType === 'BASIC_BEHAVIOR') {
                    columnsList = columnsList.filter((item) => item.attrName !== 'associated');
                }
                return columnsList;
            },
            showData() {
                return [{ value1: false, attrName: 'associated' }];
            }
        },
        methods: {
            conditionChange() {
                this.$refs.famAdvancedTable?.fnRefreshTable({ conditions: 'default' });
            }
        }
    };
});
