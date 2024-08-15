define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-participant/components/MemberLockTable/index.html'),
    'css!' + ELMP.resource('system-participant/components/MemberLockTable/style.css'),
    'underscore'
], function (ErdcKit, template) {
    const _ = require('underscore');
    return {
        template,
        props: {
            orgId: {
                type: String,
                default() {
                    return '';
                }
            },
            orgCode: {
                type: String,
                default() {
                    return '';
                }
            },
            orgRow: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('system-participant/locale/index.js'),
                form: {
                    oid: null,
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false,
                    defaultValue: {}
                },
                currentOperRow: '',
                tableBodyData: {}
            };
        },
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            MemberForm: ErdcKit.asyncComponent(ELMP.resource('system-participant/components/MemberForm/index.js'))
        },
        computed: {
            viewTableConfig() {
                return {
                    viewOid: '', // 视图id
                    firstLoad: true,
                    dataKey: 'data',
                    searchParamsKey: 'keyword', // 模糊搜索参数传递key
                    sortParamsKey: 'orderBy', // 排序参数传递key
                    sortOrderParamsKey: 'sortBy',
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/user/list/lock', // 表格数据接口
                        params: {}, // 路径参数
                        data: this.tableBodyData // body参数
                    },
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: true,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18n.memberSearchPlaceholder, // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '280',
                            isLocalSearch: true
                        },
                        mainBtn: {
                            type: 'default',
                            label: this.i18n.unlock,
                            key: 'unlock', //解锁
                            disabledBySelect: true,
                            onclick: () => {
                                let tableSelection = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                                let ids = tableSelection.map((ite) => ite.id);
                                this.unlockMembers(ids);
                            }
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
                        showPagination: false
                    },
                    addSeq: true,
                    addCheckbox: true,
                    columns: [
                        {
                            attrName: 'code', // 属性名
                            label: this.i18n.workNumber, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'name',
                            label: this.i18n.loginAccount,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        },
                        {
                            attrName: 'displayName',
                            label: this.i18n.chineseName,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        },
                        {
                            attrName: 'email',
                            label: this.i18n.email,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        },
                        {
                            attrName: 'mobile',
                            label: this.i18n.mobile,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        },
                        {
                            attrName: 'orgName',
                            label: this.i18n.orgName,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        },
                        {
                            attrName: 'operation',
                            label: this.i18n.operation,
                            sortAble: false,
                            width: window.LS.get('lang_current') === 'en_us' ? 100 : 60,
                            fixed: 'right',
                            showOverflow: false
                        }
                    ],
                    slotsField: [
                        // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        {
                            prop: 'code',
                            type: 'default' // 当前字段使用插槽
                        },
                        {
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ]
                };
            },
            // 当前操作行
            currentOperMemberRow() {
                return this.currentOperRow || '';
            }
        },
        methods: {
            unlockMembers(ids) {
                if (ids && ids.length) {
                    this.$famHttp({
                        method: 'post',
                        url: '/fam/user/list/unlock',
                        data: ids
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18n.unlockSuccess);
                            this.$emit('refresh-tree', this.orgRow?.parentKey);
                            this.reloadMemberTable();
                        }
                    });
                }
            },
            // 刷新表格
            reloadMemberTable(payload) {
                this.tableBodyData = { ...payload };
                // 避免首次进入加载过快还未渲染完成导致报错
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.$refs['famAdvancedTable'].fnRefreshTable();
                    }, 200);
                });
            },
            // 查看用户
            fnViewMemberDetail(row) {
                this.currentOperRow = row;
                this.form.oid = row?.oid || null;
                const orgNames = row?.orgName?.split(';');
                this.form.defaultValue = {
                    orgIds: _.map(row.orgIds, (oid, idx) => ({ oid: oid, name: orgNames[idx] })),
                    orgName: row?.orgName
                };
                this.form.visible = true;
                this.form.readonly = true;
            },
            // 关闭表单
            fnCloseMemberForm() {
                this.form = {
                    oid: null,
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false,
                    defaultValue: {}
                };
                this.currentOperRow = '';
            }
        }
    };
});
