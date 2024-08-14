define(['erdcloud.kit'], function (ErdcKit) {
    return {
        template: `
            <fam-view-table
                :view-table-config="viewTableConfig"
                :is-adaptive-height="false"
                :default-table-height="450"
                :enable-scroll-load="enableScrollLoad"
                ref="famViewTable"
                @action-click="handleActionClick"
                @callback="renderTableCallback"
            >
            </fam-view-table>
        `,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js'))
        },
        props: {
            changeViewTableConfig: Function,
            tableKey: String,
            viewTableBaseConfig: { type: Object, default: () => {} },
            changeOid: String,
            isSubmit: Boolean,
            tableData: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {};
        },
        computed: {
            viewTableConfig() {
                let _this = this;
                let { tableKey, fieldLinkConfig, actionConfig } = _this.viewTableBaseConfig;
                let config = {
                    tableKey,
                    viewMenu: {
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: true
                    },
                    saveAs: false,
                    tableConfig: {
                        vm: _this,
                        useCodeConfig: true,
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: {
                                relationshipRef: this.changeOid || ''
                            }
                        },
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true,
                                isLocalSearch: this.isSubmit, //launcher节点不需要要接口搜索
                                searchCondition: []
                            },
                            basicFilter: {
                                show: true
                            },
                            actionConfig
                        },

                        tableBaseEvent: {
                            // 'checkbox-all': _this.selectAllEvent,
                            // 'checkbox-change': _this.selectChangeEvent
                        },
                        fieldLinkConfig,
                        slotsField: [],
                        addOperationCol: false,
                        tableData: this.tableData.length ? this.tableData : null
                    }
                };
                return _.isFunction(this.changeViewTableConfig) ? this.changeViewTableConfig(config) : config;
            },
            enableScrollLoad() {
                return true;
            }
        },
        methods: {
            handleActionClick(data) {
                this.$emit('actionClick', data);
            },
            renderTableCallback() {
                this.$emit('callback', this.tableKey);
            }
        }
    };
});
