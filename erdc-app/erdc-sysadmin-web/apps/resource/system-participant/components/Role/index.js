define([
    'text!' + ELMP.resource('system-participant/components/Role/index.html'),
    'erdcloud.kit',
    ELMP.resource('system-participant/api.js'),
    'css!' + ELMP.resource('system-participant/components/Role/style.css')
], function (template, ErdcKit, api) {
    return {
        template,
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            RoleTree: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamRoleTree/index.js')),
            RoleList: ErdcKit.asyncComponent(ELMP.resource('system-participant/components/RoleList/index.js')),
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            }
        },
        data() {
            return {
                role: {},
                memberInfo: '',
                showBack: false,
                createEdit: false,
                importVisible: false,
                exportVisible: false,
                importRequestConfig: {},
                exportRequestConfig: {},
                treeNodeMenu: []
            };
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
            importPrem() {
                return this.treeNodeMenu.includes('ROLE_IMPORT');
            },
            exportPrem() {
                return this.treeNodeMenu.includes('ROLE_EXPORT');
            }
        },
        async created() {
            this.treeNodeMenu = await api.menuQuery('MENU_MODULE_ROLE_TREE');
        },
        methods: {
            // 创建
            onCreate() {
                this.createEdit = true;
            },
            // 编辑
            onEdit() {
                // do nothing.
            },
            // 删除
            onDelete() {
                // do nothing.
            },
            // 点击树触发事件
            onClick(data) {
                this.role = { ...data };
                this.memberInfo = 'roleList';
            },
            // 查看
            checkDetail() {
                // 调用查看详情接口
            },
            // 返回
            goBack() {
                this.memberInfo = 'roleList';
                this.showBack = false;
            },
            // 列表操作，需要刷新树
            reloadTree(key) {
                this.$refs.roleTree?.getTree(key);
            },
            onImport(data) {
                this.importRequestConfig = {
                    data: {
                        customParams: {
                            appName: data.appName
                        }
                    }
                };
                this.importVisible = true;
            },
            onExport(data) {
                this.exportRequestConfig = {
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('Role')
                        },
                        customParams: {
                            appName: data.appName
                        }
                    }
                };
                this.exportVisible = true;
            },
            importSuccess() {
                this.reloadTree();
            }
        }
    };
});
