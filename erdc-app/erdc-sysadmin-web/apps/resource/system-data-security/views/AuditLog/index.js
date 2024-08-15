define([
    'text!' + ELMP.resource('system-data-security/views/AuditLog/index.html'),
    'dayjs',
    'css!' + ELMP.resource('system-data-security/views/AuditLog/style.css')
], function (template, dayjs) {
    const FamKit = require('erdc-kit');
    return {
        template,
        components: {
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamBasicFilter: FamKit.asyncComponent(ELMP.resource('erdc-components/FamBasicFilter/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-data-security/locale/index.js'),
                ltList: [],
                tableSearchData: {
                    sortList: [['desc', 'oti']]
                }
            };
        },
        computed: {
            viewTableConfig() {
                const tableConfig = {
                    viewOid: '',
                    searchParamsKey: 'searchKey',
                    tableRequestConfig: {
                        url: '/message/log/operation/list',
                        params: {},
                        data: this.tableSearchData,
                        method: 'post',
                        transformResponse: [
                            (data) => {
                                let resData = data;
                                try {
                                    resData = data && JSON.parse(data);
                                    resData.data.records = resData.data.content;
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    firstLoad: true,
                    isDeserialize: true,
                    toolbarConfig: {
                        showRefresh: true,
                        fuzzySearch: {
                            show: false
                        }
                    },
                    tableBaseConfig: {
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left',
                        columnConfig: {
                            resizable: true
                        },
                        showOverflow: true
                    },
                    pagination: {
                        pageSize: 20,
                        indexKey: 'page',
                        sizeKey: 'size'
                    },
                    addSeq: true,
                    columns: [
                        {
                            attrName: 'uc',
                            label: this.i18n.operAccount,
                            minWidth: '100'
                        },
                        {
                            attrName: 'ona',
                            label: this.i18n.operName,
                            minWidth: '100'
                        },
                        {
                            attrName: 'sl',
                            label: this.i18n.secretLevel,
                            minWidth: '80'
                        },
                        {
                            attrName: 'cip',
                            label: this.i18n.operAddress,
                            minWidth: '120'
                        },
                        {
                            attrName: 'td',
                            label: this.i18n.operandType,
                            minWidth: '120'
                        },
                        {
                            attrName: 'dc',
                            label: this.i18n.operCoding,
                            minWidth: '200'
                        },
                        {
                            attrName: 'nij',
                            label: this.i18n.operItemName,
                            minWidth: '180'
                        },
                        {
                            attrName: 'ot',
                            label: this.i18n.operType,
                            minWidth: '80'
                        },
                        {
                            attrName: 'dij',
                            label: this.i18n.operDetails,
                            minWidth: '200'
                        },
                        {
                            attrName: 'ss',
                            label: this.i18n.operResult,
                            minWidth: '80'
                        },
                        {
                            attrName: 'oti',
                            label: this.i18n.operTime,
                            minWidth: '180'
                        },
                        {
                            attrName: 'tid',
                            label: this.i18n.operTenant,
                            minWidth: '120'
                        }
                    ],
                    columnWidths: {
                        operation: window.LS.get('lang_current') === 'en_us' ? 180 : 120
                    }
                };
                return tableConfig;
            },
            columnsList() {
                return [
                    {
                        componentName: 'erdCascader',
                        operator: 'like',
                        options: [
                            {
                                tableName: 'none',
                                displayName: this.i18n.notFiled
                            },
                            {
                                displayName: this.i18n.haveBeenFiled,
                                children: this.ltList
                            }
                        ],
                        value: '',
                        label: this.i18n.logType,
                        attrName: 'lt',
                        componentJson: JSON.stringify({
                            props: {
                                props: {
                                    label: 'displayName',
                                    value: 'tableName'
                                },
                                filterable: true
                            }
                        })
                    },
                    {
                        componentName: 'erdInput',
                        operator: 'like',
                        options: [],
                        value: '',
                        label: this.i18n.operAccount,
                        attrName: 'uc'
                    },
                    {
                        componentName: 'erdInput',
                        operator: 'like',
                        options: [],
                        value: '',
                        label: this.i18n.operName,
                        attrName: 'ona'
                    },
                    {
                        componentName: 'CustomVirtualEnumSelect', // 使用枚举组件
                        operator: 'eq',
                        options: [],
                        value: '',
                        label: this.i18n.secretLevel,
                        attrName: 'sl',
                        dataKey: 'erd.cloud.core.enums.UserSecurityLabel'
                    },
                    {
                        componentName: 'erdInput',
                        operator: 'like',
                        options: [],
                        value: '',
                        label: this.i18n.operAddress,
                        attrName: 'cip'
                    },
                    {
                        componentName: 'CustomVirtualSelect',
                        operator: 'eq',
                        options: [],
                        value: '',
                        label: this.i18n.operandType, // 使用typeName
                        attrName: 'tn',
                        componentJson: JSON.stringify({
                            props: {
                                row: {
                                    componentName: 'virtual-select',
                                    requestConfig: {
                                        url: 'fam/type/typeDefinition/findNotAccessTypes',
                                        viewProperty: 'displayName',
                                        valueProperty: 'typeName'
                                    }
                                }
                            }
                        })
                    },
                    {
                        componentName: 'erdInput',
                        operator: 'like',
                        options: [],
                        value: '',
                        label: this.i18n.operCoding,
                        attrName: 'dc'
                    },
                    {
                        componentName: 'erdInput',
                        operator: 'like',
                        options: [],
                        value: '',
                        label: this.i18n.operItemName,
                        attrName: 'om'
                    },
                    {
                        componentName: 'FamDict',
                        operator: 'eq',
                        options: [],
                        value: '',
                        label: this.i18n.operType,
                        attrName: 'ot',
                        dataKey: 'OPERATION_TYPE'
                    },
                    {
                        componentName: 'erdInput',
                        operator: 'like',
                        options: [],
                        value: '',
                        label: this.i18n.operDetails,
                        attrName: 'dij'
                    },
                    {
                        componentName: 'custom-select',
                        operator: 'eq',
                        options: [],
                        value: '',
                        label: this.i18n.operResult,
                        attrName: 'ss',
                        componentJson: JSON.stringify({
                            props: {
                                row: {
                                    componentName: 'constant-select',
                                    viewProperty: 'displayName',
                                    valueProperty: 'value',
                                    referenceList: [
                                        {
                                            displayName: this.i18n.success,
                                            value: 'success'
                                        },
                                        {
                                            displayName: this.i18n.lose,
                                            value: 'lose'
                                        }
                                    ]
                                }
                            }
                        })
                    },
                    {
                        componentName: 'erdDatePicker',
                        operator: 'eq', // 开始时间 gt  结束时间lt
                        options: [],
                        value: '',
                        label: this.i18n.operTime,
                        attrName: 'oti',
                        componentJson: JSON.stringify({
                            props: {
                                type: 'daterange'
                            }
                        })
                    }
                ];
            }
        },
        mounted() {
            this.getArchivis();
        },
        methods: {
            conditionChange(data) {
                let conditionList = [];
                delete this.tableSearchData.indexName;
                data.forEach((item) => {
                    if (item.attrName === 'lt') {
                        if (item.value1 !== 'none') {
                            this.tableSearchData.indexName = item.value1;
                        }
                    } else if (item.attrName === 'oti') {
                        conditionList.push({
                            fieldName: 'startMonth',
                            queryType: 'gt',
                            value: item.value1.split(',')[0]
                        });
                        conditionList.push({
                            fieldName: 'endMonth',
                            queryType: 'lt',
                            value: item.value1.split(',')[1]
                        });
                    } else if (item.attrName === 'ss') {
                        conditionList.push({
                            fieldName: item.attrName,
                            queryType: item.value1 === 'success' ? 'eq' : 'ne',
                            value: 200
                        });
                    } else {
                        conditionList.push({
                            fieldName: item.attrName,
                            queryType: item.oper.toLowerCase(),
                            value: item.value1
                        });
                    }
                });
                this.tableSearchData.conditionList = conditionList;
                this.$refs.famAdvancedTable?.fnRefreshTable();
            },
            diffHeightFn() {
                this.diffHeight = this.$refs?.famPageTitle?.$el?.offsetHeight || 0;
            },
            getArchivis() {
                this.$famHttp({
                    url: '/message/search',
                    data: {
                        className: 'erd.cloud.message.entity.EtOperationLogBackup',
                        pageIndex: 1,
                        pageSize: 500,
                        orderBy: 'startMonth',
                        sortBy: 'desc'
                    },
                    method: 'post'
                }).then(({ data = {} }) => {
                    const { records = [] } = data;
                    this.ltList = records.map((item) => {
                        let obj = {};
                        const { attrRawList = {} } = item;
                        attrRawList.forEach((ite) => {
                            obj[ite.attrName] = ite.value || '';
                        });
                        obj.displayName =
                            dayjs(obj.startMonth).format('YYYY-MM') + '~' + dayjs(obj.endMonth).format('YYYY-MM');
                        return obj;
                    });
                });
            },
            onExport() {
                this.$famHttp({
                    url: 'message/export',
                    data: {
                        businessName: 'OperationLogExport',
                        customParams: {
                            params: JSON.stringify(this.tableSearchData)
                        }
                    },
                    method: 'POST'
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18n.exporting,
                        showClose: true,
                        dangerouslyUseHTMLString: true
                    });
                });
            }
        }
    };
});
