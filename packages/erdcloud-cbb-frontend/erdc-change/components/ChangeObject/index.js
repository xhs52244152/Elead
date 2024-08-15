define([
    'text!' + ELMP.func('erdc-change/components/ChangeObject/index.html'),
    ELMP.func('erdc-change/utils.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-change/config/viewConfig.js')
], function (template, utils, cbbUtils, viewConfig) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ChangeObject',
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            vm: Object
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                tableHeight: document.body.clientHeight - 341,
                tableData: []
            };
        },
        watch: {
            // 树形oid发生变化的时候，重新刷新表格(有些操作oid没变化,但数据有变)
            oid(newVal) {
                if (newVal) {
                    this.$refs.changeObjectTable.fnRefreshTable();
                }
            },
            info: {
                handler(newVal) {
                    if (newVal) {
                        this.$nextTick(() => {
                            this.$refs.changeObjectTable.fnRefreshTable();
                        });
                    }
                }
            },
            deep: true
        },
        computed: {
            viewTableMapping() {
                return viewConfig?.prChangeTableView || {};
            },
            className() {
                return this.viewTableMapping?.className || '';
            },
            tableKey() {
                return this.viewTableMapping?.tableKey || '';
            },
            oid() {
                return this.vm?.containerOid || '';
            },
            viewTableConfig() {
                const { oid } = this;
                return {
                    vm: this,
                    columns: [
                        {
                            attrName: 'icon',
                            label: '',
                            width: 40,
                            align: 'center',
                            fixed: 'left',
                            extraCol: true
                        },
                        {
                            attrName: 'identifierNo',
                            label: this.i18n['编码'],
                            treeNode: true,
                            fixed: 'left',
                            minWidth: 200
                        },
                        {
                            attrName: 'name',
                            label: this.i18n['名称']
                        },
                        {
                            attrName: 'lifecycleStatus.status',
                            label: this.i18n['生命周期状态']
                        },
                        {
                            attrName: 'containerRef',
                            label: this.i18n['上下文']
                        },
                        {
                            attrName: 'createBy',
                            label: this.i18n['创建者']
                        },
                        {
                            attrName: 'updateBy',
                            label: this.i18n['修改者']
                        },
                        {
                            attrName: 'createTime',
                            label: this.i18n['创建时间']
                        },
                        {
                            attrName: 'updateTime',
                            label: this.i18n['更新时间']
                        }
                    ],
                    firstLoad: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: `/change/getChangeTree/${oid}`, // 表格数据接口
                        params: {
                            childOid: ''
                        }, // 路径参数
                        method: 'GET', // 请求方法（默认get）
                        // className: className,
                        transformResponse: [
                            (respData) => {
                                let resData = respData;
                                try {
                                    resData = respData && JSON.parse(respData);
                                    let data = ErdcKit.deepClone(resData.data.records);
                                    resData.data.records = this.dealTreeData(data);
                                    this.tableData = this.dealTreeData(data);
                                } catch (err) { }

                                return resData;
                            }
                        ]
                    },
                    toolbarConfig: {
                        showMoreSearch: false,
                        showConfigCol: true,
                        showRefresh: true,
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: true,
                            placeholder: '请输入关键词搜索', // 输入框提示文字，默认请输入
                            isLocalSearch: true, // 使用前端搜索
                            searchCondition: ['name', 'identifierNo']
                        }
                    },
                    fieldLinkConfig: {
                        fieldLink: true,
                        // 是否添加列超链接
                        fieldLinkName: 'identifierNo', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
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
                    addSeq: true, //添加序号
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
                        treeNode: 'identifierNo', //必须设置树节点显示的位置
                        treeConfig: {
                            reserve: true,
                            expandAll: true,
                            children: 'childList'
                        }
                    },
                    pagination: {
                        // 分页
                        showPagination: false // 是否显示分页
                    }
                };
            }
        },
        methods: {
            dealTreeData(data) {
                let result = data.map((item) => ({
                    ...item,
                    ...ErdcKit.deserializeArray(item.attrRawList, {
                        valueKey: 'displayName',
                        isI18n: true,
                        valueMap: {
                            icon({ value }) {
                                return value
                            }
                        }
                    }),
                    // 如果children为空数组，则置为null
                    childList: item.childList && item.childList.length ? this.dealTreeData(item.childList) : null
                }));
                return result;
            },
            handleCallBack() {
                return false;
            },
            // 详情
            handleDetail(row) {
                if (!row.oid) return;
                let detailMap = viewConfig.detailMap;
                // let moduleName = viewConfig.classNameMap[row.idKey];
                if (this.$route.path === `${this.$route?.meta?.parentPath}/${detailMap[row.idKey]}/${row.oid}`) {
                    this.vm.activeName = 'detail';
                } else {
                    //要兼容入口(首页、产品)
                    cbbUtils.goToDetail(row);
                }
            },
            getIconClass(row) {
                return utils.getIconClass(row);
            },
            getIconStyle(row) {
                const style = utils.getIconClass(row.attrRawList, row?.idKey);
                style.verticalAlign = 'text-bottom';
                style.fontSize = '16px';

                return style;
            },
            getIcon(row) {
                return row.attrRawList?.find((item) => item.attrName.includes('icon'))?.value || row.icon;
            }
        }
    };
});
