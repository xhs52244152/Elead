define(['text!' + ELMP.resource('library-list/index.html')], function (template) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('pdmLibraryStore');
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        name: 'LibraryList',
        template,
        components: {
            FamSecondaryMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamSecondaryMenu/index.js')),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('library-space/locale/index.js'),
                // 实例本身
                vm: this
            };
        },
        computed: {
            ...mapGetters(['getObjectMapping']),
            // 资源库视图映射
            libraryMapping() {
                return this.getObjectMapping({ objectName: 'library' });
            },
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: this.libraryMapping?.tableKey, // UserViewTable productViewTable
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
                        // 产品库跟资源库共用一个操作按钮
                        actionConfig: {
                            name: this.libraryMapping?.actionToolBarName,
                            containerOid: this.$store.state.space?.context?.oid || '',
                            className: this.libraryMapping?.className
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            this.enterLibrarySpace(row);
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
        activated() {
            this.refresh();
        },
        methods: {
            // 进入资源库空间
            enterLibrarySpace(row) {
                return this.$router.push({
                    path: '/space/library-space/detail',
                    query: {
                        pid: row.oid
                    }
                });
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: this.libraryMapping?.actionTableName,
                    objectOid: row.oid,
                    className: this.libraryMapping?.className
                };
            },
            refresh() {
                this.$refs.famViewTable?.refreshTable('default');
            }
        }
    };
});
