define([
    ELMP.resource('ppm-store/index.js'),
    'text!' + ELMP.resource('project-handle-task/components/HandleTaskList/index.html'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.resource('project-handle-task/components/HandleTaskList/index.css'),
    'css!' + ELMP.resource('ppm-style/global.css')
], function (store, template, commonHttp, utils) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {
            type: {
                type: String,
                default: 'normal'
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            FamAssociationObject: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAssociationObject/index.js')
            ),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js'))
        },
        data() {
            return {
                groupOptions: [],
                groupAttrName: 'notGroup',
                i18nLocalePath: ELMP.resource('project-handle-task/locale/index.js'),
                i18nMappingObj: {
                    notGroup: this.getI18nByKey('notGroup'),
                    group: this.getI18nByKey('group'),
                    deleteTipsInfo: this.getI18nByKey('deleteTipsInfo'),
                    deleteConfirm: this.getI18nByKey('deleteConfirm'),
                    cancel: this.getI18nByKey('cancel'),
                    confirm: this.getI18nByKey('confirm'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    successfullyAdded: this.getI18nByKey('successfullyAdded'),
                    successfullyRemoved: this.getI18nByKey('successfullyRemoved'),
                    removeConfirm: this.getI18nByKey('removeConfirm'),
                    removeTipsInfo: this.getI18nByKey('removeTipsInfo'),
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    edit: this.getI18nByKey('edit')
                },
                nameField: 'erd.cloud.ppm.plan.entity.DiscreteTask#name',
                showDialog: false,
                checkData: [],
                relateClassName: 'erd.cloud.ppm.common.entity.BusinessLink',
                extendParams: {
                    data: { deleteNoPermissionData: true }
                }
            };
        },
        watch: {
            '$route.query.needRefreshTable': {
                handler(val) {
                    val && this.refresh();
                    this.$router.replace({
                        path: this.$route.path,
                        query: { ...this.$route.query, needRefreshTable: false }
                    });
                }
            }
        },
        computed: {
            vm() {
                return this;
            },
            className() {
                return store.state.classNameMapping.DiscreteTask;
            },
            oid() {
                return this.$route.query.oid || '';
            },
            // 是否项目下独立的“督办”菜单
            isInProjectMenu() {
                return this.type === 'inProjectMenu';
            },
            leftTableColumns() {
                let { i18nMappingObj } = this;
                return [
                    {
                        minWidth: '40',
                        width: '40',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        prop: 'seq',
                        type: 'seq',
                        title: ' ',
                        width: 48,
                        align: 'center'
                    },
                    {
                        prop: 'icon',
                        minWidth: '48',
                        width: '48',
                        align: 'center'
                    },
                    {
                        prop: 'identifierNo',
                        title: i18nMappingObj.code,
                        width: 140
                    },
                    {
                        prop: 'name',
                        title: i18nMappingObj.name,
                        width: 200
                    },
                    {
                        prop: 'typeReference',
                        title: i18nMappingObj.type,
                        width: 100
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: i18nMappingObj.status,
                        width: 80
                    }
                ];
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: this.nameField,
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.DiscreteTask#planInfo.description',
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default'
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
            tableBaseConfig() {
                return this.groupAttrName === 'notGroup'
                    ? {
                          showOverflow: true
                      }
                    : {
                          'treeNode': 'erd.cloud.ppm.plan.entity.DiscreteTask#name',
                          'treeConfig': {
                              hasChild: 'treeNode',
                              rowField: 'oid',
                              parentField: 'parentRef'
                          },
                          'row-id': 'oid',
                          'showOverflow': true
                      };
            },
            tableConfig() {
                let tableConfig = {
                    tableKey: {
                        handleTask: 'DiscreteTaskView',
                        related: 'ActiveLinkDiscreteTaskView',
                        inProjectMenu: 'ProjectDiscreteTaskView'
                    },
                    requestData: {
                        handleTask: {},
                        related: {
                            relationshipRef: this.oid,
                            baselined: ''
                        },
                        inProjectMenu: {
                            conditionDtoList: [
                                {
                                    attrName: `${this.className}#holderRef`,
                                    oper: 'EQ',
                                    value1: this.$route?.query?.pid
                                }
                            ]
                        }
                    },
                    actionConfig: {
                        handleTask: 'PPM_DISCRETE_TASK_LIST_MENU',
                        inProjectMenu: 'PPM_PROJECT_DISCRETE_TASK_MENU'
                    },
                    rowActionConfig: {
                        handleTask: 'PPM_PROJECT_DISCRETE_TASK_LIST_OPER_MENU',
                        inProjectMenu: 'PPM_PROJECT_DISCRETE_TASK_LIST_OPER_MENU'
                    }
                };
                // 只有基线才会传这个参数
                if (!this.$route?.query?.baselined) delete tableConfig.requestData.related.baselined;
                return tableConfig;
            },
            configKey() {
                // 是否项目下独立的“督办”菜单
                if (this.isInProjectMenu) {
                    return 'inProjectMenu';
                }
                return this.$route.query?.pid || this.type === 'related' ? 'related' : 'handleTask';
            },
            enableScrollLoad() {
                // return this.type === 'related';
                return true;
            },
            // 需求、风险、问题关联督办任务的key
            actionKeyMaps() {
                let result = {};
                let keysObj = {
                    require: {
                        actionKey: 'PPM_REQUIREMENT_DISCRETE_TASK_LINK_MENU',
                        rowActionKey: 'PPM_REQUIREMENT_DISCRETE_TASK_OPERATE_MENU'
                    },
                    risk: {
                        actionKey: 'PPM_RISK_DISCRETE_TASK_LINK_MENU',
                        rowActionKey: 'PPM_RISK_DISCRETE_TASK_OPERATE_MENU'
                    },
                    issue: {
                        actionKey: 'PPM_ISSUE_DISCRETE_TASK_LINK_MENU',
                        rowActionKey: 'PPM_ISSUE_DISCRETE_TASK_OPERATE_MENU'
                    }
                };
                Object.keys(keysObj).forEach((key) => {
                    let className = store.state?.classNameMapping?.[key] || '';
                    result[className] = keysObj[key];
                });
                return result;
            },
            actionKey() {
                let relateClassName = this.$route.meta?.className || '';
                return this.actionKeyMaps[relateClassName]?.actionKey;
            },
            rowActionKey() {
                let relateClassName = this.$route.meta?.className || '';
                return this.actionKeyMaps[relateClassName]?.rowActionKey;
            },
            viewTableConfig() {
                let _this = this;
                let { configKey, actionKey } = this;
                let tableKey = this.tableConfig.tableKey[configKey];
                let requestData = this.tableConfig.requestData[configKey];
                let actionConfig = configKey === 'related' ? actionKey : this.tableConfig.actionConfig[configKey];
                let config = {
                    tableKey: tableKey,
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false,
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: _this.tableBaseConfig,
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: requestData,
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    if (_this.groupAttrName !== 'notGroup') {
                                        let result = resData.data.records;
                                        _.each(result, (item) => {
                                            _.each(item.attrRawList, (attr) => {
                                                item[attr.attrName] = attr.displayName || '';
                                            });
                                        });
                                        let resp = [];
                                        _.each(_.groupBy(result, _this.groupAttrName), (childs, key) => {
                                            let obj = {
                                                //  用来判断是否是分组行
                                                isGroupRow: true,
                                                groupId: _this.groupAttrName + ':' + key,
                                                children: childs
                                            };
                                            obj[_this.nameField] = key + `(${childs.length})`;
                                            resp.push(obj);
                                        });
                                        resData.data.records = resp;
                                    }
                                    return resData;
                                }
                            ]
                        },
                        toolbarConfig: {
                            fuzzySearch: {
                                show: configKey === 'related' // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: actionConfig,
                                containerOid: '',
                                isDefaultBtnType: configKey === 'related',
                                className: _this.className,
                                objectOid: this.oid
                            }
                        },
                        fieldLinkConfig: {
                            fieldLink: false
                        },

                        tableBaseEvent: {
                            'checkbox-all': this.selectAllEvent, // 复选框全选
                            'checkbox-change': this.selectChangeEvent // 复选框勾选事件
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            },
            needRefreshTable() {
                return this.$route.query.needRefreshTable;
            }
        },
        methods: {
            getActionConfig(row) {
                let rowActionConfig =
                    this.configKey === 'related' ? this.rowActionKey : this.tableConfig.rowActionConfig[this.configKey];
                return {
                    name: rowActionConfig,
                    objectOid: this.oid || row?.oid,
                    className: this.className
                };
            },
            renderTableCallback() {
                if (this.groupAttrName !== 'notGroup') {
                    utils.getGroupData({
                        ref: 'handleTaskList',
                        vm: this,
                        businessNameKey: this.nameField
                    });
                }
                let result = [];
                if (this.$refs.handleTaskList) {
                    let tableInstance = this.$refs.handleTaskList.getTableInstance('advancedTable');
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
            addRelated() {
                this.showDialog = true;
            },
            afterRequest({ data, callback }) {
                let result = data.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.indexOf(this.className + '#') !== -1) {
                            obj[res.attrName.split('#')[1]] = res.displayName;
                        }
                    });
                    return { ...item, ...obj, checked: false };
                });
                callback(result);
            },
            beforeSubmit(data, next) {
                if (!data.length) {
                    return next();
                }
                let childrenArrs = data.map((item) => {
                    return item.oid;
                });
                commonHttp.batchAddRelate(this.oid, childrenArrs, this.relateClassName).then((res) => {
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.successfullyAdded
                        });
                        this.refresh();
                        next();
                    }
                });
            },
            selectChangeEvent(data) {
                this.checkData = data.records;
            },
            selectAllEvent(data) {
                this.checkData = data.records;
            },
            openDetail(row) {
                if (row.isGroupRow) {
                    return;
                }
                utils.openDiscreteTaskPage(
                    'detail',
                    {
                        query: {}
                    },
                    row
                );
            },
            changeGroupData() {
                this.refresh();
            },
            refresh() {
                this.$refs.handleTaskList?.refreshTable('default');
            }
        }
    };
});
