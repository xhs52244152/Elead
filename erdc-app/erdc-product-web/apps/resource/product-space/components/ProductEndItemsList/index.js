define([
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'text!' + ELMP.resource('product-space/components/ProductEndItemsList/index.html'),
    'css!' + ELMP.resource('product-space/components/ProductEndItemsList/index.css')
], function (cbbUtils, template) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('pdmProductStore');
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ProductEndItemsList',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('product-space/locale/index.js')
            };
        },
        computed: {
            ...mapGetters(['getObjectMapping']),
            // 成品列表视图映射
            endItemsProductMapping() {
                return this.getObjectMapping({ objectName: 'endItemsProduct' });
            },
            masterRefKey() {
                return `${this.endItemsProductMapping?.className}#endMasterItem`;
            },
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: this.endItemsProductMapping?.tableKey, // UserViewTable productViewTable
                    tableConfig: this.tableConfig
                };
            },
            slotsField() {
                return [
                    {
                        // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        prop: 'operation', // 当前字段使用插槽
                        type: 'default',
                        _key: 'operation',
                        endItemKey: this.masterRefKey
                    },
                    {
                        prop: `${this.endItemsProductMapping?.className}#name`, // 当前字段使用插槽
                        type: 'default',
                        _key: 'name',
                        endItemKey: this.masterRefKey
                    },
                    {
                        prop: `${this.endItemsProductMapping?.className}#version`, // 当前字段使用插槽
                        type: 'default',
                        _key: 'version'
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField?.map((item) => ({
                    ...item,
                    slotName: `column:${item.type}:${item.prop}:content`
                }));
            },
            // 高级表格配置
            tableConfig() {
                return {
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        data: {
                            conditionDtoList: [
                                {
                                    attrName: `${this.endItemsProductMapping?.className}#endItem`,
                                    oper: 'EQ',
                                    logicalOperator: 'AND',
                                    sortOrder: 0,
                                    isCondition: true,
                                    value1: 'true'
                                }
                            ],
                            containerRef: this.$store.state.space?.context?.oid
                        } // body参数
                        // params: {} // query参数
                    },
                    toolbarConfig: {
                        basicFilter: {
                            show: true
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            this.enterProductSpace(row, 'false');
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: '116px'
                    },
                    slotsField: this.slotsField
                };
            }
        },
        methods: {
            getEndItemMasterStatus(row) {
                return row.attrRawList.find((item) => item.attrName === this.masterRefKey)?.value;
            },
            handleUpdateEndItemStatus(row) {
                const data = {
                    masterRef: row.masterRef,
                    isEndMasterItem: !this.getEndItemMasterStatus(row)
                };
                this.$famHttp({
                    url: `/part/editPartEndMasterItem?masterRef=${data.masterRef}&isEndMasterItem=${data.isEndMasterItem}`,
                    method: 'post',
                    className: this.endItemsProductMapping?.className
                }).then((res) => {
                    if (res && res.success) {
                        this.$message.success(this.i18n['更新成功']);
                        this.$refs['famViewTable'].refreshTable();
                    }
                });
            },
            // eslint-disable-next-line no-unused-vars
            enterProductSpace(row, flag) {
                cbbUtils.goToDetail(row, {
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        })
                    }
                });
            }
        }
    };
});
