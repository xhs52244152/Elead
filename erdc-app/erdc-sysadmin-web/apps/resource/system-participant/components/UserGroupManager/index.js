define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-participant/components/UserGroupManager/template.html'),
    ELMP.resource('system-participant/api.js'),
    'css!' + ELMP.resource('system-participant/components/UserGroupManager/style.css'),
    'fam:kit',
    'underscore'
], function (ErdcKit, template, api) {
    return {
        template,
        components: {
            FamUserGroupTree: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUserGroupTree/index.js')),
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            UserGroupForm: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/UserGroupForm/index.js')
            ),
            GroupMemberTable: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/GroupMemberTable/index.js')
            ),
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        data() {
            return {
                activeTab: 'gourpMembers',
                currentOperNode: {}, // 当前操作的节点
                currentSelectNode: {}, // 当前选择节点
                form: {
                    oid: null,
                    defaultValue: {},
                    visible: false,
                    loading: false,
                    editable: false,
                    deleteName: '',
                    readonly: false
                },
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'editGroup',
                    'addGroup',
                    'createSuccess',
                    'editorSuccess',
                    'ok',
                    'cancel',
                    'deleteSuccess',
                    'deleteGroupConfirm',
                    'confirmDel',
                    'members',
                    'infos',
                    'edit'
                ]),
                importVisible: false,
                exportVisible: false,
                importRequestConfig: {},
                exportRequestConfig: {},
                treeNodeMenu: [],
                infoMenu: []
            };
        },
        async created() {
            this.treeNodeMenu = await api.menuQuery('MENU_MODULE_GROUP_TREE');
            this.infoMenu = await api.menuQuery('MENU_MODULE_GROUP_INFO');
        },
        computed: {
            createPerm() {
                return this.treeNodeMenu.includes('GROUP_CREATE');
            },
            editPerm() {
                return this.treeNodeMenu.includes('GROUP_EDIT');
            },
            deletePerm() {
                return this.treeNodeMenu.includes('GROUP_DELTE');
            },
            importPerm() {
                return this.treeNodeMenu.includes('GROUP_IMPORT');
            },
            exportPerm() {
                return this.treeNodeMenu.includes('GROUP_EXPORT');
            },
            infoEditPerm() {
                return this.infoMenu.includes('GROUP_EDIT');
            },
        },
        methods: {
            // 新增
            onCreate(data) {
                this.currentOperNode = data;
                this.form.oid = null;
                this.form.editable = false;
                this.form.defaultValue = {
                    nameI18nJson: {
                        value: ''
                    },
                    descriptionI18nJson: {
                        value: ''
                    }
                };
                this.form.visible = true;
            },
            // 编辑
            onEdit(data) {
                this.currentOperNode = data;
                this.form.oid = data.oid;
                this.form.editable = true;
                this.form.visible = true;
            },
            // 删除
            onDeleteConfirm(data) {
                this.$confirm(this.i18nMappingObj?.deleteGroupConfirm, this.i18nMappingObj?.confirmDel, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        this.$famHttp({
                            url: '/fam/delete',
                            params: {
                                oid: data?.oid
                            },
                            method: 'delete'
                        })
                            .then((resp) => {
                                if (resp?.data) {
                                    this.$message.success(this.i18nMappingObj.deleteSuccess);
                                }
                                // 刷新数据
                                this.$refs['treeComponent'].refreshTree();
                            })
                            .catch((err) => {
                                // this.$message({
                                //     message: err?.data,
                                //     type: "error",
                                //     showClose: true
                                // });
                            });
                    })
                    .catch(() => {});
            },
            onSubmit(formRef) {
                this.form.loading = true;
                this.$refs[formRef]
                    .submit()
                    .then(({ data = '' }) => {
                        // 刷新数据
                        if (this.form.editable) {
                            this.$refs['treeComponent'].refreshTree(this.currentOperNode);
                            this.$refs?.userGroupFormReadonly?.fetchUserGroup();
                        } else {
                            this.$refs['treeComponent'].refreshTree(data);
                        }
                        this.closeFormClear();
                    })
                    .finally(() => {
                        this.form.loading = false;
                    });
            },
            fnRefreshTree(data) {
                this.$refs['treeComponent'].refreshTree(data);
            },
            onNodeClick(data) {
                this.currentSelectNode = { ...data };
                this.form.oid = data?.oid;
                this.fetchListById(data?.oid || '');
            },
            // 刷新成员表格
            fetchListById(roleAObjectOId) {
                const $groupMemberTable = this.$refs.groupMemberTable;
                if ($groupMemberTable) {
                    $groupMemberTable.reloadMemberTable({ roleAObjectOId });
                }
            },
            closeFormClear() {
                this.form.editable = false;
                this.form.visible = false;
                this.form.readonly = false;
                this.form.defaultValue = {};
            },
            onImportBtn(data) {
                this.importRequestConfig = {
                    data: {
                        customParams: {
                            appName: data.identifierNo
                        }
                    }
                };
                this.importVisible = true;
            },
            onExportBtn(data) {
                this.exportRequestConfig = {
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('Group')
                        },
                        customParams: {
                            appName: data.identifierNo
                        }
                    }
                };
                this.exportVisible = true;
            },
            importSuccess() {
                this.fnRefreshTree();
            }
        }
    };
});
