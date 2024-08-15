define([
    'text!' + ELMP.resource('erdc-pdm-components/BomView/index.html'),
    'css!' + ELMP.resource('erdc-pdm-components/BomView/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');
    return {
        name: 'BomView',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        props: {
            className: [String],
            // 通用页面父组件的实例
            vm: [Object],
            // 左侧树选择的节点数据
            info: [Object]
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-pdm-components/BomView/locale/index.js'),
                self: null,
                bomViewClassName: 'erd.cloud.pdm.part.entity.EtPartBomView',
                partMasterRef: ''
            };
        },
        watch: {
            info: {
                handler(newVal) {
                    if (newVal) {
                        this.partMasterRef = newVal?.masterRef;
                        this.$refs.famViewTable?.refreshTable();
                    }
                },
                deep: true,
                immediate: true
            }
        },
        computed: {
            slotsField() {
                return [
                    {
                        prop: 'operation',
                        type: 'default'
                    },
                    {
                        prop: `${this.bomViewClassName}#version`,
                        type: 'default'
                    }
                ];
            },
            viewTableConfig() {
                const { partMasterRef } = this;
                const tableConfig = {
                    tableKey: 'partBomView',
                    viewMenu: {
                        showViewManager: false
                    },
                    tableConfig: {
                        vm: this,
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            //url: `/part-yty/view/table/page`, // 表格数据接口
                            //unSubPrefix: true,
                            data: {
                                conditionDtoList: [
                                    {
                                        attrName: `${this.bomViewClassName}#partMasterRef`,
                                        oper: 'EQ',
                                        value1: partMasterRef,
                                        logicalOperator: 'AND',
                                        isCondition: true
                                    }
                                ]
                            },
                            transformResponse: [
                                (respData) => {
                                    let resData = JSON.parse(respData);
                                    return resData;
                                }
                            ]
                        },
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false, // 是否显示普通模糊搜索，默认显示
                                placeholder: this.i18n['请输入'], // 输入框提示文字，默认请输入
                                clearable: true,
                                width: '320'
                            },
                            actionConfig: {
                                name: 'PART_BOM_VIEW_LIST_OPERATE',
                                containerOid: this.$store.state.space?.context?.oid || '',
                                className: this.className,
                                objectOid: this.$route.query.oid
                            }
                        },
                        fieldLinkConfig: {},
                        pagination: {
                            // 分页
                            showPagination: false // 是否显示分页
                        },
                        slotsField: this.slotsField
                    }
                };
                return tableConfig;
            }
        },
        mounted() {
            this.self = this;
        },
        methods: {
            getActionConfig(row) {
                return {
                    name: 'PART_BOM_VIEW_OPERATE',
                    objectOid: row.oid,
                    className: this.className
                };
            }
        }
    };
});
