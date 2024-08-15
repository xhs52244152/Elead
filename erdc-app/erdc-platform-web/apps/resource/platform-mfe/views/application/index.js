define([
    'text!' + ELMP.resource('platform-mfe/views/application/index.html'),
    ELMP.resource('platform-mfe/CONST.js'),
    ELMP.resource('platform-mfe/util.js'),
    ELMP.resource('platform-mfe/api.js'),
    'erdc-kit',
    'css!' + ELMP.resource('platform-mfe/index.css')
], function (template, CONST, util, api, FamUtils) {
    const FamKit = require('fam:kit');

    return {
        template: template,
        components: {
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            addForm: FamKit.asyncComponent(ELMP.resource('platform-mfe/views/application/addForm/index.js')),
            versionManage: FamKit.asyncComponent(
                ELMP.resource('platform-mfe/views/application/versionManage/index.js')
            ),
            connectResource: FamKit.asyncComponent(ELMP.resource('platform-mfe/components/connectResource/index.js')),
            groupManage: FamKit.asyncComponent(ELMP.resource('platform-mfe/views/application/groupManage/index.js')),
            configManage: FamKit.asyncComponent(ELMP.resource('platform-mfe/views/application/configManage/index.js')),
            importModal: FamKit.asyncComponent(ELMP.resource('platform-mfe/views/application/importModal/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-mfe/locale'),
                connectVisible: false,
                configType: 0, // 0:应用配置，1:配置
                configData: {},
                isImport: true,
                parentCode: '',
                pkgCode: '',
                rowId: '',
                versionTitle: '',
                appList: [],
                groupList: {},
                isShowLeft: false
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            tagSize() {
                return util.getCurrentTheme() ? 'medium' : 'mini';
            },
            viewTableConfig() {
                const { i18nMappingObj } = this;
                const self = this;
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
                            pkgType: 'erdc-app',
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
                        mainBtn: {
                            label: i18nMappingObj.create,
                            onclick() {
                                self.$refs.addModal.show({});
                            }
                        },
                        moreOperateList: [
                            {
                                type: 'default',
                                class: '',
                                icon: '',
                                label: i18nMappingObj.groupMange,
                                onclick() {
                                    self.$refs.groupModal.show();
                                }
                            },
                            {
                                type: 'default',
                                class: '',
                                icon: '',
                                label: i18nMappingObj.appConfig,
                                onclick() {
                                    self.configType = 0;
                                    self.pkgCode = '';
                                    self.$nextTick(() => {
                                        self.$refs.configModal.show();
                                    });
                                }
                            },
                            {
                                type: 'default',
                                class: '',
                                icon: '',
                                label: i18nMappingObj.backOrRestore,
                                onclick() {
                                    self.isImport = true;
                                    self.$nextTick(() => {
                                        self.$refs.importModal.show();
                                    });
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
                            minWidth: 50
                        },
                        {
                            attrName: 'innerApp', // 属性名
                            label: i18nMappingObj.type, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 50
                        },
                        {
                            attrName: 'dependency', // 属性名
                            label: i18nMappingObj.dependency, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 70
                        },
                        {
                            attrName: 'group', // 属性名
                            label: i18nMappingObj.depGroup, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 70
                        },
                        {
                            attrName: 'online', // 属性名
                            label: i18nMappingObj.status, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 70
                        },
                        {
                            attrName: 'updateTime', // 属性名
                            label: i18nMappingObj.updateTime, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
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
                            prop: 'pkgVersion',
                            type: 'default'
                        },
                        {
                            prop: 'innerApp',
                            type: 'default'
                        },
                        {
                            prop: 'dependency',
                            type: 'default'
                        },
                        {
                            prop: 'group',
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
        mounted() {
            this.getAppData();
            this.getGroupList();
        },
        methods: {
            handleMoreAction(command, row) {
                switch (command) {
                    case 'download':
                        this.download(row);
                        break;
                    case 'config':
                        this.config(row);
                        break;
                    case 'status':
                        this.updateState(row);
                        break;
                    case 'switchVersion':
                        this.loadAppVersions(row);
                        break;
                    case 'connect':
                        this.connect(row);
                        break;
                    case 'delete':
                        this.delete(row);
                        break;
                }
            },
            download(row) {
                FamUtils.downFile({
                    url: `/platform/mfe/apps/download/erdc-app/${row.id}`
                });
            },
            config(row) {
                this.configType = 1;
                this.pkgCode = row.code;
                this.$nextTick(() => {
                    this.$refs.configModal.show();
                });
            },
            editApp(row) {
                this.$refs.addModal.show(row);
            },
            updateState(row) {
                const { i18nMappingObj } = this;
                const params = {
                    id: row.id,
                    status: !row.online
                };
                if (row.online && row.innerApp) {
                    this.$confirm(`${i18nMappingObj.offlineTips}`, `${i18nMappingObj.tips}`, {
                        confirmButtonText: i18nMappingObj.confirm,
                        cancelButtonText: i18nMappingObj.cancel,
                        type: 'warning'
                    }).then(() => {
                        util.changeStatus(params, this.refreshTable);
                    });
                } else {
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
            connect(row) {
                this.parentCode = row.code;
                this.isShowLeft = false;
                this.connectVisible = true;
            },
            delete(row) {
                this.$confirm(`${this.i18nMappingObj.deleteConfirm}?`, this.i18nMappingObj.delete, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.$famHttp(`/platform/mfe/apps/${row.id}`, {
                        method: 'DELETE'
                    }).then((res) => {
                        if (res.data) {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.deleteSuccess,
                                showClose: true
                            });
                        }
                        this.refreshTable();
                    });
                });
            },
            cancelConnect() {
                this.connectVisible = false;
            },
            refreshTable() {
                this.$refs.appManageTable?.fnRefreshTable();
            },
            getAppType(row) {
                const { i18nMappingObj } = this;
                return row.innerApp ? i18nMappingObj.innerApp : i18nMappingObj.outLink;
            },
            getDependency(row) {
                const dependency = JSON.parse(row.dependencies || 'null');
                let result = [];
                if (dependency !== null && Object.keys(dependency).length > 0) {
                    for (var key in dependency) {
                        if (dependency.hasOwnProperty(key)) {
                            const obj = {
                                key: key,
                                value: dependency[key]
                            };
                            result.push(obj);
                        }
                    }
                }
                return result;
            },
            getAppData() {
                api.getAppList().then((res) => {
                    if (res.success) {
                        this.appList = res.data;
                    }
                });
            },
            getAppName(row) {
                return this.appList.find((item) => item.identifierNo === row.appId)?.displayName;
            },
            getGroupList() {
                api.getGroupData().then((resp) => {
                    if (resp.data.length > 0) {
                        for (let i = 0; i < resp.data.length; i++) {
                            this.groupList[resp.data[i].id] = resp.data[i].displayName;
                        }
                    }
                });
            },
            getGroupName(row) {
                if (row.appId) {
                    return this.getAppName(row);
                } else if (row.groupId) {
                    return this.groupList[row.groupId] || '--';
                }
            },
            isShowOffline(row) {
                return !(row.code === 'erdc-platform-web' || (row.code === 'erdc-sysadmin-web' && row.online));
            },
            saveVersion(id) {
                if (id) {
                    this.rowId = id;
                }
                this.refreshTable();
            },
            updateGroup() {
                this.getGroupList();
                this.refreshTable();
            }
        }
    };
});
