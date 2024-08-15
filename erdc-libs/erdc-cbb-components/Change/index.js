define([
    'text!' + ELMP.resource('erdc-cbb-components/Change/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, cbbUtils) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'Change',
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        props: {
            vm: Object,
            oid: String,
            className: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/Change/locale/index.js')
            };
        },
        watch: {
            innerOid: {
                handler: function (nv) {
                    if (nv) {
                        this.$refs.changeTable.fnRefreshTable();
                    }
                }
            }
        },
        computed: {
            innerOid() {
                return this.oid || this.vm?.containerOid || '';
            },
            viewTableConfig() {
                return {
                    tableRequestConfig: {
                        url: `change/change/items/${this.innerOid}`, // 表格数据接口
                        method: 'get' // 请求方法（默认get）
                    },
                    isDeserialize: true, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    firstLoad: true, // 首次进入就加载数据（在钩子里面执行）
                    toolbarConfig: {
                        valueKey: 'attrName',
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showRefresh: false, // 是否显示刷新表格，默认显示
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        }
                    },
                    addSeq: true, // 是否添加序列
                    addIcon: true,
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
                    columns: [
                        {
                            attrName: 'icon',
                            title: '',
                            width: 48,
                            align: 'center'
                        },
                        {
                            attrName: 'identifierNo',
                            label: this.i18n?.['编码']
                        },
                        {
                            attrName: 'name',
                            label: this.i18n?.['名称']
                        },
                        {
                            attrName: 'lifecycleStatus.status',
                            label: this.i18n?.['生命周期状态']
                        },
                        {
                            attrName: 'containerRef',
                            label: this.i18n?.['上下文']
                        },
                        {
                            attrName: 'createBy',
                            label: this.i18n?.['创建者']
                        },
                        {
                            attrName: 'updateBy',
                            label: this.i18n?.['修改者']
                        },
                        {
                            attrName: 'createTime',
                            label: this.i18n?.['创建时间']
                        },
                        {
                            attrName: 'updateTime',
                            label: this.i18n?.['更新时间']
                        }
                    ],
                    fieldLinkConfig: {
                        fieldLink: true,
                        fieldLinkName: 'identifierNo',
                        linkClick: (row) => {
                            this.showDetail(row);
                        }
                    },
                    slotsField: [
                        {
                            prop: 'icon',
                            type: 'default'
                        }
                    ],
                    pagination: {
                        showPagination: false
                    }
                };
            }
        },
        methods: {
            showDetail(row) {
                return cbbUtils.goToDetail(row, {
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        })
                    }
                });
            }
        }
    };
});
