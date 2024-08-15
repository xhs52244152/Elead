define([
    'text!' + ELMP.resource('erdc-cbb-components/HistoryRecord/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, utils) {
    const ErdcKit = require('erdc-kit');

    return {
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        props: {
            oid: String,
            viewTableConfig: Function,
            toolActionConfig: Object,
            vm: Object,
            className: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/HistoryRecord/locale/index.js')
            };
        },
        watch: {
            innerOid: {
                handler: function (nv) {
                    if (nv) {
                        this.$refs.historyRecordTable.fnRefreshTable();
                    }
                }
            }
        },
        computed: {
            innerOid() {
                return this.oid || this.vm?.containerOid || '';
            },
            innerClassName() {
                return this.className || this.oid?.split(':')[1] || '';
            },
            init() {
                return this.innerOid && this.innerClassName;
            },
            defaultViewTableConfig() {
                return {
                    vm: this?.vm || this,
                    dataKey: 'data.records', // 数据源key，支持多层级
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/common/history', // 表格数据接口
                        data: {
                            oid: this.innerOid
                        },
                        className: this.innerClassName,
                        method: 'post', // 请求方法（默认get）
                        isFormData: false // 是否表单数据查询，如果是表单，则表格内不做任何参数处理，全部要外部表单传入内部无法处理
                    },
                    isDeserialize: true, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    firstLoad: true, // 首次进入就加载数据（在钩子里面执行）
                    toolbarConfig: {
                        valueKey: 'attrName',
                        showConfigCol: true, // 是否显示配置列，默认显示
                        showRefresh: true, // 是否显示刷新表格，默认显示
                        actionConfig: {
                            // 使用功能按钮组件
                            name: this.toolActionConfig?.actionName || '', // 必填，功能按钮场景key，取注入值
                            className: this.toolActionConfig?.className || this.innerClassName || '', // 非必填，当前使用场景的的className
                            containerOid: this.$store.state.space?.context?.oid || '', // 当前上下文oid
                            isDefaultBtnType: true //配置是否需要使用主按钮，设置为false的时候代表需要主按钮
                        },
                        fuzzySearch: {
                            show: false
                        }
                    },
                    addCheckbox: true, // 是否添加复选框（勾选事件可参考vxe-table官网提供事件）
                    addSeq: true, // 是否添加序列
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
                    fieldLinkConfig: {
                        fieldLink: true,
                        // 是否添加列超链接
                        fieldLinkName: 'identifierNo', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            // 超链接事件
                            this.showDetail(row);
                        }
                    },
                    columns: [
                        {
                            attrName: 'identifierNo',
                            label: this.i18n?.['编码']
                        },
                        {
                            attrName: 'name',
                            label: this.i18n?.['名称']
                        },
                        {
                            attrName: 'version',
                            label: this.i18n?.['版本']
                        },
                        {
                            attrName: 'typeReference',
                            label: this.i18n?.['类型']
                        },
                        {
                            attrName: 'iterationInfo.note',
                            label: this.i18n?.['检入备注']
                        },
                        {
                            attrName: 'containerRef',
                            label: this.i18n?.['上下文']
                        },
                        {
                            attrName: 'lifecycleStatus.status',
                            label: this.i18n?.['生命周期状态']
                        },
                        {
                            attrName: 'createBy',
                            label: this.i18n?.['创建者']
                        },
                        {
                            attrName: 'createTime',
                            label: this.i18n?.['创建时间']
                        },
                        {
                            attrName: 'updateBy',
                            label: this.i18n?.['修改者']
                        },
                        {
                            attrName: 'updateTime',
                            label: this.i18n?.['修改时间']
                        }
                    ]
                };
            },
            innerViewTableConfig() {
                if (_.isFunction(this.viewTableConfig)) {
                    return this.viewTableConfig(this.defaultViewTableConfig);
                }
                return this.defaultViewTableConfig;
            }
        },
        methods: {
            refresh() {
                this.$refs.historyRecordTable.fnRefreshTable();
            },
            showDetail(row) {
                utils.goToDetail.call(this, row, {
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        componentRefresh: true
                    }
                });
            }
        }
    };
});
