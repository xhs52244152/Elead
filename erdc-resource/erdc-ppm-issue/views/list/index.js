define([
    'text!' + ELMP.func('erdc-ppm-issue/views/list/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.func('erdc-ppm-issue/views/list/style.css'),
    'css!' + ELMP.resource('ppm-style/global.css')
], function (template, store, utils) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-issue/locale/index.js'),
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
                    layout: this.getI18nByKey('layout'),
                    setIssueStatus: this.getI18nByKey('setIssueStatus'),
                    setStateSuccess: this.getI18nByKey('setStateSuccess'),
                    batchSetStateInfo: this.getI18nByKey('batchSetStateInfo'),
                    copySuccess: this.getI18nByKey('copySuccess')
                },
                groupAttrName: 'notGroup',
                groupOptions: [],
                layoutOptionsValue: 'list',
                checkData: [],
                editRow: {},
                showSetStateDialog: false,
                detailInfo: {},
                showCopyOrMoveDialog: false,
                testData: {}
            };
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            SvgCircle: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SvgCircle/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            CommonSetState: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SetState/index.js')),
            CopyOrMove: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/CopyOrMove/index.js')),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js'))
        },
        computed: {
            vm() {
                return this;
            },
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
            resourceCode() {
                return this.$route.meta.resourceCode;
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.issue.entity.Issue#name',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.issue.entity.Issue#planInfo.completionRate',
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default'
                    }
                ];
            },
            className() {
                return store.state.classNameMapping.issue;
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
                          'treeNode': 'erd.cloud.ppm.issue.entity.Issue#name',
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
                        'erdc-ppm-issue': {},
                        'projectIssue': {
                            conditionDtoList: [
                                {
                                    attrName: 'erd.cloud.ppm.issue.entity.Issue#projectRef',
                                    oper: 'EQ',
                                    value1: this.projectOid
                                }
                            ]
                        },
                        'myIssue': {}
                    },
                    tableKey: {
                        'erdc-ppm-issue': 'IssueView',
                        'projectIssue': 'IssueView',
                        'myIssue': 'workbenchIssueView'
                    },
                    actionConfigKey: {
                        'erdc-ppm-issue': '',
                        'projectIssue': 'PPM_ISSUE_LIST_MENU',
                        'myIssue': 'PPM_WORKBENCH_ISSUE_LIST_MENU'
                    },
                    rowActionConfigKey: {
                        'erdc-ppm-issue': '',
                        'projectIssue': 'PPM_ISSUE_OPERATE_MENU',
                        'myIssue': ''
                    }
                };
            },
            routeName() {
                return this.$route.name || '';
            },
            requestData() {
                return this.tableConfigs.requestData[this.resourceCode];
            },
            viewTableConfig() {
                let _this = this;
                let tableKey = this.tableConfigs.tableKey[this.resourceCode];
                let actionConfigKey = this.tableConfigs.actionConfigKey[this.resourceCode];
                let rowActionConfigKey = this.tableConfigs.rowActionConfigKey[this.resourceCode];
                let config = {
                    tableKey: tableKey,
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
                                                'erd.cloud.ppm.issue.entity.Issue#name': key + `(${childs.length})`,
                                                //  用来判断是否是分组行
                                                'isGroupRow': true,
                                                'groupId': _this.groupAttrName + ':' + key,
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
                                name: actionConfigKey,
                                containerOid: _this.projectOid,
                                className: _this.className
                            }
                        },

                        addOperationCol: !!rowActionConfigKey,
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
                let rowActionConfigKey = this.tableConfigs.rowActionConfigKey[this.resourceCode];
                return {
                    name: rowActionConfigKey,
                    objectOid: row.oid,
                    className: this.className
                };
            },
            renderTableCallback() {
                if (this.groupAttrName !== 'notGroup') {
                    utils.getGroupData({
                        ref: 'issueList',
                        vm: this,
                        businessNameKey: 'erd.cloud.ppm.issue.entity.Issue#name'
                    });
                }
                let result = [];
                if (this.$refs.issueList) {
                    let tableInstance = this.$refs.issueList.getTableInstance('advancedTable');
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
            refresh() {
                this.$refs.issueList?.refreshTable('default');
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
            },
            getCompletionRate(row, percentSign = '') {
                let percentKey = 'erd.cloud.ppm.issue.entity.Rsik#planInfo.completionRate';
                let percent = row[percentKey] ? (+row[percentKey]).toFixed(1) : 0;
                return percentSign ? percent + percentSign : percent / 100;
            }
        }
    };
});
