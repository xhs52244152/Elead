/*
    类型属性配置
    先引用 kit组件
    Team: FamKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js')),

    <Team
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :title="title"
    :oid="typeOid"
    :openType="openType"
    @onsubmit="onSubmit"></Team>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-product-components/Team/index.html'),
    'underscore',
    'css!' + ELMP.resource('erdc-product-components/Team/style.css')
], function (template) {
    const FamKit = require('fam:kit');
    const _ = require('underscore');

    return {
        name: 'SpaceTeam',
        inheritAttrs: false,
        template,
        components: {
            // 基础表格
            ErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            OpenCreateTeam: FamKit.asyncComponent(ELMP.resource('erdc-product-components/OpenCreateTeam/index.js')),
            ProductTeamTable: FamKit.asyncComponent(ELMP.resource('erdc-product-components/ProductTeamTable/index.js')),
            FamActionButton: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            MemberReplacement: FamKit.asyncComponent(
                ELMP.resource('erdc-product-components/Team/MemberReplacement/index.js')
            )
        },
        props: {
            teamOid: {
                type: String,
                default: ''
            },
            productOid: {
                type: String,
                default: ''
            },
            containerTeamRef: {
                type: String
            },
            teamTableType: {
                type: String,
                default: 'product'
            },
            isEdit: {
                type: Boolean,
                default: true
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 参与者默认显示类型 'USER', 'GROUP'
            showParticipantType: {
                type: Array,
                default: () => {
                    return ['USER', 'GROUP'];
                }
            },
            height: {
                type: Number,
                default: 468
            },
            showCreateRole: {
                type: Boolean,
                default: true
            },
            className: String,
            actionConfig: {
                type: Object,
                default() {
                    return {
                        name: 'ContainerTeam_TABLE_ACTION'
                    };
                }
            },
            appName: String
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    keys: this.getI18nByKey('searchTips'),
                    role: this.getI18nByKey('增加角色'),
                    member: this.getI18nByKey('增加成员'),
                    remove: this.getI18nByKey('移除'),
                    responsible: this.getI18nByKey('设为主责任人'),
                    cancelResponsible: this.getI18nByKey('取消主责任人'),
                    enter: this.getI18nByKey('请输入'),
                    edit: this.getI18nByKey('编辑'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    cancel: this.getI18nByKey('取消'),
                    confirm: this.getI18nByKey('确定'),
                    detail: this.getI18nByKey('详情'),
                    confirmCancel: this.getI18nByKey('确认取消主责任人'),
                    continue: this.getI18nByKey('此操作将取消主责任人，是否继续？'),
                    selectData: this.getI18nByKey('请先选择数据'),

                    participants: this.getI18nByKey('参与者'),
                    participantsType: this.getI18nByKey('参与者类型'),
                    workNumber: this.getI18nByKey('工号'),
                    login: this.getI18nByKey('登录号'),
                    phone: this.getI18nByKey('手机'),
                    email: this.getI18nByKey('邮箱'),
                    department: this.getI18nByKey('部门'),
                    operation: this.getI18nByKey('操作'),
                    onlyShowRole: this.getI18nByKey('onlyShowRole')
                },
                searchValue: '',
                tableData: [],
                mergeCells: [],
                pagination: {
                    currentPage: 1,
                    pageSize: 10,
                    total: 11
                },
                isResponsible: false,
                dialogVisible: false,
                dialogTitle: '',
                roleRef: '',
                createTeamOid: '',
                firstRole: [], // 已选中的一级角色
                onlyShowRole: false,
                replacement: {
                    visible: true
                }
            };
        },
        computed: {
            vm() {
                return this;
            },
            columns() {
                return [
                    // {
                    //     prop: 'sortOrder',
                    //     title: '',
                    //     minWidth: '80',
                    //     width: '80'
                    // },
                    {
                        prop: 'checkbox',
                        title: '',
                        minWidth: '50',
                        width: '50',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'participants', // 参与者
                        treeNode: true,
                        width: '210',
                        title: this.i18nMappingObj?.['participants']
                    },
                    {
                        prop: 'participantsType', // 参与者类型
                        title: this.i18nMappingObj?.['participantsType']
                    },
                    {
                        prop: 'workNumber', // 工号
                        title: this.i18nMappingObj?.['workNumber']
                    },
                    {
                        prop: 'login', // 登录号
                        title: this.i18nMappingObj?.['login']
                    },
                    {
                        prop: 'phone', // 手机
                        title: this.i18nMappingObj?.['phone']
                    },
                    {
                        prop: 'email', // 邮箱
                        title: this.i18nMappingObj?.['email']
                    },
                    {
                        prop: 'department', // 部门
                        title: this.i18nMappingObj?.['department']
                    },
                    {
                        prop: 'oper', // 操作
                        title: this.i18nMappingObj?.['operation'],
                        width: 160,
                        sort: false,
                        fixed: 'right'
                    }
                ];
            }
        },
        watch: {
            searchValue(keyword) {
                this.debouncedSearch(keyword);
            }
        },
        created() {
            this.createTeamOid = this.teamOid;
            this.debouncedSearch = _.debounce((keyword) => {
                this.search(keyword);
            }, 300);
        },
        methods: {
            search(keyword) {
                this.$refs.teamTable.searchTable(keyword);
            },
            getRoleList(data) {
                this.firstRole = data;
            },
            teamFn(val) {
                this.createTeamOid = val;
            },
            onSubmit() {
                this.onRefresh();
            },
            onCreateRole() {
                this.roleRef = '';
                this.dialogTitle = this.i18nMappingObj.role;
                this.dialogVisible = true;
            },
            onCreateMember() {
                this.dialogTitle = this.i18nMappingObj.member;
                this.dialogVisible = true;
            },
            onRemove() {
                let checkList = this.$refs?.teamTable.checkList;
                if (checkList.length > 0) {
                    this.$refs?.teamTable.fnBatchRemove();
                } else {
                    this.$message.warning(this.i18nMappingObj['selectData']);
                }
            },
            onRefresh() {
                this.$refs?.teamTable.fnGetRoleList();
            },
            onConfig() {},
            // 设置责任人
            onSetResp(data) {
                // data.row['isResponsible'] = true;
                _.each(data.items, (item) => {
                    if (item.id !== data.row.id) {
                        item.isResponsible = false;
                    } else {
                        item.isResponsible = true;
                    }
                });
            },
            onCancelResp(data) {
                this.$confirm(this.i18nMappingObj['continue'], this.i18nMappingObj['confirmCancel'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    data.row['isResponsible'] = false;
                });
            },
            // 分页
            PageSizeChange() {},
            CurrentPageChange() {},
            /**
             * checkbox
             * 复选框
             * @checkbox-all="selectAllEvent"
             @checkbox-change="selectChangeEvent"
             * **/
            selectAllEvent(data) {
                const records = this.$refs['erdTable'].$table.getCheckboxRecords();
                this.selectData = records || [];
            },
            selectChangeEvent(data) {
                const records = this.$refs['erdTable'].$table.getCheckboxRecords();
                this.selectData = records || [];
            },
            handleChecked() {
                this.$refs?.teamTable.fnGetRoleList();
            },
            actionClick(btn) {
                switch (btn.name) {
                    case 'ContainerTeam_ADDROLE':
                        this.onCreateRole();
                        break;
                    case 'ContainerTeam_REMOVEROLE':
                        this.onRemove();
                        break;
                    default:
                        break;
                }
            }
        }
    };
});
