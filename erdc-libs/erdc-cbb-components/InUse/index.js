define([
    'text!' + ELMP.resource('erdc-cbb-components/InUse/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, cbbUtils) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'InUse',
        template,
        props: {
            oid: String,
            className: String,
            vm: Object,
            viewTableConfig: Function
        },
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/InUse/locale/index.js'),
                tableData: []
            };
        },
        watch: {
            innerOid: {
                handler: function (nv) {
                    if (nv) {
                        this.$refs.inUseTable.fnRefreshTable();
                    }
                }
            }
        },
        computed: {
            innerOid() {
                return this.oid || this.vm?.containerOid || '';
            },
            defaultViewTableConfig() {
                const { className, innerOid } = this;
                return {
                    vm: this?.vm || this,
                    columns: [
                        {
                            attrName: 'icon',
                            label: '',
                            width: 40,
                            align: 'center'
                        },
                        {
                            attrName: 'number',
                            label: this.i18n['编码']
                        },
                        {
                            attrName: 'name',
                            label: this.i18n['名称']
                        },
                        {
                            attrName: 'containerName',
                            label: this.i18n['上下文']
                        },
                        {
                            attrName: 'version',
                            label: this.i18n['版本']
                        }
                    ],
                    firstLoad: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/struct/getParent', // 表格数据接口
                        params: {
                            childOid: innerOid
                        }, // 路径参数
                        method: 'GET', // 请求方法（默认get）
                        className: className,
                        transformResponse: [
                            (respData) => {
                                let resData = respData;
                                try {
                                    resData = respData && JSON.parse(respData);
                                    const data = ErdcKit.deepClone(resData.data);
                                    data.isChildren = true;
                                    resData.data.records = [data];
                                    // 获取根节点数据
                                    this.tableData = resData.data.records;
                                } catch (err) {}
                                return resData;
                            }
                        ]
                    },
                    toolbarConfig: {
                        showMoreSearch: false,
                        showConfigCol: false,
                        showRefresh: false,
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        }
                    },
                    fieldLinkConfig: {
                        fieldLink: true,
                        // 是否添加列超链接
                        fieldLinkName: 'number', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            // 超链接事件
                            this.handleDetail(row);
                        }
                    },
                    slotsField: [
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'icon', // 当前字段使用插槽
                            type: 'default'
                        }
                    ],
                    addSeq: true,
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true, // 溢出隐藏显示省略号
                        treeNode: 'number',
                        treeConfig: {
                            lazy: true,
                            hasChild: 'isChildren',
                            iconOpen: 'erd-iconfont erd-icon-arrow-down',
                            iconClose: 'erd-iconfont erd-icon-arrow-right',
                            rowField: 'oid',
                            children: 'childrenList',
                            parentField: 'parentOid',
                            loadMethod: ({ row }) => {
                                return this.getBeUseByParent(row);
                            }
                        }
                    },
                    pagination: {
                        showPagination: false
                    }
                };
            },
            innerViewTableConfig() {
                if (_.isFunction(this.viewTableConfig)) {
                    return this.viewTableConfig(this.defaultViewTableConfig);
                }
                return this.defaultViewTableConfig;
            },
            init() {
                return this.innerOid && this.className;
            }
        },
        methods: {
            refresh() {
                this.$refs.inUseTable.fnRefreshTable();
            },
            handleCallBack() {
                setTimeout(() => {
                    let vxeTable = this.$refs.inUseTable.getTableInstance('vxeTable', 'instance') || {};
                    if (this.tableData.length > 0) vxeTable.setTreeExpand([this.tableData[0]], true);
                });
            },
            getBeUseByParent(row) {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/struct/getParent',
                        data: {
                            childOid: row?.childOid || ''
                        },
                        className: this.className || '',
                        method: 'GET'
                    }).then((resp) => {
                        var data = resp.data || {};
                        if (_.isArray(data.childrenList) && data.childrenList.length > 0) {
                            data.childrenList.forEach((item) => {
                                item.isChildren = !item.leaf;
                            });
                            resolve(data.childrenList);
                        } else {
                            row.isChildren = false;
                            resolve([]);
                        }
                    });
                });
            },
            handleDetail(row) {
                const className = row.childOid.split(':')[1];
                this.$famHttp({
                    url: '/fam/attr',
                    className,
                    data: {
                        oid: row?.childOid || ''
                    }
                }).then((res) => {
                    if (res.success) {
                        cbbUtils.goToDetail.call(this, res.data.rawData);
                    }
                });
            },
            getIcon(row) {
                return (
                    row.attrRawList?.find((item) => item.attrName.includes('icon'))?.value ||
                    row.rawMap?.icon?.value ||
                    row.icon
                );
            }
        }
    };
});
