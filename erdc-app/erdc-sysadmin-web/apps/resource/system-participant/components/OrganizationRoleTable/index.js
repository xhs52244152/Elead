define([
    'text!' + ELMP.resource('system-participant/components/OrganizationRoleTable/index.html'),
    ELMP.resource('system-participant/api.js'),
    'erdcloud.kit',
    'css!' + ELMP.resource('system-participant/components/OrganizationRoleTable/style.css'),
    'fam:store',
    'underscore'
], function (template, api) {
    const store = require('fam:store');
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            orgOid: {
                type: String,
                default() {
                    return '';
                }
            },
            visible: {
                type: Boolean,
                default() {
                    return '';
                }
            },
            appName: String
        },
        components: {
            // 基础表格
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            AddOrganizationRole: ErdcKit.asyncComponent(
                ELMP.resource('erdc-product-components/AddOrganizationRole/index.js')
            )
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
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'sure',
                    'addOrganizationRole',
                    'ok',
                    'cancel',
                    'add',
                    'remove',
                    'tips',
                    'deleteMember',
                    'removeSuccess',
                    'addSuccess',
                    // 表头
                    'role',
                    'principal',
                    'type',
                    'principalMobile',
                    'organization',
                    'email',
                    'operation',
                    'userGroup'
                ]),
                tableData: [],
                currentTeam: {}, // 当前团队总对象
                oldParticipant: [], // 参与者
                oldParticipantIds: [], // 参与者id
                currentOperRole: {}, // 当前操作角色
                showParticipantType: ['USER', 'GROUP'],
                maxHeight: 380, // 表格高度
                defaultTableHeight: 380,
                heightDiff: 406.5
            };
        },
        computed: {
            tableVisible() {
                return this.visible;
            },
            tableConfig() {
                return {
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
                            prop: 'roleName', // 列数据字段key
                            title: this.i18nMappingObj.role, // 列头部标题
                            minWidth: '150', // 列宽度
                            sort: false, // 是否需要排序
                            fixed: '', // 是否固定列 left right
                            treeNode: true // 标记树形表格的位置
                        },
                        {
                            prop: 'principalName',
                            title: this.i18nMappingObj.principal,
                            minWidth: '150',
                            sort: false,
                            fixed: ''
                        },
                        {
                            prop: 'principalTarget',
                            title: this.i18nMappingObj.type,
                            minWidth: '80',
                            sort: false,
                            fixed: ''
                        },
                        {
                            prop: 'department',
                            title: this.i18nMappingObj.organization,
                            minWidth: '120',
                            sort: false,
                            fixed: ''
                        },
                        {
                            prop: 'mobile',
                            title: this.i18nMappingObj.principalMobile,
                            minWidth: '100',
                            sort: false,
                            fixed: ''
                        },
                        {
                            prop: 'email',
                            title: this.i18nMappingObj.email,
                            minWidth: '160',
                            sort: false,
                            fixed: ''
                        },
                        {
                            prop: 'operation',
                            title: this.i18nMappingObj.operation,
                            width: '80',
                            sort: false,
                            fixed: 'right'
                        }
                    ]
                };
            },
            createPerm() {
                return this.$attrs.orgInfoMenu?.includes('ORG_TEAM_ADD');
            },
            removePerm() {
                return this.$attrs.orgInfoMenu?.includes('ORG_TEAM_REMOVE');
            }
        },
        watch: {
            orgOid: {
                handler(nv) {
                    // 部门oid存在
                    if (nv) {
                        // this.fnGetRoleList()
                        this.fetchOrganization(); // 根据oid查询部门详情
                    }
                },
                immediate: true
            }
        },
        created() {
            this.getHeight();
        },
        methods: {
            getHeight() {
                //获取浏览器高度并计算得到表格所用高度。 减去表格外的高度
                let height = document.documentElement.clientHeight - this.heightDiff;
                this.maxHeight = height || this.defaultTableHeight;
            },
            // 查询表格数据
            fnGetRoleList() {
                let orgContainerId = this.$store?.state?.app?.container?.containerTeamRef || ''; // 'OR:erd.cloud.foundation.principal.entity.Organization:99210668586041123'
                this.$famHttp({
                    url: `/fam/team/selectById?teamOid=${orgContainerId}`,
                    method: 'get'
                })
                    .then((res) => {
                        this.currentTeam = res?.data || {}; // 团队对象
                        // 处理角色和参与者的树显示数据源
                        let roleList = res?.data?.teamRoleLinkDtos || []; // 角色列表
                        let rolePrincipalLinks = []; // 把角色中所有的参与者解析出来
                        roleList.forEach((item) => {
                            // 把每个角色下的参与者数据增加一个parentId，并且解析数据放到一个数组中
                            rolePrincipalLinks.push(
                                ...(item.rolePrincipalLinks || []).map((ite) => {
                                    ite.parentId = item.id;
                                    return ite;
                                })
                            );
                        });
                        this.tableData = [...roleList, ...rolePrincipalLinks]; // 解析角色和参与者，放一起到表格数据源显示
                        this.$nextTick(() => {
                            const $table = this.$refs['OrgRoleTable']?.$table;
                            $table?.updateData();
                            $table?.setAllTreeExpand(true);
                        });
                    })
                    .catch((err) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: err?.data?.message || err?.data || err
                        // });
                    });
            },
            fnAddRole(row) {
                this.oldParticipantIds = [];
                this.currentOperRole = row;
                this.roleForm.oid = row?.id || '';
                this.roleForm.visible = true;
                this.roleForm.roleName = row?.roleName || '';
                this.oldParticipant = row?.rolePrincipalLinks || []; // 当前角色下的参与者
                this.oldParticipant.forEach((item) => this.oldParticipantIds.push(item.principal));
            },
            fnRemoveRole(row) {
                let teamId = this.currentTeam.oid || '';
                let oids = [row?.oid];
                // 是否要移除该成员？
                this.$confirm(this.i18nMappingObj.deleteMember, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        this.$loading({ lock: true });

                        this.$famHttp({
                            url: '/fam/team/participants/remove',
                            params: {
                                teamOid: teamId,
                                className: store.getters.className('OrgContainer')
                            },
                            data: oids,
                            method: 'delete'
                        })
                            .then((res) => {
                                if (res?.data) {
                                    this.$message.success(this.i18nMappingObj['removeSuccess']);
                                    this.fnGetRoleList();
                                }
                            })
                            .catch((err) => {
                                // this.$message({
                                //     type: 'error',
                                //     message: err?.data?.message || err?.data || err
                                // });
                            });
                    })
                    .catch(() => {})
                    .finally(() => {
                        this.$loading().close();
                    });
            },
            // 增加成员提交
            fnOnSubmitForm() {
                this.$refs?.addOrgRole.fnGetFormData(true).then((roleUserFormData) => {
                    this.roleForm.loading = true;
                    this.$loading({ lock: true });
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
                    this.$famHttp({
                        url: `/fam/team/participants/add`,
                        method: 'post',
                        data: {
                            roleAObjectRef: this.currentTeam.oid || '',
                            roleBObjectRef: this.currentOperRole?.roleBObjectRef || '',
                            className: store.getters.className('OrgContainer'),
                            rolePrincipalLinks: [...oldParticipantList, ...newParticipant]
                        }
                    })
                        .then((res) => {
                            if (res?.success) {
                                this.$message.success(this.i18nMappingObj['addSuccess']);
                                this.fnCloseFormDialog();
                                this.fnGetRoleList();
                            }
                        })
                        .catch((err) => {
                            // this.$message({
                            //     type: 'error',
                            //     message: err?.data?.message || err?.data || err
                            // });
                        })
                        .finally(() => {
                            this.roleForm.loading = false;
                            this.$loading().close();
                        });
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
                this.fetchOrganizationByOId(this.orgOid).then(({ data }) => {
                    const { rawData } = data;
                    this.extractOrganizationAttr(rawData);
                });
            },
            fetchOrganizationByOId(oid) {
                return api.fetchOrganizationByOId(oid);
            },
            // 反序列字段key值
            extractOrganizationAttr(rawData) {
                this.orgDetail = ErdcKit.deserializeAttr(rawData, {
                    valueMap: {
                        parentRef({ displayName = null, value, oid }) {
                            return {
                                name: displayName,
                                oid
                            };
                        },
                        containerRef({ displayName = null, value, oid }) {
                            return {
                                name: displayName,
                                oid
                            };
                        }
                    }
                });
                this.fnGetRoleList(); // 查询角色列表
            },
            // 参与者类型
            filterType(val) {
                let displayLabel = val;
                switch (val) {
                    case 'USER':
                        displayLabel = this.i18n.user;
                        break;
                    case 'GROUP':
                        displayLabel = this.i18n.userGroup;
                        break;
                    default:
                        break;
                }
                return displayLabel;
            }
        }
    };
});
