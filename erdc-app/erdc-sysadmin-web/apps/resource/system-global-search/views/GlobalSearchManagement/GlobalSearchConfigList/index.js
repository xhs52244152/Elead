define([
    'text!' + ELMP.resource('system-global-search/views/GlobalSearchManagement/GlobalSearchConfigList/index.html'),
    'css!' + ELMP.resource('system-global-search/styles/style.css')
], function (template) {
    const erdcloudKit = require('erdcloud.kit');
    const utils = require('erdc-kit');

    return {
        template,
        components: {
            globalSearchConfig: erdcloudKit.asyncComponent(
                ELMP.resource('system-global-search/components/GlobalSearchConfig/index.js')
            ),
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            famAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            viewTableForm: erdcloudKit.asyncComponent(
                ELMP.resource('system-viewtable/components/ViewTableForm/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-global-search/locale/index.js'),
                applicationList: [],
                treeSelectData: [],
                applicationOid: '',
                mainModelType: '',
                nameI18nJson: '',
                conditionDtoList: [],
                dialogObj: {
                    visible: false,
                    component: '',
                    title: ''
                },
                currentRow: {},
                btnLoading: false,
                viewTableFormObj: {
                    oid: '',
                    editable: false
                }
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((item) => item.meta.showRouteTitle);
            },
            appName() {
                return this.applicationList.find((item) => item.oid === this.applicationOid)?.identifierNo || '';
            },
            viewTableConfig() {
                const { name, mainModelType, application, description, createBy, createTime, operation } = this.i18n;
                return {
                    firstLoad: true,
                    tableRequestConfig: {
                        url: '/fam/globalSearch/searchTableList',
                        data: this.tableRequestConfigData,
                        headers: {
                            'App-Name': 'ALL'
                        },
                        method: 'post',
                        isFormData: false,
                        transformResponse: [
                            (data) => {
                                let resData = data;
                                try {
                                    resData = data && JSON.parse(data);
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    isDeserialize: true,
                    tableBaseConfig: {
                        showOverflow: true,
                        columnConfig: {
                            resizable: true
                        }
                    },
                    columns: [
                        {
                            attrName: 'displayName',
                            label: name,
                            fixed: 'left'
                        },
                        {
                            attrName: 'mainModelType',
                            label: mainModelType
                        },
                        {
                            attrName: 'appName',
                            label: application
                        },
                        {
                            attrName: 'descriptionI18nJson',
                            label: description
                        },
                        {
                            attrName: 'createBy',
                            label: createBy
                        },
                        {
                            attrName: 'createTime',
                            label: createTime
                        },
                        {
                            attrName: 'operation',
                            label: operation,
                            width: '100',
                            fixed: 'right'
                        }
                    ],
                    toolbarConfig: {
                        showConfigCol: true,
                        showMoreSearch: false,
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        }
                    },
                    addSeq: true,
                    fieldLinkConfig: {
                        fieldLink: true,
                        fieldLinkName: 'displayName',
                        linkClick: (row) => {
                            this.linkClick(row);
                        }
                    },
                    slotsField: [
                        {
                            prop: 'descriptionI18nJson',
                            type: 'default'
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ],
                    pagination: {
                        showPagination: true,
                        indexKey: 'pageIndex',
                        sizeKey: 'pageSize',
                        pageSize: 20
                    }
                };
            },
            tableRequestConfigData() {
                return {
                    className: 'erd.cloud.foundation.core.tableview.entity.TableDefinition',
                    getAllFields: true,
                    conditionDtoList: this.conditionDtoList,
                    orderBy: 'createTime',
                    sortBy: 'desc'
                };
            },
            isConfigDialog() {
                return this.dialogObj.component === 'globalSearchConfig';
            },
            checkedNodes() {
                return this.$store.getters.getGlobalSearchConfig('checkedNodes') || [];
            }
        },
        watch: {
            applicationOid(val) {
                this.getTypeTree(val);
            }
        },
        created() {
            this.getApplication();
        },
        methods: {
            getApplication() {
                this.$famHttp({
                    url: '/platform/application/getCurrentTenantIdApplication'
                }).then((resp) => {
                    const { data } = resp || [];
                    this.applicationList = data;
                });
            },
            getTypeTree(applicationOid) {
                if (applicationOid) {
                    this.$famHttp({
                        url: '/fam/type/typeDefinition/getTypeTree',
                        className: 'erd.cloud.foundation.type.entity.TypeDefinition',
                        params: {
                            applicationOid
                        }
                    }).then((resp) => {
                        const { data } = resp || [];
                        this.treeSelectData = data;
                    });
                }
            },
            configModel() {
                this.toggleDialog(true, this.i18n.configure, 'globalSearchConfig');
            },
            linkClick(row) {
                const currentRow = erdcloudKit.deserializeArray(row.attrRawList);
                this.$emit('switch-component', 'ViewManager', $.extend(true, row, currentRow));
            },
            editViewTable(row) {
                this.toggleDialog(true, this.i18n.edit, 'viewTableForm');
                this.viewTableFormObj.oid = row.oid;
                this.viewTableFormObj.editable = true;
            },
            deleteViewTable(row) {
                const tableName = row.displayName;
                let confirmText = utils.setTextBySysLanguage({
                    CN: this.$t('confirmDeleteTip', { name: tableName }),
                    EN: `Are you sure delete [${tableName}]?`
                });
                const { info, confirm, cancel, deleteSuccess } = this.i18n;
                this.$confirm(confirmText, info, {
                    type: 'warning',
                    confirmButtonText: confirm,
                    cancelButtonText: cancel
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/globalSearch/deleteTable',
                        params: {
                            tableKey: row.tableKey
                        },
                        method: 'POST'
                    }).then((resp) => {
                        const { success, message } = resp;
                        if (success) {
                            this.$message.success(deleteSuccess);
                            this.refreshTable();
                        } else {
                            this.$message({
                                type: 'error',
                                message: message
                            });
                        }
                    });
                });
            },
            toggleDialog(status, title = '', component = '') {
                this.dialogObj.title = title;
                this.dialogObj.visible = status;
                this.dialogObj.component = component;
            },
            handleFilterChange(type) {
                if (type === 'appName') {
                    this.mainModelType = '';
                    this.nameI18nJson = '';
                }
                if (type === 'mainModelType') {
                    this.nameI18nJson = '';
                }
                this.conditionDtoList = ['appName', 'mainModelType', 'nameI18nJson']
                    .map((prop) => {
                        if (this[prop]) {
                            return {
                                attrName: prop,
                                oper: prop === 'nameI18nJson' ? 'LIKE' : 'EQ',
                                value1: this[prop]
                            };
                        }
                        return;
                    })
                    .filter((item) => item);
                this.refreshTable();
            },
            refreshTable() {
                this.$nextTick(() => {
                    this.$refs.famAdvancedTable.fnCurrentPageChange(1);
                });
            },
            onSubmit() {
                if (this.isConfigDialog) {
                    this.submitConfig();
                } else {
                    this.submitVewForm();
                }
            },
            submitConfig() {
                const { checkedIdsMap } = this.$refs.globalSearchConfig;
                let rawDataVoList = [];
                let emptyViewModelArr = [];
                this.checkedNodes.forEach((item, index) => {
                    if (!item.tableKey) {
                        emptyViewModelArr.push(item.label);
                    }
                    let tempItem = {
                        attrRawList: [
                            {
                                attrName: 'typeName',
                                value: item.typeName
                            },
                            {
                                attrName: 'type',
                                value: 'DB'
                            },
                            {
                                attrName: 'tableKey',
                                value: item.tableKey || ''
                            },
                            {
                                attrName: 'sortOrder',
                                value: index + 1
                            }
                        ]
                    };
                    if (checkedIdsMap?.[item.oid]) {
                        tempItem.oid = checkedIdsMap[item.oid];
                    }
                    rawDataVoList.push(tempItem);
                });
                if (!rawDataVoList.length) {
                    this.$message.warning(`${this.i18n.noModelTip}`);
                    return;
                }
                if (emptyViewModelArr.length) {
                    this.$message.warning(`${emptyViewModelArr.join()} ${this.i18n.unassociatedView}`);
                    return;
                }

                let params = {
                    isFullUpdate: true,
                    className: 'erd.cloud.foundation.search.entity.GlobalSearch',
                    rawDataVoList
                };
                this.btnLoading = true;
                this.$famHttp({
                    url: 'fam/saveOrUpdate',
                    data: params,
                    method: 'POST'
                })
                    .then(() => {
                        this.$message.success(this.i18n.saveSuccess);
                        this.$store.dispatch('setGlobalSearchConsum', {
                            action: 'getModelTypeList',
                            key: 'modelTypeList'
                        });
                        this.toggleDialog(false);
                        this.refreshTable();
                    })
                    .finally(() => {
                        this.btnLoading = false;
                    });
            },
            submitVewForm() {
                this.btnLoading = true;
                this.$refs.viewTableForm
                    .submit()
                    .then(async () => {
                        this.toggleDialog(false);
                        this.refreshTable();
                    })
                    .finally(() => {
                        this.btnLoading = false;
                    });
            }
        }
    };
});
