define([
    'text!' + ELMP.func('erdc-workspace/views/list/index.html'),
    ELMP.func('erdc-workspace/config/viewConfig.js'),
    ELMP.resource('erdc-pdm-components/CoDesignConfig/index.js')
], function (template, viewConfig, coDesignConfig) {
    const ErdcKit = require('erdc-kit');
    // 判断codesign环境
    const { isDesktop, getMainWorkSpace } = coDesignConfig;

    return {
        name: 'WorkspaceList',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js')),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/SimpleSelect/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-workspace/locale/index.js'),
                vm: this,
                group: 'notGroup',
                groupOptions: [],
                mainWorkSpaceOid: ''
            };
        },
        created() {
            // 获取某个主工作区(codesign方法)
            getMainWorkSpace.call(this);
        },
        computed: {
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            tableBaseConfig() {
                const tableBaseConfig = {
                    showOverflow: true
                };
                // 分组和树表格需要做treeNode处理
                if (this.group !== 'notGroup') {
                    return {
                        ...tableBaseConfig,
                        treeNode: `${viewConfig.workspaceViewTableMap.className}#name`,
                        treeConfig: {
                            hasChild: 'treeNode',
                            rowField: 'oid',
                            parentField: 'parentRef',
                            loadMethod: null,
                            lazy: true
                        },
                        rowId: 'oid'
                    };
                }
                return tableBaseConfig;
            },
            viewTableConfig() {
                return {
                    // 视图表格定义的内部名称
                    tableKey: 'WorkspaceView',
                    tableConfig: {
                        vm: this.vm,
                        actionCustomParams: {
                            inTable: true,
                            isBatch: true
                        },
                        tableBaseConfig: this.tableBaseConfig,
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            data: {
                                containerRef: this.$route.query.pid ? this.containerRef : ''
                            },
                            // 更多配置参考axios官网
                            transformResponse: [
                                (data) => {
                                    let resData = JSON.parse(data);
                                    if (this.group !== 'notGroup') {
                                        let result = resData.data.records;
                                        _.each(result, (item) => {
                                            _.each(item.attrRawList, (attr) => {
                                                item[attr.attrName] = attr.displayName || '';
                                            });
                                        });
                                        let resp = [];
                                        _.each(_.groupBy(result, this.group), (childs, key) => {
                                            resp.push({
                                                [`${viewConfig.workspaceViewTableMap.className}#name`]:
                                                    key + `(${childs.length})`,
                                                //  用来判断是否是分组行
                                                isGroupRow: true,
                                                children: childs
                                            });
                                        });
                                        resData.data.records = resp;
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 基础筛选
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: viewConfig.workspaceViewTableMap.toolBarActionName, //操作按钮的内部名称
                                containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                                className: viewConfig.workspaceViewTableMap.className,
                                skipValidator: true
                            }
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                            operation: window.LS.get('lang_current') === 'en_us' ? 100 : 70
                        },
                        addSeq: true,
                        addCheckbox: true,
                        addIcon: true,
                        addOperationCol: true, // 是否显示操作列
                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: [
                            {
                                prop: 'operation',
                                type: 'default'
                            },
                            {
                                prop: 'icon',
                                type: 'default'
                            },
                            {
                                prop: `${viewConfig.workspaceViewTableMap.className}#name`,
                                type: 'default'
                            }
                        ]
                    },
                    actionConfig: {
                        PDM_WORKSPACE_LIST_CREATE: {
                            actionName: 'add'
                        },
                        PDM_WORKSPACE_LIST_DELETE: {
                            actionName: 'delete'
                        }
                    }
                };
            }
        },
        activated() {
            this.refresh();
            // 获取某个主工作区(codesign方法)
            getMainWorkSpace.call(this);
        },
        methods: {
            refresh() {
                this.$refs.famViewTable?.refreshTable('default');
            },
            renderTableCallback() {
                let result = [];
                // 更新分组选项
                if (this.$refs.famViewTable) {
                    let tableInstance = this.$refs.famViewTable.getTableInstance('advancedTable');
                    let columns = tableInstance.instance.columns.filter(
                        (item) => item.attrName && item.attrName !== 'operation'
                    );
                    result = columns.map((item) => {
                        return { label: item.label, attrName: item.attrName };
                    });
                    result.unshift({
                        label: this.i18n.notGroup,
                        attrName: 'notGroup'
                    });
                }
                this.groupOptions = result;
            },
            getActionConfig(row) {
                return {
                    name: isDesktop
                        ? coDesignConfig.codesignWorkspaceViewTableMap.rowActionName
                        : viewConfig.workspaceViewTableMap.rowActionName,
                    objectOid: row.oid,
                    className: viewConfig.workspaceViewTableMap.className
                };
            },
            handleNoClick(row) {
                if (!row.oid || row.oid.search(':') < 0) {
                    return;
                }
                this.$router.push({
                    path: 'workspace/detail',
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid: row.oid,
                        activeName: 'relationObj'
                    }
                });
            }
        }
    };
});
