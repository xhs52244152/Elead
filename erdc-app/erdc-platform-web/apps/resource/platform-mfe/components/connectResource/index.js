define([
    'text!' + ELMP.resource('platform-mfe/components/connectResource/index.html'),
    ELMP.resource('platform-mfe/util.js'),
    ELMP.resource('platform-mfe/api.js'),
    'erdc-kit'
], function (tmpl, util, api, FamUtils) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: tmpl,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            versionManage: ErdcKit.asyncComponent(
                ELMP.resource('platform-mfe/views/application/versionManage/index.js')
            ),
            uploadForm: ErdcKit.asyncComponent(ELMP.resource('platform-mfe/components/uploadForm/index.js'))
        },
        props: {
            parentCode: {
                type: String,
                default: ''
            },
            isShowLeft: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                i18nDirPath: ELMP.resource('platform-mfe/locale'),
                rowId: '',
                versionTitle: '',
                resType: 'all',
                version: '',
                versionVisible: false,
                versionOption: [],
                customTableHeight: 200,
                customTableData: [],
                users: [],
                newParentCode: ''
            };
        },
        computed: {
            viewTableHeight() {
                return this.isShowLeft ? '' : 300;
            },
            tagSize() {
                return util.getCurrentTheme() ? 'medium' : 'mini';
            },
            resOption() {
                const { i18nMappingObj } = this;
                return [
                    {
                        label: i18nMappingObj.allResource,
                        value: 'all'
                    },
                    {
                        label: i18nMappingObj.customResource,
                        value: 'custom'
                    },
                    {
                        label: i18nMappingObj.publicResource,
                        value: '-1'
                    }
                ];
            },
            viewTableConfig() {
                const self = this;
                const { i18nMappingObj, isShowLeft, newParentCode } = this;
                const tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addSeq: false,
                    addOperationCol: false,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/platform/mfe/apps/page', // 表格数据接口
                        method: 'GET', // 请求方法（默认get）
                        data: {
                            pkgType: 'erdc-resource',
                            parentCode: newParentCode,
                            orderBy: 'updateTime'
                        },
                        transformResponse: [
                            (data) => {
                                let resData = data;
                                try {
                                    const parseData = data && JSON.parse(data);
                                    self.users = parseData?.ext?.users;
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
                        secondaryBtn: isShowLeft
                            ? [
                                  {
                                      label: i18nMappingObj.upload,
                                      onclick() {
                                          self.$refs.uploadModal.show();
                                      }
                                  }
                              ]
                            : []
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
                            attrName: 'parentCode', // 属性名
                            label: i18nMappingObj.depMicroApp, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 120,
                            hide: !isShowLeft
                        },
                        {
                            attrName: 'code', // 属性名
                            label: i18nMappingObj.code, // 字段名
                            sortAble: false, // 是否支持排序
                            minWidth: 200
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
                            minWidth: 100
                        },
                        {
                            attrName: 'online', // 属性名
                            label: i18nMappingObj.status, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 70
                        },
                        {
                            attrName: 'createUser', // 属性名
                            label: i18nMappingObj.createBy, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 70,
                            hide: !isShowLeft
                        },
                        {
                            attrName: 'updateUser', // 属性名
                            label: i18nMappingObj.updateBy, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 70,
                            hide: !isShowLeft
                        },
                        {
                            attrName: 'updateTime', // 属性名
                            label: i18nMappingObj.updateTime, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 120
                        },
                        {
                            attrName: 'operation', // 属性名
                            label: i18nMappingObj.operation, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 160,
                            hide: !isShowLeft
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'parentCode',
                            type: 'default'
                        },
                        {
                            prop: 'code',
                            type: 'default'
                        },
                        {
                            prop: 'createUser',
                            type: 'default'
                        },
                        {
                            prop: 'updateUser',
                            type: 'default'
                        },
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
            },
            customTableConfig() {
                const { customTableData, i18nMappingObj } = this;
                const tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addSeq: false,
                    addOperationCol: false,
                    tableData: customTableData,
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false,
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        }
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
                        showPagination: false
                    },
                    columns: [
                        {
                            attrName: 'parentCode', // 属性名
                            label: i18nMappingObj.depMicroApp, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 120
                        },
                        {
                            attrName: 'code', // 属性名
                            label: i18nMappingObj.code, // 字段名
                            sortAble: false, // 是否支持排序
                            minWidth: 200
                        },
                        {
                            attrName: 'displayName', // 属性名
                            label: i18nMappingObj.name, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 120
                        },
                        {
                            attrName: 'pkgVersion', // 属性名
                            label: i18nMappingObj.version, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'online', // 属性名
                            label: i18nMappingObj.status, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 80
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
                            width: 60
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'parentCode',
                            type: 'default'
                        },
                        {
                            prop: 'code',
                            type: 'default'
                        },
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
        created() {
            this.newParentCode = this.parentCode;
        },
        mounted() {
            this.getResourceOpt();
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
                const params = {
                    id: row.id,
                    status: !row.online
                };
                util.changeStatus(params, this.refreshTable);
            },
            download(row) {
                FamUtils.downFile({
                    url: `/platform/mfe/apps/download/erdc-resource/${row.id}`
                });
            },
            changeCustomStatus(row) {
                const params = {
                    id: row.id,
                    status: !row.online
                };
                util.changeStatus(params, this.refreshTable);
            },
            refreshCustomTable() {
                this.$refs.customTable?.fnRefreshTable();
            },
            loadAppVersions(row) {
                this.rowId = row.id;
                this.versionTitle = `${row.displayName}-${this.i18nMappingObj.versionManage}`;
                this.$nextTick(() => {
                    this.$refs.versionModal.show();
                });
            },
            refreshTable() {
                this.$refs.connectResTable?.fnRefreshTable();
            },
            changeResType(val) {
                this.resType = val;
                if (val !== 'all') {
                    this.newParentCode = val;
                } else {
                    this.newParentCode = '';
                }
                this.refreshTable();
            },
            changeVersion(val) {
                this.version = val;
            },
            cancelVesion() {
                this.versionVisible = false;
            },
            getResourceOpt() {
                this.$famHttp({
                    url: '/platform/mfe/apps/page',
                    method: 'GET',
                    data: {
                        pageIndex: 1,
                        pageSize: 1000,
                        pkgType: 'erdc-app'
                    }
                }).then((resp) => {
                    if (resp.data.records?.length > 0) {
                        for (let i = 0; i < resp.data.records?.length; i++) {
                            const temp = resp.data.records[i];
                            if (temp.innerApp) {
                                let obj = {
                                    label: temp.displayName,
                                    value: temp.code
                                };
                                this.resOption.push(obj);
                            }
                        }
                    }
                });
            },
            openCustomList(row) {
                if (this.isShowLeft) {
                    this.rowId = row.id;
                    this.customTableData = row.customInfo;
                    this.versionVisible = true;
                } else {
                    return;
                }
            },
            tagType(isCustom) {
                return isCustom ? 'danger' : '';
            },
            fnTableData(tableData) {
                if (this.versionVisible) {
                    const result = tableData.find((item) => item.id === this.rowId);
                    this.customTableData = result?.customInfo;
                    this.refreshCustomTable();
                }
            },
            isShowOffline(row) {
                return !(row.code === 'erdc-login' && row.online);
            },
            updateVersion(id) {
                if (id) {
                    this.rowId = id;
                }
                this.refreshTable();
            },
            getUser(id) {
                return this.users?.find((user) => user.id === id)?.displayName || '--';
            }
        }
    };
});
