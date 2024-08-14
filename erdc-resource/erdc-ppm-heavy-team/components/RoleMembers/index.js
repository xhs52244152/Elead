define([
    'text!' + ELMP.resource('erdc-ppm-heavy-team/components/RoleMembers/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-ppm-heavy-team/components/RoleMembers/style.css')
], function (template, ErdcKit, store, utils) {
    const TreeUtil = ErdcKit.TreeUtil;
    return {
        template,
        props: {
            oid: {
                type: String,
                default: ''
            },
            containerTeamRef: String,
            teamTableType: {
                type: String,
                default: 'product'
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {
                        data: {
                            appName: 'PPM',
                            isGetVirtualRole: false
                        }
                    };
                }
            },
            treeDetail: {
                type: Object,
                default: {}
            },
            isShow: {
                type: Boolean,
                default: true
            },
            showCreateRole: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                searchVal: '',
                tableData: [],
                sourceData: [],
                i18nLocalePath: ELMP.resource('erdc-ppm-heavy-team/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    moveTip: this.getI18nByKey('moveTip'),
                    moveTo: this.getI18nByKey('moveTo'),
                    deleteTip: this.getI18nByKey('deleteTip'),
                    tip: this.getI18nByKey('tip'),
                    more: this.getI18nByKey('more'),
                    lookUser: this.getI18nByKey('lookUser'),

                    deleteRole: this.getI18nByKey('deleteRole'),
                    deleteMember: this.getI18nByKey('deleteMember'),
                    deleteAllMember: this.getI18nByKey('deleteAllMember'),
                    deleteSelectData: this.getI18nByKey('deleteSelectData'),
                    keys: this.getI18nByKey('keys'),
                    role: this.getI18nByKey('role'),
                    member: this.getI18nByKey('member'),
                    selectRole: this.getI18nByKey('selectRole'),
                    selectMember: this.getI18nByKey('selectMember'),
                    remove: this.getI18nByKey('remove'),
                    responsible: this.getI18nByKey('responsible'),
                    cancelResponsible: this.getI18nByKey('cancelResponsible'),
                    onlyShowRole: this.getI18nByKey('onlyShowRole'),

                    confirmDelete: this.getI18nByKey('confirmDelete'),
                    confirmCancel: this.getI18nByKey('confirmCancel'),
                    continue: this.getI18nByKey('continue'),
                    add: this.getI18nByKey('add'),
                    searchTips: this.getI18nByKey('searchTips'),
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    addMember: this.getI18nByKey('addMember'),
                    operate: this.getI18nByKey('operate'),
                    participants: this.getI18nByKey('participants'),
                    participantsType: this.getI18nByKey('participantsType'),
                    workNumber: this.getI18nByKey('workNumber'),
                    login: this.getI18nByKey('login'),
                    mobile: this.getI18nByKey('mobile'),
                    email: this.getI18nByKey('email'),
                    department: this.getI18nByKey('department'),
                    successfullyRemoved: this.getI18nByKey('successfullyRemoved'),
                    successfullySet: this.getI18nByKey('successfullySet'),
                    successfullyCancel: this.getI18nByKey('successfullyCancel'),
                    successful: this.getI18nByKey('successful'),
                    successfullyAdd: this.getI18nByKey('successfullyAdd'),
                    mainResponsible: this.getI18nByKey('mainResponsible')
                },
                selectList: [],
                dialogVisible: false,
                dialogVisibleUser: false,
                onlyShowRole: false,
                dialogTitle: '增加角色',
                teamOid: '',
                roleRef: '',
                tableMaxHeight: 380, // 表格高度
                heightDiff: 236,
                defaultTableHeight: 350,
                showParticipantType: ['USER', 'GROUP', 'ROLE'],
                currentTeam: {}, // 当前团队总对象
                oldParticipant: [], // 参与者
                oldParticipantIds: [], // 参与者id
                checkList: [], // 当前复选框选中数据
                currentOperRole: {}, // 当前操作角色
                firstRole: [] // 已选中的一级角色
            };
        },
        created() {
            this.getHeight();
        },
        computed: {
            tableConfig() {
                return {
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
                        iconClose: 'erd-iconfont erd-icon-arrow-right',
                        parentField: 'parentId' //父级key
                    },
                    // 列
                    column: [
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
                            prop: 'seq', // 列数据字段key
                            type: 'seq', // 特定类型
                            title: ' ',
                            width: 48,
                            align: 'left' //多选框默认居中显示
                        },
                        {
                            prop: 'principalName', // 参与者
                            treeNode: true,
                            sort: false,
                            width: '210',
                            title: this.i18nMappingObj.participants
                        },
                        {
                            prop: 'principalTarget', // 参与者类型
                            title: this.i18nMappingObj.participantsType,
                            sort: false
                        },
                        {
                            prop: 'code', // 工号
                            title: this.i18nMappingObj.workNumber,
                            sort: false
                        },
                        {
                            prop: 'userCode', // 登录号
                            title: this.i18nMappingObj['login'],
                            sort: false
                        },
                        {
                            prop: 'mobile', // 手机
                            title: this.i18nMappingObj['mobile'],
                            sort: false
                        },
                        {
                            prop: 'email', // 邮箱
                            title: this.i18nMappingObj['email'],
                            sort: false
                        },
                        {
                            prop: 'department', // 部门
                            title: this.i18nMappingObj['department'],
                            sort: false
                        },
                        {
                            visible: false,
                            prop: 'operate', // 操作
                            title: this.i18nMappingObj['operate'],
                            width: 80,
                            sort: false,
                            fixed: 'right'
                        }
                    ]
                };
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            className() {
                return store.state.classNameMapping.businessHeavyTeam;
            }
        },
        filters: {
            // 参与者类型
            filterType(val) {
                let displayLabel = val;
                switch (val) {
                    case 'USER':
                        displayLabel = '用户';
                        break;
                    case 'GROUP':
                        displayLabel = '群组';
                        break;
                    case 'ROLE':
                        displayLabel = '角色';
                        break;
                    default:
                        break;
                }
                return displayLabel;
            }
        },
        watch: {
            oid: {
                handler(nVal) {
                    if (nVal) {
                        setTimeout(() => {
                            this.getTableData();
                        }, 300);
                    }
                },
                immediate: true
            }
        },
        methods: {
            getHeight() {
                //获取浏览器高度并计算得到表格所用高度。 减去表 格外的高度
                let height = document.documentElement.clientHeight - this.heightDiff;
                this.tableMaxHeight = height || this.defaultTableHeight;
            },
            getTableData() {
                this.$famHttp({
                    url: '/cbb/heavyTeam/getRoleParticipantsByTeamOid',
                    method: 'GET',
                    params: {
                        teamOid: this.oid,
                        className: this.className
                    }
                }).then((res) => {
                    if (res.code === '200') {
                        this.currentTeam = res?.data || {}; // 团队对象
                        this.teamOid = res?.data?.oid || ''; // 团队oid
                        this.$emit('teamevent', res?.data?.oid);
                        // 处理角色和参与者的树显示数据源
                        let roleList = res?.data?.teamRoleLinkDtos || []; // 角色列表
                        // this.$emit(
                        //     'getrolelist',
                        //     roleList?.map((item) => item?.roleBObjectRef)
                        // );
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
                        // 勾选仅展示角色
                        if (this.onlyShowRole) {
                            this.tableData = this.tableData.filter((item) => item.principalTarget === 'ROLE');
                        }
                        this.$nextTick(() => {
                            const $table = this.$refs['erdRoleTable']?.$table;
                            $table?.updateData();
                            $table?.setAllTreeExpand(true);
                        });
                        this.sourceData = _.map(this.tableData, (item) => _.extend({}, ErdcKit.deepClone(item)));
                    }
                });
            },
            onRefresh() {
                this.getTableData();
            },
            searchTable(keyword) {
                this.tableData = keyword
                    ? TreeUtil.filterTreeTable(ErdcKit.deepClone(this.sourceData), keyword, {
                          attrs: ['principalName', 'identifierNo', 'code', 'roleCode', 'roleName', 'userCode', 'email']
                      })
                    : ErdcKit.deepClone(this.sourceData);
                this.$nextTick(() => {
                    const $table = this.$refs['erdRoleTable']?.$table;
                    $table?.updateData();
                    $table?.setAllTreeExpand(true);
                });
            },
            handleChecked() {
                this.getTableData();
            },
            fnAddRole(row) {
                this.dialogTitle = this.i18nMappingObj.member;
                this.dialogVisible = true;
                this.roleRef = row.roleBObjectRef;
                this.oldParticipantIds = [];
                this.currentOperRole = row;
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
                this.$confirm(deleteTips, this.i18nMappingObj.tip, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        this.$famHttp({
                            url: '/cbb/heavyTeam/participants/remove',
                            params: {
                                teamOid: teamId,
                                className: this.className
                            },
                            data: oids,
                            method: 'delete'
                        })
                            .then((res) => {
                                if (res?.data) {
                                    this.$message.success(this.i18nMappingObj['success']);
                                    this.getTableData();
                                }
                            })
                            .catch(() => {});
                    })
                    .catch(() => {})
                    .finally(() => {
                        // this.$loading().close()
                    });
            },
            // 设置责任人
            onSetResp(row) {
                let { primarily, id } = row;
                let formData = new FormData();
                formData.append('rolePrincipalMapId', id);
                formData.append('teamOid', this.teamOid);
                formData.append('isPrimarily', !primarily);

                this.$famHttp({
                    url: '/cbb/team/setPrimarily',
                    className: this.className,
                    data: formData,
                    method: 'post'
                }).then(() => {
                    this.$message.success(this.i18nMappingObj['success']);
                    this.getTableData(); // 查询角色列表
                });
            },
            lookUser(row) {
                this.dialogVisibleUser = true;
                this.currentOperRole = row;
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
                        url: '/cbb/team/setPrimarily',
                        data: formData,
                        className: this.className,
                        method: 'post'
                    }).then(() => {
                        this.$message.success(this.i18nMappingObj['success']);
                        this.getTableData(); // 查询角色列表
                    });
                });
            },
            fnEditor() {
                this.$refs['relativeTeam'].$refs['FamAdvancedTable'];
            },
            onInput: function () {
                utils.debounceFn(() => {
                    this.searchTable(this.searchVal);
                }, 300);
            },
            // 复选框改变
            selectChangeEvent(data) {
                this.selectList = data.records.map((item) => item.oid);
            },
            handleAdd() {
                this.roleRef = '';
                this.dialogVisible = true;
                this.currentOperRole = {};
            },
            handleRemove() {
                if (!this.selectList.length) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSelectData
                    });
                }
                let teamId = this.teamOid || '';
                // 是否要移除该成员？
                this.$confirm(this.i18nMappingObj.deleteSelectData, this.i18nMappingObj.tip, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        this.$famHttp({
                            url: '/cbb/heavyTeam/participants/remove',
                            params: {
                                teamOid: teamId,
                                className: this.className
                            },
                            data: this.selectList,
                            method: 'delete'
                        })
                            .then((res) => {
                                if (res?.data) {
                                    this.$message.success(this.i18nMappingObj['success']);
                                    this.getTableData();
                                    this.selectList = [];
                                }
                            })
                            .catch(() => {});
                    })
                    .catch(() => {})
                    .finally(() => {
                        // this.$loading().close()
                    });
            },
            handleCancel() {
                this.innerVisible = false;
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_OPERATE_MENU',
                    objectOid: row.oid,
                    className: store.state.classNameMapping.project
                };
            },
            onSubmit() {
                this.getTableData();
            }
        },
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            LookUser: ErdcKit.asyncComponent(ELMP.resource('erdc-ppm-heavy-team/components/LookUser/index.js')),

            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            OpenCreateTeam: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/OpenCreateTeam/index.js'))
        }
    };
});
