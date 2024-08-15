define([
    'text!' + ELMP.resource('platform-mfe/views/layoutAndTheme/index.html'),
    ELMP.resource('platform-mfe/util.js'),
    'erdc-kit',
    'css!' + ELMP.resource('platform-mfe/index.css')
], function (template, util, FamUtils) {
    const FamKit = require('fam:kit');

    return {
        template: template,
        components: {
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            uploadForm: FamKit.asyncComponent(ELMP.resource('platform-mfe/components/uploadForm/index.js')),
            versionManage: FamKit.asyncComponent(ELMP.resource('platform-mfe/views/application/versionManage/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-mfe/locale'),
                pageType: 'erdc-layout',
                rowId: '',
                versionTitle: ''
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            tagSize() {
                return util.getCurrentTheme() ? 'medium' : 'mini';
            },
            pageOption() {
                const { i18nMappingObj } = this;
                return [
                    {
                        label: i18nMappingObj.layout,
                        value: 'erdc-layout'
                    },
                    {
                        label: i18nMappingObj.theme,
                        value: 'erdc-theme'
                    }
                ];
            },
            viewTableConfig() {
                const self = this;
                const { pageType, i18nMappingObj } = this;
                const tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addSeq: false,
                    addOperationCol: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/platform/mfe/apps/page', // 表格数据接口
                        method: 'GET', // 请求方法（默认get）
                        data: {
                            pkgType: pageType,
                            orderBy: 'updateTime'
                        },
                        transformResponse: [
                            (data) => {
                                let resData = data;
                                try {
                                    const parseData = data && JSON.parse(data);
                                    const records = parseData?.data?.records || [];
                                    parseData.data.records = records;
                                    resData = parseData;
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: true,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: i18nMappingObj.inputPlace, // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '280'
                        },
                        secondaryBtn: [
                            {
                                type: 'default',
                                class: '',
                                icon: '',
                                label: i18nMappingObj.upload,
                                onclick() {
                                    self.$refs.uploadModal.show();
                                }
                            }
                        ]
                    },
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left', // 全局文本对齐方式
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true // 溢出隐藏显示省略号
                    },
                    pagination: {
                        // 分页
                        showPagination: true,
                        pageSize: 20,
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    columns: [
                        {
                            attrName: 'code', // 属性名
                            label: i18nMappingObj.code, // 字段名
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'displayName', // 属性名
                            label: i18nMappingObj.name, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 250
                        },
                        {
                            attrName: 'pkgVersion', // 属性名
                            label: i18nMappingObj.version, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 70
                        },
                        {
                            attrName: 'online', // 属性名
                            label: i18nMappingObj.status, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 70
                        },
                        {
                            attrName: 'updateTime', // 属性名
                            label: i18nMappingObj.updateTime, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'operation', // 属性名
                            label: i18nMappingObj.operation, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 160
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'online', // 当前字段使用插槽
                            type: 'default'
                        },
                        {
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ]
                };
                return tableConfig;
            }
        },
        methods: {
            handleMoreAction(command, row) {
                switch (command) {
                    case 'status':
                        this.updateState(row);
                        break;
                    case 'versionManage':
                        this.loadAppVersions(row);
                        break;
                }
            },
            updateState(row) {
                const result = this.$refs.layoutTable?.tableData.filter((item) => item.online);
                if (result.length <= 1 && row.online && this.pageType !== 'erdc-help') {
                    this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj.offTips
                    });
                } else {
                    const params = {
                        id: row.id,
                        status: !row.online
                    };
                    util.changeStatus(params, this.refreshTable);
                }
            },
            loadAppVersions(row) {
                this.rowId = row.id;
                this.versionTitle = `${row.displayName}-${this.i18nMappingObj.versionManage}`;
                this.$nextTick(() => {
                    this.$refs.versionModal.show();
                });
            },
            changePageType(id) {
                this.pageType = id;
                this.refreshTable();
            },
            refreshTable() {
                this.$refs.layoutTable?.fnRefreshTable();
            },
            download(row) {
                FamUtils.downFile({
                    url: `/platform/mfe/apps/download/${this.pageType}/${row.id}`
                });
            },
            saveVersion(id) {
                if (id) {
                    this.rowId = id;
                }
                this.refreshTable();
            }
        }
    };
});
