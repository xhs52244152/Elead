define([
    'text!' + ELMP.resource('my-knowledge/views/list/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-utils/index.js')
], function (template, ppmStore, commonActions, utils) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        props: {
            // 是否在流程中使用
            isProcess: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('my-knowledge/locale/index.js'),
                groupAttrName: 'notGroup',
                groupOptions: [],
                vm: null
            };
        },
        computed: {
            tableBaseConfig() {
                return this.groupAttrName === 'notGroup'
                    ? {
                          showOverflow: true
                      }
                    : {
                          'treeNode': this.nameField,
                          'treeConfig': {
                              hasChild: 'treeNode',
                              rowField: 'oid',
                              parentField: 'parentRef'
                          },
                          'row-id': 'oid',
                          'showOverflow': true
                      };
            },
            documentClassName() {
                return ppmStore.state.classNameMapping.document;
            },
            nameField() {
                return `${this.documentClassName}#name`;
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
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default'
                    },
                    {
                        prop: this.nameField,
                        type: 'default'
                    }
                ];
            },
            enableScrollLoad() {
                return true;
            },
            viewTableConfig() {
                let _this = this;
                let { isProcess } = _this;
                let config = {
                    tableKey: 'workbenchDocumentView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: true
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        useCodeConfig: true,
                        tableBaseConfig: _this.tableBaseConfig,
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
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
                                                [_this.nameField]: key + `(${childs.length})`,
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
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            showRefresh: true,
                            showConfigCol: true,
                            fuzzySearch: {
                                show: isProcess // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: !isProcess
                            },
                            actionConfig: isProcess
                                ? {}
                                : {
                                      name: 'PPM_WORKBENCH_KNOWLEDGE_LIST_MENU',
                                      containerOid: '',
                                      className: _this.documentClassName
                                  }
                        },
                        tableBaseEvent: {
                            'checkbox-all': _this.selectAllEvent,
                            'checkbox-change': _this.selectChangeEvent
                        },
                        addIcon: true,
                        addOperationCol: !isProcess,
                        fieldLinkConfig: {
                            fieldLink: false,
                            fieldLinkName: _this.nameField,
                            linkClick: (row) => {
                                this.openDocument(row);
                            }
                        },
                        slotsField: _this.slotsField
                    }
                };
                return config;
            }
        },
        mounted() {
            this.vm = this;
        },
        methods: {
            getActionConfig(row) {
                return {
                    name: 'KNOWLEDGE_DOCUMENT_OPERATE_MENU',
                    objectOid: row.oid,
                    className: this.documentClassName
                };
            },
            renderTableCallback() {
                if (this.groupAttrName !== 'notGroup') {
                    utils.getGroupData({
                        ref: 'myKnowledgeTable',
                        vm: this,
                        businessNameKey: this.nameField
                    });
                }
                let result = [];
                if (this.$refs.myKnowledgeTable) {
                    let tableInstance = this.$refs.myKnowledgeTable.getTableInstance('advancedTable');
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
            refresh() {
                this.$refs.myKnowledgeTable?.refreshTable('default');
            },
            openDocument(row) {
                if (row.isGroupRow) return;
                this.$router.push({
                    path: '/my-knowledge/document/detail',
                    query: {
                        oid: row.oid,
                        title: row[this.nameField]
                    }
                });
            },
            changeGroupData() {
                this.refresh();
            }
        }
    };
});
