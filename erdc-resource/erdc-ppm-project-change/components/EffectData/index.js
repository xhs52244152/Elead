define([
    'erdcloud.kit',
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    'EventBus'
], function (ErdcKit, utils, commonHttp, EventBus) {
    return {
        template: `
            <div class="effect-data-container">
                <erd-contraction-panel
                    v-for="(con, index) in contractionArray"
                    :unfold.sync="panelUnfolds[index]"
                    :title="con.title"
                    :class="con.activeName"
                >
                    <template v-slot:content>
                        <erd-tabs  v-model="con.activeName" @tab-click="handleClick">
                            <erd-tab-pane
                                v-for="item in con.tabs"
                                :key="item.key"
                                :label="item.label"
                                :name="item.key"
                                :lazy="true"
                            >
                                <common-table
                                    :tableKey="item.key"
                                    :ref="getTableConfigData('tableRef', item.key)"
                                    :view-table-base-config="getTableConfigData('viewTableBaseConfig', item.key)"
                                    :change-oid="changeOid"
                                    :change-view-table-config="changeViewTableConfig"
                                    @actionClick="(data) => handleActionClick(data, item.key)"
                                    @callback="renderTableCallback"
                                    :isSubmit="isSubmit"
                                    :currentKey="currentKey"
                                    :tableData="tableData"
                                ></common-table>
                            </erd-tab-pane>
                        </erd-tabs>
                    </template>
                </erd-contraction-panel>
                <fam-association-object
                    v-if="showDialog"
                    ref="associationObject"
                    :class-name="currentClassName"
                    :table-key="currentTableKey"
                    :visible.sync="showDialog"
                    :url-config="urlConfig"
                    :enableScrollLoad="true"
                    :showCount="false"
                    @before-submit="beforeSubmit"
                >
                </fam-association-object>
            </div>
        `,
        components: {
            CommonTable: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-project-change/components/EffectData/components/CommonTable/index.js')
            ),
            FamAssociationObject: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAssociationObject/index.js'))
        },
        props: {
            businessData: {
                type: Array,
                default: () => []
            },
            draftInfos: {
                type: Object,
                default: () => {}
            },
            processInfos: {
                type: Object,
                default: () => {}
            },
            processStep: String
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-project-change/locale/index.js'),
                panelUnfolds: [],
                handleTaskUnfold: true,
                showDialog: false,
                urlConfig: {},
                currentKey: '',
                originData: {
                    task: [],
                    requirement: [],
                    issue: [],
                    risk: [],
                    discreteTask: []
                },
                draftTableData: {},
                className: 'erd.cloud.ppm.change.entity.AffectedData',
                viewTableData: {
                    task: [],
                    requirement: [],
                    issue: [],
                    risk: [],
                    discreteTask: []
                },
                activeName: 'task'
            };
        },
        watch: {
            businessData: {
                handler(data) {
                    if (data.length && this.isSubmit) {
                        this.draftTableData = data[0]?.originEffectData || {};
                    }
                },
                immediate: true
            }
        },
        computed: {
            tableData() {
                return this.isSubmit ? this.viewTableData[this.activeName] : [];
            },
            contractionArray() {
                let result = [
                    {
                        title: this.i18n.effectData,
                        tabs: [
                            {
                                key: 'task',
                                label: this.i18n.plan
                            },
                            {
                                key: 'requirement',
                                label: this.i18n.require
                            },
                            {
                                key: 'issue',
                                label: this.i18n.issue
                            },
                            {
                                key: 'risk',
                                label: this.i18n.risk
                            },
                            {
                                key: 'discreteTask',
                                label: this.i18n.handleTask
                            }
                        ],
                        activeName: 'task'
                    }
                ];
                this.panelUnfolds = result.map(() => {
                    return true;
                });
                return result;
            },
            relatedConfig() {
                return {
                    task: {
                        relateTableKey: 'taskView',
                        className: 'erd.cloud.ppm.plan.entity.Task'
                    },
                    requirement: {
                        relateTableKey: 'RequirementView',
                        className: 'erd.cloud.ppm.require.entity.Requirement'
                    },
                    risk: {
                        relateTableKey: 'RiskView',
                        className: 'erd.cloud.ppm.risk.entity.Risk'
                    },
                    issue: {
                        relateTableKey: 'IssueView',
                        className: 'erd.cloud.ppm.issue.entity.Issue'
                    },
                    discreteTask: {
                        relateTableKey: 'DiscreteTaskView',
                        className: 'erd.cloud.ppm.plan.entity.DiscreteTask'
                    }
                };
            },
            projectOid() {
                return this.businessData[0]?.oid;
            },
            changeOid() {
                return this.businessData[0]?.roleBObjectRef || '';
            },
            tableConfig() {
                let { isComplete, openDetail, changeOid } = this;
                return {
                    tableRef: {
                        task: 'taskTable',
                        requirement: 'requireTable',
                        issue: 'issueTable',
                        risk: 'riskTable',
                        discreteTask: 'discreteTask'
                    },
                    viewTableBaseConfig: {
                        task: {
                            actionConfig: {
                                name: isComplete ? '' : 'PPM_CHANGE_TASK_OPERATE_MENU',
                                className: 'erd.cloud.ppm.change.entity.Change',
                                objectOid: changeOid
                            },
                            fieldLinkConfig: {
                                fieldLink: true,
                                fieldLinkName: 'erd.cloud.ppm.plan.entity.Task#name',
                                linkClick: (row) => {
                                    openDetail(row, 'task');
                                }
                            },
                            tableKey: 'ChangeAffectedTaskView'
                        },
                        requirement: {
                            actionConfig: {
                                name: isComplete ? '' : 'PPM_CHANGE_REQUIREMENT_OPERATE_MENU',
                                className: 'erd.cloud.ppm.change.entity.Change',
                                objectOid: changeOid
                            },
                            fieldLinkConfig: {
                                fieldLink: true,
                                fieldLinkName: 'erd.cloud.ppm.require.entity.Requirement#name',
                                linkClick: (row) => {
                                    openDetail(row, 'requirement');
                                }
                            },
                            tableKey: 'ChangeAffectedRequirementView'
                        },
                        issue: {
                            actionConfig: {
                                name: isComplete ? '' : 'PPM_CHANGE_ISSUE_OPERATE_MENU',
                                className: 'erd.cloud.ppm.change.entity.Change',
                                objectOid: changeOid
                            },
                            fieldLinkConfig: {
                                fieldLink: true,
                                fieldLinkName: 'erd.cloud.ppm.issue.entity.Issue#name',
                                linkClick: (row) => {
                                    openDetail(row, 'issue');
                                }
                            },
                            tableKey: 'ChangeAffectedIssueView'
                        },
                        risk: {
                            actionConfig: {
                                name: isComplete ? '' : 'PPM_CHANGE_RISK_OPERATE_MENU',
                                className: 'erd.cloud.ppm.change.entity.Change',
                                objectOid: changeOid
                            },
                            fieldLinkConfig: {
                                fieldLink: true,
                                fieldLinkName: 'erd.cloud.ppm.risk.entity.Risk#name',
                                linkClick: (row) => {
                                    openDetail(row, 'risk');
                                }
                            },
                            tableKey: 'ChangeAffectedRiskView'
                        },
                        discreteTask: {
                            actionConfig: {
                                name: isComplete ? '' : 'PPM_CHANGE_DISCRETE_TASK_OPERATE_MENU',
                                className: 'erd.cloud.ppm.change.entity.Change',
                                objectOid: changeOid
                            },
                            fieldLinkConfig: {
                                fieldLink: true,
                                fieldLinkName: 'erd.cloud.ppm.plan.entity.DiscreteTask#name',
                                linkClick: (row) => {
                                    // 督办任务的查看详情
                                    utils.openDiscreteTaskPage(
                                        'detail',
                                        {
                                            query: {
                                                pid: this.projectOid
                                            }
                                        },
                                        row
                                    );
                                }
                            },
                            tableKey: 'ChangeAffectedDiscreteTaskView'
                        }
                    }
                };
            },
            currentClassName() {
                return this.relatedConfig[this.currentKey]?.className;
            },
            currentTableKey() {
                return this.relatedConfig[this.currentKey]?.relateTableKey;
            },
            // 是否提交页面（提交页面或者草稿页面）
            isSubmit() {
                return this.processStep === 'launcher';
            },
            isComplete() {
                return this.processInfos.processStatusEnum === 'LIFECYCLE_COMPLETED';
            }
        },
        mounted() {
            // 跨页面创建创建回显数据
            let _this = this;
            window.addEventListener('storage', function (e) {
                if (e.key === 'change:project:createOid') {
                    _this.setTableData(e.newValue);
                    localStorage.setItem('change:project:createOid', '');
                }
            });
        },
        activated() {
            //当前页面回显数据
            let oid = localStorage.getItem('change:project:createOid');
            localStorage.setItem('change:project:createOid', '');
            this.setTableData(oid);
        },
        methods: {
            handleClick(tab) {
                this.activeName = tab.name;
            },
            getTableConfigData(field, key) {
                return this.tableConfig[field][key];
            },
            handleActionClick({ name }, key) {
                this.currentKey = key;
                const eventClick = {
                    CHANGE_REQUIREMENT_ADD: this.handleChangeAdd,
                    CHANGE_TASK_ADD: this.handleChangeAdd,
                    CHANGE_ISSUE_ADD: this.handleChangeAdd,
                    CHANGE_RISK_ADD: this.handleChangeAdd,
                    CHANGE_DISCRETE_TASK_ADD: this.handleChangeAdd,
                    CHANGE_DISCRETE_TASK_CREATE: this.create,
                    CHANGE_REQUIREMENT_CREATE: this.create,
                    CHANGE_ISSUE_CREATE: this.create,
                    CHANGE_RISK_CREATE: this.create,
                    CHANGE_DISCRETE_TASK_DELETE: this.remove,
                    CHANGE_TASK_DELETE: this.remove,
                    CHANGE_REQUIREMENT_DELETE: this.remove,
                    CHANGE_ISSUE_DELETE: this.remove,
                    CHANGE_RISK_DELETE: this.remove
                };
                eventClick[name] && eventClick[name](key);
            },
            handleChangeAdd(key) {
                this.showDialog = true;
                switch (key) {
                    case 'discreteTask':
                        this.urlConfig = {
                            data: {
                                deleteNoPermissionData: true
                            }
                        };
                        break;
                    case 'requirement':
                        this.urlConfig = {
                            data: {
                                relationshipRef: this.projectOid,
                                deleteNoPermissionData: true,
                                className: 'erd.cloud.ppm.require.entity.RequirementAssignLink',
                                tableKey: 'ProjAssignReqView'
                            }
                        };
                        break;
                    default:
                        this.urlConfig = {
                            data: {
                                conditionDtoList: [
                                    {
                                        attrName: this.currentClassName + '#projectRef',
                                        oper: 'EQ',
                                        value1: this.projectOid
                                    }
                                ],
                                deleteNoPermissionData: true
                            }
                        };
                }
            },
            // 增加数据
            beforeSubmit(data, next) {
                const FamAdvancedTable = this.getFamAdvancedTable();
                let tableData = FamAdvancedTable.tableData;
                let result = data.map((item) => {
                    let result = this.formatData(item.attrRawList);
                    result.attrRawList = ErdcKit.deepClone(item.attrRawList);
                    result.oid = result[this.currentClassName + '#oid'];
                    return result;
                });
                if (tableData.filter((item) => result.filter((res) => res.oid === item.oid).length).length) {
                    return this.$message.error(this.i18n.verifyTips); //唯一校验性失败
                } else if (this.isSubmit) {
                    FamAdvancedTable.tableData = [...tableData, ...result];
                    this.originData[this.currentKey] = FamAdvancedTable.tableData;
                    this.$message.success(this.i18n.addedSuccessfully); //添加成功
                    const tableRef = this.getTableConfigData('tableRef', this.currentKey);
                    this.$refs[tableRef][0].$children[0].$refs.FamAdvancedTable.sourceData = JSON.parse(
                        JSON.stringify(FamAdvancedTable.tableData)
                    );
                    this.viewTableData[this.currentKey] = FamAdvancedTable.tableData;
                    next();
                } else {
                    let requestConfig = {
                        className: this.className,
                        rawDataVoList: []
                    };
                    requestConfig.rawDataVoList = result.map((item) => {
                        return {
                            attrRawList: [
                                {
                                    attrName: 'roleAObjectRef',
                                    value: this.changeOid
                                },
                                {
                                    attrName: 'roleBObjectRef',
                                    value: item.oid
                                }
                            ]
                        };
                    });
                    commonHttp.saveOrUpdate({ data: requestConfig }).then(() => {
                        this.$message.success(this.i18n.addedSuccessfully); //添加成功
                        this.refresh();
                        next();
                    });
                }
            },
            create(key) {
                let { changeOid } = this;
                const routeNameMaps = {
                    requirement: '/space/requirement-list/require/create',
                    issue: '/space/erdc-ppm-issue/issue/create',
                    risk: '/space/erdc-ppm-risk/create'
                };
                const appName = 'erdc-project-web';
                const query = {
                    createType: 'projectChange',
                    pid: this.projectOid,
                    backRouteConfig: JSON.stringify({ query: this.$route.query, path: this.$route.path }),
                    appName: this.$store.state.route.resources.identifierNo,
                    changeOid
                };
                // 是否督办任务 的创建
                if (key === 'discreteTask') {
                    utils.openDiscreteTaskPage('create', {
                        query: {
                            ...query,
                            // 来源=变更，只读
                            source: JSON.stringify({ value: 'CHANGE', readonly: true })
                        },
                        appName: 'erdc-project-web' // 指定跳转到项目应用下（主要为了创建督办任务时，所属项目能够赋值）
                    });
                } else {
                    utils.openPage({
                        appName,
                        routeConfig: {
                            path: routeNameMaps[key],
                            query
                        }
                    });
                }
            },
            // 添加创建数据
            setTableData(oid) {
                if (this.isSubmit) {
                    oid &&
                        commonHttp.commonAttr({ data: { oid } }).then((res) => {
                            let { currentClassName } = this;
                            let rawData = res.data.rawData;
                            let attrRawList = _.keys(rawData).map((key) => {
                                return {
                                    ...rawData[key],
                                    attrName: currentClassName + '#' + key
                                };
                            });
                            let result = this.formatData(attrRawList);
                            result.oid = result[currentClassName + '#oid'];
                            result.attrRawList = attrRawList;
                            let FamAdvancedTable = this.getFamAdvancedTable();
                            FamAdvancedTable.tableData.unshift(result);
                            this.originData[this.currentKey] = FamAdvancedTable.tableData;
                            this.viewTableData[this.currentKey] = FamAdvancedTable.tableData;
                        });
                } else {
                    this.refresh();
                }
            },
            remove(key) {
                const FamAdvancedTable = this.getFamAdvancedTable(key);
                const selectData = FamAdvancedTable.selectData.map((item) => item.oid);
                if (!selectData.length) {
                    return this.$message.info(this.i18n.checkDataTips); // 请先勾选数据
                }
                this.$confirm(this.i18n.removeOrNot, this.i18n.removeConfirm, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    type: 'warning'
                })
                    .then(() => {
                        if (this.isSubmit) {
                            FamAdvancedTable.tableData = FamAdvancedTable.tableData.filter(
                                (item) => !selectData.includes(item.oid)
                            );
                            const tableRef = this.getTableConfigData('tableRef', key);
                            this.$refs[tableRef][0].$children[0].$refs.FamAdvancedTable.sourceData = JSON.parse(
                                JSON.stringify(FamAdvancedTable.tableData)
                            );
                            this.viewTableData[key] = FamAdvancedTable.tableData;
                            FamAdvancedTable.selectData = [];
                            this.$message.success(this.i18n.removedSuccessfully); //移除成功
                        } else {
                            let params = {
                                catagory: 'DELETE',
                                className: this.className,
                                oidList: selectData
                            };
                            commonHttp.deleteByIds({ data: params }).then(() => {
                                this.$message.success(this.i18n.removedSuccessfully); //移除成功
                                this.refresh();
                            });
                        }
                    })
                    .catch(() => {});
            },
            formatData(data) {
                let { currentClassName } = this;
                return ErdcKit.deserializeAttr(data, {
                    valueMap: {
                        [currentClassName + '#lifecycleStatus.status']: (e) => e.displayName,
                        [currentClassName + '#responsiblePerson']: (e) => e.displayName,
                        [currentClassName + '#responsiblePeople']: (e) => e.displayName,
                        [currentClassName + '#proposer']: (e) => e.displayName,
                        [currentClassName + '#timeInfo.scheduledStartTime']: (e) => e.displayName,
                        [currentClassName + '#timeInfo.scheduledEndTime']: (e) => e.displayName,
                        [currentClassName + '#probability']: (e) => e.displayName,
                        [currentClassName + '#submitTime']: (e) => e.displayName,
                        [currentClassName + '#dueDate']: (e) => e.displayName,
                        [currentClassName + '#verifier']: (e) => e.displayName,
                        [currentClassName + '#priority']: (e) => e.displayName,
                        [currentClassName + '#typeReference']: (e) => e.displayName,
                        [currentClassName + '#resAssignments']: (e) => e.displayName,
                        [currentClassName + '#organizationRef']: (e) => e.displayName
                    }
                });
            },
            validate() {
                return new Promise((resolve) => {
                    let result = {
                        originEffectData: {},
                        affectedTarget: {}
                    };
                    if (this.isSubmit) {
                        _.keys(this.viewTableData).forEach((key) => {
                            const tableData = this.viewTableData[key];
                            result.originEffectData[key] = tableData;
                            result.affectedTarget[key] = tableData.map((item) => {
                                return item.oid;
                            });
                        });
                    } else {
                        const tableRef = this.tableConfig['tableRef'];
                        const { originEffectData } = this.businessData[0];
                        _.keys(tableRef).forEach((key) => {
                            let tableData = [];
                            tableData = this.$refs[tableRef[key]]
                                ? this.getFamAdvancedTable(key).tableData
                                : originEffectData[key];
                            // 保存数据在草稿页面使用
                            result.originEffectData[key] = tableData;
                            result.affectedTarget[key] = tableData.map((item) => {
                                return item.oid;
                            });
                        });
                    }
                    resolve(result);
                });
            },
            openDetail(row) {
                let config = {};
                if (!this.isSubmit) {
                    const changeRouteConfig = (routeConfig) => {
                        routeConfig.query.pid = this.projectOid;
                        return routeConfig;
                    };
                    config = {
                        oidKey: 'roleBObjectRef',
                        changeRouteConfig
                    };
                }
                utils.openDetail(row, config);
            },
            refresh(key) {
                this.getFamAdvancedTable(key)?.fnRefreshTable();
            },
            renderTableCallback(key) {
                // 切换显示列会重新加载数据，在提交表单时表格数据是假数据没有调用接口，所以存一份数据在切换显示列时重新赋值
                const FamAdvancedTable = this.getFamAdvancedTable(key);
                if (this.isSubmit) {
                    FamAdvancedTable.tableData = this.originData[key];
                }
                // 草稿数据回显
                let draftTableData = this.draftTableData[key] || [];
                if (draftTableData.length) {
                    FamAdvancedTable.tableData = ErdcKit.deepClone(draftTableData);
                    draftTableData = [];
                }
            },
            getFamAdvancedTable(key) {
                let tableRef = this.getTableConfigData('tableRef', key || this.currentKey);
                return this.$refs[tableRef]?.[0]?.$refs.famViewTable.$refs.FamAdvancedTable;
            },
            changeViewTableConfig(config) {
                // 在提交页面不需要刷新按钮
                config.tableConfig.toolbarConfig.showRefresh = !this.isSubmit;
                return config;
            }
        },
        beforeDestroy() {
            window.removeEventListener('storage', () => {});
        }
    };
});
