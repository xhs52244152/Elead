define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-participant/components/OrganizationManager/template.html'),
    ELMP.resource('system-participant/api.js'),
    'css!' + ELMP.resource('system-participant/components/OrganizationManager/style.css'),
    'underscore'
], function (ErdcKit, template, api) {
    const _ = require('underscore');
    const axios = require('fam:http');
    const store = require('fam:store');
    // $.i18n.loadResourceLang('fam_member');

    return {
        template,
        components: {
            FamOrganizationTree: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamOrganizationTree/index.js')),
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            // MemberTable: ErdcKit.asyncComponent(ELMP.resource('system-participant/components/MemberViewTable/index.js')), // 视图表格
            MemberTable: ErdcKit.asyncComponent(ELMP.resource('system-participant/components/MemberTable/index.js')), // 旧表格
            MemberLockTable: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/MemberLockTable/index.js')
            ), // 已锁定用户表格
            OrganizationForm: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/OrganizationForm/index.js')
            ),
            OrganizationView: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/OrganizationView/index.js')
            ),
            FamImport: ErdcKit.asyncComponent(ELMP.resource(`erdc-components/FamImport/index.js`)),
            FamExport: ErdcKit.asyncComponent(ELMP.resource(`erdc-components/FamExport/index.js`))
        },
        data() {
            return {
                orgId: '',
                orgCode: '',
                currentOrgObj: {},
                currentSelectNode: {},
                specialOrg: [],
                activeTab: 'members',
                currentOperNode: '',
                form: {
                    oid: null,
                    defaultValue: {},
                    visible: false,
                    loading: false,
                    editable: false,
                    deleteOrgName: ''
                },
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // 是否是编辑信息（即tab上的编辑按钮）
                isEditMsg: '',
                importVisible: false,
                exportVisible: false,
                requestConfig: {
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('organization')
                        }
                    }
                },
                appName: '',
                treeNodeMenu: [],
                orgInfoMenu: []
            };
        },
        async created() {
            this.specialOrg = store.getters.specialConstName('specialOrganization');
            this.treeNodeMenu = await api.menuQuery('MENU_MODULE_ORG_TABLE');
            this.orgInfoMenu = await api.menuQuery('MENU_MODULE_ORG_TEAM_TABLE');
        },
        computed: {
            showLockOrg() {
                return this.$store.state.app.threeMemberEnv ? this.$store.getters['app/isSecurity'] : true;
            },
            // 特殊部门不显示信息tab
            isShowOrgInfo() {
                return !this.specialOrg.includes(this.currentOrgObj?.identifierNo);
            },
            isUnlockTable() {
                return this.orgCode === 'ORG999999';
            },
            createPerm() {
                return this.treeNodeMenu.includes('ORG_CREATE');
            },
            editPerm() {
                return this.treeNodeMenu.includes('ORG_EDIT');
            },
            deletePerm() {
                return this.treeNodeMenu.includes('ORG_DELETE');
            },
            importPerm() {
                return this.treeNodeMenu.includes('ORG_IMPORT');
            },
            exportPerm() {
                return this.treeNodeMenu.includes('ORG_EXPORT');
            }
        },
        methods: {
            getOrganizationMoreOperation(data) {
                return _.compact([
                    data.addSub
                        ? {
                              key: 'ADD_CHILDREN',
                              name: this.$t('新增子部门'),
                              data
                          }
                        : null,
                    data.delete
                        ? {
                              key: 'DELETE',
                              name: this.$t('删除'),
                              data
                          }
                        : null
                ]);
            },
            onNodeOperate({ key, data }) {
                switch (key) {
                    case 'ADD_CHILDREN':
                        {
                            this.onCreate(data);
                        }
                        break;
                }
            },
            // 新增部门
            onCreate(data) {
                this.currentOperNode = data;
                this.form.oid = null;
                this.form.editable = false;
                this.form.defaultValue = {
                    parentRef: data,
                    nameI18nJson: {
                        value: ''
                    },
                    descriptionI18nJson: {
                        value: ''
                    }
                };
                this.openOrganizationForm();
            },
            // 编辑部门
            onEdit(data, type) {
                this.currentOperNode = data;
                this.form.oid = data.oid;
                this.form.editable = true;
                if (type === 'editMsg') this.isEditMsg = type;
                else this.isEditMsg = '';
                this.openOrganizationForm();
            },
            // 删除
            onDeleteConfirm(data) {
                this.$confirm(
                    this.$t('deleteDepartmentTips', { departmentName: data?.displayName || '' }),
                    this.i18n.confirmDel,
                    {
                        type: 'warning',
                        confirmButtonText: this.i18n.ok,
                        cancelButtonText: this.i18n.cancel
                    }
                )
                    .then(() => {
                        axios
                            .delete('/fam/delete', {
                                params: {
                                    oid: data?.oid
                                }
                            })
                            .then(() => {
                                this.activeTab = 'members';
                                // 刷新数据（根据当前操作节点的父节点，如果没有则直接初始化刷新）
                                // data?.parentKey ? this.$refs['orgTree'].refreshNode(data?.parentKey) : this.$refs['orgTree'].init()
                                this.$refs['orgTree'].updateTree(data, 'delete');
                                this.$message.success(this.i18n.deleteSuccess);
                            })
                            .catch(() => {
                                // this.$message({
                                //     message: err?.data?.message || '删除失败',
                                //     type: 'error',
                                //     showClose: true
                                // });
                            });
                    })
                    .catch(() => {
                        // do nothing
                    });
            },
            fnDeleteOrg() {
                this.form.deleteOrgVisible = false;
            },
            onNodeClick(data) {
                let specialOrg = this.$store.getters.specialConstName('specialOrganization') || [];
                this.orgId = data.id || '';
                this.orgCode = data.identifierNo || '';
                if (specialOrg.includes(this.orgCode)) {
                    this.activeTab = 'members';
                }
                this.currentOrgObj = { ...data };
                this.currentSelectNode = { ...data };
                this.appName = data?.appName || '';
                this.$nextTick(() => {
                    // ORG999999 标识“已锁定”
                    if (data.identifierNo !== 'ORG999999') {
                        this.fetchMemberListByOrgId(data.id);
                    }
                });
            },
            // 刷新部门成员表格
            fetchMemberListByOrgId(orgId) {
                const $memberTable = this.$refs.memberTable;
                if ($memberTable) {
                    $memberTable.reloadMemberTable({ orgId, orderBy: 'createTime' });
                }
            },
            onSubmit(formRef) {
                this.form.loading = true;
                this.$refs[formRef].submit().then(() => {
                    // 刷新数据（根据当前操作节点）
                    // this.$refs['orgTree'].refreshNode(this.currentOperNode?.key, this.currentOperNode?.parentKey)
                    // this.refreshOrgTree()
                    this.closeOrganizationForm(formRef);
                    if (this.isEditMsg) {
                        this.activeTab = 'members--';
                        this.$refs['orgTree'].updateTree(this.currentOperNode, 'add');
                        setTimeout(() => {
                            this.activeTab = 'infos';
                        }, 10);
                    } else {
                        let isAdd = this.form.oid ? 'edit' : 'add';
                        this.$refs['orgTree'].updateTree(this.currentOperNode, isAdd);
                    }
                }).finally(() => {
                    this.form.loading = false;
                });
            },
            refreshOrgTree() {
                // this.$refs['orgTree'].refreshTree();
                // 更新当前树节点
                this.$refs['orgTree'].updateTree(this.currentOrgObj, 'updatedTree');
            },
            openOrganizationForm() {
                this.form.visible = true;
            },
            closeOrganizationForm() {
                this.form.editable = false;
                this.form.visible = false;
                this.form.defaultValue = {};
                // this.currentSelectNode = {}
            },
            onImport() {
                this.importVisible = true;
            },
            importSuccess() {
                this.$refs['orgTree'].refreshTree();
            },
            onExport() {
                this.exportVisible = true;
            }
        }
    };
});
