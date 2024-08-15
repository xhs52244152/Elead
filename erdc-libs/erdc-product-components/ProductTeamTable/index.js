define([
    'text!' + ELMP.resource('erdc-product-components/ProductTeamTable/index.html'),
    'css!' + ELMP.resource('erdc-product-components/ProductTeamTable/style.css'),
    'fam:kit',
    'fam:store',
    ELMP.resource('erdc-app/api/organization.js'),
    'underscore'
], function (template) {
    const FamKit = require('fam:kit');
    const TreeUtil = FamKit.TreeUtil;
    const store = require('fam:store');
    const _ = require('underscore');
    const api = require(ELMP.resource('erdc-app/api/organization.js'));

    const ActionMethods = {
        // 查看用户
        ContainerTeam_VIEWUSERS: function (vm, row) {
            vm.viewUsers(row);
        },
        // 增加成员
        ContainerTeam_ADDMEMBER: function (vm, row) {
            vm.fnAddRole(row);
        },
        // 设为主责任人
        ContainerTeam_SETMAIN: function (vm, row) {
            vm.onSetResp(row);
        },
        // 取消主责任人
        ContainerTeam_CANCELMAIN: function (vm, row) {
            vm.onCancelResp(row);
        },
        // 移除成员
        ContainerTeam_REMOVEMEMBER: function (vm, row) {
            vm.fnRemoveRole(row);
        },
        // 成员替换
        ContainerTeam_MEMBER_REPLAICEMENT: function (vm, row) {
            vm.replaceMember(row);
        }
    };
    if (!store.state.common.actionMethods['ContainerTeam_REMOVEMEMBER']) {
        store.dispatch('registerActionMethods', ActionMethods);
    }

    return {
        template,
        components: {
            FamErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            AddOrganizationRole: FamKit.asyncComponent(
                ELMP.resource('erdc-product-components/AddOrganizationRole/index.js')
            ),
            OpenCreateTeam: FamKit.asyncComponent(ELMP.resource('erdc-product-components/OpenCreateTeam/index.js')),
            ViewUsers: FamKit.asyncComponent(ELMP.resource('erdc-product-components/ViewUsers/index.js')),
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        props: {
            orgOid: {
                type: String,
                default() {
                    return '';
                }
            },
            containerTeamRef: {
                type: String
            },
            visible: {
                type: Boolean,
                default() {
                    return '';
                }
            },
            showCreateRole: {
                type: Boolean,
                default: true
            },
            type: String,
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
            height: {
                type: Number,
                default: 690
            },
            onlyShowRole: {
                type: Boolean,
                default: false
            },
            className: String,
            keyword: String,
            bizOid: String,
            appName: String,
            changeTableConfig: Function
        },
        data() {
            return {
                orgDetail: {},
                roleForm: {
                    roleName: '',
                    visible: false,
                    loading: false,
                    editable: false
                },
                loading: false,
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    deleteRole: this.getI18nByKey('是否要移除该角色？'),
                    deleteMember: this.getI18nByKey('是否要移除该成员？'),
                    deleteAllMember: this.getI18nByKey('存在子类角色'),
                    deleteData: this.getI18nByKey('是否要移除当前所选数据吗？'),
                    tips: this.getI18nByKey('提示'),
                    keys: this.getI18nByKey('请输入关键字'),
                    role: this.getI18nByKey('增加角色'),
                    member: this.getI18nByKey('增加成员'),
                    remove: this.getI18nByKey('移除'),
                    responsible: this.getI18nByKey('设为主责任人'),
                    cancelResponsible: this.getI18nByKey('取消主责任人'),
                    enter: this.getI18nByKey('请输入'),
                    edit: this.getI18nByKey('编辑'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    removeSuccess: this.getI18nByKey('移除成功'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    cancel: this.getI18nByKey('取消'),
                    confirm: this.getI18nByKey('确定'),
                    detail: this.getI18nByKey('详情'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    continue: this.getI18nByKey('此操作将取消主责任人，是否继续？'),
                    // 表头
                    participants: this.getI18nByKey('参与者'),
                    participantsType: this.getI18nByKey('参与者类型'),
                    workNumber: this.getI18nByKey('工号'),
                    login: this.getI18nByKey('登录号'),
                    phone: this.getI18nByKey('手机'),
                    email: this.getI18nByKey('邮箱'),
                    department: this.getI18nByKey('部门'),
                    operation: this.getI18nByKey('操作'),
                    operationSuccess: this.getI18nByKey('操作成功'),
                    viewUsers: this.getI18nByKey('viewUsers'),
                    memberReplacement: this.getI18nByKey('memberReplacement')
                },
                tableData: [],
                sourceData: [],
                currentTeam: {}, // 当前团队总对象
                oldParticipant: [], // 参与者
                oldParticipantIds: [], // 参与者id
                checkList: [], // 当前复选框选中数据
                currentRow: null, // 当前操作角色
                currentRole: null,
                showParticipantType: ['USER', 'GROUP', 'ROLE'],
                tableMaxHeight: 380, // 表格高度
                defaultTableHeight: 380,
                heightDiff: 280,
                dialogVisible: false,
                dialogTitle: '',
                roleRef: '',
                teamOid: '',
                showViewUsersDialog: false,
                isReplacement: false,
                currentOperUser: null,
                levelDict: []
            };
        },
        computed: {
            tableVisible() {
                return this.visible;
            },
            tableConfig() {
                const tableConfig = {
                    border: true,
                    height: this.tableMaxHeight,
                    rowConfig: {
                        isCurrent: true,
                        isHover: true
                    },
                    columnConfig: {
                        resizable: true
                    },
                    align: 'left',
                    showOverflow: true,
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
                        // {
                        //     prop: 'sortOrder',
                        //     title: '',
                        //     minWidth: '80',
                        //     sort: false,
                        //     width: '80',
                        // },
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
                            title: this.i18nMappingObj?.['participants']
                        },
                        {
                            prop: 'principalTarget', // 参与者类型
                            title: this.i18nMappingObj?.['participantsType'],
                            sort: false
                        },
                        {
                            prop: 'code', // 工号
                            title: this.i18nMappingObj?.['workNumber'],
                            sort: false
                        },
                        {
                            prop: 'userCode', // 登录号
                            title: this.i18nMappingObj?.['login'],
                            sort: false
                        },
                        {
                            prop: 'mobile', // 手机
                            title: this.i18nMappingObj?.['phone'],
                            sort: false
                        },
                        {
                            prop: 'email', // 邮箱
                            title: this.i18nMappingObj?.['email'],
                            sort: false
                        },
                        {
                            prop: 'department', // 部门
                            title: this.i18nMappingObj?.['department'],
                            sort: false
                        },
                        {
                            prop: 'operation', // 操作
                            title: this.i18nMappingObj?.['operation'],
                            width: this.$store.state.i18n?.lang === 'zh_cn' ? 65 : 92,
                            sort: false,
                            fixed: 'right'
                        }
                    ]
                };
                return _.isFunction(this.changeTableConfig) ? this.changeTableConfig(tableConfig) : tableConfig;
            },
            pathToCurrentRole() {
                return this.currentRole
                    ? TreeUtil.findPath(this.tableData, {
                          target: this.currentRole
                      }).concat(this.currentRole)
                    : [];
            }
        },
        watch: {
            orgOid: {
                handler(nv) {
                    // 部门oid存在
                    if (nv) {
                        // this.fnGetRoleList()
                        if (nv?.includes('ScalableContainer')) {
                            this.getContainerInfo();
                        } else {
                            this.fetchOrganization();
                        }
                    } else {
                        this.fnGetRoleList();
                    }
                }
            },
            containerTeamRef: {
                handler(containerTeamRef) {
                    if (containerTeamRef) {
                        this.fnGetRoleList();
                    }
                }
            }
        },
        filters: {
            // 参与者类型
            filterType(val, filterType) {
                return filterType(val);
            }
        },
        created() {
            this.vm = this;
            this.getHeight();
            this.getLevelDict();
        },
        mounted() {
            if (this.orgOid) {
                if (this.orgOid?.includes('ScalableContainer')) {
                    this.getContainerInfo();
                } else {
                    this.fetchOrganization();
                }
            } else if (this.containerTeamRef) {
                this.fnGetRoleList();
            }
        },
        methods: {
            getHeight() {
                //获取浏览器高度并计算得到表格所用高度。 减去表 格外的高度
                let height = document.documentElement.clientHeight - this.heightDiff;
                this.tableMaxHeight = height || this.defaultTableHeight;
            },
            onSubmit() {
                this.fnGetRoleList();
            },
            changeCheck(data) {
                this.checkList = data.records.map((item) => item.oid);
            },
            // 设置责任人
            onSetResp(row) {
                let { primarily, id } = row;
                let formData = new FormData();
                formData.append('rolePrincipalMapId', id);
                formData.append('teamOid', this.teamOid);
                formData.append('isPrimarily', !primarily);

                this.$famHttp({
                    url: '/fam/team/setPrimarily',
                    data: formData,
                    className: this.className,
                    method: 'post'
                }).then(() => {
                    this.$message.success(this.i18nMappingObj['operationSuccess']);
                    this.fnGetRoleList(); // 查询角色列表
                });
            },
            onCancelResp(row) {
                let { primarily, id } = row;
                let formData = new FormData();
                formData.append('rolePrincipalMapId', id);
                formData.append('teamOid', this.teamOid);
                formData.append('isPrimarily', !primarily);

                this.$confirm(this.i18nMappingObj['continue'], this.i18nMappingObj['confirmCancel'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/team/setPrimarily',
                        data: formData,
                        className: this.className,
                        method: 'post'
                    }).then(() => {
                        this.$message.success(this.i18nMappingObj['operationSuccess']);
                        this.fnGetRoleList(); // 查询角色列表
                    });
                });
            },
            // 批量移除
            fnBatchRemove() {
                let teamId = this.teamOid || '';
                let oids = this.checkList;

                this.$confirm(this.i18nMappingObj.deleteData, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/team/participants/remove',
                        params: {
                            teamOid: teamId,
                            className: this.className || store.getters.className('OrgContainer')
                        },
                        data: oids,
                        method: 'delete'
                    }).then((res) => {
                        if (res?.data) {
                            this.$message.success(this.i18nMappingObj['operationSuccess']);
                            this.fnGetRoleList();
                            this.$set(this, 'checkList', []);
                        }
                    });
                });
            },
            // 查询表格数据
            fnGetRoleList(containerTeamRef, hasOrgOid) {
                if (!hasOrgOid && containerTeamRef && containerTeamRef === this.containerTeamRef) {
                    return;
                }
                // let orgContainerId = this.orgDetail?.containerRef?.oid || '' // 'OR:erd.cloud.foundation.principal.entity.Organization:99210668586041123'
                // 产品: OR:erd.cloud.foundation.core.team.entity.ContainerTeam:1592467466757210114 产品管理
                // 团队模板: OR:erd.cloud.foundation.core.team.entity.TeamTemplate:1597505508426715137 // 团队模板管理

                let orgContainerId = containerTeamRef || this.containerTeamRef || '';
                if (this.type === 'teamTemplate' && this.orgDetail?.oid) {
                    orgContainerId = this.orgDetail.oid;
                }
                if (!orgContainerId) {
                    return Promise.reject(new Error('containerTeamRef is empty'));
                }
                this.loading = true;
                this.$famHttp({
                    url: `/fam/team/selectById`,
                    params: {
                        teamOid: orgContainerId,
                        className: this.className
                    },
                    method: 'get'
                })
                    .then((res) => {
                        this.currentTeam = res?.data || {}; // 团队对象
                        this.teamOid = res?.data?.oid || ''; // 团队oid
                        this.teamBaseInfo = res?.data || {};
                        this.$emit('teamevent', res?.data?.oid);
                        // 处理角色和参与者的树显示数据源
                        let roleList = res?.data?.teamRoleLinkDtos || []; // 角色列表
                        this.$emit(
                            'getrolelist',
                            roleList?.map((item) => item?.roleBObjectRef)
                        );
                        let rolePrincipalLinks = []; // 把角色中所有的参与者解析出来
                        let roleChildren = []; // 子角色
                        // 特殊处理 组织默认团队 不可添加子角色
                        if (this.currentTeam?.number === 'T20200425005') {
                            this.showParticipantType = ['USER', 'GROUP'];
                        } else {
                            this.showParticipantType = ['USER', 'GROUP', 'ROLE'];
                        }
                        // 取出所有children，
                        const callbackChildren = (array) => {
                            array.forEach((item) => {
                                // 后端没有返回id时，截取oid最后一个值作为id
                                if (!item?.id) item.id = item?.oid?.split(':')?.[2];

                                if (item?.rolePrincipalLinks?.length) {
                                    rolePrincipalLinks.push(
                                        ...(item.rolePrincipalLinks || []).map((ite) => {
                                            ite.parentId = item.id;
                                            return ite;
                                        })
                                    );
                                }
                                if (item?.children?.length) {
                                    roleChildren.push(
                                        ...(item.children || []).map((ite) => {
                                            ite.parentId = item.id;
                                            ite.principalName = ite.roleName;
                                            ite.principalTarget = 'ROLE';
                                            return ite;
                                        })
                                    );
                                    callbackChildren(item.children);
                                }
                            });
                        };
                        roleList.forEach((item) => {
                            // 角色增加标识
                            item.principalTarget = 'ROLE';
                            item.parentId = '-1'; // 防止vxe-table由于没找到parentId而导致的表格数据显示不出来
                            item['principalName'] = item.roleName;
                            if (!item.id) {
                                item.id = item.oid;
                            }
                            // 把每个角色下的参与者数据增加一个parentId，并且解析数据放到一个数组中
                            rolePrincipalLinks.push(
                                ...(item.rolePrincipalLinks || []).map((ite) => {
                                    ite.parentId = item.id;
                                    return ite;
                                })
                            );
                            // children字段存储子角色
                            if (item.children?.length) {
                                roleChildren.push(
                                    ...(item.children || []).map((ite) => {
                                        ite.parentId = item.id;
                                        ite.principalName = ite.roleName;
                                        ite.principalTarget = 'ROLE';
                                        return ite;
                                    })
                                );
                                callbackChildren(item.children);
                            }
                        });
                        this.tableData = [...roleList, ...rolePrincipalLinks, ...roleChildren]; // 解析角色和参与者，放一起到表格数据源显示 + 子角色
                        // 表格是树形，但是数据之前全部抛出为一层，这里将数据转换排序方式，
                        this.tableData = [
                            ...this.tableData.filter((item) => item.principalTarget === 'ROLE'),
                            ...this.tableData.filter((item) => item.principalTarget === 'GROUP'),
                            ...this.tableData.filter((item) => item.principalTarget === 'USER')
                        ];
                        if (this.tableData.length > 0) {
                            this.tableData = this.tableData?.map((item) => {
                                return {
                                    ...item,
                                    code: item?.code || '--',
                                    userCode: item?.userCode || '--',
                                    mobile: item?.mobile || '--',
                                    email: item?.email || '--',
                                    department: item?.department || '--'
                                };
                            });
                        }
                        // 勾选仅展示角色
                        if (this.onlyShowRole) {
                            this.tableData = this.tableData.filter((item) => item.principalTarget === 'ROLE');
                        }
                        this.$nextTick(() => {
                            const $table = this.$refs['ProRoleTable']?.$table;
                            $table?.updateData();
                            $table?.setAllTreeExpand(true);
                        });
                        this.sourceData = _.map(this.tableData, (item) => _.extend({}, FamKit.deepClone(item)));
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            fnAddRole(row) {
                this.dialogTitle = this.i18nMappingObj.member;
                this.isReplacement = false;
                this.dialogVisible = true;
                this.roleRef = row.roleBObjectRef;
                this.oldParticipantIds = [];
                this.currentRow = row;
                this.currentRole = row;
                this.roleForm.oid = row?.id || '';
                this.roleForm.visible = true;
                this.roleForm.roleName = row?.roleName || '';
                this.oldParticipant = row?.rolePrincipalLinks || []; // 当前角色下的参与者
                this.oldParticipant.forEach((item) => this.oldParticipantIds.push(item.principal));
            },
            fnRemoveRole(row) {
                let deleteTips = this.i18nMappingObj.deleteMember;
                let roleChildren = row?.children?.map((item) => item.principalTarget) || [];
                if (roleChildren.length && roleChildren.includes('ROLE')) {
                    deleteTips = this.i18nMappingObj.deleteAllMember;
                } else if (roleChildren.length || row.parentId === '-1' || row?.principalTarget === 'ROLE') {
                    deleteTips = this.i18nMappingObj.deleteRole;
                }

                let teamId = this.teamOid || '';
                let oids = [row?.oid];
                // 是否要移除该成员？
                this.$confirm(deleteTips, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        this.$famHttp({
                            url: '/fam/team/participants/remove',
                            params: {
                                teamOid: teamId,
                                className: this.className || store.getters.className('OrgContainer')
                            },
                            data: oids,
                            method: 'delete'
                        }).then((res) => {
                            if (res?.data) {
                                this.$message.success(this.i18nMappingObj['operationSuccess']);
                                this.fnGetRoleList();
                            }
                        });
                    })
                    .finally(() => {
                        // this.$loading().close()
                    });
            },
            // 增加成员提交
            fnOnSubmitForm() {
                this.roleForm.loading = true;
                this.$loading({ lock: true });
                let roleUserFormData = this.$refs?.addOrgRole.fnGetFormData();
                // 新增参与者人员
                let newParticipant = (roleUserFormData?.selectVal || []).map((item) => {
                    return {
                        roleBObjectRef: item,
                        primarily: false,
                        principalTarget: roleUserFormData?.participantType
                    };
                });
                let oldParticipantList = [];
                this.oldParticipant.forEach((item) => {
                    let filterRes = newParticipant.filter(
                        (ite) =>
                            ite.roleBObjectRef == item.roleBObjectRef && ite.principalTarget == item.principalTarget
                    );
                    // 如果没有重复的，把旧的参与者放到新数组中
                    if (!filterRes?.length > 0) {
                        oldParticipantList.push({
                            roleBObjectRef: item.roleBObjectRef,
                            primarily: false,
                            principalTarget: item.principalTarget
                        });
                    }
                });
                let className = store.getters.className('OrgContainer');
                if (!this.teamOid.includes('ContainerTeam')) {
                    className = this.className;
                }
                this.$famHttp({
                    url: `/fam/team/participants/add`,
                    method: 'post',
                    data: {
                        roleAObjectRef: this.teamOid || '',
                        roleBObjectRef: this.currentRow?.roleBObjectRef || '',
                        className: className,
                        rolePrincipalLinks: [...oldParticipantList, ...newParticipant]
                    }
                })
                    .then((res) => {
                        if (res?.success) {
                            this.$message.success(this.i18nMappingObj['operationSuccess']);
                            this.fnCloseFormDialog();
                            this.fnGetRoleList();
                        }
                    })
                    .finally(() => {
                        this.roleForm.loading = false;
                        this.$loading().close();
                    });
            },
            // 关闭弹窗
            fnCloseFormDialog() {
                this.roleForm.visible = false;
                this.roleForm.loading = false;
                this.roleForm.oid = '';
                this.roleForm.editable = false;
                this.roleForm.roleName = '';
            },
            // 根据oid查询部门详情
            fetchOrganization() {
                return this.fetchOrganizationByOId(this.orgOid).then(({ data }) => {
                    const { rawData } = data;
                    this.extractOrganizationAttr(rawData);
                });
            },
            fetchOrganizationByOId(oid) {
                return api.fetchOrganizationByOId(oid);
            },
            // 反序列字段key值
            extractOrganizationAttr(rawData) {
                this.orgDetail = FamKit.deserializeAttr(rawData, {
                    valueMap: {
                        parentRef({ displayName = null, oid }) {
                            return {
                                name: displayName,
                                oid
                            };
                        },
                        containerRef({ displayName = null, oid }) {
                            return {
                                name: displayName,
                                oid
                            };
                        }
                    }
                });

                this.fnGetRoleList(); // 查询角色列表
            },
            getContainerInfo() {
                this.$famHttp({
                    url: '/fam/container/getCurrentContainerInfo',
                    data: {
                        oid: this.orgOid
                    },
                    method: 'get'
                }).then((res) => {
                    this.fnGetRoleList(res?.data?.containerTeamRef, true);
                });
            },
            // 点击群组数据的查看用户按钮，打开用户详情弹窗
            viewUsers(row) {
                this.currentRow = row;
                this.currentRole = row;
                this.showViewUsersDialog = true;
            },
            getActionConfig(row) {
                let actionConfig = {
                    name: 'ContainerTeam_ROW_ACTION',
                    objectOid: row.oid,
                    className: this.className,
                    containerOid: this.teamOid
                };

                // 通用空间模板时 删除className
                if (this.$route.query.pageType) {
                    delete actionConfig.className;
                }

                return actionConfig;
            },
            replaceMember(row) {
                this.dialogTitle = this.i18nMappingObj.memberReplacement;
                this.currentRow = row;
                const pathToCurrent = TreeUtil.findPath(this.tableData, {
                    target: row,
                    isSome: false
                });
                if (row.principalTarget === 'ROLE') {
                    this.currentRole = row;
                } else {
                    this.currentRole =
                        pathToCurrent[pathToCurrent.length - 2] || pathToCurrent[pathToCurrent.length - 1];
                }
                this.roleRef = row.roleBObjectRef;
                this.isReplacement = true;
                this.dialogVisible = true;
            },
            assemblyMemberReplacement(vm, data = []) {
                let { createList = [], updateList = [], deleteList = [] } = vm.assembleChanges();
                const rawDataVoList = [];

                if (this.isReplacement && data.length) {
                    deleteList = deleteList.filter(
                        (item) => !data.some((subItem) => subItem.roleName === item.roleName)
                    );
                }

                const generateRawData = (row, action, removeAttrRawList, createOid = null) => {
                    const rawObject = {
                        roleAObjectRef:
                            action === 'CREATE'
                                ? this.currentRole.oid
                                : null || row.roleAObjectRef || this.currentRow.roleAObjectRef,
                        roleBObjectRef: row.roleBObjectRef || row.oid
                    };

                    return {
                        containerRef: this.currentRole.oid,
                        oid: action === 'CREATE' ? createOid : row.oid,
                        className:
                            row.principalTarget === 'ROLE'
                                ? this.currentRole?.idKey || this.currentRow.idKey
                                : row.idKey || this.$store.getters.className('RolePrincipalLink'),
                        action,
                        attrRawList: removeAttrRawList
                            ? null
                            : Object.keys(rawObject).map((key) => ({
                                  attrName: key,
                                  value: rawObject[key]
                              }))
                    };
                };

                const saveRawData = (rows, action, removeAttrRawList) => {
                    rows.forEach((row) => {
                        if (row) {
                            rawDataVoList.push(generateRawData(row, action, removeAttrRawList));
                        }
                    });
                };

                saveRawData(createList, 'CREATE');
                saveRawData(deleteList, 'DELETE', true);
                updateList.forEach((row) => {
                    const replaceWith = row.replaceWith?.value || [];
                    if (replaceWith.length > 0) {
                        replaceWith.forEach((oid, index) => {
                            if (row) {
                                rawDataVoList.push(
                                    generateRawData(
                                        {
                                            ...row,
                                            roleBObjectRef: oid
                                        },
                                        index === 0 ? 'UPDATE' : 'CREATE',
                                        false,
                                        row.oid
                                    )
                                );
                            }
                        });
                    }
                });

                return {
                    action: 'UPDATE',
                    className: this.teamOid,
                    containerRef: this.bizOid || this.$route.query.pid || this.teamOid,
                    rawDataVoList
                };
            },
            submitMemberReplacement(vm, data) {
                return this.$famHttp({
                    url: '/fam/saveOrUpdate',
                    method: 'POST',
                    className: this.className,
                    data: this.assemblyMemberReplacement(vm, data?.children)
                }).then(() => {
                    this.$message.success(this.i18n.memberReplaceSuccess);
                });
            },
            searchTable(keyword) {
                this.tableData = keyword
                    ? TreeUtil.filterTreeTable(FamKit.deepClone(this.sourceData), this.keyword, {
                          attrs: ['principalName', 'identifierNo', 'code', 'roleCode', 'roleName', 'userCode', 'email']
                      })
                    : FamKit.deepClone(this.sourceData);
                this.$nextTick(() => {
                    const $table = this.$refs['ProRoleTable']?.$table;
                    $table?.updateData();
                    $table?.setAllTreeExpand(true);
                });
            },
            // 参与者类型
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
            getLevelDict() {
                this.$famHttp({
                    url: `/fam/dictionary/tree/teamRoleLevel`,
                    headers: {
                        'App-Name': 'ALL'
                    },
                    params: {
                        status: 1
                    }
                }).then(({ data = [] }) => {
                    this.levelDict = data;
                });
            },
            setLevel(level, data) {
                this.$famHttp({
                    url: 'fam/update',
                    data: {
                        attrRawList: [
                            {
                                attrName: 'roleLevel',
                                value: level?.identifierNo || ''
                            }
                        ],
                        className: 'erd.cloud.core.team.entity.TeamRoleLink',
                        isDraft: false,
                        oid: data.oid
                    },
                    method: 'POST',
                    unSubPrefix: true
                }).then(() => {
                    this.$message.success(this.i18n.setLevelSuccess);
                    this.fnGetRoleList();
                });
            },
            roleLevelName(roleLevel) {
                return this.levelDict.find((item) => item.identifierNo === roleLevel)?.displayName;
            }
        }
    };
});
