define([
    'erdcloud.kit',
    ELMP.resource('platform-dev-ops/api.js'),
    'text!' + ELMP.resource('platform-dev-ops/components/CacheKeyList/template.html'),
    'underscore'
], function (ErdcKit, api, template, _) {
    return {
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            CacheKeyDetail: ErdcKit.asyncComponent(ELMP.resource('platform-dev-ops/components/CacheKeyDetail/index.js'))
        },
        props: {
            /**
             * 当前查看的缓存空间
             */
            currentRegion: {
                type: String,
                required: true
            },
            /**
             * 当前服务
             */
            currentServiceShortName: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('platform-dev-ops/locale/index.js'),
                keyword: null,
                tableData: [],
                loading: false,
                currentSelection: [],
                pagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                },
                dialog: {
                    visible: false,
                    currentCacheKey: null
                },
                deleteLoading: false
            };
        },
        computed: {
            columns() {
                return [
                    {
                        prop: 'seq',
                        type: 'seq',
                        title: ' ',
                        width: 48,
                        align: 'center'
                    },
                    {
                        prop: 'checkbox',
                        title: '',
                        minWidth: '50',
                        width: '50',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        prop: 'key',
                        title: this.i18n.cacheKey,
                        minWidth: '100'
                    },
                    {
                        prop: 'level',
                        title: this.i18n.level,
                        minWidth: '100'
                    },
                    {
                        prop: 'operation',
                        title: this.i18n.operation,
                        width: 60
                    }
                ];
            },
            params() {
                const keyword = this.keyword || '';
                return {
                    pageIndex: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize,
                    name: keyword.trim(),
                    region: this.currentRegion,
                    service: this.currentServiceShortName
                };
            },
            disabledDeleteCacheKey() {
                return !this.currentSelection || this.currentSelection.length === 0;
            }
        },
        watch: {
            currentRegion() {
                this.reloadTable();
            },
            tableData() {
                this.currentSelection = [];
            }
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
                const originalTableData = ErdcKit.deepClone(this.originalTableData);
                this.tableData = this.keyword
                    ? originalTableData.filter((row) => {
                          return [row.key]
                              .filter(Boolean)
                              .map((item) => item.toUpperCase())
                              .some((item) => item.indexOf(this.keyword.toUpperCase()) !== -1);
                      })
                    : originalTableData;
            },
            fetchCacheKeys(params) {
                this.loading = true;
                return api
                    .fetchCacheKeys(params)
                    .then(({ data }) => {
                        const { records, pageIndex, pageSize, total } = data;
                        this.pagination = {
                            pageIndex,
                            pageSize,
                            total: +total
                        };
                        this.originalTableData = ErdcKit.deepClone(records);
                        this.tableData = records.map((key) => ({
                            key: key.key,
                            level: key.level,
                            region: this.currentRegion,
                            value: {},
                            ...key
                        }));
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            translateCacheLevel(level) {
                return [this.i18n.l1Cache, this.i18n.l2Cache][level - 1] || level;
            },
            reloadTable() {
                this.fetchCacheKeys(this.params);
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
            handleCheckCacheInfo(row) {
                this.dialog.currentCacheKey = row.key;
                this.dialog.visible = true;
            },
            handleDeleteSelectedCacheKeys() {
                return this.handleDeleteCacheKeys(this.currentSelection);
            },
            handleDeleteCacheKey(row) {
                this.handleDeleteCacheKeys([row]);
            },
            handleDeleteCacheKeys(rows) {
                this.$confirm(this.i18n.confirmDeleteCacheKey, this.i18n.delete, {
                    type: 'warning'
                }).then(() => {
                    this.deleteLoading = true;
                    this.deleteCacheKeys(rows.map((item) => item.key)).finally(() => {
                        this.deleteLoading = false;
                        this.reloadTable();
                    });
                });
            },
            deleteCacheKeys(keys) {
                return api
                    .deleteCacheKeys({
                        keys,
                        region: this.currentRegion,
                        service: this.currentServiceShortName
                    })
                    .then(({ data }) => {
                        if (typeof data === 'string') {
                            this.$message.warn(data);
                        } else {
                            this.$message.success(this.i18n.deleteSuccess);
                            this.reloadTable();
                        }
                    });
            }
        }
    };
});
