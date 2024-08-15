define([
    'text!' +
        ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/RightSettingPanel/index.html'),
    'css!' +
        ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/RightSettingPanel/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            CheckLineItem: FamKit.asyncComponent(
                ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/CheckLineItem/index.js')
            )
        },
        props: {
            selectNodeKey: {
                type: [String, Number],
                default: ''
            },
            roleSettingData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            optionSettingData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            checkedOptions: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            checkedRoles: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            panelTitle: {
                type: String,
                default: ''
            },
            activeTab: {
                type: String,
                default: 'role'
            },
            maxHeight: {
                type: [String, Number],
                default: ''
            },
            typeName: {
                type: String,
                default: ''
            },
            unMouse: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                isIndeterminate: false,
                searchValue: '',
                optionSettingList: [],
                roleCheckboxData: [],
                showDialog: false
            };
        },
        watch: {
            activeTab() {
                this.isCheckAll = false;
            },
            optionSettingData: {
                immediate: true,
                deep: true,
                handler(val) {
                    this.optionSettingList = val || [];
                }
            },
            roleSettingData: {
                immediate: true,
                deep: true,
                handler(val) {
                    this.roleCheckboxData = {
                        childList: val || [],
                        checkedRoles: this.roleCheckboxData?.checkedRoles || []
                    };
                }
            },
            checkedRoles: {
                immediate: true,
                deep: true,
                handler(val) {
                    let checkedList = [];
                    if (val && this.roleCheckboxData?.childList) {
                        checkedList = this.roleCheckboxData.childList
                            .filter((item) => {
                                return val.indexOf(item.roleBObjectRef) !== -1;
                            })
                            .map((el) => {
                                return el.roleCode;
                            });
                    }
                    this.$set(this.roleCheckboxData, 'checkedRoles', checkedList);
                }
            },
            checkedOptions: {
                immediate: true,
                deep: true,
                handler(val) {
                    this.setCheckedOption(val);
                }
            },
            unMouse: {
                immediate: true,
                handler(val) {
                    if (val) {
                        this.showDialog = val;
                        this.cancel();
                    }
                }
            }
        },
        created() {},
        computed: {
            scrollBarHeight() {
                return `${this.maxHeight - 112}px`;
            },
            panelTitleTips() {
                return this.activeTab === 'role' ? '设置角色对应的功能操作权限' : '设置功能操作权限对应的角色';
            },
            isCheckAll: {
                get() {
                    let isCheckAll = false;
                    if (this.activeTab === 'role') {
                        const allCheckValid = this.optionSettingList
                            ?.filter((item) => {
                                return !item.hidden;
                            })
                            .map((item) => {
                                return item.childList?.length === item.checkedOptions?.length;
                            });
                        isCheckAll = !allCheckValid.includes(false);
                    } else {
                        const { childList = [], checkedRoles = [] } = this.roleCheckboxData;
                        const filterList = childList.filter((item) => {
                            return !item.hidden;
                        });
                        const checkedList = filterList.filter((item) => {
                            return checkedRoles.includes(item.roleCode);
                        });
                        isCheckAll = filterList.length > 0 && filterList.length === checkedList.length;
                    }
                    return isCheckAll;
                },
                set() {}
            },
            disabled() {
                let disabled = false;
                if (this.activeTab === 'operation') {
                    disabled =
                        !this.roleCheckboxData.childList ||
                        this.roleCheckboxData.childList.length === 0 ||
                        !this.roleCheckboxData.checkedRoles ||
                        this.roleCheckboxData.checkedRoles.length === 0;
                }
                return disabled;
            }
        },
        mounted() {},
        methods: {
            // 取消提示框
            cancel() {
                this.$confirm('检测到未保存的内容，是否在离开页面前保存修改？', '提示', {
                    customClass: 'custom-confirm-cancel',
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(() => {
                    this.handlerSave();
                }).catch(() => {
                    this.hideDialog();
                });
            },
            hideDialog() {
                this.showDialog = false;
                this.$emit('hide-dialog'); // 重置提示框提示
            },
            handlerChangeCheckAll(flag) {
                const isRoleTab = this.activeTab === 'role';
                if (isRoleTab) {
                    this.optionSettingList.map((item) => {
                        const childList = item.childList || [];
                        const checkedOptions = item.checkedOptions;
                        let checkedList = [];
                        if (flag) {
                            checkedList = childList
                                .filter((el) => {
                                    return checkedOptions.indexOf(el.oid) !== -1 || !el.hidden;
                                })
                                .map((el) => {
                                    return el.oid;
                                });
                        }
                        this.$set(item, 'checkedOptions', checkedList);
                    });
                } else {
                    const { childList, checkedRoles } = this.roleCheckboxData;
                    let checkedRoleCode = [];
                    if (flag) {
                        checkedRoleCode = childList
                            .filter((el) => {
                                return checkedRoles.indexOf(el.roleCode) !== -1 || !el.hidden;
                            })
                            .map((item) => {
                                return item.roleCode;
                            });
                    }
                    this.$set(this.roleCheckboxData, 'checkedRoles', checkedRoleCode);
                }
            },
            setCheckedOption(checkedList) {
                const newCheckList = checkedList || [];
                this.optionSettingList.map((item) => {
                    const childList = item.childList || [];
                    const list =
                        childList
                            .filter((el) => {
                                return newCheckList.indexOf(el.identifierNo) !== -1;
                            })
                            .map((op) => op.oid) || [];
                    this.$set(item, 'checkedOptions', list);
                });
            },
            handlerCheckOption(checkOid, line) {
                this.$emit('hide-dialog', checkOid); // 重置提示框提示
                this.$set(line, 'checkedOptions', checkOid);
            },
            handlerCheckRole(checkOid) {
                this.$emit('hide-dialog', checkOid); // 重置提示框提示
                this.$set(this.roleCheckboxData, 'checkedRoles', checkOid);
            },
            handlerSave() {
                this.hideDialog();
                let submitParams = this.optionSettingList;
                if (this.activeTab !== 'role') {
                    submitParams = [this.roleCheckboxData];
                }
                this.$emit('handler-save', submitParams);
            },
            handlerSearch(val) {
                if (this.activeTab === 'role') {
                    this.optionSettingList.forEach((item) => {
                        const childList = item.childList;
                        let showChild = false;
                        childList.forEach((el) => {
                            const name = el.name;
                            const hidden = name.indexOf(val) === -1;
                            this.$set(el, 'hidden', hidden);
                            !hidden && (showChild = true);
                        });
                        this.$set(item, 'hidden', !showChild);
                    });
                } else {
                    this.roleCheckboxData.childList.forEach((item) => {
                        const hidden = item.roleName.indexOf(val) === -1;
                        this.$set(item, 'hidden', hidden);
                    });
                }
            },
            handlerReset() {
                if (this.activeTab === 'role') {
                    this.$emit('handler-reset-role-tab');
                } else {
                    this.$emit('handler-reset-options-tab');
                }
            },
            getShowData(optionSettingList) {
                return optionSettingList.filter((el) => !el.hidden);
            },
            getShowCheckChildList(roleCheckboxData) {
                return roleCheckboxData.childList.filter((el) => !el.hidden);
            }
        }
    };
});
