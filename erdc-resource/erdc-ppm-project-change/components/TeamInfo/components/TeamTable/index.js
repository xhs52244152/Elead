define([
    'erdcloud.kit',
    'text!' + ELMP.func('erdc-ppm-project-change/components/TeamInfo/components/TeamTable/index.html')
], function (ErdcKit, template) {
    const FamKit = require('fam:kit');
    const TreeUtil = FamKit.TreeUtil;
    return {
        template,
        props: {
            tableData: {
                type: Array,
                default: () => []
            },
            readonly: Boolean
        },
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-project-change/locale/index.js'),
                selectData: '',
                teamTableData: [],
                sourceData: []
            };
        },
        computed: {
            tableConfig() {
                let tableConfig = {
                    border: true,
                    rowConfig: {
                        isCurrent: true,
                        isHover: true
                    },
                    columnConfig: {
                        resizable: true
                    },
                    align: 'left',
                    showOverflow: true,
                    rowClassName(data) {
                        return data?.row?.action === 'DELETE' ? 'fam-erd-table__row--deleted' : '';
                    },
                    sortConfig: {
                        showIcon: false,
                        multiple: false
                    },
                    filterConfig: {
                        iconNone: 'erd-iconfont erd-icon-filter',
                        iconMatch: 'erd-iconfont erd-icon-filter on'
                    },
                    treeConfig: {
                        transform: true,
                        expandAll: true, // 默认展开全部
                        reserve: true, // 刷新数据保持默认展开
                        rowField: 'id',
                        iconOpen: 'erd-iconfont erd-icon-arrow-down',
                        iconClose: 'erd-iconfont erd-icon-arrow-right ',
                        parentField: 'parentId' //父级key
                    },
                    // 列
                    column: [
                        {
                            prop: 'seq', // 列数据字段key
                            type: 'seq', // 特定类型
                            title: ' ',
                            width: 48,
                            align: 'left' //多选框默认居中显示
                        },
                        {
                            prop: 'checkbox',
                            title: '',
                            minWidth: '50',
                            sort: false,
                            width: '50',
                            type: 'checkbox',
                            align: 'center'
                        },
                        {
                            prop: 'principalName', // 参与者
                            treeNode: true,
                            sort: false,
                            width: '210',
                            title: this.i18n?.['participants']
                        },
                        {
                            prop: 'principalTarget', // 参与者类型
                            title: this.i18n?.['participantsType'],
                            sort: false
                        },
                        {
                            prop: 'code', // 工号
                            title: this.i18n?.['workNumber'],
                            sort: false
                        },
                        {
                            prop: 'userCode', // 登录号
                            title: this.i18n?.['login'],
                            sort: false
                        },
                        {
                            prop: 'mobile', // 手机
                            title: this.i18n?.['mobilePhone'],
                            sort: false
                        },
                        {
                            prop: 'email', // 邮箱
                            title: this.i18n?.['email'],
                            sort: false
                        },
                        {
                            prop: 'department', // 部门
                            title: this.i18n?.['department'],
                            sort: false
                        },
                        {
                            prop: 'operation', // 操作
                            title: this.i18n['operation'],
                            width: this.$store.state.i18n?.lang === 'zh_cn' ? 65 : 92,
                            sort: false,
                            fixed: 'right'
                        }
                    ]
                };
                if (this.readonly) tableConfig.column = tableConfig.column.filter((item) => item.prop !== 'operation');
                return tableConfig;
            }
        },
        watch: {
            tableData: {
                handler(val) {
                    this.sourceData = _.map(val, (item) => _.extend({}, FamKit.deepClone(item)));
                    this.teamTableData = val;
                },
                immediate: true
            }
        },
        methods: {
            handleCommand(key, row) {
                this.$emit('command', { key, row });
            },
            searchTable(keyword) {
                this.teamTableData = keyword
                    ? TreeUtil.filterTreeTable(ErdcKit.deepClone(this.sourceData), keyword, {
                          attrs: ['principalName', 'identifierNo', 'code', 'roleCode', 'roleName', 'userCode', 'email']
                      })
                    : ErdcKit.deepClone(this.sourceData);
                this.expandTree();
            },
            filterType(val) {
                let displayLabel = val;
                switch (val) {
                    case 'USER':
                        displayLabel = this.i18n.user;
                        break;
                    case 'GROUP':
                        displayLabel = this.i18n.group;
                        break;
                    case 'ROLE':
                        displayLabel = this.i18n.role;
                        break;
                    default:
                        break;
                }
                return displayLabel;
            },
            selectChangeEvent({ recodes }) {
                this.selectData = recodes;
            },
            expandTree() {
                this.$nextTick(() => {
                    const $table = this.$refs['famErdTable']?.$table;
                    $table?.updateData();
                    $table?.setAllTreeExpand(true);
                });
            }
        }
    };
});
