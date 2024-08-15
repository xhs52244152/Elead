define([
    'text!' + ELMP.resource('erdc-permission-components/PermissionIndex/index.html'),
    'css!' + ELMP.resource('erdc-permission-components/PermissionIndex/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            TypeTreeSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-permission-components/TypeTreeSelect/index.js')),
            StatusSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-permission-components/StatusSelect/index.js')),
            AddOrEditPermission: ErdcKit.asyncComponent(
                ELMP.resource('erdc-permission-components/AddOrEditPermission/index.js')
            ),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            )
        },
        props: {
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            queryScope: {
                type: String,
                default: 'fullTenant'
            },
            row: {
                type: Object,
                default() {
                    return null;
                }
            },
            appName: String,
            isBasics: Boolean,
            showSearch: {
                type: Boolean,
                default: true
            },
            beforeRequest: Function,
            includeAncestorDomain: {
                type: Boolean,
                default() {
                    return true;
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-permission-components/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    type: this.getI18nByKey('类型'),
                    state: this.getI18nByKey('状态'),
                    inherit: this.getI18nByKey('继承父级'),
                    moreOperation: this.getI18nByKey('更多操作'),
                    add: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    delete: this.getI18nByKey('删除'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    search: this.getI18nByKey('搜索'),
                    deleteSuccess: this.getI18nByKey('删除成功'),
                    deleteTips: this.getI18nByKey('删除确认提示'),
                    deleteConfirm: this.getI18nByKey('确认删除'),
                    editPermission: this.getI18nByKey('编辑对象权限'),
                    createPermission: this.getI18nByKey('创建对象权限'),
                    setValidCondition: this.getI18nByKey('请设置有效条件'),
                    context: this.getI18nByKey('上下文'),
                    participants: this.getI18nByKey('参与者'),
                    gPermission: this.getI18nByKey('授予权限'),
                    dPermission: this.getI18nByKey('拒绝权限'),
                    aPermission: this.getI18nByKey('绝对拒绝权限'),
                    operation: this.getI18nByKey('操作'),
                    searchPlease: this.getI18nByKey('请输入'),
                    btachDeleteEmpty: this.getI18nByKey('请选择删除')
                },
                pageLoading: false,
                organizationInfo: {},
                searchConditionsObj: {
                    typeSelected: null,
                    searchInputValue: '',
                    includeAncestorDomain: this.includeAncestorDomain,
                    appName: ''
                },
                typeOptList: [],
                moreOperateList: [
                    // {
                    //     // 更多操作按钮配置
                    //     name: '删除',
                    //     clickFnName: 'handlerBatchDelete'
                    // }
                    // {
                    //     name: '导入',
                    //     clickFnName: 'handlerImportPermission'
                    // },
                    // {
                    //     name: '导出',
                    //     clickFnName: 'handlerExportPermission'
                    // }
                ],
                objPermissionTableData: [],
                dialogTitle: '',
                pageInfo: {
                    currentPage: 1,
                    total: 0,
                    pageSize: 20
                },
                isEditPermission: true,
                tableSelectedData: [],
                typeSelectCopy: {}
            };
        },
        computed: {
            allColumns() {
                return [
                    {
                        prop: 'checkbox',
                        type: 'checkbox',
                        width: 40,
                        align: 'center'
                    },
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        width: '48',
                        align: 'center'
                    },
                    {
                        prop: 'containerName',
                        title: this.i18nMappingObj.context,
                        minWidth: 120,
                        canHide: true
                    },
                    {
                        prop: 'typeDisplayName',
                        title: this.i18nMappingObj.type,
                        minWidth: 110,
                        canHide: true
                    },
                    {
                        prop: 'stateDisplayName',
                        title: this.i18nMappingObj.state,
                        minWidth: 80,
                        canHide: true
                    },
                    {
                        prop: 'principalName',
                        title: this.i18nMappingObj.participants,
                        minWidth: 120
                    },
                    {
                        prop: 'grantPermission',
                        title: this.i18nMappingObj.gPermission,
                        minWidth: 200
                    },
                    {
                        prop: 'denialOfPermission',
                        title: this.i18nMappingObj.dPermission,
                        minWidth: 200
                    },
                    {
                        prop: 'absoluteDenialOfPermission',
                        title: this.i18nMappingObj.aPermission,
                        minWidth: 200
                    },
                    {
                        prop: 'appDisplayName',
                        title: this.i18n.scopeApplication,
                        minWidth: 200,
                        canHide: true
                    },
                    {
                        prop: 'operation',
                        title: this.i18nMappingObj.operation,
                        width: 100,
                        fixed: 'right',
                        canHide: true
                    }
                ].filter(Boolean);
            },
            objPermissionTableColumns() {
                if (this.isEditPermission) {
                    return this.allColumns;
                } else {
                    return this.allColumns.filter((item) => {
                        if (!item.canHide) {
                            return item;
                        }
                    });
                }
            },
            tableCheckboxConfig() {
                return {
                    checkMethod(data) {
                        const rowData = data.row || {};

                        return !rowData.isExtends;
                    }
                };
            },
            innerRow() {
                return {
                    components: 'constant-select',
                    viewProperty: 'displayName',
                    valueProperty: 'identifierNo',
                    referenceList: this.$store?.state?.app?.appNames || [],
                    clearable: true
                };
            },
            isContext() {
                return !this.row?.noContext;
            },
            filterConfigs() {
                return [
                    {
                        label: this.i18n.app,
                        field: 'appNames',
                        component: 'custom-select',
                        componentJson: JSON.stringify({
                            props: {
                                row: this.innerRow,
                                clearable: true,
                                filterable: true,
                                multiple: this.isEditPermission
                            }
                        }),
                        listeners: {
                            input: this.submitSearch
                        }
                    },
                    {
                        label: this.i18nMappingObj.type,
                        field: 'typeSelected'
                    },
                    {
                        label: this.i18nMappingObj.state,
                        field: 'status'
                    },
                    {
                        label: this.i18n.inheritParent,
                        field: 'includeAncestorDomain',
                        component: 'erd-checkbox',
                        hidden: !this.isEditPermission,
                        listeners: {
                            change: this.submitSearch
                        }
                    }
                ].filter((item) => (item.field === 'appNames' ? this.isEditPermission : true) && !item?.hidden);
            }
        },
        mounted() {
            this.$emit('permissionReady');
        },
        methods: {
            changeOrganization(selectedObj) {
                this.organizationInfo = selectedObj;
                if (selectedObj?.holderTypeName && !this.isEditPermission) {
                    this.typeSelectCopy = {
                        appName: selectedObj.appName,
                        displayName: selectedObj.holderTypeDisplayName,
                        id: selectedObj.holderTypeOid,
                        name: selectedObj.holderTypeName
                    };
                    this.$set(this.searchConditionsObj, 'typeSelected', this.typeSelectCopy);
                } else {
                    this.typeSelectCopy = null;
                    this.$set(this.searchConditionsObj, 'typeSelected', this.typeSelectCopy);
                }
                if (!this.isEditPermission) {
                    this.$set(this.searchConditionsObj, 'statusName', 'ALL');
                    this.$set(this.searchConditionsObj, 'statusValue', '-1');
                } else {
                    this.$set(this.searchConditionsObj, 'statusName', '');
                    this.$set(this.searchConditionsObj, 'statusValue', '');
                }
                this.resetPageInfo();
                this.getPermissionTableData();
                this.$refs?.permissionTypeSelect?.[0]?.getTypeData();
            },
            changeEditPermission(flag) {
                this.isEditPermission = flag;
                this.resetPageInfo();
                this.resetSearchConditions();

                if (!flag && !_.isEmpty(this.typeSelectCopy)) {
                    this.$set(this.searchConditionsObj, 'typeSelected', this.typeSelectCopy);
                }
                // if (!flag) {
                //     this.objPermissionTableData = [];
                // } else {
                this.refreshTableData();
                // }
            },
            refreshTableData() {
                this.handlerSearchPermission();
            },
            formatDialogDataByRow(row) {
                // 封装dialog需要的权限列表
                const accessPermissions = row.accessPermissions || [];
                const grantPermissionArr = this.getPermissionNameByType(accessPermissions, '1', 'code');
                const denialOfPermissionArr = this.getPermissionNameByType(accessPermissions, '2', 'code');
                const absoluteDenialOfPermission = this.getPermissionNameByType(accessPermissions, '3', 'code');
                // 封装dialog基本信息模块
                const typeSelectObj = {
                    id: row.typeName,
                    name: row.typeName,
                    displayName: row.typeDisplayName,
                    appName: row.appName
                };
                const statusSelectObj = {
                    name: row.stateName,
                    displayName: row.stateDisplayName
                };
                const participantObj = {
                    principalName: row.principalName,
                    principalRef: row.principalRef,
                    principalTarget: row.principalTarget,
                    principal: row.principal || {}
                };
                return {
                    editFormData: {
                        typeSelectObj: typeSelectObj,
                        statusSelectObj: statusSelectObj,
                        participantObj: participantObj
                    },
                    editTableData: {
                        grantPermissionArr: grantPermissionArr,
                        denialOfPermissionArr: denialOfPermissionArr,
                        absoluteDenialOfPermission: absoluteDenialOfPermission
                    },
                    editRowId: row.id
                };
            },
            editRow(data) {
                const { row } = data;
                const dialogDefaultData = this.formatDialogDataByRow(row);
                this.dialogTitle = this.i18nMappingObj.editPermission;
                if (row.appName) {
                    this.queryParams.data.appName = row.appName;
                }
                // 打开dialog
                this.$refs.addOrEditPermissionDialog.showOrHideDialog(
                    true,
                    dialogDefaultData,
                    this.organizationInfo.defaultDomainRef || this.organizationInfo.domainRef
                );
            },
            onDeleteRow(data) {
                this.$confirm(this.i18nMappingObj.deleteTips, this.i18nMappingObj.deleteConfirm, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    const params =
                        data &&
                        data.map((item) => {
                            return {
                                domainRef: item.ownerDomainRef,
                                principalRef: item.principalRef,
                                stateName: item.stateName,
                                typeName: item.typeName,
                                allExceptPrincipal: item.allExceptPrincipal,
                                appNames: _.isArray(item.appName) ? item.appName : [item.appName]
                            };
                        });
                    this.$famHttp({
                        url: '/fam/access/deleteRule',
                        method: 'POST',
                        data: params
                    })
                        .then(() => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.deleteSuccess,
                                showClose: true
                            });
                            this.tableSelectedData = [];
                            this.refreshTableData();
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            },
            deleteRow(data) {
                this.onDeleteRow([data.row]);
            },
            selectChangeEvent() {
                // do noting.
            },
            handlerMenuClick(fnName) {
                this[fnName]();
            },
            submitSearch: _.debounce(function () {
                this.resetPageInfo();
                this.handlerSearchPermission();
            }, 100),
            handlerSearchPermission() {
                // if (
                //     !this.isEditPermission &&
                //     (!this.searchConditionsObj.typeSelected?.name || !this.searchConditionsObj.statusName)
                // ) {
                //     this.$message({ message: this.i18nMappingObj.setValidCondition, type: 'warning', showClose: true });
                //     return;
                // }
                this.getPermissionTableData();
            },
            getPermissionTableData() {
                const { defaultDomainRef, domainRef } = this.organizationInfo || {};
                if (!defaultDomainRef && !domainRef) {
                    return;
                }
                const requestUrl = this.isEditPermission
                    ? '/fam/access/getAclControlRuleList'
                    : '/fam/access/getEffectiveRules';
                const requestParams = {
                    domainRef: defaultDomainRef || domainRef,
                    typeName: this.searchConditionsObj.typeSelected?.name,
                    stateName: this.searchConditionsObj.statusName,
                    keyword: this.searchConditionsObj.searchInputValue
                };
                if (this.isEditPermission) {
                    requestParams.pageSize = this.pageInfo.pageSize;
                    requestParams.pageIndex = this.pageInfo.currentPage;
                    requestParams.includeAncestorDomain = this.searchConditionsObj.includeAncestorDomain;
                    requestParams.appNames = this.searchConditionsObj.appNames;
                } else {
                    requestParams.appName = this.appName;
                }
                this.pageLoading = true;
                if (_.isFunction(this.beforeRequest)) this.beforeRequest(requestParams);
                this.$famHttp({
                    url: requestUrl,
                    data: requestParams,
                    method: this.isEditPermission ? 'POST' : 'GET'
                })
                    .then((res) => {
                        if (res.success && res.data) {
                            let resRecords = res.data.records || [];
                            if (!this.isEditPermission) {
                                resRecords = res.data.rules;
                            }
                            this.objPermissionTableData = this.formatMainTableData(resRecords);
                            this.isEditPermission && (this.pageInfo.total = Number(res.data.total || 0));
                        }
                    })
                    .finally(() => {
                        this.pageLoading = false;
                    });
            },
            formatMainTableData(resData) {
                return resData.map((item, index) => {
                    const permissionInfoArr = item.accessPermissions || [];
                    const grantPermission = this.getPermissionNameByType(permissionInfoArr, '1', 'description').join(
                        ' , '
                    );
                    const denialOfPermission = this.getPermissionNameByType(permissionInfoArr, '2', 'description').join(
                        ' , '
                    );
                    const absoluteDenialOfPermission = this.getPermissionNameByType(
                        permissionInfoArr,
                        '3',
                        'description'
                    ).join(' , ');
                    return {
                        ...item,
                        id: index,
                        grantPermission: grantPermission,
                        denialOfPermission: denialOfPermission,
                        absoluteDenialOfPermission: absoluteDenialOfPermission
                    };
                });
            },
            getPermissionNameByType(list, type, filed) {
                const filterList = list.filter((item) => {
                    return item.permissionType === type;
                });
                return filterList.map((el) => {
                    return el[filed];
                });
            },
            handlerCreateObjPermission() {
                this.dialogTitle = this.i18nMappingObj.createPermission;
                this.$refs.addOrEditPermissionDialog.showOrHideDialog(
                    true,
                    null,
                    this.organizationInfo.defaultDomainRef || this.organizationInfo.domainRef
                );
            },
            handlerChangeTypeSelect(data) {
                if (data?.name === undefined) data = null;
                this.$set(
                    this.searchConditionsObj,
                    'typeSelected',
                    !this.isEditPermission && !data ? ErdcKit.deepClone(this.typeSelectCopy) : data
                );
                this.$nextTick(() => {
                    this.typeSelectCopy = ErdcKit.deepClone(data);
                    // if (this.isEditPermission || this.searchConditionsObj.statusValue) {
                    this.submitSearch();
                    // }
                });
            },
            handlerChangeStatusSelect(data) {
                this.$set(this.searchConditionsObj, 'statusName', data.name);
                this.$set(this.searchConditionsObj, 'statusValue', data.id);
                this.$nextTick(() => {
                    // if (this.isEditPermission || this.searchConditionsObj.typeSelected) {
                    this.submitSearch();
                    // }
                });
            },
            handleSizeChange(val) {
                this.pageInfo.currentPage = 1;
                this.pageInfo.pageSize = val;
                this.handlerSearchPermission();
            },
            handleCurrentChange(val) {
                this.pageInfo.currentPage = val;
                this.handlerSearchPermission();
            },
            resetPageInfo() {
                this.pageInfo = {
                    currentPage: 1,
                    total: 0,
                    pageSize: 20
                };
            },
            resetSearchConditions() {
                if (this.isEditPermission) {
                    this.$refs.permissionTypeSelect?.[0]?.clearTypeSelections();
                    this.$refs.permissionStatusSelect?.[0]?.clearStatusSelections();
                    this.searchConditionsObj = {
                        typeSelected: null,
                        searchInputValue: '',
                        includeAncestorDomain: true
                    };
                } else if (!this.searchConditionsObj.statusValue) {
                    this.$set(this.searchConditionsObj, 'statusName', 'ALL');
                    this.$set(this.searchConditionsObj, 'statusValue', '-1');
                }
            },
            operationSuccess() {
                this.refreshTableData();
            },
            handlerCheckboxChange(event) {
                const record = event?.$table?.getCheckboxRecords() || [];
                this.tableSelectedData = record.filter((item) => {
                    return !item.isExtends;
                });
            },
            // 删除
            handleBatchDelete() {
                if (this.tableSelectedData.length === 0) {
                    this.$message({ message: this.i18nMappingObj.btachDeleteEmpty, type: 'warning', showClose: true });
                    return;
                }
                this.onDeleteRow(this.tableSelectedData);
            },
            handlerImportPermission() {
                // do nothing.
            },
            handlerExportPermission() {
                // do nothing.
            }
        }
    };
});
