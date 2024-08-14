define([
    'text!' + ELMP.func('erdc-ppm-risk/views/list/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'erdcloud.store',
    'css!' + ELMP.func('erdc-ppm-risk/views/list/style.css'),
    'css!' + ELMP.resource('ppm-style/global.css')
], function (template, store, utils, ErdcStore) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-risk/locale/index.js'),
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
                    layout: this.getI18nByKey('layout')
                },
                groupAttrName: 'notGroup',
                groupOptions: [],
                layoutOptionsValue: 'list',
                checkData: [],
                vm: null
            };
        },
        created() {
            this.vm = this;
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            SvgCircle: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SvgCircle/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js'))
        },
        computed: {
            layoutOptions() {
                return [
                    {
                        label: this.i18nMappingObj.list,
                        value: 'list'
                    },
                    {
                        label: this.i18nMappingObj.kanban,
                        value: 'kanban'
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
                        prop: 'erd.cloud.ppm.risk.entity.Risk#name',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.risk.entity.Risk#planInfo.completionRate',
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default'
                    }
                ];
            },
            className() {
                return store.state.classNameMapping.risk;
            },
            projectOid() {
                return this.$route.query.pid;
            },
            tableBaseConfig() {
                return this.groupAttrName === 'notGroup'
                    ? {
                          showOverflow: true
                      }
                    : {
                          'treeNode': 'erd.cloud.ppm.risk.entity.Risk#name',
                          'treeConfig': {
                              hasChild: 'treeNode',
                              rowField: 'oid',
                              parentField: 'parentRef'
                          },
                          'row-id': 'oid',
                          'showOverflow': true
                      };
            },
            tableConfigs() {
                return {
                    requestData: {
                        riskLibraryList: {},
                        projectRiskList: {
                            conditionDtoList: [
                                {
                                    attrName: 'erd.cloud.ppm.risk.entity.Risk#projectRef',
                                    oper: 'EQ',
                                    value1: this.projectOid
                                }
                            ]
                        }
                    }
                };
            },
            resourceCode() {
                return this.$route.meta.resourceCode;
            },
            requestData() {
                return this.tableConfigs.requestData[this.resourceCode];
            },
            viewTableConfig() {
                let _this = this;
                let config = {
                    tableKey: _this.projectOid ? 'RiskView' : 'workbenchRiskView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: _this.tableBaseConfig,
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: _this.requestData,
                            // 更多配置参考axios官网
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
                                            resp.push({
                                                'erd.cloud.ppm.risk.entity.Risk#name': key + `(${childs.length})`,
                                                //  用来判断是否是分组行
                                                'groupId': _this.groupAttrName + ':' + key,
                                                'isGroupRow': true,
                                                'children': childs
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
                                show: true
                            },
                            actionConfig: {
                                name: this.projectOid ? 'PPM_RISK_LIST_MENU' : 'PPM_WORKBENCH_RISK_LIST_MENU',
                                containerOid: _this.projectOid,
                                className: _this.className
                            }
                        },

                        tableBaseEvent: {
                            'checkbox-all': _this.selectAllEvent, // 复选框全选
                            'checkbox-change': _this.selectChangeEvent // 复选框勾选事件
                        },
                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: _this.slotsField
                    }
                };
                return config;
            },
            enableScrollLoad() {
                return true;
            }
        },
        methods: {
            getActionConfig(row) {
                return {
                    name: 'PPM_RISK_OPERATE_MENU',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            renderTableCallback() {
                if (this.groupAttrName !== 'notGroup') {
                    utils.getGroupData({
                        ref: 'riskList',
                        vm: this,
                        businessNameKey: 'erd.cloud.ppm.risk.entity.Risk#name'
                    });
                }
                let result = [];
                if (this.$refs.riskList) {
                    let tableInstance = this.$refs.riskList.getTableInstance('advancedTable');
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
            actionClick() {},
            onCommand() {},
            // 批量删除
            batchDelete() {
                if (!this.checkData.length) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSelectData
                    });
                }
                let params = {
                    catagory: 'DELETE',
                    className: this.className,
                    oidList: []
                };
                params.oidList = this.checkData.map((item) => {
                    return item.oid;
                });
                this.deleteData(params);
            },
            // 批量设置状态
            batchSetStatus() {
                if (!this.checkData.length) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSelectData
                    });
                }
                let stateKey = 'erd.cloud.ppm.risk.entity.Risk#lifecycleStatus.status',
                    state = this.checkData[0][stateKey];
                let len = this.checkData.filter((item) => item[stateKey] === state).length;
                if (len !== this.checkData.length) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.batchSetStateInfo
                    });
                }
                let row = {
                    'erd.cloud.ppm.risk.entity.Risk#lifecycleStatus.status': state,
                    'oid': this.checkData[0].oid
                };
                this.setStateType = 'batch';
                this.openSetStateDialog(row);
            },
            openSetStateDialog(row) {
                this.editRow = {
                    ...row,
                    state: row['erd.cloud.ppm.risk.entity.Risk#lifecycleStatus.status']
                };
                this.showSetStateDialog = true;
            },
            edit(row) {
                this.$router.push({
                    name: this.$route?.name === 'projectRiskList' ? 'riskEdit' : 'riskLibraryEdit',
                    params: {
                        oid: row.oid
                    },
                    query: {
                        title: `编辑${row['erd.cloud.ppm.risk.entity.Risk#name']}`
                    }
                });
            },
            create() {
                this.$router.push({
                    name: this.$route?.name === 'projectRiskList' ? 'riskCreate' : 'riskLibraryCreate'
                });
            },
            deleteRow(row) {
                let params = {
                    catagory: 'DELETE',
                    className: this.className,
                    oidList: [row.oid]
                };
                this.deleteData(params);
            },
            deleteData(params) {
                this.$confirm(this.i18nMappingObj.deleteTipsInfo, this.i18nMappingObj.deleteConfirm, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/ppm/deleteByIds',
                        method: 'DELETE',
                        params: {},
                        data: params
                    }).then((resp) => {
                        if (resp.success) {
                            this.refresh();
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.deleteSuccess
                            });
                        }
                    });
                });
            },
            refresh() {
                this.$refs.riskList?.refreshTable('default');
            },
            changeGroupData() {
                this.refresh();
            },
            selectAllEvent(data) {
                this.checkData = data.records;
            },
            selectChangeEvent(data) {
                this.checkData = data.records;
            },
            openDetail(row) {
                !row.isGroupRow && utils.openDetail(row);
                // let pid = this.projectOid;

                // // 工作台风险的项目id
                // let projectOid =
                //     row.attrRawList.find((item) => item.attrName === 'erd.cloud.ppm.risk.entity.Risk#projectRef')
                //         ?.oid || '';
                // let query = {
                //     pid: projectOid,
                //     oid: row.oid
                // };
                // if (ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web') {
                //     const appName = 'erdc-project-web';
                //     const targetPath = '/space/erdc-ppm-risk/detail';
                //     // path组装query参数
                //     let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                //     window.open(url, appName);
                // } else {
                //     this.$router.push({
                //         path: '/space/erdc-ppm-risk/detail',
                //         params: {
                //             oid: row.oid
                //         },
                //         query: {
                //             pid,
                //             oid: row.oid,
                //             title: row['erd.cloud.ppm.risk.entity.Risk#name']
                //         }
                //     });
                // }
            },
            getCompletionRate(row, percentSign = '') {
                let percentKey = 'erd.cloud.ppm.risk.entity.Rsik#planInfo.completionRate';
                let percent = row[percentKey] ? (+row[percentKey]).toFixed(1) : 0;
                return percentSign ? percent + percentSign : percent / 100;
            }
        }
    };
});
