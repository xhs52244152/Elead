define([
    'erdcloud.kit',
    'text!' + ELMP.resource('ppm-component/ppm-components/Related/index.html'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    'css!' + ELMP.resource('ppm-component/ppm-components/Related/index.css')
], function (ErdcKit, template, commonHttp, ppmUtils, actions) {
    const actionConfigNameList = {
        taskTab: {
            risk: 'PPM_TASK_RISK_BE_LINK_MENU', // 风险
            issue: 'PPM_TASK_ISSUE_BE_LINK_MENU' // 问题
        },
        requirementTab: {
            risk: 'PPM_REQUIRE_RISK_BE_LINK_MENU',
            issue: 'PPM_REQUIRE_ISSUE_BE_LINK_MENU'
        },
        issueTab: {
            risk: 'PPM_ISSUE_RISK_BE_LINK_MENU',
            issue: 'PPM_ISSUE_ISSUE_BE_LINK_MENU'
        },
        riskTab: {
            risk: 'PPM_RISK_RISK_BE_LINK_MENU',
            issue: 'PPM_RISK_ISSUE_BE_LINK_MENU'
        }
    };
    let Related = {
        name: 'related',
        template: template,
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/Related/locale/index.js'),
                i18nMappingObj: {
                    deleteTipsInfo: this.getI18nByKey('deleteTipsInfo'),
                    deleteConfirm: this.getI18nByKey('deleteConfirm'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    deleteAssociation: this.getI18nByKey('deleteAssociation'),
                    confirmRemove: this.getI18nByKey('confirmRemove'),
                    successfullyAdded: this.getI18nByKey('successfullyAdded'),
                    task: this.getI18nByKey('task'),
                    require: this.getI18nByKey('require'),
                    issue: this.getI18nByKey('issue'),
                    risk: this.getI18nByKey('risk'),
                    code: this.getI18nByKey('code'),
                    name: this.getI18nByKey('name'),
                    type: this.getI18nByKey('type'),
                    status: this.getI18nByKey('status')
                },
                formData: {},
                dialogClassName: 'erd.cloud.ppm.project.entity.Project',
                showDialog: false,
                tableKey: '',
                panelUnfolds: [],
                needSelectProject: false,
                selectedProjectOid: '',
                tabsConfig: {},
                urlConfig: {}
            };
        },
        created() {
            this.selectedProjectOid = this.$route.query?.pid;
        },
        computed: {
            relatedData() {
                _.each(this.$attrs.relatedData, () => {
                    this.panelUnfolds.push(true);
                });
                return this.$attrs.relatedData || [];
            },
            defaultConfig() {
                let { i18nMappingObj } = this;
                let defaultConfig = {
                    task: {
                        title: i18nMappingObj.task,
                        className: 'erd.cloud.ppm.plan.entity.Task',
                        tableKey: 'ActiveLinkTaskView',
                        actionConfigName: 'PPM_ISSUE_TASK_LINK_CREATE_MENU',
                        rowActionConfigName: 'PPM_ISSUE_TASK_OPERATE_MENU',
                        relateTableKey: 'taskView',
                        createPageRoute: {
                            path: '/project-plan/planCreate',
                            params: {
                                currentPlanSet: 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1'
                            },
                            query: {
                                collectId: 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1',
                                isCreateRelation: true,
                                roleAObjectRef: this.oid,
                                pid: this.$route.query.pid || '',
                                className: 'erd.cloud.ppm.common.entity.BusinessLink'
                            }
                        }
                    },
                    issue: {
                        title: i18nMappingObj.issue,
                        className: 'erd.cloud.ppm.issue.entity.Issue',
                        tableKey: 'ActiveLinkIssueView',
                        actionConfigName: 'PPM_ISSUE_ISSUE_LINK_CREATE_MENU',
                        rowActionConfigName: 'PPM_ISSUE_ISSUE_OPERATE_MENU',
                        relateTableKey: 'IssueView',
                        createPageRoute: {
                            path: '/erdc-ppm-issue/issue/create',
                            query: {
                                isCreateRelation: true,
                                roleAObjectRef: this.oid,
                                pid: this.$route.query.pid || '',
                                className: 'erd.cloud.ppm.common.entity.BusinessLink'
                            }
                        }
                    },
                    risk: {
                        title: i18nMappingObj.risk,
                        className: 'erd.cloud.ppm.risk.entity.Risk',
                        tableKey: 'ActiveLinkRiskView',
                        actionConfigName: 'PPM_ISSUE_RISK_LINK_CREATE_MENU',
                        rowActionConfigName: 'PPM_ISSUE_RISK_OPERATE_MENU',
                        relateTableKey: 'RiskView',
                        createPageRoute: {
                            path: '/erdc-ppm-risk/create',
                            query: {
                                isCreateRelation: true,
                                roleAObjectRef: this.oid,
                                pid: this.$route.query.pid || '',
                                className: 'erd.cloud.ppm.common.entity.BusinessLink'
                            }
                        }
                    },
                    require: {
                        title: i18nMappingObj.require,
                        className: 'erd.cloud.ppm.require.entity.Requirement',
                        tableKey: 'ActiveLinkRequirementView',
                        actionConfigName: 'PPM_ISSUE_REQUIREMENT_LINK_CREATE_MENU',
                        rowActionConfigName: 'PPM_ISSUE_REQUIREMENT_OPERATE_MENU',
                        relateTableKey: 'RequirementView',
                        needSelectProject: true,
                        createPageRoute: {
                            path: '/requirement-list/require/create',
                            query: {
                                isCreateRelation: true,
                                roleAObjectRef: this.oid,
                                pid: this.$route.query.pid || '',
                                className: 'erd.cloud.ppm.common.entity.BusinessLink'
                            }
                        }
                    },
                    // 被关联
                    passiveLinkTask: {
                        title: i18nMappingObj.task,
                        className: 'erd.cloud.ppm.plan.entity.Task',
                        tableKey: 'PassiveLinkTaskView',
                        actionConfigName: 'PPM_TASK_LINK_MENU',
                        businessName: 'TaskExport',
                        templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1714907513407754241'
                    },
                    passiveLinkRequire: {
                        title: i18nMappingObj.require,
                        className: 'erd.cloud.ppm.require.entity.Requirement',
                        tableKey: 'PassiveLinkRequirementView',
                        actionConfigName: 'PPM_REQUIREMENT_LINK_MENU',
                        businessName: 'RequireExport',
                        templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1744553998192967682'
                    },
                    passiveLinkIssue: {
                        title: i18nMappingObj.issue,
                        className: 'erd.cloud.ppm.issue.entity.Issue',
                        tableKey: 'PassiveLinkIssueView',
                        actionConfigName: actionConfigNameList[this.currentScene]?.issue,
                        businessName: 'IssueExport',
                        templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1745260228997775361'
                    },
                    passiveLinkRisk: {
                        title: i18nMappingObj.risk,
                        className: 'erd.cloud.ppm.risk.entity.Risk',
                        tableKey: 'PassiveLinkRiskView',
                        actionConfigName: actionConfigNameList[this.currentScene]?.risk,
                        businessName: 'RiskExport',
                        templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1747188640197169154'
                    }
                };
                _.each(this.relatedData, (item) => {
                    if (!item.businessKey) return;
                    if (defaultConfig[item.businessKey]) {
                        _.keys(item).forEach((key) => {
                            if (key === 'businessKey') return;
                            defaultConfig[item.businessKey][key] = item[key];
                        });
                    } else {
                        defaultConfig[item.businessKey] = item;
                    }
                });
                return defaultConfig;
            },
            vm() {
                return this;
            },
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    }
                    // {
                    //     prop: 'erd.cloud.ppm.risk.entity.Risk#name',
                    //     type: 'default'
                    // }
                ];
            },
            projectOid() {
                return this.$route.query.pid;
            },
            currentScene() {
                let currentScene = '';
                if (this.oid.includes('Task')) {
                    currentScene = 'taskTab';
                } else if (this.oid.includes('Requirement')) {
                    currentScene = 'requirementTab';
                } else if (this.oid.includes('Issue')) {
                    currentScene = 'issueTab';
                } else if (this.oid.includes('Risk')) {
                    currentScene = 'riskTab';
                }
                return currentScene;
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            oid() {
                return this.$attrs?.idKey ? this.$route.query[this.$attrs?.idKey] || '' : this.$route.query.oid || '';
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
                        title: i18nMappingObj.name
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
            }
        },
        activated() {
            this.refresh();
            this.tabsConfig = {};
        },
        methods: {
            viewTableConfig(it) {
                let _this = this;
                let { oid } = this;
                let { tableKey, actionConfigName, className, rowActionConfigName } = this.defaultConfig[it.businessKey];
                let requestData = {
                    relationshipRef: oid,
                    deleteNoPermissionData: true
                };
                // 如果是基线就要传baselined为空字符串
                if (this.$route.query.baselined) {
                    requestData.baselined = '';
                }
                return {
                    tableKey: tableKey,
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: requestData,
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                placeholder: '请输入名称',
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            actionConfig: {
                                name: actionConfigName,
                                isDefaultBtnType: true,
                                containerOid: _this.projectOid,
                                className,
                                objectOid: oid
                            }
                        },
                        pagination: {
                            showPagination: false
                        },

                        addOperationCol: !!rowActionConfigName,
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: `${className}#name`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                ppmUtils.openDetail(row, {
                                    oidKey: it.businessKey.includes('passiveLink') ? 'roleAObjectRef' : 'roleBObjectRef'
                                });
                            }
                        },
                        slotsField: _this.slotsField
                    }
                };
            },
            getActionConfig(row, it) {
                let { className, rowActionConfigName } = this.defaultConfig[it.businessKey];
                return {
                    name: rowActionConfigName,
                    objectOid: this.oid,
                    className: className
                };
            },
            getSlotsName(slotsField) {
                return slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            refresh() {
                if (!this.tabsConfig.businessKey) return;
                let { tableKey } = this.defaultConfig[this.tabsConfig.businessKey];
                this.$refs[tableKey]?.[0]?.refreshTable();
            },
            beforeSubmit(data, next) {
                if (!data.length) {
                    return next();
                }
                let childrenArrs = data.map((item) => {
                    return item.oid;
                });
                commonHttp
                    .batchAddRelate(this.oid, childrenArrs, 'erd.cloud.ppm.common.entity.BusinessLink')
                    .then((res) => {
                        if (res.success) {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.successfullyAdded
                            });
                            let refsName;
                            _.keys(this.defaultConfig).forEach((key) => {
                                if (
                                    this.defaultConfig[key].className === this.dialogClassName &&
                                    this.tableKey === this.defaultConfig[key].relateTableKey
                                )
                                    refsName = this.defaultConfig[key].tableKey;
                            });
                            this.$refs[refsName]?.[0]?.refreshTable();
                            next();
                        }
                    });
            },
            // 功能按钮点击事件
            actionClick(data, it) {
                const eventClick = {
                    // 关联增加
                    ISSUE_TASK_LINK_CREATE: this.addObj,
                    ISSUE_ISSUE_LINK_CREATE: this.addObj,
                    ISSUE_RISK_LINK_CREATE: this.addObj,
                    ISSUE_REQUIREMENT_LINK_CREATE: this.addObj,
                    TASK_ISSUE_ADD: this.addObj,
                    TASK_RISK_ADD: this.addObj,
                    TASK_REQ_ADD: this.addObj,
                    // 关联创建
                    TASK_ISSUE_CREATE: this.cteateObj,
                    TASK_RISK_CREATE: this.cteateObj,
                    TASK_REQ_CREATE: this.cteateObj,
                    // 被关联导出
                    TASK_LINK_EXPORT: this.export,
                    REQUIREMENT_LINK_EXPORT: this.export,
                    // 任务tab-被关联导出
                    TASK_ISSUE_BE_LINK_EXPORT: this.export,
                    TASK_RISK_BE_LINK_EXPORT: this.export,
                    // 需求tab-被关联导出
                    REQUIRE_RISK_BE_LINK_EXPORT: this.export,
                    REQUIRE_ISSUE_BE_LINK_EXPORT: this.export,
                    // 风险tab-被关联导出
                    RISK_ISSUE_BE_LINK_EXPORT: this.export,
                    RISK_RISK_BE_LINK_EXPORT: this.export,
                    // 问题tab-被关联导出
                    RISK_BE_LINK_EXPORT: this.export,
                    ISSUE_BE_LINK_EXPORT: this.export
                };
                eventClick[data.name] && eventClick[data.name](it);
            },
            addObj(it) {
                this.showDialog = true;
                let { className, relateTableKey, needSelectProject } = this.defaultConfig[it.businessKey];
                this.needSelectProject = needSelectProject;
                this.dialogClassName = className;
                this.tableKey = relateTableKey;
                this.selectedProjectOid = '';
                if (it.businessKey !== 'require') {
                    this.urlConfig = {
                        data: {
                            conditionDtoList: this.projectOid
                                ? [
                                      {
                                          attrName: this.dialogClassName + '#projectRef',
                                          oper: 'EQ',
                                          value1: this.projectOid
                                      }
                                  ]
                                : [],
                            deleteNoPermissionData: true
                        }
                    };
                } else {
                    this.urlConfig = {};
                }
            },
            cteateObj(it) {
                this.tabsConfig = it;
                let routeConfig = this.defaultConfig[it?.businessKey]?.createPageRoute;
                let prefixUrl = '/container';
                if (this.$route.query.pid) prefixUrl = '/space';
                routeConfig.path = prefixUrl + routeConfig.path;
                this.$router.push(routeConfig);
            },
            export(it) {
                const getExportRequestData = (data, requestData) => {
                    let exportFields = data.selectedColumns.map((item) => {
                        return item.attrName;
                    });
                    requestData.className = this.defaultConfig[it.businessKey]?.className;
                    let params = {
                        businessName: this.defaultConfig[it.businessKey]?.businessName, // 切换对应的name
                        templateId: this.defaultConfig[it.businessKey]?.templateId, // 切换对应的id
                        useDefaultExport: false,
                        exportFields,
                        customParams: {
                            useDefaultTemplate: true,
                            exportType: 'excel'
                        },
                        tableSearchDto: requestData
                    };
                    return params;
                };
                let params = {
                    className: this.defaultConfig[it.businessKey]?.className,
                    tableRef: this.defaultConfig[it.businessKey]?.tableKey,
                    getExportRequestData
                };
                actions.export(this.vm, params);
            },
            afterRequest({ data, callback }) {
                let result = data.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.indexOf(this.dialogClassName + '#') !== -1) {
                            obj[res.attrName.split('#')[1]] = res.displayName;
                        }
                    });
                    return { ...item, ...obj, checked: false };
                });
                callback(result);
            },
            refreshLeftTable() {
                this.urlConfig = {
                    data: {
                        className: this.selectedProjectOid
                            ? 'erd.cloud.ppm.require.entity.RequirementAssignLink'
                            : this.dialogClassName,
                        relationshipRef: this.selectedProjectOid,
                        tableKey: this.selectedProjectOid ? 'ProjAssignReqView' : this.tableKey
                    }
                };
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            FamObjectSelectDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamObjectSelectDialog/index.js')
            ),
            FamAssociationObject: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAssociationObject/index.js')
            ),
            ProjectSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/ProjectSelect/index.js'))
        }
    };
    return Related;
});
