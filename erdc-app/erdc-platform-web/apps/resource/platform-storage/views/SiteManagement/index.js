define([
    'erdcloud.kit',
    ELMP.resource('platform-storage/api.js'),
    ELMP.resource('platform-storage/components/SiteEdit/index.js'),
    'text!' + ELMP.resource('platform-storage/views/SiteManagement/index.html'),
    'css!' + ELMP.resource('platform-storage/views/SiteManagement/index.css')
], function (erdcloudKit, api, SiteEdit, template) {
    return {
        template,
        components: {
            SiteEdit,
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys([
                        'name',
                        'code',
                        'address',
                        'healthState',
                        'mainSite',
                        'enableOrDisable',
                        'bindDepartments',
                        'syncRecord',
                        'syncStrategy',
                        'deleteSiteTip',
                        'siteDeleteSuccess',
                        'siteEnable',
                        'siteDown',
                        'siteActiveFailed',
                        'delete',
                        'enableSiteTip',
                        'yes',
                        'no',
                        'exceptionInfo',
                        'noExceptionInfo',
                        'confirm',
                        'cancel',
                        'siteFiles',
                        'veryslow',
                        'slow',
                        'fast',
                        'searchTips'
                    ]),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    open: this.getI18nByKey('启用'),
                    close: this.getI18nByKey('停用')
                },
                // 当前查看/编辑的站点
                detailVisible: false
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
                            attrName: 'name',
                            label: i18nMappingObj.name
                        },
                        {
                            attrName: 'code',
                            label: i18nMappingObj.code
                        },
                        {
                            attrName: 'serverAddr',
                            label: i18nMappingObj.address
                        },
                        {
                            attrName: 'health',
                            label: i18nMappingObj.healthState,
                            width: '80px'
                        },
                        {
                            attrName: 'active',
                            label: i18nMappingObj.enableOrDisable,
                            width: '80px'
                        },
                        {
                            attrName: 'mainCenter',
                            label: i18nMappingObj.mainSite,
                            width: '80px'
                        },
                        {
                            attrName: 'operation',
                            label: this.i18nMappingObj.operate,
                            isDisable: true,
                            fixed: 'right',
                            showOverflow: false,
                            width: '160px'
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'health',
                            type: 'default'
                        },
                        {
                            prop: 'active',
                            type: 'default'
                        },
                        {
                            prop: 'mainCenter',
                            type: 'default'
                        },
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
                                this.handleEditSite();
                            }
                        },
                        secondaryBtn: [
                            {
                                label: i18nMappingObj.bindDepartments,
                                onclick: () => {
                                    this.handleBindDepartment();
                                }
                            }
                        ]
                    },
                    tableRequestConfig: {
                        url: api.url.site.pageList
                    },
                    pagination: {
                        showPagination: true,
                        pageSize: 20
                    }
                };
            }
        },
        methods: {
            refreshTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            isMainCenter(mainCenter) {
                return mainCenter ? this.i18nMappingObj.yes : this.i18nMappingObj.no;
            },
            getHealthClass(health) {
                let className = '';
                if (health <= 60) {
                    className = 'health-veryslow';
                } else if (health > 60 && health <= 90) {
                    className = 'health-slow';
                } else if (health > 90 && health <= 100) {
                    className = 'health-excellent';
                }
                return className;
            },
            getHealthTitle(health) {
                let title = '';
                if (health <= 60) {
                    title = this.i18nMappingObj.veryslow;
                } else if (health > 60 && health <= 90) {
                    title = this.i18nMappingObj.slow;
                } else if (health > 90 && health <= 100) {
                    title = this.i18nMappingObj.fast;
                }
                return title;
            },
            handleDelete(siteInfo) {
                const { i18nMappingObj } = this;

                this.$confirm(i18nMappingObj.deleteSiteTip, {
                    confirmButtonText: i18nMappingObj.confirm,
                    cancelButtonText: i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.deleteSite(siteInfo);
                });
            },
            deleteSite(siteInfo) {
                api.site
                    .delete(siteInfo.id)
                    .then((res) => {
                        if (res.success) {
                            this.$message({
                                showClose: true,
                                message: this.i18nMappingObj.siteDeleteSuccess,
                                type: 'success'
                            });
                            this.refreshTable();
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err.data.message,
                        //     type: 'error'
                        // });
                    });
            },
            handleActiveChange(siteInfo) {
                const { i18nMappingObj } = this;

                const query = {
                    siteId: siteInfo.id
                };

                const active = siteInfo.active;
                api.site.active(query).then(() => {
                    const message = active ? i18nMappingObj.siteDown : i18nMappingObj.siteEnable;
                    this.$message({
                        showClose: true,
                        message: message,
                        type: 'success'
                    });
                    this.refreshTable();
                });
            },
            handleEditSite(params) {
                this.$refs.editRef.show(params);
            },
            handleErrMsg(params) {
                const { i18nMappingObj } = this;

                this.$confirm(params.errMsg ?? i18nMappingObj.noExceptionInfo, i18nMappingObj.exceptionInfo, {
                    customClass: 'err-msg-confirm',
                    showCancelButton: false,
                    confirmButtonText: i18nMappingObj.confirm,
                    type: 'warning'
                });
            },

            /**
             * 跳转到“绑定部门”页面，进行部门和站点的绑定
             */
            handleBindDepartment() {
                this.$router.push({
                    name: 'siteBindDepartment'
                });
            },
            /**
             * 文件列表
             */
            getSiteFileList() {
                this.$router.push({
                    name: 'siteFiles'
                });
            },
            /**
             * 同步记录
             */
            handleSyncRecord(siteInfo) {
                if (!siteInfo.active) {
                    this.$message({
                        type: 'error',
                        message: this.i18nMappingObj.enableSiteTip
                    });
                    return;
                }
                this.$router.push({
                    name: 'syncRecord',
                    query: {
                        siteCode: siteInfo.code
                    }
                });
            },
            /**
             * 定时任务
             */
            handleTimingTask(siteInfo) {
                if (!siteInfo.active) {
                    this.$message({
                        type: 'error',
                        message: this.i18nMappingObj.enableSiteTip
                    });
                    return;
                }

                this.$router.push({
                    path: 'siteTimingTask',
                    query: {
                        siteCode: siteInfo.code
                    }
                });
            }
        }
    };
});
