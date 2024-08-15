define([
    'text!' + ELMP.resource('erdc-components/FamAssociationObject/index.html'),
    'css!' + ELMP.resource('erdc-components/FamAssociationObject/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            visible: Boolean,
            title: {
                type: String,
                default: '关联对象'
            },
            leftTitle: {
                type: String,
                default: '可选对象'
            },
            rightTitle: {
                type: String,
                default: '已选对象'
            },
            leftTableColumns: {
                type: Array,
                default: () => {
                    return [
                        {
                            minWidth: '40',
                            width: '40',
                            type: 'checkbox',
                            align: 'center'
                        },
                        {
                            prop: 'icon',
                            minWidth: '48',
                            width: '48',
                            align: 'center'
                        },
                        {
                            prop: 'identifierNo',
                            title: '编码',
                            width: 140
                        },
                        {
                            prop: 'name',
                            title: '名称',
                            width: 200
                        },
                        {
                            prop: 'typeReference',
                            title: '类型',
                            width: 100
                        },
                        {
                            prop: 'lifecycleStatus.status',
                            title: '状态',
                            width: 80
                        }
                    ];
                }
            },
            appName: {
                type: String,
                default: 'plat'
            },
            className: {
                type: String,
                default: ''
            },
            tableKey: {
                type: String,
                default: ''
            },
            urlConfig: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            getTableData: {
                type: Function,
                default: null
            },
            // 重新请求接口是否恢复默认值
            isClearData: Boolean,
            // 判断是否是
            isUnfixedSource: Boolean,
            leftDisabled: {
                type: String,
                default: 'accessToView'
            },
            iconColorFiled: {
                type: String,
                default: 'iconColor'
            },
            enableScrollLoad: {
                type: Boolean,
                default: false
            },
            showCount: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamAssociationObject/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteAll: this.getI18nByKey('deleteAll'),
                    searchTips: this.getI18nByKey('searchTips'),
                    association: this.getI18nByKey('association'),
                    operate: this.getI18nByKey('operate')
                },
                showLabelKey: 'oid',
                allColumnsList: [],
                showDialog: true,
                tableLoading: false,
                rightTableVisibleData: [],
                searchLeftKey: '',
                searchRightKey: '',
                leftTableData: [],
                leftCheckData: [],
                rightTableData: [],
                sourceTableData: [],
                originRightTableData: [],
                // 分页
                pagination: {
                    pageSize: 20, // 每页多少条数据
                    pageIndex: 1, // 第几页
                    total: 0 // 总共有多少条数据
                },
                lazy: {
                    // 懒加载执行中
                    loading: false,
                    // 懒加载完成
                    completed: false,
                    // 懒加载任务ID
                    asyncQueryId: '',
                    // api日志懒加载任务ID
                    scrollId: '',
                    // 懒加载失败
                    isError: false,
                    // 定时器
                    timer: null,
                    lock: false
                }
            };
        },
        computed: {
            showLoadMore() {
                return this.enableScrollLoad && !this.lazy.completed;
            },
            defaultFooterText() {
                if (this.lazy.loading) {
                    return this.i18nMappingObj.loading;
                }
                if (this.lazy.completed) {
                    return this.i18nMappingObj.loadCompleted;
                }
                return this.i18nMappingObj.loadMore;
            },
            dialogVisible: {
                set(data) {
                    this.$emit('update:visible', data);
                },
                get() {
                    return this.visible;
                }
            },
            attrList() {
                if (this.enableScrollLoad) {
                    return new Array(this.leftTableData.length).fill({ isSelected: false });
                }
                let selectedLen = this.originRightTableData.length;
                let arr = [];
                for (let i = 0; i < this.pagination.total; i++) {
                    arr[i] = { isSelected: i < selectedLen };
                }
                return arr;
            },
            rightTableColumns() {
                let operation = [
                    {
                        title: this.i18nMappingObj.operate,
                        prop: 'operation',
                        width: 50,
                        slots: {
                            default: 'operation'
                        }
                    }
                ];
                return [...this.leftTableColumns.filter((item) => item.type !== 'checkbox'), ...operation];
            },
            canGetLeftTableData() {
                return this.className && this.tableKey && this.className + this.tableKey;
            }
        },
        watch: {
            canGetLeftTableData: {
                handler(val) {
                    if (val) {
                        this.isClearData && this.clearData();
                        this.getLeftTableData();
                    }
                },
                immediate: true
            },
            // 监听参数的变化
            urlConfig: {
                handler(val) {
                    if (val) {
                        this.isClearData && this.clearData();
                        this.pagination.pageIndex = 1;
                        this.getLeftTableData();
                    }
                },
                deep: true
            }
        },
        beforeDestroy() {
            clearTimeout(this.lazy.timer);
            this.lazy.timer = null;
            if (this._tableRequestController) {
                this._tableRequestController.abort();
            }
        },
        methods: {
            handleLoadMoreClick() {
                if (!this.enableScrollLoad) return;
                if (this.lazy.loading || this.lazy.completed) return;
                this.lazyLoadLeftTableData({
                    isAppendData: true,
                    asyncQueryId: this.lazy.asyncQueryId
                }).then(() => {
                    // do nothing.
                });
            },
            handleScroll({ $table, scrollHeight, scrollTop, isY }) {
                if (this.enableScrollLoad && isY && this.lastScrollTop - scrollTop < 0) {
                    if (this.lazy.completed || this.lazy.loading || this.lazy.lock) return;
                    const clientHeight = $table.$refs.tableBody.$el.clientHeight;
                    const scrollLoadHeightThreshold = 72;
                    const isScrollToBottom = scrollTop + clientHeight + scrollLoadHeightThreshold >= scrollHeight;
                    if (isScrollToBottom) {
                        this.lazyLoadLeftTableData({
                            isAppendData: true,
                            asyncQueryId: this.lazy.asyncQueryId
                        }).then(() => {
                            // do nothing.
                        });
                    }
                }
                this.lastScrollTop = scrollTop;
            },
            lazyLoadLeftTableData({ isAppendData = false, asyncQueryId = '', lazyLoadCount = 0 } = {}) {
                return new Promise((resolve, reject) => {
                    if (lazyLoadCount > 10) {
                        this.lazy.loading = false;
                        this.lazy.completed = true;
                        this.lazy.isError = true;
                        return reject(new Error('加载数据出错，请稍后后再试'));
                    }

                    const controller = new AbortController();

                    this.lazy.loading = true;
                    this.tableLoading = true;
                    clearTimeout(this.lazy.timer);
                    this.lazy.timer = null;

                    const config = {
                        method: 'POST',
                        url: '/fam/view/table/page',
                        ...this.urlConfig,
                        className: this.className,
                        data: {
                            deleteNoPermissionData: false,
                            tableKey: this.tableKey,
                            className: this.className,
                            ...this.urlConfig.data,
                            searchKey: this.searchLeftKey.trim(),
                            pageSize: this.pagination.pageSize,
                            pageIndex: this.pagination.pageIndex
                        },
                        signal: controller.signal,
                        appName: this.appName
                    };
                    this._tableRequestController = controller;

                    config.data.asyncQueryId = asyncQueryId;
                    if (!isAppendData && !asyncQueryId && config.data.pageIndex === 1) {
                        config.data.asyncQueryId = '';
                    }

                    /**
                     * 当请求参数发生变化时需要重新获取asyncQueryKey
                     * 剔除asyncQueryKey后对比请求参数是否一致，如果一致继续进行数据获取
                     * 如果不一致清空asyncQueryKey以及lazy中的asyncQueryKey,重新获取asyncQueryKey进行数据获取
                     * */
                    const prevRequestConfig = ErdcKit.deepClone(this.requestConfig) || {};
                    const currentRequestConfig = ErdcKit.deepClone(config);
                    const deleteAttrs = ['asyncQueryId', 'pageSize', 'pageIndex', 'page', 'size'];
                    deleteAttrs.forEach((item) => {
                        if (prevRequestConfig.data) {
                            delete prevRequestConfig.data[item];
                        }
                        delete currentRequestConfig.data[item];
                    });
                    if (JSON.stringify(prevRequestConfig) !== JSON.stringify(currentRequestConfig)) {
                        config.data.asyncQueryId = '';
                        this.lazy.asyncQueryId = '';
                    }
                    this.requestConfig = config;

                    return this.$famHttp(config)
                        .then((resp) => {
                            this.lazy.lock = true;

                            if (!isAppendData) {
                                this.clearData();
                            }

                            let result = resp?.data || {};
                            const tableData = result.records || [];
                            const asyncQueryVal = result.asyncQueryId || config.data.asyncQueryId;
                            this.lazy.asyncQueryId = asyncQueryVal;
                            this.lazy.completed = result.complete;

                            this.pagination.pageIndex = result?.pageIndex || 1;
                            this.pagination.pageSize = result?.pageSize || 0;
                            if (isAppendData) {
                                this.pagination.total = +this.pagination.total + (+result?.total || 0);
                            } else {
                                this.pagination.total = +result?.total || 0;
                            }

                            if (!asyncQueryVal) {
                                return Promise.resolve(tableData);
                            }
                            if (this.isDefAsyncQueryKey && !result.complete) {
                                this.keepAsyncQueryAlive(asyncQueryVal);
                            }
                            lazyLoadCount = ++lazyLoadCount;
                            // 当前查询是生成查询id，需要重新查询数据
                            if (!config.data.asyncQueryId) {
                                return this.lazyLoadLeftTableData({
                                    isAppendData: false,
                                    asyncQueryId: result.asyncQueryId,
                                    lazyLoadCount
                                });
                            }
                            // 未查询结束 且 接口未返回数据
                            if (!result.complete && !tableData.length) {
                                return this.lazyLoadLeftTableData({
                                    isAppendData: true,
                                    asyncQueryId: asyncQueryVal,
                                    lazyLoadCount
                                });
                            }
                            return Promise.resolve(tableData);
                        })
                        .then((tableData) => {
                            this.handleData(tableData, isAppendData);
                            return Promise.resolve(this.leftTableData);
                        })
                        .then((tableData) => {
                            this.lazy.isError = false;
                            const $table = this.$refs.leftTable;
                            return this.$nextTick()
                                .then(() => $table.refreshScroll())
                                .then(() => Promise.resolve(tableData));
                        })
                        .catch(() => {
                            this.lazy.isError = true;
                        })
                        .finally(() => {
                            this.lazy.lock = false;
                            this.tableLoading = false;
                            this.lazy.loading = false;
                        });
                });
            },
            keepAsyncQueryAlive(asyncQueryVal) {
                this.lazy.timer = setTimeout(() => {
                    this.fetchAsyncQueryData(asyncQueryVal)
                        .then(() => {
                            this.keepAsyncQueryAlive(asyncQueryVal);
                        })
                        .catch(() => {
                            clearTimeout(this.lazy.timer);
                            this.lazy.timer = null;
                        });
                }, 20 * 1000);
            },
            // 左表格勾选触发
            onLeftSelectChange({ row, checked }) {
                if (checked) {
                    this.rightTableData.push(row);
                    this.originRightTableData.push(row);
                } else {
                    this.rightTableData = this.rightTableData.filter((item) => item.oid !== row.oid);
                    this.originRightTableData = this.originRightTableData.filter((item) => item.oid !== row.oid);
                }
            },
            clearData() {
                if (!this.isUnfixedSource) {
                    this.rightTableData = [];
                    this.originRightTableData = [];
                }
                this.leftCheckData = [];
                this.searchRightKey = '';
                this.pagination.pageIndex = 1;
                this.pagination.total = 0;
            },
            // 左表格全选
            onLeftCheckAll({ checked }) {
                if (checked) {
                    this.leftTableData.forEach((item) => {
                        let isSelcted =
                            !!this.$refs.rightTable.$table.getRowById(item.oid) || !item?.[this.leftDisabled];
                        if (!isSelcted) this.rightTableData.push(item);
                    });
                } else {
                    this.rightTableData = this.rightTableData.filter((item) => {
                        return !this.$refs.leftTable.$table.getRowById(item.oid);
                    });
                }
                this.originRightTableData = JSON.parse(JSON.stringify(this.rightTableData));
            },
            // 右表格 单个取消
            onRightClear(row) {
                this.rightTableData = this.rightTableData.filter((item) => item.oid !== row.oid);
                this.originRightTableData = this.originRightTableData.filter((item) => item.oid !== row.oid);
                // 取消左表格对应勾选
                let leftRow = this.leftTableData.find((item) => item.oid === row.oid);
                if (leftRow) {
                    leftRow.checked = false;
                    this.$refs.leftTable?.$refs?.xTable?.setCheckboxRow(leftRow, false);
                }
            },
            // 右表格 全取消
            onAllDelete() {
                this.rightTableData = [];
                this.originRightTableData = [];
                // 取消左表格对应勾选
                this.leftTableData.forEach((item) => (item.checked = false));
                this.$refs.leftTable?.$refs?.xTable?.clearAll();
            },
            // 右表格搜索
            searchRightTableData() {
                this.rightTableData = this.originRightTableData.filter((item) =>
                    [item.name, item.identifierNo, item.displayName]
                        .filter(Boolean)
                        .some((val) => val.indexOf(this.searchRightKey.trim()) !== -1)
                );
            },
            cancel() {
                this.dialogVisible = false;
            },
            confirm() {
                const next = () => {
                    this.dialogVisible = false;
                    this.$emit('submit', this.originRightTableData);
                };
                if (!this.originRightTableData?.length) {
                    return this.$message({
                        type: 'error',
                        message: this.i18n.NullPrompt
                    });
                }
                if (this.$listeners['before-submit']) {
                    this.$emit('before-submit', this.originRightTableData, next);
                } else {
                    next();
                }
            },
            getLeftTableData(isSearch) {
                if (_.isFunction(this.getTableData)) {
                    this.leftTableData = this.getTableData();
                    this.pagination.total = this.leftTableData.length;
                    if (this.searchLeftKey.trim()) {
                        this.leftTableData = this.getTableData().filter(
                            (item) => item.name === this.searchLeftKey.trim()
                        );
                    }
                    return;
                }

                if (isSearch) {
                    this.pagination.pageIndex = 1;
                }
                if (this.enableScrollLoad) {
                    return this.lazyLoadLeftTableData({
                        isAppendData: false,
                        asyncQueryId: ''
                    });
                }
                let { urlConfig, className, tableKey, appName } = this;
                const { pageSize, pageIndex } = this.pagination;
                const config = {
                    url: '/fam/view/table/page',
                    method: 'POST',
                    appName,
                    data: {
                        className,
                        tableKey,
                        pageSize,
                        pageIndex,
                        deleteNoPermissionData: false
                    }
                };
                if (this.searchLeftKey.trim()) {
                    // 搜索功能，直接设置searchKey，会根据类型关联里面对象配置的属性组来模糊查询不同属性（如编码、名称，需要查询更多再配置）
                    // config.data.conditionDtoList = [
                    //     {
                    //         attrName: this.className + '#name',
                    //         oper: 'LIKE',
                    //         value1: this.searchLeftKey
                    //     }
                    // ];
                    config.data.searchKey = this.searchLeftKey.trim();
                }
                let urlConfigData = urlConfig.data;
                let configData = config.data;
                // 合并外部传入的data值
                _.keys(urlConfigData).forEach((key) => {
                    if (urlConfigData[key] instanceof Array && configData[key]) {
                        configData[key] = [...urlConfigData[key], ...configData[key]];
                    } else if (urlConfigData[key] instanceof Object && configData[key]) {
                        configData[key] = { ...urlConfigData[key], ...configData[key] };
                    } else {
                        configData[key] = urlConfigData[key];
                    }
                });
                _.keys(urlConfig).forEach((key) => {
                    if (key !== 'data') config[key] = urlConfig[key];
                });
                this.getTableDataRequest(config, isSearch);
            },
            pageSizeChange(val) {
                this.pagination.pageSize = val;
                this.pagination.pageIndex = 1;
                this.getLeftTableData();
            },
            currentPageChange(val) {
                this.pagination.pageIndex = val;
                this.getLeftTableData();
            },
            getTableDataRequest(config) {
                this.tableLoading = true;
                this.$famHttp({
                    url: config.url,
                    method: config.method,
                    data: config.data,
                    ...config
                })
                    .then((res) => {
                        let data = res.data;
                        let records = data.records;
                        // 更新分页数据
                        this.pagination.pageIndex = data.pageIndex;
                        this.pagination.total = Number(data.total);
                        this.handleData(records);
                    })
                    .finally(() => {
                        this.tableLoading = false;
                    });
            },
            getIcon(row) {
                return row.attrRawList?.find((item) => item.attrName.includes('icon'))?.value || row.icon || '';
            },
            handleData(tableData, isAppendData) {
                const callback = (result) => {
                    result = result.map((item) => {
                        let len = _.filter(this.originRightTableData, { oid: item.oid }).length;
                        this.$set(item, 'checked', !!len);
                        return item;
                    });
                    if (isAppendData) {
                        this.leftTableData = [...this.leftTableData, ...result];
                    } else {
                        this.leftTableData = result;
                    }
                    this.sourceTableData = ErdcKit.deepClone(this.leftTableData);
                };
                if (this.$listeners['after-request']) {
                    this.$emit('after-request', { data: tableData, callback });
                } else {
                    let result = tableData.map((item) => {
                        let obj = {};
                        _.each(item.attrRawList, (res) => {
                            if (res.attrName.indexOf(this.className + '#') !== -1) {
                                obj[res.attrName.split('#')[1]] = res.displayName;
                            }
                        });
                        let len = _.filter(this.originRightTableData, { oid: item.oid }).length;
                        return { ...item, ...obj, checked: !!len };
                    });
                    callback(result);
                }
            }
        }
    };
});
