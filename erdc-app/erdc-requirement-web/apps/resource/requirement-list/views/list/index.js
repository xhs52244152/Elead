define([
    'text!' + ELMP.resource('requirement-list/views/list/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'erdcloud.store',
    'css!' + ELMP.resource('requirement-list/views/list/style.css'),
    'css!' + ELMP.resource('ppm-style/global.css')
], function (template, store, utils, ErdcStore) {
    const ErdcKit = require('erdcloud.kit');
    return {
        name: 'requirementList',
        template,
        data() {
            return {
                i18nLocalePath: ELMP.resource('requirement-list/locale/index.js'),
                i18nMappingObj: {
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    deleteTipsInfo: this.getI18nByKey('deleteTipsInfo'),
                    deleteConfirm: this.getI18nByKey('deleteConfirm'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    notGroup: this.getI18nByKey('notGroup'),
                    group: this.getI18nByKey('group'),
                    kanban: this.getI18nByKey('kanban'),
                    list: this.getI18nByKey('list'),
                    tree: this.getI18nByKey('tree'),
                    layout: this.getI18nByKey('layout'),
                    requirementPool: this.getI18nByKey('requirementPool')
                },
                group: 'notGroup',
                groupOptions: [],
                layout: 'list',
                vm: null,
                isReady: false,
                tableData: [],
                treeRequestData: {
                    level: -1,
                    parentRef: 'OR:erd.cloud.ppm.require.entity.RequirementPool:1698587354582720513',
                    requirementLink: store.state.classNameMapping.requireLink
                },
                showOperate: true,
                baselineOid: '',
                containerOid: '',
                latestOid: ''
            };
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            SvgCircle: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SvgCircle/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            BaselineSelect: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/BaselineSelect/index.js')
            ),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js'))
        },
        computed: {
            layoutOptions() {
                // 工作台不需要树结构
                const isPortalWeb = window.__currentAppName__ === 'erdc-portal-web';
                const list = [
                    {
                        label: this.i18nMappingObj.list,
                        value: 'list'
                    }
                ];
                return isPortalWeb
                    ? list
                    : [
                          ...list,
                          {
                              label: this.i18nMappingObj.tree,
                              value: 'tree'
                          }
                      ];
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.className}#name`,
                        type: 'default'
                    },
                    {
                        prop: `${this.className}#planInfo.completionRate`,
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default'
                    }
                ];
            },
            className() {
                return store.state.classNameMapping.require;
            },
            viewOid() {
                return this.$refs.table.viewOid;
            },
            projectOid() {
                return this.$route.query.pid;
            },
            tableBaseConfig() {
                // 分组和树表格需要做treeNode处理
                if (this.group !== 'notGroup' || this.layout === 'tree') {
                    return {
                        'treeNode': `${this.className}#name`,
                        'treeConfig': {
                            hasChild: 'treeNode',
                            rowField: 'oid',
                            parentField: 'parentRef',
                            loadMethod: this.layout === 'tree' ? this.loadChildrenMethod : null,
                            lazy: true
                        },
                        'row-id': 'oid',
                        'showOverflow': true
                    };
                } else {
                    return {
                        showOverflow: true
                    };
                }
            },
            sceneName() {
                return this.$route.meta.sceneName || '';
            },
            routeName() {
                return ErdcStore.state.route.resources.identifierNo === 'erdc-requirement-web';
            },
            listTableConfig() {
                let _this = this;
                let { tableBaseConfig, tableKey, requestData, className } = this;
                let data = ErdcKit.deepClone(requestData);
                if (this.sceneName === 'projectRequirement' && this.baselineOid) {
                    data.conditionDtoList = [
                        {
                            attrName: `${this.className}#baselineMasterRef`,
                            oper: 'EQ',
                            value1: this.baselineOid
                        }
                    ];
                    data.baselined = true;
                }
                let config = {
                    tableKey,
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig,
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data,
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    if (_this.group !== 'notGroup') {
                                        let result = resData.data.records;
                                        _.each(result, (item) => {
                                            _.each(item.attrRawList, (attr) => {
                                                item[attr.attrName] = attr.displayName || '';
                                            });
                                        });
                                        let resp = [];
                                        _.each(_.groupBy(result, _this.group), (childs, key) => {
                                            resp.push({
                                                [`${_this.className}#name`]: key + `(${childs.length})`,
                                                //  用来判断是否是分组行
                                                isGroupRow: true,
                                                groupId: _this.group + ':' + key,
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
                            fuzzySearch: {
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: true,
                                className
                            },
                            actionConfig: {
                                name: _this.actionName,
                                containerOid: _this.containerOid,
                                className: _this.className,
                                objectOid: _this.projectOid
                            }
                        },
                        addOperationCol: this.showOperate, // 是否显示操作列

                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: _this.slotsField
                    }
                };
                return config;
            },
            treeTableConfig() {
                let _this = this;
                let {
                    tableBaseConfig,
                    treeRequestData: { level, parentRef, requirementLink }
                } = this;
                let config = {
                    tableKey: 'RequirementTreeView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig,
                        beforeRequest: function (config) {
                            config.data.pageSize = 10000;
                            return new Promise((resolve) => {
                                resolve(config);
                            });
                        },
                        tableRequestConfig: {
                            url: '/ppm/linkTree/childrenTree',
                            data: {
                                level,
                                parentRef,
                                typeName: requirementLink,
                                deleteNoPermissionData: true,
                                pageIndex: 1,
                                pageSize: 10000
                            },
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    let records = _this.formatData(resData.data?.childrenList || []);
                                    resData.data.records = records || [];
                                    _this.tableData = records;
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: false
                            },
                            actionConfig: {
                                name: 'PPM_REQUIREMENT_MENU_MODULE',
                                containerOid: _this.containerOid,
                                className: _this.className
                            }
                        },
                        pagination: {
                            showPagination: false
                        },

                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: _this.slotsField
                    }
                };
                return config;
            },
            viewTableConfig() {
                switch (this.layout) {
                    case 'list':
                        return this.listTableConfig;
                    case 'tree':
                        return this.treeTableConfig;
                    default:
                        return this.listTableConfig;
                }
            },
            enableScrollLoad() {
                if (this.rowKey !== 'oid') {
                    return false;
                } else {
                    return this.layout === 'list';
                }
            }
        },
        created() {
            this.getContainerRef();
        },
        mounted() {
            this.vm = this;
            this.rowKey = this.$route.meta.rowKey || 'oid';
            this.tableKey = this.$route.meta?.tableKey || 'RequirementView';
            let config = this.tableKey === 'ProjAssignReqView' ? { relationshipRef: this.projectOid } : {};
            this.requestData = _.isFunction(config) ? config(this) : config;
            this.actionName = this.$route.meta?.actionName || 'PPM_REQUIREMENT_MENU_MODULE';
            this.rowActionName = this.$route.meta?.rowActionName || 'PPM_REQUIRE_OPERATE_MENU';
            this.showOperate =
                typeof this.$route.meta?.showOperate === 'boolean' ? this.$route.meta?.showOperate : true;
            this.isReady = true;
        },
        methods: {
            getContainerRef() {
                this.$famHttp({
                    url: '/fam/peferences/RequirementPoolContainerRef',
                    method: 'GET'
                }).then((resp) => {
                    this.containerOid = resp.data;
                });
            },
            changeBaseline({ value, latestOid }) {
                this.baselineOid = value;
                this.latestOid = latestOid || ''; //操作选择基线对比时用到
                this.refresh();
            },
            getActionConfig(row) {
                return {
                    name: this.rowActionName,
                    objectOid: row[this.rowKey],
                    className: this.className
                };
            },
            renderTableCallback() {
                if (this.group !== 'notGroup') {
                    utils.getGroupData({
                        ref: 'table',
                        vm: this,
                        businessNameKey: `${this.className}#name`
                    });
                }
                let result = [];
                // 更新分组选项
                if (this.$refs.table) {
                    let tableInstance = this.$refs.table.getTableInstance('advancedTable');
                    let columns = tableInstance.instance.columns.filter(
                        (item) => item.attrName && item.attrName !== 'operation'
                    );
                    result = columns.map((item) => {
                        return { label: item.label, attrName: item.attrName };
                    });
                    result.unshift({
                        label: this.i18nMappingObj.notGroup,
                        attrName: 'notGroup'
                    });
                }
                this.groupOptions = result;
            },
            actionClick(data) {
                const eventClick = {
                    // PPM_REQUIREMENT_CREATE_MENU: this.create
                };
                eventClick[data.name] && eventClick[data.name]();
            },
            refresh() {
                this.$refs.table?.refreshTable('default');
            },
            openDetail(row) {
                !row.isGroupRow && utils.openDetail(row);
            },
            getCompletionRate(row, percentSign = '') {
                let percentKey = `${this.className}#planInfo.completionRate`;
                let percent = row[percentKey] ? (+row[percentKey]).toFixed(1) : 0;
                return percentSign ? percent + percentSign : percent / 100;
            },
            loadChildrenMethod({ row }) {
                let {
                    treeRequestData: { requirementLink },
                    viewOid
                } = this;
                return new Promise((resolve) => {
                    let params = {
                        parentRef: row.oid,
                        typeName: requirementLink,
                        tableViewRef: viewOid
                    };
                    this.$famHttp({
                        url: '/ppm/linkTree/children',
                        method: 'GET',
                        className: this.className,
                        params: params // 放在地址栏里
                    }).then((resp) => {
                        let data = resp.data || [];
                        this.loadChildIndex++;
                        this.setTableData(row.oid, this.formatData(data), this.tableData);
                        resolve(this.formatData(data));
                    });
                });
            },
            setTableData(oid, result, treeData = '') {
                for (let i = 0; i < treeData.length; i++) {
                    const node = treeData[i];
                    if (node.oid === oid) {
                        node.children = result;
                        break;
                    }
                    if (node.children && node.children.length > 0) {
                        this.setTableData(oid, result, node.children);
                    }
                }
            },
            formatData(data) {
                let result =
                    data?.map((item) => {
                        let attrData = {};
                        (item.attrRawList || []).forEach((item) => {
                            attrData[item.attrName] = item.displayName;
                        });
                        return Object.assign(attrData, item);
                    }) || [];
                return result;
            }
        }
    };
});
