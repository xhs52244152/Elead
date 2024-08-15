define([
    'text!' +
        ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/AuthorityMain/index.html'),
    'css!' + ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/AuthorityMain/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            ResizableContainer: FamKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            LeftBoxTabs: FamKit.asyncComponent(
                ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/LeftBoxTabs/index.js')
            ),
            RightSettingPanel: FamKit.asyncComponent(
                ELMP.resource(
                    'erdc-product-components/PermissionManagement/FunctionalAuthority/RightSettingPanel/index.js'
                )
            )
        },
        props: {
            containerOid: {
                type: String,
                defualt: ''
            },
            typeOid: {
                type: String,
                defualt: ''
            },
            typeName: {
                type: String,
                defualt: ''
            },
            maxHeight: {
                type: [String, Number],
                default: ''
            }
        },
        data() {
            return {
                selectedRoleData: {},
                selectedOptionsNode: {},
                activeTab: 'role',
                optionSettingData: [], // 操作数对应的右侧设置面板数据
                roleTreeData: [],
                roleOriginData: [],
                optionsTreeData: [],
                optionsOriginData: [],
                checkedOptions: [],
                checkedRoles: [],
                resizableContainerStyle: {
                    width: '200px',
                    minWidth: 200,
                    maxWidth: '50%'
                },
                unMouse: false,
                isChange: false, // 判断数据是否发生变化
                checkList: []
            };
        },
        watch: {
            typeOid: {
                immediate: true,
                handler(val) {
                    if (val) {
                        this.getMenuTreeData();
                    }
                }
            },
            checkList: {
                deep: true,
                handler(nv) {
                    if(nv) this.isChange = true;
                }
            }
        },
        created() {},
        computed: {
            menuTreeData() {
                const menuTreeData = this.activeTab === 'role' ? this.roleTreeData : this.optionsTreeData;
                return menuTreeData;
            },
            roleSettingData() {
                // 角色树对应的右侧设置面板数据
                return this.optionsOriginData;
            }
        },
        mounted() {},
        methods: {
            handleMouseDown(event) {
                const childEl = this.$refs.rightSettingPanel.$el;
                if (!childEl.contains(event.target) && this.isChange) {
                    this.unMouse = true;
                    this.isChange = false;
                }
            },
            hideDialog(data) {
                this.unMouse = false;
                this.checkList = data;
            },
            getMenuTreeData() {
                this.getRoleTree();
                this.getOptionTree();
            },
            getRoleTree() {
                const requestConfig = {
                    url: '/fam/team/getTeamByHolderRef',
                    method: 'get',
                    data: {
                        holderRef: this.containerOid,
                        isGetVirtualRole: true
                    }
                };
                const callBack = (res) => {
                    res.data && res.data.teamRoleLinkDtos && this.formatTreeMenu(res.data.teamRoleLinkDtos);
                };
                this.handlerGetTreeData(requestConfig, callBack);
            },
            getOptionTree() {
                const requestConfig = {
                    url: '/fam/menu/module/tree',
                    method: 'get',
                    data: {
                        typeName: this.typeName
                        // typeName: this.$store.getters.className('productDemo')
                    }
                };
                const callBack = (res) => {
                    res.data && this.formatOptionsMenu(res.data);
                };
                this.handlerGetTreeData(requestConfig, callBack);
            },
            handlerGetTreeData(requestConfig, callBack) {
                this.$famHttp(requestConfig).then((res) => {
                    callBack(res);
                });
            },
            formatTreeMenu(data) {
                const treeData = data.map((item) => {
                    const tree = {
                        key: item.oid || item.roleBObjectRef,
                        displayName: item.roleName,
                        roleRef: item.roleBObjectRef,
                        childList: [],
                        leaf: true
                    };
                    return tree;
                });
                this.roleTreeData = treeData;
                this.roleOriginData = JSON.parse(JSON.stringify(data));
                this.selectedRoleData = (treeData && treeData[0]) || {};

                this.$nextTick(() => {
                    this.handleNodeClick(this.selectedRoleData);
                });
            },
            formatOptionsMenu(data) {
                // 需要对数据的ID进行重新赋值，因为ID可能会重复，设置勾选就会有问题
                const formatId = (arr, parentId, parentNumber) => {
                    const item = arr.map((el) => {
                        el.id = parentId ? `${parentId}--${el.oid}` : el.oid;
                        el.parentNumber = parentNumber ? `${parentNumber}--${el.number}` : el.number;
                        el.childList && (el.childList = formatId(el.childList, el.id, el.parentNumber));
                        !el.key && (el.key = el.level);
                        return el;
                    });
                    return item;
                };
                const newData = formatId(data);
                this.$set(this, 'optionsTreeData', newData);
                this.$set(this, 'optionsOriginData', newData);
            },
            handlerTabChange(activeTab) {
                this.activeTab = activeTab;
                // 切换tab页签，需要 将树切换，选择的先清空，然后根据tab 页签进行赋值，选中的节点需要重新赋值，然后重新查询勾选的权限
                if (this.activeTab === 'role') {
                    this.roleTreeData = JSON.parse(JSON.stringify(this.roleOriginData));
                    this.formatTreeMenu(this.roleTreeData);
                } else {
                    this.optionsOriginData.checkedOptions = [];
                    this.optionsTreeData = JSON.parse(JSON.stringify(this.optionsOriginData));
                    // this.selectedOptionsNode = this.optionsTreeData[0] || {};
                    // 默认选中有数据的
                    this.selectedOptionsNode = this.optionsTreeData?.[0]?.childList?.[0] || {};
                    this.$nextTick(() => {
                        this.handleNodeClick(this.selectedOptionsNode);
                    });
                }
                // this.getMenuTreeData();
            },
            handleNodeClick(nodeData) {
                if (this.activeTab === 'role') {
                    this.selectedRoleData = nodeData;
                    const callBack = (res) => {
                        if (res && res.data) {
                            this.checkedOptions = res.data;
                        }
                    };
                    this.refreshRightPanelByRole(callBack, {
                        roleOid: nodeData.roleRef
                    });
                } else {
                    this.selectedOptionsNode = nodeData;
                    this.refreshRightPanelByOpt();
                }
            },
            refreshRightPanelByRole(callBack, data) {
                const requestConfig = {
                    url: `/fam/component/access/${this.containerOid}/${this.typeOid}`,
                    method: 'get',
                    data
                };
                this.handlerGetTreeData(requestConfig, callBack);
            },
            refreshRightPanelByOpt() {
                if (this.selectedOptionsNode.level > 1) {
                    const callBack = (res) => {
                        if (res && res.data) {
                            this.checkedRoles = res.data;
                        }
                    };
                    this.refreshRightPanelByRole(callBack, {
                        menuName: this.selectedOptionsNode.identifierNo
                    });
                }
            },
            getSubmitData(settingData) {
                const menuNames = [];
                const isRoleTab = this.activeTab === 'role';
                const equalKey = isRoleTab ? 'oid' : 'roleCode';
                const pushKey = isRoleTab ? 'identifierNo' : 'roleBObjectRef';
                const checkedKey = isRoleTab ? 'checkedOptions' : 'checkedRoles';

                settingData.forEach((item) => {
                    const childList = item.childList || [];
                    const checkItem = item[checkedKey] || [];
                    childList.forEach((el) => {
                        if (checkItem.includes(el[equalKey])) {
                            menuNames.push(el[pushKey]);
                        }
                    });
                });
                return menuNames;
            },
            handlerSavePage(settingData) {
                const submitData = this.getSubmitData(settingData);
                this.fnSaveSetting(submitData);
            },
            fnSaveSetting(submitData) {
                const isRoleTab = this.activeTab === 'role';
                let suffix = isRoleTab ? 'saveByRole' : 'saveByMenu';
                let finalParams = isRoleTab ? this.selectedRoleData.roleRef : this.selectedOptionsNode.identifierNo;
                this.$famHttp({
                    url: `/fam/component/access/${suffix}/${this.containerOid}/${this.typeOid}/${finalParams}`,
                    method: 'post',
                    data: submitData
                })
                    .then((res) => {
                        this.$message({
                            type: 'success',
                            message: '保存成功'
                        });
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: '保存失败'
                        // });
                    });
            },
            handlerResetRoleTab() {
                this.handleNodeClick(this.selectedRoleData);
            },
            handlerResetOptionsTab() {
                this.handleNodeClick(this.selectedOptionsNode);
            }
        }
    };
});
