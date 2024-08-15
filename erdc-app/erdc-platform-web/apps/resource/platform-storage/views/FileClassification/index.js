define([
    'text!' + ELMP.resource('platform-storage/views/FileClassification/index.html'),
    'erdcloud.kit',
    ELMP.resource('platform-storage/api.js'),
    ELMP.resource('platform-storage/components/FileClassificationEdit/index.js')
], function (template, erdcloudKit, api, FileTypeEdit) {
    return {
        template,
        components: {
            FileTypeEdit,
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys([
                        'sort',
                        'name',
                        'code',
                        'icon',
                        'moveUp',
                        'moveDown',
                        'back',
                        'fileClassification'
                    ]),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    batchDelete: this.getI18nByKey('批量删除'),
                    selectTip: this.getI18nByKey('请选择数据'),
                    deleteTip: this.getI18nByKey('deletTip'),
                    delSuccess: this.getI18nByKey('删除成功'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    tip: this.getI18nByKey('提示')
                },

                tableHeight: document.body.clientHeight - 188,
                total: 0,
                fileType: null
            };
        },
        computed: {
            viewTableConfig() {
                const { i18nMappingObj } = this;

                let self = this;
                return {
                    firstLoad: true,
                    addSeq: true,
                    addCheckbox: true,
                    addOperationCol: false,
                    columns: [
                        {
                            attrName: 'name',
                            label: i18nMappingObj.name
                        },
                        {
                            attrName: 'code',
                            label: i18nMappingObj.code
                        },
                        {
                            attrName: 'icon',
                            label: i18nMappingObj.icon
                        },
                        {
                            attrName: 'operation',
                            label: '操作',
                            isDisable: true,
                            fixed: 'right',
                            showOverflow: false,
                            width: 150
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'operation',
                            type: 'default'
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
                            show: false
                        },
                        showConfigCol: true,
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
                            }
                        ]
                    },
                    tableRequestConfig: {
                        url: '/file/doc/v1/type/define/page',
                        transformResponse: [
                            function (data) {
                                let resData = data;
                                try {
                                    resData = data && JSON.parse(data);
                                    self.total = parseInt(resData.data.total ?? 0);
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    pagination: {
                        showPagination: true,
                        pageSize: 20
                    }
                };
            }
        },
        created() {
            this.tableHeight = document.body.clientHeight - 188;
        },
        methods: {
            goBack() {
                this.$router.back();
            },
            create() {
                this.fileType = null;
                this.$nextTick(() => {
                    this.$refs.editRef.show();
                });
            },
            handleEdit(data) {
                this.fileType = data;
                this.$nextTick(() => {
                    this.$refs.editRef.show();
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
                    this.deletedRequest(ids);
                });
            },
            deletedRequest(ids) {
                api.fileType
                    .del(ids)
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
            handleSort(row, direction) {
                api.fileType
                    .sort(row.id, direction)
                    .then((res) => {
                        if (res.success) {
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
            }
        }
    };
});
