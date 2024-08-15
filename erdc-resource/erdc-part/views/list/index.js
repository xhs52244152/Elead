define(['text!' + ELMP.func('erdc-part/views/list/index.html'), ELMP.func('erdc-part/config/viewConfig.js')], function (
    template,
    partCfg
) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'PartList',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BatchSetValue: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/BatchSetValue/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-part/locale/index.js'),
                setValue: {
                    visible: false,
                    tableData: []
                },
                vm: this
            };
        },
        computed: {
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            partViewTableMap() {
                return partCfg.partViewTableMap;
            },
            viewTableConfig() {
                return {
                    // 视图表格定义的内部名称
                    tableKey: 'partForm',
                    tableConfig: {
                        vm: this,
                        actionCustomParams: {
                            inTable: true,
                            isBatch: true
                        },
                        tableRequestConfig: {
                            data: {
                                containerRef: this.$route.query.pid ? this.containerRef : ''
                            }
                        },
                        toolbarConfig: {
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: this.partViewTableMap.toolBarActionName, //操作按钮的内部名称
                                containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                                className: this.partViewTableMap.className,
                                skipValidator: true
                            }
                        },
                        tableBaseConfig: {
                            checkboxConfig: {
                                checkMethod({ row }) {
                                    return row.accessToView;
                                }
                            }
                        },
                        columnWidths: {
                            operation: window.LS.get('lang_current') === 'en_us' ? 100 : 70
                        },
                        addSeq: true,
                        addCheckbox: true,
                        addIcon: true,
                        addOperationCol: true, // 是否显示操作列
                        slotsField: this.slotsField,
                        fieldLinkConfig: {
                            fieldLink: true, // 是否添加列超链接
                            fieldLinkName: `${partCfg.partViewTableMap.className}#identifierNo`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                row?.accessToView && this.handleNoClick(row);
                            }
                        }
                    }
                };
            },
            slotsField() {
                return [
                    {
                        prop: 'operation',
                        type: 'default'
                    },
                    {
                        prop: 'icon',
                        type: 'default'
                    }
                ];
            }
        },
        activated() {
            this.refresh();
        },
        methods: {
            setValueSuccess() {
                this.setValue.tableData = [];
                this.setValue.visible = false;
                this.refresh();
            },
            getActionConfig(row) {
                return {
                    name: partCfg.partViewTableMap.rowActionName,
                    objectOid: row.oid,
                    className: partCfg.partViewTableMap.className
                };
            },
            handleNoClick(row) {
                if (!row.oid) return;
                const lifecycleStatus =
                    _.find(row?.attrRawList, (item) => new RegExp('lifecycleStatus.status$').test(item?.attrName)) ||
                    {};

                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                // 如果是草稿就跳转到编辑页面
                if (lifecycleStatus && lifecycleStatus.value === 'DRAFT') {
                    this.$router.push({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/edit`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: row.oid,
                            origin: 'list'
                        }
                    });
                } else {
                    this.$router.push({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: row.oid
                        }
                    });
                }
            },
            //刷新列表
            refresh() {
                this.$refs.famViewTable?.getTableInstance('advancedTable', 'refreshTable')('default');
            }
        }
    };
});
