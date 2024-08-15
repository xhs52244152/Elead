define([
    'text!' + ELMP.resource('platform-dev-ops/views/ApiLog/index.html'),
    'css!' + ELMP.resource('platform-dev-ops/views/ApiLog/style.css')
], function (template) {
    const erdcloudKit = require('erdcloud.kit');
    const dayjs = require('dayjs');
    return {
        template,
        components: {
            famAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            apiLogDetail: erdcloudKit.asyncComponent(
                ELMP.resource('platform-dev-ops/components/ApiLogDetail/index.js')
            ),
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-dev-ops/locale/index.js'),
                i18nMappingObj: {
                    timestamp: this.getI18nByKey('timestamp'),
                    appName: this.getI18nByKey('appName'),
                    clientIp: this.getI18nByKey('clientIp'),
                    traceId: this.getI18nByKey('traceId'),
                    spanId: this.getI18nByKey('spanId'),
                    interfaceName: this.getI18nByKey('interfaceName'),
                    methodName: this.getI18nByKey('methodName'),
                    tenantId: this.getI18nByKey('tenantId'),
                    userId: this.getI18nByKey('userId'),
                    takeTime: this.getI18nByKey('takeTime'),
                    status: this.getI18nByKey('status'),
                    detail: this.getI18nByKey('detail'),
                    operation: this.getI18nByKey('operation'),
                    normal: this.getI18nByKey('normal'),
                    systemAnomaly: this.getI18nByKey('systemAnomaly'),
                    businessException: this.getI18nByKey('businessException'),
                    fuzzySearchTip: this.getI18nByKey('fuzzySearchTip'),
                    takeTimeTip: this.getI18nByKey('takeTimeTip'),
                    statusTip: this.getI18nByKey('statusTip')
                },
                searchKey: '',
                takeTime: '',
                status: '',
                dialogVisible: false,
                currentRow: {}
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            statusEnum() {
                const tempEnum = ['normal', 'systemAnomaly', 'businessException'];
                return tempEnum.map((item, index) => {
                    return {
                        label: this.i18nMappingObj[item],
                        value: index
                    };
                });
            },
            viewTableConfig: function () {
                const { i18nMappingObj } = this;
                return {
                    firstLoad: true,
                    tableRequestConfig: {
                        url: '/index/index/findPage',
                        data: this.tableRequestConfigData,
                        method: 'post',
                        isFormData: false,
                        transformResponse: [
                            (data) => {
                                let resData = data;
                                try {
                                    resData = data && JSON.parse(data);
                                    resData.data.records = resData.data.content.map((item) => {
                                        const statusEnum = {
                                            0: 'normal',
                                            1: 'systemAnomaly',
                                            2: 'businessException'
                                        };
                                        item['@timestamp'] = dayjs(item['@timestamp']).format('YYYY-MM-DD HH:mm:ss');
                                        item['status'] = this.i18nMappingObj[statusEnum[item['status']]];
                                        return item;
                                    });
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    tableBaseConfig: {
                        showOverflow: true,
                        columnConfig: {
                            resizable: true
                        }
                    },
                    columns: [
                        {
                            attrName: '@timestamp',
                            label: i18nMappingObj.timestamp,
                            width: '150',
                            fixed: 'left'
                        },
                        {
                            attrName: 'interfaceName',
                            label: i18nMappingObj.interfaceName,
                            width: '350'
                        },
                        {
                            attrName: 'methodName',
                            label: i18nMappingObj.methodName,
                            width: '200'
                        },
                        {
                            attrName: 'status',
                            label: i18nMappingObj.status,
                            width: '80'
                        },
                        {
                            attrName: 'takeTime',
                            label: i18nMappingObj.takeTime,
                            width: '100',
                            align: 'right'
                        },
                        {
                            attrName: 'userId',
                            label: i18nMappingObj.userId
                        },
                        {
                            attrName: 'tenantId',
                            label: i18nMappingObj.tenantId,
                            width: '80'
                        },
                        {
                            attrName: 'appName',
                            label: i18nMappingObj.appName
                        },
                        {
                            attrName: 'clientIp',
                            label: i18nMappingObj.clientIp
                        },
                        {
                            attrName: 'traceId',
                            label: i18nMappingObj.traceId
                        },
                        {
                            attrName: 'spanId',
                            label: i18nMappingObj.spanId
                        },
                        {
                            attrName: 'operation',
                            label: i18nMappingObj.operation,
                            width: '60',
                            fixed: 'right'
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
                    slotsField: [
                        {
                            prop: 'displayMode',
                            type: 'default'
                        },
                        {
                            prop: 'noticeState',
                            type: 'default'
                        },
                        {
                            prop: 'createTime',
                            type: 'default'
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ],
                    pagination: {
                        showPagination: true,
                        indexKey: 'page',
                        sizeKey: 'size',
                        pageSize: 20
                    }
                };
            },
            tableRequestConfigData() {
                let conditionList = [
                    {
                        fieldName: 'logType.keyword',
                        queryType: 'eq',
                        value: 'interfaceLog'
                    }
                ];
                if (this.searchKey !== '') {
                    const searchFileList = ['interfaceName', 'methodName', 'traceId', 'appName', 'userId'];
                    const conditions = searchFileList.map((item) => {
                        return {
                            conditionList: [
                                {
                                    fieldName: `${item}.keyword`,
                                    queryType: item === 'interfaceName' ? 'likeRight' : 'eq',
                                    value: this.searchKey
                                }
                            ]
                        };
                    });
                    conditionList.push({
                        queryType: 'or',
                        conditionList: conditions
                    });
                }
                if (this.takeTime !== '') {
                    conditionList.push({
                        fieldName: 'takeTime',
                        queryType: 'gt',
                        value: Number.isNaN(this.takeTime) ? '' : this.takeTime
                    });
                }
                if (this.status !== '') {
                    conditionList.push({
                        fieldName: 'status',
                        queryType: 'eq',
                        value: this.status
                    });
                }
                return {
                    indexName: 'erd_log_index',
                    page: 1,
                    size: 20,
                    searchCount: true,
                    sortList: [['desc', '@timestamp']],
                    conditionList
                };
            }
        },
        created() {},
        methods: {
            showDetail(row) {
                this.currentRow = row;
                this.dialogVisible = true;
            },
            handleFilterChange() {
                this.$nextTick(() => {
                    this.$refs.famAdvancedTable.fnCurrentPageChange(1);
                });
            }
        }
    };
});
