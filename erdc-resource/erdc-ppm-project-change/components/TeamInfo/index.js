define([
    'erdcloud.kit',
    'text!' + ELMP.func('erdc-ppm-project-change/components/TeamInfo/index.html'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js')
], function (ErdcKit, template, utils) {
    const FamKit = require('fam:kit');
    const TreeUtil = FamKit.TreeUtil;
    return {
        template,
        props: {
            businessData: {
                type: Array,
                default: () => []
            },
            readonly: Boolean,
            processInfos: {
                type: Object,
                default: () => {}
            }
        },
        components: {
            AddRole: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-project-change/components/TeamInfo/components/AddRole/index.js')
            ),
            OpenCreateTeam: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/OpenCreateTeam/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            TeamTable: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-project-change/components/TeamInfo/components/TeamTable/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-project-change/locale/index.js'),
                tableData: [],
                addRoleVisible: false,
                panelUnfolds: true,
                selectData: [],
                teamDialogVisible: false,
                teamOid: '',
                roleRef: '',
                currentRow: {},
                currentRole: {},
                showParticipantType: ['USER', 'GROUP', 'ROLE']
            };
        },
        computed: {
            args() {
                return [this];
            },
            basicActionConfig() {
                return {
                    name: 'PPM_PROJECT_TEAM_CHANGE_OP_MENU'
                };
            },
            dialogTitle() {
                return this.i18n.addMember;
            },
            addRoleConfig() {
                let { oid } = this.businessData[0] || {};
                return {
                    'biz-oid': oid,
                    'product-oid': oid,
                    'container-team-ref': this.containerTeamRef,
                    'query-params': this.queryParams
                };
            },
            containerTeamRef() {
                return (
                    this.businessData[0]?.teamTableConfig?.containerTeamRef || this.businessData[0]?.containerTeamRef
                );
            },
            appName() {
                return this.businessData[0]?.teamTableConfig?.appName || this.businessData[0]?.appName;
            },
            queryParams() {
                return {
                    data: {
                        appName: this.appName,
                        isGetVirtualRole: false
                    }
                };
            },
            pathToCurrentRole() {
                return this.currentRole
                    ? TreeUtil.findPath(this.tableData, {
                          target: this.currentRole
                      }).concat(this.currentRole)
                    : [];
            }
        },
        mounted() {
            this.tableData = this.businessData[0]?.teamTableData || [];
        },
        methods: {
            changeInfo() {
                let changeOid = this.businessData[0].roleBObjectRef;
                const changeContentValue = this.businessData[0].changeObject.attrRawList.find(
                    (item) => item.attrName === 'changeContent'
                )?.value;
                const changeContent = changeContentValue?.split(',').find((item) => ['TEAM'].includes(item));

                let props = {
                    showDialog: true,
                    changeOid,
                    compareType: 'teamChange',
                    changeContent
                };
                let { destroy } = utils.useFreeComponent({
                    template: `
                            <change-info
                                v-bind="params"
                                @cancel="cancel">
                            </change-info>
                            `,
                    components: {
                        ChangeInfo: ErdcKit.asyncComponent(
                            ELMP.func('erdc-ppm-project-change/components/ChangeInfo/index.js')
                        )
                    },
                    data() {
                        return {
                            params: {}
                        };
                    },
                    created() {
                        this.params = props;
                    },
                    methods: {
                        cancel() {
                            destroy();
                        }
                    }
                });
            },
            validate() {
                return new Promise((resolve) => {
                    const formatData = (treeData) => {
                        treeData.forEach((item) => {
                            if (item.isCreate && item.principalTarget === 'ROLE') {
                                delete item.oid;
                                delete item.id;
                                delete item.parentId;
                            }
                            if (item?.children) {
                                item.children = item.children.map((item) => {
                                    // 如果是新增的数据就删除oid、parentId、id， 这几个字段都是前端生成，后端底层不适配
                                    if (item.isCreate && item.principalTarget === 'ROLE') {
                                        delete item.oid;
                                        delete item.id;
                                        delete item.parentId;
                                    }
                                    return item;
                                });
                                // 把children的用户、群组数据放在changeRolePrincipalLinks、角色放在changeChildren
                                item.changeChildren = item.children.filter((item) => item.principalTarget === 'ROLE');
                                item.changeRolePrincipalLinks = item.children.filter(
                                    (item) => item.principalTarget !== 'ROLE'
                                );
                            }
                            if (item?.children?.length) {
                                formatData(item?.children);
                            }
                        });
                    };
                    let treeData = ErdcKit.deepClone(this.tableData);
                    treeData = treeData.filter((item) => item.parentId === '-1');
                    formatData(treeData);
                    resolve({
                        teamChange: { teamRoleLinkDtos: treeData },
                        teamTableData: this.tableData,
                        teamTableConfig: {
                            containerTeamRef: this.containerTeamRef,
                            appName: this.appName
                        }
                    });
                });
            },
            selectChangeEvent({ recodes }) {
                this.selectData = recodes;
            },
            actionClick({ name }) {
                const eventMap = {
                    PPM_PROJECT_TEAM_CHANGE_ADD: this.addRoleInfo,
                    PPM_PROJECT_TEAM_CHANGE_REMOVE: this.remove,
                    PPM_PROJECT_TEAM_ROLE_CHANGE_ADD: this.createRole
                };
                eventMap[name] && eventMap[name]();
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
            createRole() {
                this.currentRole = null;
                this.currentRow = null;
                this.roleRef = '';
                this.teamDialogVisible = true;
            },
            addRoleInfo() {
                this.addRoleVisible = true;
            },
            remove() {
                let selectData = this.$refs.teamTable.$refs.famErdTable.$refs.xTable
                    .getCheckboxRecords()
                    .map((item) => {
                        return item.oid;
                    });
                if (!selectData.length) {
                    this.$message({
                        type: 'info',
                        message: this.i18n['checkDataTips']
                    });
                    return;
                }
                this.$confirm(this.i18n.removeOrNot, this.i18n.removeConfirm, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    type: 'warning'
                }).then(() => {
                    this.tableData = this.removeData(this.tableData, selectData);
                    this.$message({
                        type: 'success',
                        message: this.i18n['removedSuccessfully']
                    });
                });
            },
            removeData(tableData, oids) {
                for (let i = 0; i < tableData.length; i++) {
                    tableData = tableData.filter((item) => !oids.includes(item.oid));
                    let item = tableData[i];
                    if (item?.children && item?.children.length) this.removeData(item.children, oids);
                }
                return tableData;
            },
            // 添加成员
            addRoleConfirm(data) {
                let hasRoleData = data.filter(
                    (item) =>
                        item.parentId === '-1' &&
                        this.tableData.find(
                            (res) => item.roleBObjectRef === res.roleBObjectRef && res.parentId === '-1'
                        )
                );
                if (hasRoleData.length) {
                    let principalName = hasRoleData
                        .map((item) => {
                            return item.roleName;
                        })
                        .join('、');
                    return this.$message.error(this.$t('addErrorTips', { principalName }));
                }
                this.tableData = [...data, ...this.tableData];
                this.$refs.teamTable.expandTree();
            },
            getOids(data, oids = []) {
                data.forEach((item) => {
                    oids.push(item.oid);
                    if (item.children?.length) {
                        this.getOids(item.children, oids);
                    }
                });
            },
            // 删除
            deleteItem(row) {
                if (row.isCreate) {
                    let oids = [];
                    this.getOids([row], oids);
                    this.tableData = this.removeData(this.tableData, oids);
                } else {
                    let result = this.getAllData([row]);
                    result.forEach((item) => {
                        this.$set(item, 'action', 'DELETE');
                    });
                }
            },
            // 取消删除
            cancelDelete(row) {
                this.$set(row, 'action', '');
            },
            handleCommand(key, row) {
                const eventMap = {
                    deleteItem: this.deleteItem,
                    addMember: this.addMember,
                    cancelDelete: this.cancelDelete,
                    cancelResponsible: this.cancelResponsible,
                    setResponsible: this.setResponsible
                };
                eventMap[key] && eventMap[key](row);
            },
            customSubmit(vm, data) {
                if (_.keys(this.currentRow).length) {
                    const next = (data) => {
                        this.tableData = data;
                    };
                    return this.updateTableData(data, this.tableData, this.currentRow, next);
                } else {
                    return this.handleCreateRole(vm, data);
                }
            },
            // 设置主责任人
            setResponsible(row) {
                this.tableData
                    .find((item) => item.id === row.parentId)
                    .children.forEach((item) => {
                        this.$set(item, 'primarily', item.oid === row.oid);
                    });
            },
            // 取消主责人
            cancelResponsible(row) {
                this.$set(row, 'primarily', false);
            },
            handleCreateRole(vm, data) {
                return new Promise((resolve, reject) => {
                    // 当前选择的角色
                    let currentSelectRole = this.$refs.createTeam.$refs.famParticipantSelect.selectData;
                    let { teamTable: teamTableRef } = this.$refs;
                    let { rolePrincipalLinks, children } = data;
                    // 角色表格数据
                    let tableData = teamTableRef.teamTableData;
                    let hasRoleData = tableData.filter(
                        (item) => item.roleBObjectRef === data.roleBObjectRef && item.parentId === '-1'
                    );
                    if (
                        hasRoleData.length ||
                        children.filter((item) => item.roleBObjectRef === data.roleBObjectRef).length
                    ) {
                        let principalName =
                            hasRoleData
                                .map((item) => {
                                    return item.roleName;
                                })
                                .join('、') || currentSelectRole?.[0]?.name;
                        this.$message.error(this.$t('addRepeatTips', { principalName }));
                        return reject();
                    }
                    let result = {
                        className: data.className,
                        parentId: '-1',
                        roleAObjectRef: data.roleAObjectRef,
                        roleBObjectRef: data.roleBObjectRef,
                        children: [],
                        oid: data.roleBObjectRef + '-' + new Date().getTime(),
                        id: data.roleBObjectRef + '-' + new Date().getTime(),
                        principalName: currentSelectRole[0]?.name,
                        principalTarget: 'ROLE',
                        // 用于标识是否新增
                        isCreate: true
                    };
                    result.children = [...rolePrincipalLinks, ...children];
                    result.children = result.children.map((item) => {
                        item.parentId = result.id;
                        // 用于标识是否新增
                        item.isCreate = true;
                        if (item.id === '-1') item.id = item.oid;
                        if (item.roleType === 'ROLE') {
                            item.oid = item.oid || item.roleBObjectRef + '-' + new Date().getTime();
                            item.id = item.id || item.roleBObjectRef + '-' + new Date().getTime();
                            item.principalName = item.roleName;
                            item.principalTarget = item.roleType;
                        }
                        return item;
                    });
                    this.tableData = this.tableData.filter(
                        (item) => !(item.roleBObjectRef === result.roleBObjectRef && item.parentId === '-1')
                    );
                    this.tableData = [result, ...this.tableData, ...result.children];
                    setTimeout(() => {
                        this.$refs?.teamTable?.$refs?.famErdTable?.$table?.setAllTreeExpand(true);
                    }, 100);
                    resolve();
                });
            },
            /**
             * @param {Array} data 增加的角色数据
             * @param {Array} tableData  表格数据
             * @param {Object} currentRow  当前行数据
             * */
            updateTableData(data, tableData, currentRow, next) {
                return new Promise((resolve, reject) => {
                    let { rolePrincipalLinks, children } = data;
                    let { id, oid, principalName } = currentRow;
                    let childrenData = [];
                    let parentData = [...this.getParentData(this.tableData, [currentRow]), ...[currentRow]];
                    let currentChildren = this.tableData.filter((item) => item.parentId === id);
                    // 当前结构树下不能添加相同角色
                    if (
                        children.filter(
                            (child) => parentData.filter((item) => item.roleBObjectRef === child.roleBObjectRef).length
                        ).length
                    ) {
                        this.$message({
                            type: 'error',
                            message: this.$t('addErrorTips', { principalName })
                        });
                        return reject();
                    }
                    // 过滤当前角色下已存在的成员
                    let member = rolePrincipalLinks
                        .filter(
                            (item) =>
                                item.principalTarget === 'USER' &&
                                !currentChildren.filter((res) => res.oid === item.oid).length
                        )
                        .map((item) => {
                            item.parentId = id;
                            // 用于标识是否新增
                            item.isCreate = true;
                            if (item.id === '-1') item.id = item.oid;
                            return item;
                        });
                    // 获取已移除的成员
                    let removeMember = currentChildren.filter(
                        (res) =>
                            res.principalTarget === 'USER' &&
                            !rolePrincipalLinks.filter((item) => res.oid === item.oid).length
                    );

                    // 过滤当前角色下已存在的子角色
                    let roles = children
                        .filter(
                            (item) =>
                                !currentChildren.filter((res) => res.roleBObjectRef === item.roleBObjectRef).length
                        )
                        .map((item) => {
                            item.oid = item.oid || item.roleBObjectRef + '-' + new Date().getTime();
                            item.parentId = id;
                            item.id = item.id || item.roleBObjectRef + '-' + new Date().getTime();
                            item.principalName = item.roleName;
                            item.principalTarget = item.roleType;
                            // 用于标识是否新增
                            item.isCreate = true;
                            return item;
                        });
                    // 获取已移除的角色
                    let removeRoles = currentChildren.filter(
                        (res) =>
                            res.principalTarget === 'ROLE' &&
                            !children.filter((item) => item.roleBObjectRef === res.roleBObjectRef).length
                    );

                    // 过滤当前角色下已存在的群组
                    let group = rolePrincipalLinks
                        .filter(
                            (item) =>
                                item.principalTarget === 'GROUP' &&
                                !currentChildren.filter((res) => res.oid === item.oid).length
                        )
                        .map((item) => {
                            item.parentId = id;
                            // 用于标识是否新增
                            item.isCreate = true;
                            // 如果id为-1会导致栈溢出
                            if (item.id === '-1') item.id = item.oid;
                            return item;
                        });
                    // 获取已移除的群组
                    let removeGroup = currentChildren.filter(
                        (res) =>
                            res.principalTarget === 'GROUP' &&
                            !rolePrincipalLinks.filter((item) => res.oid === item.oid).length
                    );

                    tableData = tableData.map((item) => {
                        if (item.oid === oid) {
                            // 移除已删除数据
                            item.children = this.formatData(currentChildren || [], [
                                ...removeRoles,
                                ...removeMember,
                                ...removeGroup
                            ]);
                            item.children = [...item.children, ...member, ...roles, ...group];
                            childrenData = item.children;
                        }
                        return item;
                    });
                    // 把父子数据都查出来，再移除已删除的角色
                    let result = this.getAllData(removeRoles);
                    tableData = this.formatData(tableData, [...result, ...removeMember, ...removeGroup]);
                    tableData = [...tableData, ...member, ...roles, ...group];
                    // 搜索之后表格数据不会带出children，所以再加一层判断，如果tableData中没有children数据就重新push
                    let oldChildrenData = childrenData.filter(
                        (item) => !tableData.filter((res) => res.oid === item.oid).length
                    );
                    tableData = [...tableData, ...oldChildrenData];
                    next && next(tableData);
                    this.$refs?.teamTable?.$refs?.famErdTable?.$table?.setTreeExpand(currentRow, true);
                    resolve();
                });
            },
            getParentData(tableData, selectData, result = []) {
                for (let i = 0; i < tableData.length; i++) {
                    let item = tableData[i];
                    if (
                        selectData.filter((res) => res.parentId === item.id).length &&
                        !result.filter((res) => res.id === item.id).length
                    ) {
                        result.push(item);
                        return this.getParentData(tableData, [item], result);
                    }
                }
                return result;
            },
            formatData(data, deleteData) {
                return data.filter(
                    (res) =>
                        !deleteData.filter((role) => res.roleBObjectRef === role.roleBObjectRef && role.oid === res.oid)
                            .length
                );
            },
            getAllData(data, result = []) {
                result = [...data, ...result];
                for (let i = 0; i < data.length; i++) {
                    let children = data[i]?.children || [];
                    if (children?.length) return this.getAllData(children, result);
                }
                return result;
            },
            addMember(row) {
                this.roleRef = row.roleBObjectRef;
                this.currentRow = row;
                this.currentRole = row;
                this.teamDialogVisible = true;
                // setTimeout(() => {
                //     // 组件会根据当前角色去调接口回显数据，由于当前增加是前端增加，没有调用接口，所以要加延迟手动把回显数据覆盖
                //     this.$refs.createTeam && (this.$refs.createTeam.tableData = currentChildren);
                //     // 如果当前角色调接口是有值的，然后覆盖表格数据为空时，选人不会清空数据，所以掉底层选人组件把值重新赋值
                //     if (this.$refs?.createTeam?.$refs?.groupParticipantSelect)
                //         this.$refs.createTeam.$refs.groupParticipantSelect.$refs.famParticipantSelect.selectData =
                //             currentChildren.filter((item) => item.principalTarget === 'ROLE');
                // }, 300);
            }
        }
    };
});
