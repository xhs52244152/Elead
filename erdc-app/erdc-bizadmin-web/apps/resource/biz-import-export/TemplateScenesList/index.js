define([
    'text!' + ELMP.resource('biz-import-export/TemplateScenesList/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('biz-import-export/TemplateScenesList/style.css')
], function (template, utils) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            CreateOrEditForm: FamKit.asyncComponent(ELMP.resource('biz-import-export/CreateOrEditForm/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamImport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-import-export/TemplateScenesList/locale/index.js'),
                i18nMappingObj: {
                    模板业务编码: this.getI18nByKey('模板业务编码'),
                    模板分类名称: this.getI18nByKey('模板分类名称'),
                    noCurrentTenant: this.getI18nByKey('noCurrentTenant')
                },
                currentTable: 'templateCategory',
                selectedAppName: 'all',
                editRow: null,
                editTemplate: null,
                dialogTitle: '',
                dialogVisiable: false,
                loading: false,
                isReadonly: false,
                importVisible: false,
                requestConfig: {}
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            tenantId() {
                return this.$store.state.app.tenantId;
            },
            categoryClassName() {
                return this.$store.getters.className('exportBusinessInfo');
            },
            templateClassName() {
                return this.$store.getters.className('exportTemplate');
            },
            editRowCode() {
                return this.editRow?.name;
            },
            editRowName() {
                return this.editRow?.nameI18nJson;
            },
            baseParams() {
                const baseParams = {
                    className: this.categoryClassName,
                    orderBy: 'createTime',
                    sortBy: 'desc'
                };
                if (this.selectedAppName !== 'all') {
                    baseParams.conditionDtoList = [
                        {
                            attrName: 'appName',
                            oper: 'EQ',
                            value1: this.selectedAppName === 'all' ? '' : this.selectedAppName
                        }
                    ];
                }
                return baseParams;
            },
            templateCategoryTableConfig() {
                return {
                    viewOid: '',
                    searchParamsKey: 'searchKey',
                    addOperationCol: true,
                    addSeq: true,
                    addCheckbox: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/search',
                        headers: {
                            'App-Name': 'ALL'
                        },
                        params: {},
                        data: this.baseParams,
                        method: 'post'
                    },
                    fieldLinkConfig: {
                        fieldLink: true,
                        fieldLinkName: 'nameI18nJson',
                        linkClick: (row) => {
                            this.gotoTemplateList(row, 'templateList');
                        }
                    },
                    headerRequestConfig: {
                        url: '/fam/table/head',
                        method: 'POST',
                        data: {
                            className: this.categoryClassName
                        }
                    },
                    firstLoad: true,
                    isDeserialize: true,
                    toolbarConfig: {
                        showConfigCol: false,
                        showMoreSearch: false,
                        fuzzySearch: {
                            show: true,
                            clearable: true,
                            width: '280',
                            placeholder: '请输入名称'
                        },
                        actionConfig: {
                            name: 'ExportBusinessInfo_TABLE_ACTION',
                            containerOid: this.$store.state.space?.context?.oid || ''
                        }
                    },
                    tableBaseConfig: {
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left',
                        columnConfig: {
                            resizable: true
                        },
                        showOverflow: true
                    },
                    pagination: {
                        // 分页
                        pageSize: 20,
                        indexKey: 'pageIndex',
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    columns: [],
                    slotsField: [
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ]
                };
            },
            templateTableConfig() {
                return {
                    viewOid: '',
                    searchParamsKey: 'searchKey',
                    addOperationCol: true,
                    addSeq: true,
                    addCheckbox: true,
                    tableRequestConfig: {
                        url: '/fam/search',
                        params: {},
                        data: {
                            className: this.templateClassName,
                            conditionDtoList: [
                                {
                                    attrName: 'businessRef',
                                    oper: 'EQ',
                                    value1: this.editRow.oid
                                }
                            ],
                            orderBy: 'updateTime',
                            sortBy: 'desc'
                        },
                        method: 'post'
                    },
                    fieldLinkConfig: {
                        fieldLink: true,
                        fieldLinkName: 'nameI18nJson',
                        linkClick: (row) => {
                            this.dialogTitle = '导入导出模板详情';
                            this.reviewDetailDialog(row);
                        }
                    },
                    headerRequestConfig: {
                        url: '/fam/table/head',
                        method: 'POST',
                        data: {
                            className: this.templateClassName,
                            conditionDtoList: [
                                {
                                    attrName: 'businessRef',
                                    oper: 'EQ',
                                    value1: this.editRow.oid
                                }
                            ]
                        }
                    },
                    firstLoad: true,
                    isDeserialize: true,
                    toolbarConfig: {
                        showConfigCol: false,
                        showMoreSearch: false,
                        fuzzySearch: {
                            show: false,
                            clearable: true,
                            width: '280',
                            placeholder: '请输入名称'
                        },
                        actionConfig: {
                            name: 'ExportTemplate_TABLE_ACTION',
                            containerOid: this.$store.state.space?.context?.oid || ''
                        }
                    },
                    tableBaseConfig: {
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left',
                        columnConfig: {
                            resizable: true
                        },
                        showOverflow: true
                    },
                    pagination: {
                        pageSize: 20,
                        indexKey: 'pageIndex',
                        sizeKey: 'pageSize'
                    },
                    columns: [],
                    slotsField: [
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ]
                };
            },
            appNameOptionsList() {
                const userAppNames = this.$store.state.app.appNames || [];
                return [
                    {
                        identifierNo: 'all',
                        displayName: '全部'
                    },
                    ...userAppNames
                ];
            }
        },
        watch: {
            currentTable(val) {
                this.$nextTick(() => {
                    this.$refs[`${val}Table`].initTable();
                });
            }
        },
        methods: {
            getActionPullTip(row) {
                return row.tenantId === this.tenantId ? '' : this.i18nMappingObj.noCurrentTenant;
            },
            getActionConfig(row, name) {
                return {
                    name,
                    objectOid: row.oid
                };
            },
            onCategoryCommand(btnInfo, rowData) {
                switch (btnInfo.name) {
                    case 'ExportBusinessInfo_DETAIL':
                        this.handlerReviewCategory(rowData);
                        break;
                    case 'ExportBusinessInfo_UPDATE':
                        this.handlerEditCategory(rowData);
                        break;
                    case 'ExportBusinessInfo_DELETE':
                        this.handlerDeleteCategory(rowData);
                        break;
                    default:
                        break;
                }
            },
            onCommand(btnInfo, rowData) {
                switch (btnInfo.name) {
                    case 'ExportTemplate_DETAIL':
                        this.reviewDetailDialog(rowData, 'details');
                        break;
                    case 'ExportTemplate_UPDATE':
                        this.dialogTitle = '编辑导入导出模板';
                        this.handlerEditTemplate(rowData);
                        break;
                    case 'ExportTemplate_DELETE':
                        this.handlerDeleteTemplate(rowData);
                        break;
                    default:
                        break;
                }
            },
            changeAppName() {
                this.$refs.templateCategoryTable?.fnRefreshTable();
            },
            refreshTemplateTable() {
                this.$refs.templateListTable?.fnRefreshTable();
            },
            gotoTemplateList(row, currentTableName) {
                this.$set(this, 'editRow', row);
                this.currentTable = currentTableName;
            },
            openCreateOrEditDialog() {
                this.dialogVisiable = true;
            },
            onHandlerConfirm() {
                this.$refs.createOrEditForm.validate();
            },
            handlerReviewCategory(rowData) {
                this.dialogTitle = '导入导出模板类别详情';
                this.$set(this, 'editRow', rowData);
                this.isReadonly = true;
                this.openCreateOrEditDialog();
            },
            handlerEditCategory(row) {
                this.dialogTitle = '编辑导入导出模板类别';
                this.$set(this, 'editRow', row);
                this.openCreateOrEditDialog();
            },
            handlerDeleteCategory(row) {
                this.$alert('确认删除此模板类别吗？', {
                    title: '确认删除'
                }).then(() => {
                    this.$famHttp('/fam/delete', {
                        method: 'DELETE',
                        params: {
                            oid: row.oid
                        }
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: `删除成功`,
                            showClose: true
                        });
                        this.changeAppName();
                    });
                });
            },
            handlerFormSubmit(isCreateForm, formData) {
                this.loading = true;
                const isCategory = this.currentTable === 'templateCategory';
                const data = {
                    className: isCategory ? this.categoryClassName : this.templateClassName
                };
                if (isCategory) {
                    data.attrRawList = formData;
                } else {
                    data.attrRawList = formData.attrRawList;
                    data.contentSet = formData.contentSet;
                }
                if (!isCreateForm) {
                    data.oid = isCategory ? this.editRow?.oid : this.editTemplate?.oid?.value;
                }
                const url = `/fam/${isCreateForm ? 'create' : 'update'}`;
                this.$famHttp({ url, data: data, method: 'POST' })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: `保存成功`,
                            showClose: true
                        });
                        this.onHandlerCancel();
                        if (isCategory) {
                            this.changeAppName();
                        } else {
                            this.refreshTemplateTable();
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            onHandlerCancel() {
                this.dialogVisiable = false;
                this.isReadonly = false;
                if (this.currentTable === 'templateCategory') {
                    this.$set(this, 'editRow', null);
                } else {
                    this.$set(this, 'editTemplate', null);
                }
            },
            handlerEditTemplate(row) {
                this.$famHttp({
                    url: '/fam/attr',
                    data: {
                        oid: row.oid
                    }
                }).then((resp) => {
                    this.$set(this, 'editTemplate', resp.data.rawData);
                    this.openCreateOrEditDialog();
                });
            },
            handlerDeleteTemplate(row) {
                this.$confirm('确认删除此模板吗？', '确认删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$famHttp('/fam/delete', {
                        method: 'DELETE',
                        params: {
                            oid: row.oid
                        }
                    })
                        .then(() => {
                            this.$message({
                                type: 'success',
                                message: `删除成功`,
                                showClose: true
                            });
                            this.refreshTemplateTable();
                        })
                        .catch(() => {
                            this.$message({
                                type: 'error',
                                message: '删除失败',
                                showClose: true
                            });
                        });
                });
            },
            reviewDetailDialog(row, type) {
                if (type === 'details') {
                    this.dialogTitle = '导入导出模板详情';
                    this.isReadonly = true;
                    this.handlerEditTemplate(row);
                    return;
                }
                let attrRawList = row.attrRawList || [];
                let file = attrRawList.find((i) => i.attrName === 'fileList');
                let authorizeCode = attrRawList.find((i) => i.attrName === 'authorizeCode');
                if (file && file.value && file.value.length) {
                    utils.downloadFile(file.value[0].fileId, authorizeCode.value[file.value[0].fileId]);
                }
                // utils
                //     .downFile({
                //         method: 'get',
                //         url: '/fam/export/template/downTemplate',
                //         data: {
                //             oid: row.oid
                //         }
                //     })
                //     .catch((error) => {
                //         console.error(error);
                //     });
            },
            batchDeleteTemplate(data, type) {
                if (data.length === 0) {
                    this.$message({
                        type: 'warning',
                        message: '请勾选需要删除的行.'
                    });
                    return;
                }
                this.$confirm('确认删除', '确认删除', {
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    const deleteIds = data.map((item) => item.oid);
                    this.$famHttp({
                        url: '/fam/deleteByIds',
                        method: 'delete',
                        params: {},
                        data: {
                            oidList: deleteIds,
                            className: type === 'template' ? this.templateClassName : this.categoryClassName
                        }
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: `批量删除成功`,
                            showClose: true
                        });
                        type === 'template' ? this.refreshTemplateTable() : this.changeAppName();
                    });
                });
            },

            // 模板详情功能按钮事件
            actionClick(type, data) {
                const eventClick = {
                    ExportTemplate_CREATE: this.onCreate,
                    ExportTemplate_DELETE: this.onDelete
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            },
            onCreate() {
                this.dialogTitle = this.i18n.createImportExportTemplate;
                this.openCreateOrEditDialog();
            },
            onDelete(data) {
                this.batchDeleteTemplate(data, 'template');
            },

            // 导入导出模板功能按钮事件
            actionClickCategory(type, data) {
                const eventClick = {
                    ExportBusinessInfo_CREATE: this.onCreateCategory,
                    ExportBusinessInfo_DELETE: this.onDeleteCategory,
                    ExportTemplate_Import: this.onImport,
                    ExportTemplate_Export: this.onExport
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            },
            onCreateCategory() {
                this.dialogTitle = this.i18n.createImportExportTemplateCategories;
                this.openCreateOrEditDialog();
            },
            onImport() {
                this.importVisible = true;
            },
            importSuccess() {
                this.refreshTemplateTable();
            },
            onExport() {
                this.$famHttp({
                    url: '/fam/export',
                    method: 'POST',
                    data: {
                        businessName: 'ExportTemplateExport'
                    }
                }).then(() => {
                    this.$message({
                        type: 'success',
                        dangerouslyUseHTMLString: true,
                        message: this.i18n.exporting,
                        showClose: true
                    });
                });
            },
            onDeleteCategory(data) {
                this.batchDeleteTemplate(data, 'category');
            }
        }
    };
});
