define([
    'text!' + ELMP.resource('advanced-search/views/GlobalSearchList/index.html'),
    ELMP.resource('advanced-search/advancedSearchMixin.js'),
    'css!' + ELMP.func('advanced-search/styles/style.css')
], function (template, advancedSearchMixin) {
    const erdcloudKit = require('erdcloud.kit');

    return {
        mixins: [advancedSearchMixin],
        template,
        components: {
            GlobalSearchConditions: erdcloudKit.asyncComponent(
                ELMP.resource('advanced-search/views/GlobalSearchConditions/index.js')
            ),
            FamExport: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('advanced-search/locale/index.js'),
                i18nMappingObj: {},
                totolRecords: '',
                viewOid: '',
                exportVisible: false,
                exportRequestConfig: {}
            };
        },
        watch: {
            '$route.query': {
                immediate: true,
                handler(val) {
                    if (val) {
                        const { mainModelType, searchKey, searchType, currentHistoryObj } = val;
                        this.storeCommit('mainModelType', mainModelType);
                        this.storeCommit('searchKey', searchKey);
                        this.storeCommit('searchType', searchType);
                        this.storeCommit('currentHistoryObj', currentHistoryObj);

                        let { conditionsList, originConditionsList } = val;
                        try {
                            conditionsList = JSON.parse(decodeURIComponent(conditionsList));
                            originConditionsList = JSON.parse(decodeURIComponent(originConditionsList));
                        } catch (error) {
                            console.error(error);
                            conditionsList = [];
                            originConditionsList = [];
                        }
                        this.storeCommit('conditionsList', conditionsList);
                        this.storeCommit('originConditionsList', originConditionsList);
                        this.refreshTable();
                    }
                }
            },
            tableViews: {
                immediate: true,
                handler(val, oval) {
                    if (!_.isEqual(val, oval)) {
                        this.viewList = val || [];
                        this.viewOid = val[0]?.oid;
                    }
                }
            },
            viewOid: {
                immediate: true,
                handler(val) {
                    const viewTableRef = this.$refs.famViewTable;
                    if (val && viewTableRef) {
                        viewTableRef.fnViewChange({ oid: val });
                    }
                }
            }
        },
        computed: {
            viewTableConfig() {
                return {
                    tableKey: this.tableKey,
                    tableConfig: {
                        tableRequestConfig: {
                            defaultParams: {
                                conditionDtoList: this.searchType === 'conditionDtoSearch' ? this.conditionDtoList : []
                            },
                            method: 'post',
                            data: {
                                className: this.mainModelType,
                                searchKey: this.searchType === 'inputSearch' ? this.searchKey : ''
                            },
                            transformResponse: [
                                (data) => {
                                    let resData;
                                    try {
                                        const parseData = data && JSON.parse(data);
                                        const requestConfig = this.$refs?.famViewTable?.getTableInstance(
                                            'advancedTable',
                                            'requestConfig'
                                        );
                                        
                                        // 查询结果个数只从第一页返回值中获取
                                        if (requestConfig?.data?.pageIndex === 1) {
                                            this.totolRecords = parseData?.data?.total;
                                        }
                                        resData = parseData;
                                    } catch (error) {
                                        resData = data;
                                    }
                                    return resData;
                                }
                            ]
                        },
                        isDeserialize: true,
                        firstLoad: true,
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false
                            }
                        },
                        headerRequestConfig: {
                            method: 'POST',
                            data: {
                                className: this.mainModelType
                            }
                        },
                        sortFixRight: true,
                        fieldLinkConfig: {
                            fieldLink: true
                        },
                        slotsField: [
                            {
                                prop: 'icon',
                                type: 'default'
                            }
                        ],
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
                        }
                    }
                };
            }
        },
        created() {
            this.storeDispatch({ action: 'getTableViews', key: 'tableViews' });
        },
        mounted() {
            document.addEventListener('click', this.setFormVisible);
        },
        destroyed() {
            document.removeEventListener('click', this.setFormVisible);
        },
        methods: {
            onGlobalSearch() {
                this.refreshTable();
            },
            refreshTable() {
                setTimeout(() => {
                    this.$refs.famViewTable?.getTableInstance(
                        'advancedTable',
                        'refreshTable'
                    )({ conditions: 'default' });
                }, 500);
            },
            handlerBatchExport() {
                this.exportVisible = true;
                const exportRequestConfig = this.$refs?.famViewTable?.getTableInstance(
                    'advancedTable',
                    'requestConfig'
                );
                const advancedTable = this.$refs?.famViewTable?.getTableInstance('advancedTable', 'instance');
                const exportFields =
                    advancedTable?.columns?.filter((item) => !item.extraCol).map((item) => item.attrName) || [];
                let tableSearchDto = exportRequestConfig?.data || {};
                delete tableSearchDto.asyncQueryId;
                this.exportRequestConfig = {
                    data: {
                        className: this.mainModelType,
                        exportFields,
                        tableSearchDto
                    }
                };
            },
            handlerDialogSuccess(dialogVisible, refreshTable) {
                this.exportVisible = dialogVisible;
                if (refreshTable) {
                    this.refreshTable();
                }
            },
            setFormVisible(e) {
                if (e.target.className.includes('erd-icon-forbidden')) {
                    return;
                }
                const searchListConditions = document.querySelector('.search-list-conditions');
                const globalSearchMessageBox = document.querySelector('.global-search-message-box');
                const advancedGroupConfirmBox = document.querySelector('.advanced-group-confirm-box');
                const isContainsTarget = [searchListConditions, globalSearchMessageBox, advancedGroupConfirmBox].some(
                    (item) => item?.contains(e.target)
                );
                if (!isContainsTarget) {
                    this.storeCommit('showMoreConditions', false);
                }
            }
        }
    };
});
