define([
    'text!' + ELMP.resource('erdc-product-components/OpenCreateTeam/index.html'),
    'erdc-kit',
    'underscore',
    'css!' + ELMP.resource('erdc-product-components/OpenCreateTeam/style.css')
], function (template, utils) {
    const FamKit = require('fam:kit');
    const _ = require('underscore');
    const store = require('fam:store');

    return {
        template,
        components: {
            // 基础表格
            FamErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            AddParticipantSelect: FamKit.asyncComponent(
                ELMP.resource('erdc-product-components/AddParticipantSelect/index.js')
            ),
            FamParticipantSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },
            teamOid: {
                type: String,
                default: ''
            },
            roleRefer: {
                type: String,
                default: ''
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 当前选中行角色
            currentRow: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 类型
            type: {
                type: String,
                default: 'addRole'
            },
            // 已选中的一级角色
            firstRole: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 参与者类型默认值 'USER', 'GROUP'
            showParticipantType: {
                type: Array,
                default: () => {
                    return ['USER', 'GROUP'];
                }
            },
            showAddMember: {
                type: Boolean,
                default: true
            },
            addRoleUrl: {
                type: String,
                default: '/fam/team/participants/add'
            },
            getPrincipalsUrl: {
                type: String,
                default: '/fam/team/getPrincipalsById'
            },
            className: String,
            isReplacement: Boolean,
            customSubmit: Function,
            currentRoleData: Object,
            pathToCurrentRole: {
                type: Array,
                default() {
                    return [];
                }
            },
            queryScope: {
                type: String,
                default: 'fullTenant'
            },
            appName: String
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    deleteMember: this.getI18nByKey('是否要移除该成员？'),
                    tips: this.getI18nByKey('提示'),
                    keys: this.getI18nByKey('请输入关键字'),
                    role: this.getI18nByKey('增加角色'),
                    member: this.getI18nByKey('增加成员'),
                    selectRole: this.getI18nByKey('选择角色'),
                    selectMember: this.getI18nByKey('选择成员'),
                    remove: this.getI18nByKey('移除'),
                    responsible: this.getI18nByKey('设为主责任人'),
                    cancelResponsible: this.getI18nByKey('取消主责任人'),
                    enter: this.getI18nByKey('请输入'),
                    edit: this.getI18nByKey('编辑'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    removeSuccess: this.getI18nByKey('移除成功'),
                    addSuccess: this.getI18nByKey('增加成功'),
                    cancel: this.getI18nByKey('取消'),
                    confirm: this.getI18nByKey('确定'),
                    detail: this.getI18nByKey('详情'),
                    confirmCancel: this.getI18nByKey('确认取消主责任人'),
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
                    selectData: this.getI18nByKey('请先选择数据'),
                    memberReplacement: this.getI18nByKey('memberReplacement'),
                    memberReplacementColumnTips: this.getI18nByKey('memberReplacementColumnTips'),
                    memberReplacementTips: this.getI18nByKey('memberReplacementTips')
                },
                // showParticipantType: ['USER', 'GROUP'], // 参与者显示类型 'USER', 'GROUP'
                form: {
                    oid: null,
                    defaultValue: {},
                    visible: true,
                    loading: false,
                    editable: false,
                    deleteName: '',
                    readonly: false
                },
                unfoldRole: true,
                unfoldMember: true,
                disMember: false,
                participantVal: '',
                selectMember: '',
                memberList: [], // 成员
                groupList: [], // 群组
                roleList: [], // 人员
                currentRole: [], // 当前角色
                currentRowMember: [],
                selectRole: '',
                roleId: '',
                roleRef: '',
                tableData: [],
                deletedData: [],
                oldParticipant: [], // 参与者
                oldParticipantIds: [], // 参与者id
                newParticipant: [], // 新增参与者人员
                formData: {},
                loading: false,
                participantSelectType: 'USER', // 人员、角色...复合选择器组件当前选择类型
                replacementMemberCache: {},
                disabled: true,
                containerRef: ''
            };
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
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            columns() {
                return [
                    {
                        prop: 'checkbox',
                        title: '',
                        minWidth: '50',
                        width: '50',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'principalName', // 参与者
                        width: '210',
                        title: this.i18nMappingObj?.['participants']
                    },
                    {
                        prop: 'principalTarget', // 参与者类型
                        title: this.i18nMappingObj?.['participantsType'],
                        width: '80'
                    },
                    {
                        prop: 'code', // 工号
                        title: this.i18nMappingObj?.['workNumber']
                    },
                    {
                        prop: 'userCode', // 登录号
                        title: this.i18nMappingObj?.['login']
                    },
                    this.isReplacement
                        ? null
                        : {
                              prop: 'mobile', // 手机
                              title: this.i18nMappingObj?.['phone']
                          },
                    this.isReplacement
                        ? null
                        : {
                              prop: 'email', // 邮箱
                              title: this.i18nMappingObj?.['email'],
                              minWidth: '200'
                          },
                    {
                        prop: 'department', // 部门
                        title: this.i18nMappingObj?.['department']
                    },
                    this.isReplacement
                        ? {
                              prop: 'replacement',
                              title: this.i18nMappingObj?.['memberReplacement'],
                              width: 340,
                              tips: this.i18nMappingObj?.memberReplacementColumnTips
                          }
                        : null,
                    {
                        prop: 'operation', // 操作
                        title: this.i18nMappingObj?.['operation'],
                        width: this.isReplacement ? 48 : 160,
                        sort: false,
                        fixed: 'right'
                    }
                ].filter((i) => !!i);
            },
            selectProps() {
                let roleCompName = 'custom-virtual-role-select';
                let roleComponentConf = this.fnComponentHandle(roleCompName, true, this.queryParams);
                return {
                    multiple: false,
                    clearable: true,
                    filterable: true,
                    disabledArray: this.firstRole,
                    collapseTags: this.collapseTags || false,
                    row: {
                        componentName: roleCompName,
                        requestConfig: roleComponentConf.componentConfigs || ''
                    },
                    placeholder: this.i18nMappingObj.pleaseSelect
                };
            },
            participantSelectValue() {
                let list = [];
                this.tableData.forEach((item) => {
                    if (item.principalTarget === this.participantSelectType) {
                        list.push(item.principal || item.roleBObjectRef);
                    }
                });
                this.tableData.forEach((row) => {
                    const replaceWith = row.replaceWith || {};
                    if (replaceWith.type === this.participantSelectType && _.isArray(replaceWith.value)) {
                        replaceWith.value.forEach((replaceRowId) => {
                            if (!list.some((item) => item.oid === replaceRowId)) {
                                if (this.participantSelectType === 'USER') {
                                    const userOrGroup = this.replacementMemberCache[replaceRowId];
                                    list.push(userOrGroup);
                                } else {
                                    list.push(replaceRowId);
                                }
                            }
                        });
                    }
                });

                const value = this.tableData
                    .map((item) => {
                        return {
                            ...item,
                            displayName: item?.principalName,
                            oid: item.roleBObjectRef || item.oid,
                            orgName: item.department
                        };
                    })
                    .filter((item) => list.includes(item.oid) || list.includes(item.roleBObjectRef));
                return {
                    type: this.participantSelectType,
                    value
                };
            },
            allTableDataValue() {
                const value = this.participantSelectValue.value.map((item) => item.oid);
                return {
                    type: this.participantSelectValue.type,
                    value
                };
            },
            selectedReplacementParticipant() {
                const values = Object.values(this.replacementMemberCache);
                return {
                    users: values,
                    userGroups: values.map((item) => (typeof item === 'object' ? item?.oid : item)).filter(Boolean)
                };
            },
            vxeTable() {
                return this.$refs.erdTable.$refs.xTable;
            },
            pathToCurrentRoleIds() {
                const pathToCurrentRoleIds = this.pathToCurrentRole?.map((role) => role.roleBObjectRef) || [];
                return [...this.currentRole, ...pathToCurrentRoleIds];
            },
            replacementDisabledIds() {
                const tableData = [...this.tableData, ...this.currentRowMember];
                return tableData.map((item) => {
                    return item.roleBObjectRef || item.oid;
                });
            },
            disableIds() {
                const value = this.participantSelectValue.value || [];
                return [
                    ...this.pathToCurrentRoleIds,
                    ...this.selectedReplacementParticipant.users
                        .map((item) => (typeof item === 'object' ? item?.oid : item))
                        .filter(Boolean),
                    ...this.selectedReplacementParticipant.userGroups
                        .map((item) => (typeof item === 'object' ? item?.oid : item))
                        .filter(Boolean)
                ].filter((i) => !value.includes(i));
            },
            queryParamsSelect() {
                return {
                    data: {
                        roleType: 'Erd-202200000003',
                        appName: this.appName,
                        ...this.queryParams?.data
                    }
                };
            }
        },
        watch: {
            selectRole(n) {
                this.roleId = n?.split(':')[2];
                // 选择成员时禁止选择当前角色
                this.currentRole = n?.split();
                if (!_.isEmpty(n)) {
                    this.getPrincipalsById();
                }
            }
        },
        mounted() {
            this.init();
            if (!_.isEmpty(this.roleRefer)) {
                this.selectRole = this.roleRefer;
                this.disMember = true;
            }
        },
        methods: {
            input(val) {
                this.participantSelectType = val.type;
                this.resetSubmitButtonDisabledState();
            },
            init() {
                this.tableData = [];
                if (this.isReplacement && this.currentRow.principalTarget !== 'ROLE') {
                    this.tableData = [FamKit.deepClone(this.currentRow)];
                    this.oldParticipant = [FamKit.deepClone(this.currentRow)];
                }
                if (this.isReplacement) {
                    this.participantSelectType = 'USER';
                }
            },
            // 获取团队角色成员-打开弹窗，获取节点初始具有的角色list
            getPrincipalsById() {
                let data = {
                    oid: this.teamOid,
                    teamRoleOid: this.currentRoleData?.oid || this.selectRole,
                    className: this.className
                    // teamRoleOid: this.selectRole
                    // roleId: this.roleId
                };
                this.$famHttp({
                    url: this.getPrincipalsUrl,
                    method: 'get',
                    data
                }).then((res) => {
                    let result = res?.data;
                    result?.children?.forEach((item) => {
                        item.principalName = item.roleName;
                        item.principalTarget = 'ROLE';
                        return item;
                    });
                    let data = result?.children?.concat(result?.rolePrincipalLinks || []) || [];
                    if (this.isReplacement) {
                        this.tableData = data.filter((i) => i.roleType !== 'ROLE');
                    } else if (!this.isReplacement || this.currentRow?.principalTarget === 'ROLE') {
                        this.tableData = data;
                    } else {
                        this.currentRowMember = data;
                    }
                    this.oldParticipantIds = [];
                    this.oldParticipant = FamKit.deepClone(data);
                    this.oldParticipant?.forEach((item) => {
                        // 选择成员时禁止选择当前角色和已选中角色
                        this.currentRole = [...this.currentRole, item.roleBObjectRef];
                        this.oldParticipantIds.push(item.principal || item.roleBObjectRef);
                    });
                });
            },
            // 选择角色
            changeRole(data) {
                // 选择成员时禁止选择当前角色
                this.currentRole = data?.split();
                this.$emit('change', data);
                this.disabled = false;
                this.$refs.groupParticipantSelect?.$refs.famParticipantSelect.clearInput();
                if (!data) {
                    this.resetSubmitButtonDisabledState();
                }
            },
            // 选择用户 - 人员组件勾选用户时
            changeMember(oid, data) {
                if (this.participantSelectType === 'USER') {
                    this.memberList = data;
                    this.groupList = [];
                } else if (['ROLE', 'GROUP'].includes(this.participantSelectType)) {
                    // 选择群组 -人员组件选择角色或群组时
                    this.memberList = [];
                    this.groupList = data;
                }
                // 人员选择器变更后，处理最新选择数据，加入表格中
                this.addMember();
                this.resetSubmitButtonDisabledState();
            },
            // 增加成员
            addMember() {
                // 新增参与者人员
                let newParticipant = [];
                if (this.memberList?.length > 0) {
                    _.each(this.memberList, (item) => {
                        let obj = {
                            oid: item.oid,
                            id: item.id,
                            email: item.email,
                            principal: item.oid,
                            principalName: item.displayName,
                            principalTarget: 'USER',
                            department: item.orgName,
                            primarily: false,
                            code: item.code,
                            userCode: item.name,
                            mobile: item.mobile,
                            __newRow__: true
                        };
                        newParticipant.push(obj);
                    });
                } else if (this.groupList?.length > 0) {
                    _.each(this.groupList, (item) => {
                        let obj = {
                            oid: item.roleBObjectRef || item.oid,
                            id: item.id,
                            principal: item.roleBObjectRef || item.oid,
                            principalName: item.name || item.displayName,
                            principalTarget: item.principalTarget || 'GROUP',
                            primarily: false,
                            __newRow__: true
                        };
                        newParticipant.push(obj);
                    });
                }
                const tableData = JSON.parse(JSON.stringify(this.tableData));
                // 重复成员名称 - 这里做两次循环，将组件数据多余的放入表格，将表格中多余的清除
                newParticipant.forEach((item) => {
                    const sameItem = tableData.find((el) => {
                        return (
                            (el?.principal || el?.roleBObjectRef) === item.principal &&
                            el.principalTarget === item.principalTarget
                        );
                    });
                    if (!sameItem) {
                        this.tableData.push(item);
                    }
                });
                let newTableData = [];
                if (newParticipant.length) {
                    this.tableData.forEach((item) => {
                        const sameItem = newParticipant.find((el) => {
                            return (
                                this.participantSelectType !== item.principalTarget ||
                                ((item?.principal || item?.roleBObjectRef) === el.principal &&
                                    el.principalTarget === item.principalTarget)
                            );
                        });
                        if (sameItem) {
                            newTableData.push(item);
                        }
                    });
                } else {
                    newTableData = this.tableData.filter((item) => item.principalTarget !== this.participantSelectType);
                }
                if (this.isReplacement) {
                    const replaceWith = newTableData.reduce((prev, item) => {
                        const replaceWith = item.replaceWith?.value || [];
                        return [...prev, ...replaceWith];
                    }, []);
                    newTableData = newTableData.filter((item) => {
                        return !replaceWith.includes(item.oid) && !replaceWith.includes(item.roleBObjectRef);
                    });
                }
                this.tableData = newTableData;
                /**
                 * 1、先得到添加的成员，和tableData做对比，去掉重复的，往tableData里push不存在的用户，
                 * 保证tableData是最新的最全的用户，提交的时候就可以只传tableData了
                 * 2、场景：角色已经可以查询出来用户了，赋值给tableData， 此后就不需要oldParticipant
                 */
            },
            // 增加成员提交
            fnOnSubmitForm() {
                if (!this.selectRole) {
                    return this.$message({
                        type: 'error',
                        message: '请先选择角色',
                        showClose: true
                    });
                }
                this.loading = true;
                let roleData = this.tableData.filter((item) => item.principalTarget === 'ROLE');
                if (this.isReplacement) {
                    roleData = [...roleData, ...this.oldParticipant.filter((item) => item.principalTarget === 'ROLE')];
                }
                let tableData = this.tableData.filter((item) => item.principalTarget !== 'ROLE');
                // 用户 / 群组
                const rolePrincipalLinks = tableData.map((item) => {
                    item.roleBObjectRef = item.principal || item.roleBObjectRef;
                    return item;
                });
                // 子角色
                const children = roleData.map((item) => {
                    return {
                        parentRef: this.type === 'addRole' ? '' : this.currentRoleData?.oid,
                        roleAObjectRef: this.teamOid,
                        roleBObjectRef: item.principal || item.roleBObjectRef,
                        roleName: item.principalName,
                        roleType: item.principalTarget
                    };
                });
                let className = store.getters.className('OrgContainer');
                if (!this.teamOid.includes('ContainerTeam')) {
                    className = this.className;
                }
                let data = {
                    parentRef: this.currentRoleData?.parentId === '-1' ? undefined : this.currentRoleData?.parentRef,
                    roleAObjectRef: this.teamOid || '',
                    roleBObjectRef: this.selectRole || '',
                    className: className,
                    rolePrincipalLinks,
                    children
                };
                if (typeof this.customSubmit === 'function') {
                    return this.customSubmit(this, data)
                        .then(() => {
                            this.getPrincipalsById();
                            this.toggleShow();
                            this.$emit('onsubmit');
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                }

                this.$famHttp({
                    url: this.addRoleUrl,
                    method: 'post',
                    data
                })
                    .then((res) => {
                        if (res?.success) {
                            _.each(this.tableData, (item) => {
                                if (item.primarily === true) {
                                    let formData = new FormData();
                                    formData.append('rolePrincipalMapId', item.id);
                                    formData.append('teamOid', this.teamOid);
                                    formData.append('isPrimarily', item.primarily);
                                    if (this.className) {
                                        formData.append('className', this.className);
                                    }

                                    this.$famHttp({
                                        url: '/fam/team/setPrimarily',
                                        className: this.className,
                                        data: formData,
                                        method: 'post'
                                    }).then(() => {});
                                }
                            });
                            this.$message.success(this.i18nMappingObj['operationSuccess']);
                            this.getPrincipalsById();
                            this.toggleShow();
                            this.$emit('onsubmit');
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 移除成员
            fnRemoveRole(data) {
                let index = data.rowIndex;
                // 是否要移除该成员？
                this.$confirm(this.i18nMappingObj.deleteMember, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        this.$message.success(this.i18nMappingObj['operationSuccess']);
                        this.tableData.splice(index, 1);
                        if (!data.row.__newRow__) {
                            this.deletedData = [...this.deletedData, data.row];
                        }
                        this.resetSubmitButtonDisabledState();
                    })
                    .catch(() => {})
                    .finally(() => {});
            },
            toggleShow() {
                const visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            // 设置责任人
            onSetResp(data) {
                data.row.primarily = true;
                _.each(data.items, (item) => {
                    if (item.id !== data.row.id) {
                        item.primarily = false;
                    }
                });
                // let {primarily, id} = data.row;
                // let formData = new FormData()
                // formData.append('rolePrincipalMapId', id)
                // formData.append('teamOid', this.teamOid)
                // formData.append('isPrimarily', !primarily)

                // this.$famHttp({
                //     url: "/fam/team/setPrimarily",
                //     data: formData,
                //     method: 'post'
                // }).then(res => {
                //     this.getPrincipalsById() // 查询角色列表
                // })
            },
            onCancelResp(data) {
                let { primarily, id } = data.row;
                let formData = new FormData();
                formData.append('rolePrincipalMapId', id);
                formData.append('teamOid', this.teamOid);
                formData.append('isPrimarily', !primarily);

                this.$confirm(this.i18nMappingObj['continue'], this.i18nMappingObj['confirmCancel'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    data.row.primarily = !data.row.primarily;
                    // this.$famHttp({
                    //     url: "/fam/team/setPrimarily",
                    //     data: formData,
                    //     method: 'post'
                    // }).then(res => {
                    //     this.getPrincipalsById() // 查询角色列表
                    // })
                });
            },

            // 移除
            onRemove() {
                if (!this.selectData || this.selectData.length === 0) {
                    this.$message({
                        message: this.i18nMappingObj.selectData,
                        type: 'warning'
                    });
                    return;
                }
                this.removePrincipals(this.selectData);
            },
            removePrincipals(rows) {
                const rowArray = Array.isArray(rows) ? rows : [rows].filter(Boolean);

                this.$confirm(this.i18nMappingObj.deleteMember, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        const data = JSON.parse(JSON.stringify(this.tableData));
                        const filterData = data.filter((item) => {
                            return (
                                rowArray.findIndex((el) => {
                                    return el.id === item.id;
                                }) === -1
                            );
                        });
                        this.deletedData = [...this.deletedData, ...rowArray];
                        this.tableData = filterData;
                        this.$message.success(this.i18nMappingObj['operationSuccess']);
                        this.$set(this, 'selectData', []);
                        this.resetSubmitButtonDisabledState();
                    })
                    .catch(() => {})
                    .finally(() => {
                        // this.$loading().close()
                    });
            },
            // 添加成员
            userSearchSubmit: function () {
                const type = this.participantVal?.type || '';
                let selectUser = this.participantVal?.value || [];
                // 部门
                if (type === 'ORG') {
                    const oid = this.participantVal?.value?.oid || '';
                    selectUser = oid ? [oid] : [];
                }

                if (!selectUser.length) {
                    return this.$message({
                        message: this.i18nMappingObj.errorSelect,
                        type: 'error'
                    });
                }
                const relationList = selectUser.map((item) => {
                    return {
                        action: 'CREATE',
                        attrRawList: [
                            {
                                attrName: 'roleBObjectRef',
                                value: item
                            }
                        ],
                        className: 'erd.cloud.foundation.core.menu.entity.ResourceLink'
                    };
                });
                // 防抖
                utils.debounceFn(() => {
                    this.updateService({
                        className: 'erd.cloud.foundation.core.menu.entity.Resource',
                        oid: this.oid,
                        attrRawList: [],
                        associationField: 'roleAObjectRef',
                        relationList
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.successAdd
                        });
                        // this.$confirm(this.i18nMappingObj.successAdd, this.i18nMappingObj.wxts, {
                        //     confirmButtonText: this.i18nMappingObj.submit,
                        //     showCancelButton : false,
                        //     type: 'success',
                        //     closeOnClickModal : false
                        // }).then(res=>{
                        // }).catch(error=>{
                        // })
                        // 刷新表格
                        this.getTableList();
                    }, this.i18nMappingObj.failedAdd);
                }, 200);
            },
            /**
             * checkbox
             * 复选框
             * @checkbox-all="selectAllEvent"
             @checkbox-change="selectChangeEvent"
             * **/
            selectChangeEvent() {
                const records = this.$refs['erdTable'].$table.getCheckboxRecords();
                this.selectData = records || [];
            },
            // 取消
            onCancel() {
                this.innerVisible = false;
            },
            beforeEditMethod({ row }) {
                return row.principalTarget !== 'ROLE' && !row.__newRow__;
            },
            handleReplacementChange(ids, rawData) {
                this.replacementMemberCache = Object.assign(
                    {},
                    this.replacementMemberCache,
                    rawData?.reduce((prev, item) => {
                        prev[item.oid] = item;
                        return prev;
                    }, {})
                );
            },
            handleReplacementInput(row) {
                row.__updated__ = true;
                this.resetSubmitButtonDisabledState();
            },
            assembleChanges() {
                const createList = this.tableData.filter((row) => row.__newRow__);
                const updateList = this.tableData.filter((row) => row.__updated__);
                const deleteList = this.oldParticipant?.filter((row) => {
                    const tableData = [...this.tableData, ...this.currentRowMember];
                    return tableData.every((item) => item.oid !== row.oid);
                });
                return {
                    createList,
                    updateList,
                    deleteList
                };
            },
            resetSubmitButtonDisabledState() {
                this.$nextTick(() => {
                    const { createList, updateList, deleteList } = this.assembleChanges();
                    const replaceWith = updateList.reduce((prev, item) => {
                        const replaceWith = item.replaceWith?.value || [];
                        return [...prev, ...replaceWith];
                    }, []);
                    this.disabled =
                        (!createList.length && !replaceWith.length && !deleteList.length) ||
                        (this.disMember && !this.selectRole);
                });
            }
        }
    };
});
