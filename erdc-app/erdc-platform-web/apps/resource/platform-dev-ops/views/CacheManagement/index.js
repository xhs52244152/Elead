define([
    'erdcloud.kit',
    'text!' + ELMP.resource('platform-dev-ops/views/CacheManagement/template.html'),
    ELMP.resource('platform-dev-ops/api.js'),
    'underscore',
    'css!' + ELMP.resource('platform-dev-ops/views/CacheManagement/style.css')
], function (ErdcKit, template, api, _) {
    return {
        template,
        components: {
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            CacheKeyList: ErdcKit.asyncComponent(ELMP.resource('platform-dev-ops/components/CacheKeyList/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('platform-dev-ops/locale/index.js'),
                // 系统服务清单
                services: [],
                serviceOptions: [],
                // 当前选中的服务
                currentSelectedService: null,
                // 滤关键词
                keyword: null,
                // 当前表格数据
                tableData: [],
                // 表格分页信息
                pagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                },
                // 当前选中值
                currentSelection: [],
                // 表格加载状态
                loading: false,
                // 缓存键弹窗信息
                dialog: {
                    visible: false,
                    currentRegion: null
                },
                // 按钮加载状态
                loadingBtn: {
                    clear: false,
                    clearAll: false,
                    refreshAll: false
                }
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            columns() {
                return [
                    {
                        prop: 'seq',
                        type: 'seq',
                        title: ' ',
                        width: 48,
                        align: 'center',
                        fixed: 'left'
                    },
                    {
                        prop: 'checkbox',
                        title: '',
                        minWidth: '50',
                        width: '50',
                        type: 'checkbox',
                        align: 'center',
                        fixed: 'left'
                    },
                    {
                        prop: 'name',
                        title: this.i18n.region,
                        minWidth: '200',
                        link: true,
                        fixed: 'left'
                    },
                    {
                        prop: 'displayName',
                        title: this.i18n.displayName,
                        minWidth: '200',
                        fixed: 'left',
                        slots: {
                            default: 'common-cell'
                        }
                    },
                    {
                        prop: 'size',
                        title: this.i18n.size,
                        minWidth: '80',
                        slots: {
                            default: 'common-cell'
                        }
                    },
                    {
                        prop: 'ttl',
                        title: this.i18n.ttl,
                        minWidth: '80',
                        slots: {
                            default: 'common-cell'
                        }
                    },
                    {
                        prop: 'group',
                        title: this.i18n.group,
                        minWidth: '100',
                        slots: {
                            default: 'common-cell'
                        }
                    },
                    {
                        prop: 'policy',
                        title: this.i18n.policy,
                        minWidth: '100'
                    },
                    {
                        prop: 'readonly',
                        title: this.i18n.readonly,
                        minWidth: '80',
                        slots: {
                            default: 'boolean-cell'
                        }
                    },
                    {
                        prop: 'operation',
                        title: this.i18n.operation,
                        width: 60,
                        align: 'center',
                        fixed: 'right'
                    }
                ];
            },
            tableParams() {
                const keyword = this.keyword || '';
                return {
                    pageIndex: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize,
                    name: keyword.trim(),
                    service: this.currentServiceShortName
                };
            },
            disableClearAll() {
                return !this.currentSelection || this.currentSelection.length === 0;
            },
            currentService() {
                return this.services.find((service) => {
                    return service.identifierNo === this.currentSelectedService;
                });
            },
            currentServiceShortName() {
                return this.currentService ? this.currentService.shortName : null;
            }
        },
        watch: {
            tableData() {
                this.currentSelection = [];
            }
        },
        created() {
            this.fetchServices();
        },
        mounted() {
            this.reloadTable();
        },
        methods: {
            refreshTable() {
                this.keyword = '';
                this.reloadTable();
            },
            search() {
                this.reloadTable();
            },
            fetchServices(...args) {
                return api.fetchServices(...args).then(({ data }) => {
                    this.services = data;
                    this.serviceOptions = this.serviceFilterMethod('');
                    this.currentSelectedService = this.getDefaultSelectedService();
                });
            },
            handleServiceChange: _.debounce(function () {
                this.pagination.pageIndex = 1;
                this.reloadTable();
            }, 100),
            /**
             * 获取默认服务
             * 默认服务：
             * 1. 平台-基础服务
             * 2. 第一个服务
             * @returns {string}
             */
            getDefaultSelectedService() {
                const famCore = this.services.find((service) => {
                    return service.shortName === 'fam' || service.identifierNo === 'erdcloud-fam-app';
                });
                return famCore ? famCore.identifierNo : this.services[0].identifier;
            },
            serviceFilterMethod(keyword) {
                if (keyword === null || (typeof keyword === 'string' && keyword.trim().length === 0)) {
                    this.serviceOptions = this.services.map((service) => {
                        return {
                            value: service.identifierNo,
                            label: service.displayName
                        };
                    });
                    return this.serviceOptions;
                }
                let keywordString = keyword.toString().trim().toUpperCase();
                const searchFields = ['displayName', 'identifierNo'];
                this.serviceOptions = this.services
                    .filter((service) => {
                        return searchFields.some((field) => {
                            const value = (service[field] || '').toString().trim().toUpperCase();
                            return value.indexOf(keywordString) !== -1;
                        });
                    })
                    .map((service) => {
                        return {
                            value: service.identifierNo,
                            label: service.displayName
                        };
                    });
                return this.serviceOptions;
            },
            fetchCacheRegions(params) {
                this.loading = true;
                return api
                    .fetchCacheRegions(params)
                    .then(({ data }) => {
                        const { records, pageIndex, pageSize, total } = data;
                        this.pagination = {
                            pageIndex,
                            pageSize,
                            total: +total
                        };
                        this.originalTableData = ErdcKit.deepClone(records);
                        this.tableData = records.map((region) => {
                            const cacheSpec = region.cacheSpec || {};
                            return {
                                ...region,
                                ...cacheSpec
                            };
                        });
                    })
                    .catch(() => {
                        this.tableData = [];
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            reloadTable() {
                this.fetchCacheRegions(this.tableParams);
            },
            handleSizeChange() {
                this.reloadTable();
            },
            handleCurrentChange() {
                this.reloadTable();
            },
            handleCheckboxChange({ records }) {
                this.currentSelection = records;
            },
            handleDropdownVisibleChange(visible, row) {
                this.$set(row, '_visible', visible);
            },
            handleClearAllCaches() {
                this.$confirm(this.i18n.confirmClearAllCaches, this.i18n.clearAllCaches, {
                    type: 'warning'
                }).then(() => {
                    this.loadingBtn.clearAll = true;
                    this.clearAllCaches().finally(() => {
                        this.loadingBtn.clearAll = false;
                    });
                });
            },
            handleClearSelectedCaches() {
                this.loadingBtn.clear = true;
                this.handleClearCaches(this.currentSelection).finally(() => {
                    this.loadingBtn.clear = false;
                });
            },
            clearAllCaches() {
                return api.clearAllCaches({ service: this.currentServiceShortName }).then(({ data }) => {
                    if (typeof data === 'string') {
                        this.showErrorMessage(this.i18n.clearCachesSuccess, data);
                    } else {
                        this.$message.success(this.i18n.clearCachesSuccess);
                        this.reloadTable();
                    }
                });
            },
            handleCheckCacheKeys(row) {
                this.dialog.currentRegion = row;
                this.dialog.visible = true;
            },
            handleClearCaches(rows) {
                return new Promise((resolve, reject) => {
                    this.$confirm(this.i18n.confirmClearSelectedCaches, this.i18n.clearCache, {
                        type: 'warning'
                    })
                        .then(() => {
                            this.clearCaches(rows)
                                .then(() => {
                                    resolve();
                                })
                                .catch((error) => {
                                    reject(error);
                                });
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            clearCaches(rows) {
                if (!rows || rows.length === 0) {
                    const error = new Error(this.i18n.pleaseSelect);
                    this.$message.warn(error.message);
                    return Promise.reject(error);
                }
                return api
                    .clearCaches({ regions: rows.map((item) => item.name), service: this.currentServiceShortName })
                    .then(({ data }) => {
                        if (typeof data === 'string') {
                            this.showErrorMessage(this.i18n.clearCachesSuccess, data);
                        } else {
                            this.$message.success(this.i18n.clearCachesSuccess);
                            this.reloadTable();
                        }
                    });
            },
            handleRefreshAllCaches() {
                this.$confirm(this.i18n.confirmRefreshAllCaches, this.i18n.refreshAllCaches, {
                    type: 'warning'
                }).then(() => {
                    this.refreshAllCaches();
                });
            },
            refreshAllCaches() {
                this.loadingBtn.refresh = true;
                return api
                    .refreshAllCaches({ service: this.currentServiceShortName })
                    .then(({ data }) => {
                        this.$message.success(typeof data === 'string' ? data : this.i18n.refreshAllCachesSuccess);
                        this.reloadTable();
                    })
                    .finally(() => {
                        this.loadingBtn.refresh = false;
                    });
            },
            showErrorMessage(title, message) {
                this.$alert(
                    `<p class="flex align-items-center mb-normal" >
                      <i class="text-2xl color-warning erd-iconfont erd-icon-info2 mr-normal"></i><span style="line-height: var(--superLineHeight);">${title}</span>
                    </p>
                    <p class="text-normal font-normal p-normal" style="background-color: #f1f1f1">${message.replaceAll(
                        /\n/g,
                        '<br />'
                    )}</p>`,
                    this.i18n.info,
                    {
                        confirmButtonText: this.i18n.confirm,
                        dangerouslyUseHTMLString: true
                    }
                );
            }
        }
    };
});
