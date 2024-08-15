define([
    ELMP.resource('platform-api/components/ServiceEdit/index.js'),
    ELMP.resource('platform-api/components/ServiceDetail/index.js'),
    ELMP.resource('platform-api/components/InterfaceImport/index.js'),
    'text!' + ELMP.resource('platform-api/views/ApiManagement/index.html')
], function (serviceEdit, serviceDetail, InterfaceImport, template) {
    const erdcloudKit = require('erdcloud.kit');
    return {
        template: template,
        components: {
            serviceEdit,
            serviceDetail,
            InterfaceImport,
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('platform-api/views/ApiManagement/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    serviceName: this.getI18nByKey('服务名'),
                    serviceOwner: this.getI18nByKey('服务所有者'),
                    description: this.getI18nByKey('描述'),
                    interfaceDoc: this.getI18nByKey('接口文档'),
                    version: this.getI18nByKey('版本'),
                    restApi: this.getI18nByKey('rest'),
                    dubboApi: this.getI18nByKey('dubbo'),
                    collect: this.getI18nByKey('收集'),
                    collectSuccess: this.getI18nByKey('收集成功'),
                    create: this.getI18nByKey('创建'),
                    importApi: this.getI18nByKey('接口文件导入'),
                    edit: this.getI18nByKey('编辑')
                },

                serviceList: [],
                service: null
            };
        },

        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            viewTableConfig() {
                const { i18nMappingObj, menuLevel } = this;
                const self = this;

                const columns = [
                    {
                        attrName: 'serviceName',
                        label: i18nMappingObj.serviceName,
                        width: 200
                    },
                    {
                        attrName: 'description',
                        label: i18nMappingObj.description
                    },
                    {
                        attrName: 'vers',
                        label: i18nMappingObj.version,
                        width: 100
                    },
                    {
                        attrName: 'rest',
                        label: i18nMappingObj.interfaceDoc,
                        width: 100
                    },
                    {
                        attrName: 'dubbo',
                        label: i18nMappingObj.interfaceDoc,
                        width: 100
                    },
                    {
                        attrName: 'operation',
                        label: '操作',
                        isDisable: true,
                        fixed: 'right',
                        showOverflow: false,
                        width: 80
                    }
                ];

                /**
                 * 当菜单为二级菜单时，添加列
                 */
                columns.splice(
                    3,
                    0,
                    {
                        attrName: 'owner',
                        label: i18nMappingObj.serviceOwner,
                        width: 100
                    },
                    {
                        attrName: 'collect',
                        label: i18nMappingObj.collect,
                        width: 100
                    }
                );

                return {
                    firstLoad: true,
                    addSeq: true,
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
                                label: i18nMappingObj.importApi,
                                onclick: () => {
                                    this.importApi();
                                }
                            }
                        ]
                    },
                    tableBaseConfig: {
                        showOverflow: true, // 溢出隐藏显示省略号
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        }
                    },
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        // url: '/apiauth/v1/service/list',
                        url: '/common/apiauth/v1/service/info/list',
                        method: 'GET',
                        transformResponse: [
                            function (data) {
                                let resData = data;

                                try {
                                    resData = data && JSON.parse(data);
                                    resData.data.records = self.handlerData(resData);
                                } catch (error) {
                                    console.error(error);
                                }

                                return resData;
                            }
                        ]
                    },
                    columns,
                    addOperationCol: false,
                    slotsField: [
                        {
                            type: 'default',
                            prop: 'collect'
                        },
                        {
                            type: 'default',
                            prop: 'rest'
                        },
                        {
                            type: 'default',
                            prop: 'dubbo'
                        },
                        {
                            type: 'default',
                            prop: 'owner'
                        },
                        {
                            type: 'default',
                            prop: 'operation'
                        }
                    ],
                    fieldLinkConfig: {
                        fieldLink: true,
                        // 是否添加列超链接
                        fieldLinkName: 'serviceName', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            // 超链接事件
                            this.showDetail(row);
                        }
                    },
                    pagination: {
                        showPagination: false
                    }
                };
            },
            resource() {
                return this.$store.getters['route/matchResource'](this.$route) ?? {};
            },
            menuLevel() {
                return this.resource.level;
            }
        },
        methods: {
            handlerData(resData) {
                const serviceList = resData?.data.serviceList ?? [];
                const userList = resData?.data.userList ?? [];

                const records = serviceList.map((item) => {
                    const owner = item.owner ? item.owner.split(',') : [];

                    const users = [];
                    owner.forEach((ownerId) => {
                        const findUser = userList.find((user) => user.oid === ownerId);
                        findUser && users.push(findUser);
                    });

                    return Object.assign({}, { users }, item);
                });

                this.serviceList = serviceList;

                return records;
            },
            create() {
                this.service = null;
                this.$refs.serviceEditRef.show();
            },
            showDetail(service) {
                this.service = service;
                this.$refs.serviceDetailRef.show();
            },
            handleEdit(service) {
                this.service = service;
                this.$refs.serviceEditRef.show();
            },
            toEdit() {
                this.$refs.serviceEditRef.show();
            },
            handleEditClose() {
                this.service = null;
            },
            importApi() {
                this.$refs.importRef.show();
            },
            handleCollect(row) {
                this.$famHttp({
                    url: '/common/apiauth/v1/doc/collect',
                    method: 'POST',
                    data: {
                        appNames: row.appName
                    },
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then((res) => {
                    if (res.success) {
                        this.$message({
                            message: this.i18nMappingObj.collectSuccess,
                            type: 'success',
                            showClose: true
                        });
                        this.refreshTable();
                    }
                });
            },
            getApiDetail(row, type) {
                const query = {
                    serviceName: row.serviceName,
                    appName: row.appName,
                    docType: type,
                    from: this.$route.fullPath
                };

                switch (type) {
                    case 'rest':
                        this.$router.push({
                            path: 'interfaceDoc',
                            query: {
                                title: 'Rest 接口' + row.serviceName,
                                ...query
                            }
                        });
                        break;
                    case 'dubbo':
                        this.$router.push({
                            path: 'dubboDoc',
                            query: {
                                title: 'Dubbo 接口 ' + row.serviceName,
                                ...query
                            }
                        });
                        break;
                    default:
                        break;
                }
            },
            refreshTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            }
        }
    };
});
