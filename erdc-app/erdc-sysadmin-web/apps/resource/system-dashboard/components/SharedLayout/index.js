define([
    'text!' + ELMP.resource('system-dashboard/components/SharedLayout/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('system-dashboard/components/SharedLayout/index.css')
], function (tmpl, erdcloudKit) {
    return {
        template: tmpl,
        props: {
            appName: String
        },
        components: {
            famAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        computed: {
            appList: function () {
                return this.$store.state.app.appNames || [];
            },
            appMap: function () {
                const appMap = {};
                this.appList.forEach(function (i) {
                    appMap[i.identifierNo] = i;
                });
                return appMap;
            },
            menuInfo: function () {
                return this.$store.getters['route/matchResource'](this.$route);
            },
            layoutId: function () {
                return this.$route.params.id;
            },
            viewTableConfig: function () {
                const { i18nMappingObj } = this;
                const resourceInfo = this.menuInfo || {};
                return {
                    columns: [
                        {
                            attrName: 'name',
                            label: i18nMappingObj.name,
                            minWidth: 150
                        },
                        {
                            attrName: 'appName',
                            label: i18nMappingObj.appName,
                            minWidth: 110
                        },
                        {
                            attrName: 'createBy',
                            label: i18nMappingObj.creator,
                            minWidth: 110
                        },
                        {
                            attrName: 'createTime',
                            label: i18nMappingObj.createTime,
                            minWidth: 150
                        },
                        {
                            attrName: 'operation',
                            label: i18nMappingObj.operation,
                            sortAble: false,
                            extraCol: true,
                            fixed: 'right',
                            width: 100,
                            showOverflow: false,
                            minWidth: 100
                        }
                    ],
                    // searchParamsKey: 'searchKey',
                    isDeserialize: true, // 是否反序列数据源
                    sortFixRight: true, // 排序图标是否显示在右边
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        tableKey: 200,
                        nameI18nJson: 200,
                        operation: 100
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
                    tableBaseEvent: {
                        // 基础表格的事件，参考vxe官方API(这里事件官方写什么名称就是什么，不能驼峰命名)
                        // 'checkbox-change': this.selectChangeEvent
                    },
                    firstLoad: true,
                    tableRequestConfig: {
                        url: '/common/dashboard/layout/share/list',
                        method: 'GET',
                        data: {
                            className: this.layoutClass,
                            resourceId: resourceInfo.id
                        }
                    },
                    toolbarConfig: {
                        showConfigCol: false,
                        showRefresh: true,
                        showMoreSearch: false,
                        fuzzySearch: {
                            show: false
                        }
                    },
                    addOperationCol: true,
                    addCheckbox: false,
                    addSeq: false,
                    slotsField: [
                        {
                            prop: 'appName',
                            type: 'default'
                        },
                        {
                            prop: 'createBy',
                            type: 'default'
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ],
                    fieldLinkConfig: {},
                    pagination: {
                        // 分页
                        showPagination: true, // 是否显示分页
                        pageSize: 20,
                        indexKey: 'pageIndex',
                        sizeKey: 'pageSize'
                    }
                };
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-dashboard/locale/index.js'),
                i18nMappingObj: {
                    setDefault: this.getI18nByKey('设为默认'),
                    success: this.getI18nByKey('成功')
                },
                layoutClass: 'erd.cloud.dashboard.entity.DashboardLayout',
                pageSize: 20,
                pageIndex: 1,
                currentLan: window.LS.get('lang_current')
            };
        },
        methods: {
            reload: function () {
                this.$refs.table.fnRefreshTable('default');
            },
            createOrUpdateLayout: function (layout) {
                var rowList = [];
                _.each(layout, function (value, key) {
                    rowList.push({
                        attrName: key,
                        value: value
                    });
                });

                return this.$famHttp({
                    url: layout.oid ? '/fam/update' : '/fam/create',
                    method: 'post',
                    data: {
                        className: this.layoutClass,
                        attrRawList: rowList
                    }
                }).catch((error) => {
                    console.error(error);
                });
            },
            useSystemLayout: function (layout) {
                const self = this;
                self.createOrUpdateLayout({
                    layoutType: 'PERSONAL',
                    nameI18nJson: layout.nameI18nJson,
                    descriptionI18nJson: layout.nameI18nJson,
                    state: 'STARTED',
                    pinned: true,
                    appName: layout.appName,
                    resourceRef: layout.resourceRef,
                    sourceLayoutOid: layout.oid
                }).then((res) => {
                    if (res.success) {
                        self.$message({
                            type: 'success',
                            message: self.i18nMappingObj.useSuccess
                        });
                        self.reload();
                    }
                });
            }
        },
        created() {},
        mounted() {}
    };
});
