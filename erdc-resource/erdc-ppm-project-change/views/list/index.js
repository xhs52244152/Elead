define([
    'text!' + ELMP.func('erdc-ppm-project-change/views/list/index.html'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.func('erdc-ppm-project-change/style.css')
], function (template, commonActions, ppmStore, utils) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-project-change/locale/index.js'),
                groupAttrName: 'notGroup',
                groupOptions: [],
                groupNameField: 'erd.cloud.ppm.change.entity.Change#identifierNo',
                tableRef: 'changeList',
                visible: false,
                changeList: [],
                changeContentList: [],
                changeValue: '',
                changeContent: [],
                defaultProps: {
                    label: 'displayName',
                    value: 'identifierNo'
                }
            };
        },
        computed: {
            vm() {
                return this;
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default'
                    },
                    {
                        prop: this.groupNameField,
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
            pid() {
                return this.$route?.query?.pid || '';
            },
            tableBaseConfig() {
                return this.groupAttrName === 'notGroup'
                    ? {
                          showOverflow: true
                      }
                    : {
                          'treeNode': this.groupNameField,
                          'treeConfig': {
                              hasChild: 'treeNode',
                              rowField: 'oid',
                              parentField: 'parentRef'
                          },
                          'row-id': 'oid',
                          'showOverflow': true
                      };
            },
            viewTableConfig() {
                let _this = this;
                let config = {
                    tableKey: 'ChangeView',
                    viewMenu: {
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false,
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: _this.tableBaseConfig,
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: {
                                conditionDtoList: [
                                    {
                                        attrName: 'erd.cloud.ppm.change.entity.Change#projectRef',
                                        isCondition: true,
                                        logicalOperator: 'AND',
                                        oper: 'EQ',
                                        sortOrder: 1,
                                        value1: this.$route.query.pid
                                    }
                                ],
                                orderBy: 'erd.cloud.ppm.change.entity.Change#createTime',
                                sortBy: 'desc'
                            },
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
                                                [this.groupNameField]: key + `(${childs.length})`,
                                                //  用来判断是否是分组行
                                                isGroupRow: true,
                                                groupId: _this.groupAttrName + ':' + key,
                                                children: childs
                                            });
                                        });
                                        resData.data.records = resp;
                                    }
                                    return resData;
                                }
                            ]
                        },
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false
                            },
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: 'PPM_CHANGE_LIST_MENU',
                                containerOid: _this.containerRef,
                                className: 'erd.cloud.ppm.change.entity.Change',
                                objectOid: _this.pid
                            }
                        },

                        tableBaseEvent: {
                            'checkbox-all': _this.selectAllEvent,
                            'checkbox-change': _this.selectChangeEvent
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
            },
            containerRef() {
                return this.$store?.state?.space?.object?.containerRef;
            }
        },
        watch: {
            changeValue(val, old) {
                if (val !== old) {
                    this.changeContent = [];
                    if (val === 'MULTI_TYPE') {
                        this.getChangeContentList();
                    } else {
                        this.changeContentList = this.changeList.filter((item) => item.identifierNo === val);
                        // 除了多类型变更其他变更内容只有一项，默认选上
                        if (this.changeContentList.length === 1) this.changeContent = [val];
                    }
                }
            }
        },
        activated() {
            this.refresh();
        },
        methods: {
            openDetail(row) {
                if (row.isGroupRow) return;
                utils.openProcessPage(this, row);
            },
            changeGroupData() {
                this.refresh();
            },
            refresh() {
                this.$refs[this.tableRef]?.refreshTable('default');
            },
            renderTableCallback() {
                if (this.groupAttrName !== 'notGroup') {
                    utils.getGroupData({
                        ref: this.tableRef,
                        vm: this,
                        businessNameKey: this.groupNameField
                    });
                }
                let result = [];
                if (this.$refs[this.tableRef]) {
                    let tableInstance = this.$refs[this.tableRef].getTableInstance('advancedTable');
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
            actionClick({ name }) {
                const eventClick = {
                    PPM_CHANGE_CREATE: this.createChange
                };
                eventClick[name] && eventClick[name]();
            },
            getChangeContentList() {
                this.$famHttp({
                    url: '/fam/dictionary/tree/changeContent',
                    params: {
                        status: 1
                    },
                    method: 'GET'
                }).then((res) => {
                    this.changeContentList = res.data?.filter((item) => item.identifierNo !== 'OTHER') || [];
                });
            },
            getChangeType() {
                this.$famHttp({
                    url: '/fam/dictionary/tree/ChangeType',
                    params: {
                        status: 1
                    },
                    method: 'GET'
                }).then((res) => {
                    this.changeList = res.data || [];
                    this.visible = true;
                });
            },
            createChange() {
                this.getChangeType();
            },
            handleConfirm() {
                if (!this.changeValue) return this.$message.warning(this.i18n.selectChangeType);
                if (!this.changeContent.length) return this.$message.warning(this.i18n.selectChangeContent);
                const childrenStr = this.changeContent.join(',');
                const changeContentName = this.changeContent
                    .map((identifierNo) => {
                        return this.changeContentList.find((item) => item.identifierNo === identifierNo).name;
                    })
                    .join(',');

                this.visible = false;
                let customGetProcessFunc = () => {
                    return new Promise((resolve) => {
                        this.$famHttp({
                            url: '/ppm/process/getAllProcessDefDto',
                            data: {
                                isInherit: true,
                                operationScenario: 'LAUNCH_PROCESS',
                                className: 'erd.cloud.ppm.change.entity.Change',
                                attrRawList: [
                                    {
                                        attrName: 'changeType',
                                        value: this.changeValue
                                    },
                                    {
                                        attrName: 'changeContent',
                                        value: childrenStr
                                    }
                                ]
                            },
                            method: 'POST'
                        }).then((res) => {
                            resolve(res);
                        });
                    });
                };
                let projectInfo = ErdcKit.deepClone(ppmStore.state.projectInfo);
                let { key, id } = projectInfo.containerRef || {};
                projectInfo.containerRef = `OR:${key}:${id}`;
                projectInfo.changeType = this.changeValue;
                projectInfo.changeContent = childrenStr;
                projectInfo.changeContentName = changeContentName;
                // 团队变更需要
                projectInfo.containerTeamRef = this.$store.state.space?.context?.containerTeamRef;
                commonActions.startProcess(this, {
                    containerRef: this.containerRef || '',
                    businessData: [projectInfo],
                    customGetProcessFunc,
                    isCheckDraft: () => false,
                    handleCancel: this.handleCancel
                });
            },
            handleCancel() {
                this.changeValue = '';
                this.changeContent = [];
                this.visible = false;
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_CHANGE_OPERATE_MENU',
                    objectOid: row.oid,
                    className: row.idKey
                };
            },
            onCommand({ name }) {
                const eventClick = {
                    PROJECT_CHANGE_APPROVE: this.approval
                };
                eventClick[name] && eventClick[name]();
            },
            approval() {
                utils.openPage({
                    appName: 'erdc-portal-web',
                    routeConfig: {
                        path: '/biz-bpm/process/todos',
                        query: {
                            isRefresh: new Date().getTime().toString()
                        }
                    }
                });
            }
        }
    };
});
