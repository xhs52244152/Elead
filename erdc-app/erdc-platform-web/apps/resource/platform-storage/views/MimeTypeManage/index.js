define([
    'erdcloud.kit',
    ELMP.resource('platform-storage/api.js'),
    ELMP.resource('platform-storage/components/TypeEdit/index.js'),
    'text!' + ELMP.resource('platform-storage/views/MimeTypeManage/index.html')
], function (erdcloudKit, api, typeEdit, template) {
    return {
        template,
        components: {
            typeEdit,
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys([
                        'fileTypeCode',
                        'fileTypeName',
                        'mimeType',
                        'fileClassification',
                        'fileFormat',
                        'searchTips'
                    ]),
                    create: this.getI18nByKey('创建'),
                    batchDelete: this.getI18nByKey('批量删除'),
                    selectTip: this.getI18nByKey('请选择数据'),
                    deleteTip: this.getI18nByKey('deleteTip'),
                    delSuccess: this.getI18nByKey('删除成功'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    tip: this.getI18nByKey('提示')
                },
                baseType: null,
                fileTypes: []
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            viewTableConfig() {
                const { i18nMappingObj } = this;
                return {
                    firstLoad: true,
                    addSeq: true,
                    addCheckbox: true,
                    addOperationCol: false,
                    columns: [
                        {
                            attrName: 'defineCode',
                            label: i18nMappingObj.fileTypeCode
                        },
                        {
                            attrName: 'defineName',
                            label: i18nMappingObj.fileTypeName
                        },
                        {
                            attrName: 'extension',
                            label: i18nMappingObj.fileFormat,
                            width: '100'
                        }
                    ],
                    tableBaseConfig: {
                        showOverflow: true, // 溢出隐藏显示省略号
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        rowConfig: {
                            keyField: 'id'
                        }
                    },
                    toolbarConfig: {
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: true,
                            placeholder: i18nMappingObj.searchTips,
                            clearable: true,
                            width: '280'
                        },
                        showConfigCol: true,
                        showRefresh: true,
                        showMoreSearch: false,
                        mainBtn: {
                            label: i18nMappingObj.create,
                            onclick: () => {
                                this.create();
                            }
                        },
                        secondaryBtn: [
                            {
                                label: i18nMappingObj.batchDelete,
                                onclick: () => {
                                    this.handleBatchDelete();
                                }
                            },
                            {
                                label: i18nMappingObj.fileClassification,
                                onclick: () => {
                                    this.goFileType();
                                }
                            }
                        ]
                    },
                    tableRequestConfig: {
                        url: '/file/doc/v1/type/link/page'
                    },
                    pagination: {
                        showPagination: true,
                        pageSize: 20
                    }
                };
            }
        },
        created() {
            this.getFileTypes();
        },
        methods: {
            create() {
                this.$refs.editRef.show();
            },
            goFileType() {
                this.$router.push({
                    path: 'classification'
                });
            },
            handleSaveSuccess() {
                this.refreshTable();
            },
            /**
             * 批量删除
             */
            handleBatchDelete() {
                const { i18nMappingObj } = this;

                let selected = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                if (!selected.length) {
                    this.$message({
                        type: 'warning',
                        message: i18nMappingObj.selectTip,
                        showClose: true
                    });
                    return;
                }
                this.$confirm(this.i18nMappingObj.deleteTip, this.i18nMappingObj.tip, {
                    confirmButtonText: i18nMappingObj.confirm,
                    cancelButtonText: i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    const ids = selected.map((item) => item.id);
                    this.delectedRequest(ids);
                });
            },
            delectedRequest(ids) {
                api.baseType
                    .delete(ids)
                    .then((res) => {
                        if (res.code === '200') {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.delSuccess,
                                showClose: true
                            });
                            this.refreshTable();
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            },
            refreshTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            getFileTypes() {
                api.fileType
                    .getList()
                    .then((res) => {
                        if (res.success) {
                            this.fileTypes = res.data ?? [];
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            }
        }
    };
});
