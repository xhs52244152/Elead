define(['text!' + ELMP.resource('supplier-list/index.html'), 'vuex', 'erdc-kit', 'underscore'], function (template) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('pdmSupplierStore');
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        name: 'SupplierList',
        template,
        components: {
            FamSecondaryMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamSecondaryMenu/index.js')),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('supplier-list/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['请输入搜索关键词', 'create', 'edit', 'copy', 'saveas']),
                // 高级表格默认参数
                defaultParams: {},
                // 是否是列表
                isList: true,
                // 实例本身
                vm: null
            };
        },
        computed: {
            ...mapGetters(['getViewTableMapping']),
            // 供应商视图映射
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: 'supplier' });
            },
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: this.viewTableMapping?.tableKey, // UserViewTable productViewTable
                    tableConfig: this.tableConfig
                };
            },
            // 高级表格配置
            tableConfig() {
                return {
                    vm: this.vm,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        defaultParams: this.defaultParams // body参数
                    },
                    toolbarConfig: {
                        // fuzzySearch: {
                        //     show: true, // 是否显示普通模糊搜索，默认显示
                        //     placeholder: this.i18nMappingObj['请输入搜索关键词'], // 输入框提示文字，默认请输入
                        //     clearable: true,
                        //     width: '320'
                        // },
                        basicFilter: {
                            show: true
                        },
                        // 产品库跟供应商共用一个操作按钮
                        actionConfig: {
                            name: this.viewTableMapping?.actionToolBarName,
                            containerOid: this.$store.state.space?.context?.oid || '',
                            className: this.viewTableMapping?.className
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            this.enterSupplierSpace(row);
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: '60px'
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
                                _.each(arr, (item) => {
                                    let [sitem = {}] = item?.$refs?.actionPulldown || [];
                                    sitem.hide && sitem.hide();
                                });
                            });
                        }, 100)
                    }
                };
            }
        },
        mounted() {
            this.vm = this;
        },
        methods: {
            // 进入供应商空间
            enterSupplierSpace(row) {
                return this.$router.push({
                    name: 'supplierSpace',
                    params: {
                        pid: row.oid
                    },
                    query: {
                        title: row?.[`${this?.viewTableMapping?.className}#name`] || ''
                    }
                });
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: this.viewTableMapping?.actionTableName,
                    objectOid: row.oid,
                    className: this.viewTableMapping?.className
                };
            }
        }
    };
});
