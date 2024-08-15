define([
    'erdcloud.kit',
    ELMP.resource('platform-storage/api.js'),
    'text!' + ELMP.resource('platform-storage/views/SyncRecord/index.html'),
    'css!' + ELMP.resource('platform-doc/site/pages/syncRecord/index.css')
], function (erdcloudKit, api, template) {
    return {
        template,
        components: {
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys([
                        'back',
                        'taskName',
                        'startTime',
                        'endTime',
                        'syncState',
                        'numberOfFiles',
                        'completedQuantity',
                        'exceptionInfo',
                        'syncRecord'
                    ])
                },
                tableHeight: document.body.clientHeight - 188,

                stateMap: {
                    '-1': '待执行',
                    '0': '执行中', //开始执行
                    '1': '执行中', // 正在执行，服务端定义的开始执行和执行中，对于用户来讲是不可感知的。因此状态都显示为执行中
                    '2': '成功',
                    '3': '失败'
                },
                stateTag: {
                    '-1': 'info',
                    '0': '',
                    '1': '',
                    '2': 'success',
                    '3': 'danger'
                }
            };
        },
        computed: {
            siteCode() {
                return this.$route.query.siteCode;
            },
            viewTableConfig() {
                const { i18nMappingObj, siteCode } = this;

                return {
                    firstLoad: true,
                    addSeq: true,
                    addCheckbox: true,
                    addOperationCol: false,
                    columns: [
                        {
                            attrName: 'taskName',
                            label: i18nMappingObj.taskName
                        },
                        {
                            attrName: 'createTime',
                            label: i18nMappingObj.startTime,
                            width: '120px'
                        },
                        {
                            attrName: 'updateTime',
                            label: i18nMappingObj.endTime,
                            width: '120px'
                        },
                        {
                            attrName: 'state',
                            label: i18nMappingObj.syncState,
                            width: '80px'
                        },
                        {
                            attrName: 'totalCount',
                            label: i18nMappingObj.numberOfFiles,
                            width: '120px'
                        },
                        {
                            attrName: 'overCount',
                            label: i18nMappingObj.completedQuantity,
                            width: '120px'
                        },
                        {
                            attrName: 'errMsg',
                            label: i18nMappingObj.exceptionInfo,
                            minWidth: '160px'
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'state',
                            type: 'default'
                        }
                    ],
                    tableBaseConfig: {
                        showOverflow: true, // 溢出隐藏显示省略号
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        rowConfig: {
                            keyField: 'id'
                        }
                    },
                    toolbarConfig: {
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        },
                        showConfigCol: true,
                        showMoreSearch: false
                    },
                    tableRequestConfig: {
                        url: api.url.site.syncRecord + `/${siteCode}`
                    },
                    pagination: {
                        showPagination: true,
                        pageSize: 20
                    }
                };
            }
        },
        methods: {
            // 返回
            goBack() {
                this.$router.back();
            },
            refreshTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            }
        }
    };
});
