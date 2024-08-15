define(['text!' + ELMP.resource('product-list/index.html')], function (template) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('pdmProductStore');
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        name: 'ProductList',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamSecondaryMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamSecondaryMenu/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('product-space/locale/index.js'),
                vm: this
            };
        },
        computed: {
            ...mapGetters(['getObjectMapping']),
            // 产品库视图映射
            productMapping() {
                return this.getObjectMapping({ objectName: 'product' });
            },
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: this.productMapping?.tableKey, // UserViewTable productViewTable
                    tableConfig: this.tableConfig
                };
            },
            // 高级表格配置
            tableConfig() {
                return {
                    vm: this.vm,
                    toolbarConfig: {
                        basicFilter: {
                            show: true
                        },
                        actionConfig: {
                            name: this.productMapping?.actionToolBarName, //操作按钮的内部名称
                            containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                            className: this.productMapping?.className //维护到store里
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            this.enterProductSpace(row);
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: window.LS.get('lang_current') === 'en_us' ? 100 : 70
                    },
                    slotsField: [
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ],
                    tableBaseEvent: {
                        scroll: _.throttle(() => {
                            let arr =
                                _.chain(this.$refs)
                                    .pick((value, key) => key.indexOf('famActionPulldown') > -1)
                                    .values()
                                    .value() || [];
                            this.$nextTick(() => {
                                _.each(arr, (operationComp) => {
                                    try {
                                        const [actionPulldownRef] = operationComp?.$refs?.actionPulldown || [];
                                        actionPulldownRef && actionPulldownRef.hide && actionPulldownRef.hide();
                                    } catch (e) {}
                                });
                            });
                        }, 100)
                    }
                };
            }
        },
        activated() {
            this.refresh();
        },
        methods: {
            enterProductSpace(row) {
                this.$router.push({
                    path: '/space/product-space/detail',
                    query: {
                        pid: row.oid
                        // isTemplate: false
                    }
                });
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: this.productMapping?.actionTableName,
                    objectOid: row.oid,
                    className: this.productMapping?.className
                };
            },
            refresh() {
                this.$refs.famViewTable?.refreshTable('default');
            }
        }
    };
});
