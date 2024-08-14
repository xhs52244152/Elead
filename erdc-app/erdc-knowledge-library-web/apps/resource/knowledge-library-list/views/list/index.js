define([
    'erdcloud.kit',
    'text!' + ELMP.resource('knowledge-library-list/views/list/index.html'),
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('knowledge-library-list/views/list/style.css')
], function (ErdcKit, template, ppmStore) {
    return {
        template,
        components: {
            FolderList: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/FolderList/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            FolderDialog: ErdcKit.asyncComponent(
                ELMP.resource('knowledge-library-list/components/FolderDialog/index.js')
            ),
            FolderPermissions: ErdcKit.asyncComponent(
                ELMP.resource('knowledge-library-list/components/FolderPermissions/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('knowledge-library-list/locale/index.js'),
                // 知识库Oid
                oid: ppmStore.state.knowledgeInfo?.oid,
                containerRef: ppmStore.state.knowledgeInfo?.containerRef,
                folderVisible: false,
                currentType: 'create',
                currentRow: {},
                vm: null,
                currentTreeNode: {},
                isMove: false,
                isPermission: false
            };
        },
        computed: {
            folderProps() {
                return {
                    'toolbar-operation-type': 'PPM_PROJECT_SUB_FOLDER_LIST_MENU',
                    'container-ref': this.containerRef,
                    'folder-tree-title': this.i18n.knowledgeLibrary,
                    'set-form-config': this.setFormConfig,
                    'vm': this.vm,
                    'change-table-config': this.changeTableConfig
                };
            },
            // FolderList实例
            folderListRef() {
                return this.$refs?.folderList || {};
            },
            // 左侧树实例
            folderListTreeRef() {
                let [folderListTreeRef] = this.folderListRef?.$refs?.FolderListTree || [{}];
                return folderListTreeRef;
            },
            // 右侧表格实例
            folderListDetailRef() {
                let [FolderListDetail] = this.folderListRef?.$refs?.FolderListDetail || [{}];
                return FolderListDetail;
            },
            typeName() {
                return this.$store.getters.className('subFolder');
            },
            documentClassName() {
                return ppmStore.state.classNameMapping.document;
            }
        },
        mounted() {
            this.vm = this;
        },
        activated() {
            this.refresh();
        },
        methods: {
            cancelPermission() {
                this.isPermission = false;
            },
            changeTableConfig(config) {
                let result = config.columns.find((item) => item.attrName === 'name');
                result && (result.width = '300');
                // 过滤没权限数据
                config.tableRequestConfig.data.deleteNoPermissionData = true;
                return config;
            },
            getIconStyle(data) {
                try {
                    return JSON.parse(data);
                } catch {
                    return data;
                }
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            // 左侧树行操作
            getFolderActionConfig(row) {
                return {
                    name: 'PROJECT_SUB_FOLDER_OPERATE_MENU',
                    objectOid: row.oid
                };
            },
            // 左侧树搜索旁边创建按钮
            getTreeActionConfig() {
                return {
                    name: 'PPM_PROJECT_SUB_FOLDER_TREE_MENU'
                };
            },
            // 右侧表格行操作
            getActionConfig(row) {
                const classifyMaps = {
                    [this.typeName]: 'KNOWLEDGE_FOLDER_OPERATE_MENU', // 文件夹操作
                    [this.documentClassName]: 'KNOWLEDGE_DOCUMENT_OPERATE_MENU' // 文档操作
                };
                return {
                    name: classifyMaps[row.idKey],
                    objectOid: row.oid,
                    className: row.idKey
                };
            },
            // 文件夹编辑或创建或移动
            handleConfirm(data) {
                let url = '/plat-system/create';
                let message = this.i18n.createdSuccessfully;
                let params = {
                    attrRawList: data,
                    className: this.typeName,
                    containerRef: this.containerRef
                };
                if (this.currentType === 'edit') {
                    url = '/plat-system/update';
                    message = this.i18n.updateSuccessfully;
                    params.oid = this.currentRow.oid;
                }
                this.$famHttp({
                    url,
                    method: 'POST',
                    data: params,
                    appName: 'PPM'
                }).then(() => {
                    this.$message.success(message);
                    this.folderVisible = false;
                    this.folderListTreeRef?.refreshList();
                });
            },
            // 右侧表格刷新
            refresh() {
                this.folderListDetailRef.$refs?.famAdvancedTable?.fnRefreshTable();
                this.folderListTreeRef?.refreshList();
            },
            // 表格名称打开详情
            openDocument({ row }) {
                // 代表是文件夹
                if (row.idKey === this.$store.getters.className('subFolder')) {
                    this.folderListRef?.onCheck(row);
                    return;
                }
                this.$router.push({
                    path: '/knowledge-library-list/document/detail',
                    query: {
                        oid: row.oid,
                        title: row.name,
                        folderObject: this.currentTreeNode
                    }
                });
            },
            setFormConfig(formConfigList) {
                formConfigList['FOLDER_MOVE_FORM'] = formConfigList['FOLDER_MOVE_FORM'].filter(
                    (item) => item.field !== 'context'
                );
            },
            onNodeFolderClick(data) {
                this.currentTreeNode = data;
            },
            switchTreeNode() {
                let value = this.folderListTreeRef.treeData[0]?.oid;
                this.folderListTreeRef.$refs.globalTree.setCurrentKey(value);
                this.$nextTick(() => {
                    this.folderListTreeRef.$refs.globalTree?.$el?.querySelector('.is-current')?.click();
                });
            }
        }
    };
});
