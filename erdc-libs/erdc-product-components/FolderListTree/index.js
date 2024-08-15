define([
    'text!' + ELMP.resource('erdc-product-components/FolderListTree/index.html'),
    'EventBus',
    'css!' + ELMP.resource('erdc-product-components/FolderListTree/style.css')
], function (template) {
    const FamKit = require('fam:kit');
    const store = require('fam:store');

    return {
        template,
        components: {
            FolderListConfig: FamKit.asyncComponent(ELMP.resource('erdc-product-components/FolderListConfig/index.js')) // 编辑子类型
        },
        data() {
            return {
                visible: false,
                i18nLocalePath: ELMP.resource('erdc-product-components/FolderListTree/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    searchKeyword: this.getI18nByKey('搜索关键字'),
                    create: this.getI18nByKey('创建'),
                    moreActions: this.getI18nByKey('更多操作'),
                    completeImport: this.getI18nByKey('全量导入'),
                    completeExport: this.getI18nByKey('全量导出'),
                    folder: this.getI18nByKey('文件夹'),
                    createFolder: this.getI18nByKey('创建文件夹'),
                    editFolder: this.getI18nByKey('编辑文件夹'),
                    nameNotEmpty: this.getI18nByKey('名称不能为空且不能含有空格'),
                    tips: this.getI18nByKey('提示'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    deleteSuccessfully: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败')
                },
                dialogVisible: false,
                openType: 'create',
                searchValue: '',
                treeList: [],
                basicsListData: [],
                treeData: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'childList'
                },
                editingNodeId: null,
                edit: false,
                typeAttrGlobal: false,
                newCategory: {
                    id: 'create',
                    parentId: '-1',
                    displayName: '',
                    childList: []
                },
                breadList: [], //面包屑数组
                breadLabel: '', //面包屑文字
                rowData: [], // 编辑选中数据
                folderTitle: '',
                selectData: {},
                treeHeight: '100%',
                addEnabled: true,
                editEnabled: true,
                delEnabled: true
            };
        },
        props: {
            containerRef: String,
            toolbarOperationType: {
                type: String,
                default: ''
            },
            rowOperationType: {
                type: String,
                default: ''
            },
            currentFolder: Object,
            folderTreeTitle: String,
            allowDragFn: Function
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
            lan() {
                const lan = this.$store.state.i18n?.lang || 'zh_cn';
                return lan;
            },
            selectKey() {
                return this.currentFolder?.oid || '';
            },
            defaultExpandedKeys() {
                return this.selectKey ? [this.selectKey].filter(Boolean) : [this.treeData[0]?.key].filter(Boolean);
            },
            title() {
                return this.folderTreeTitle || this.i18nMappingObj.folder;
            }
        },
        watch: {
            searchValue(n) {
                this.$refs.globalTree.filter(n);
            },
            containerRef() {
                this.getListTree();
            },
            selectKey(value) {
                this.$nextTick(() => {
                    this.$refs.globalTree.setCurrentKey(value);
                    this.$nextTick(() => {
                        this.$refs.globalTree?.$el?.querySelector('.is-current')?.click();
                    });
                });
            }
        },
        mounted() {
            if (this.$refs?.header?.clientHeight) {
                this.treeHeight = `calc(100vh - ${this.$refs.header.clientHeight + 152}px)`;
            }
            if (this?.$store?.state?.app?.typeAttrGlobal) {
                this.typeAttrGlobal = true;
            }
            if (this.containerRef) this.getListTree();
        },
        methods: {
            // 获取按钮详情，判断按钮权限
            getButtonsPermissions() {
                this.getToolbarOperationButtons();
                this.getRowOperationButtons();
            },
            getToolbarOperationButtons() {
                this.$famHttp({
                    url: '/fam/menu/query',
                    method: 'POST',
                    data: {
                        name: this.toolbarOperationType || 'MENU_ACTION_FOLDER',
                        containerOid: store.state.space?.context?.oid || ''
                    }
                })
                    .then((resp) => {
                        const { data } = resp;
                        const addBtn = data.actionLinkDtos.find((item) => item.nameI18nJson?.value === '创建文件夹');
                        this.addEnabled = addBtn.actionDto?.enabled ?? true;
                    })
                    .catch((error) => {});
            },
            getRowOperationButtons() {
                if (!this.treeData[0]?.childList?.length) return;
                const data = this.treeData[0]?.childList[0];
                this.$famHttp({
                    url: '/fam/menu/query',
                    method: 'POST',
                    data: {
                        name: this.rowOperationType || 'MENU_MODEL_MANAGER',
                        objectOid: data.oid,
                        className: data.idKey
                    }
                })
                    .then((resp) => {
                        const { data } = resp;
                        const editBtn = data.actionLinkDtos.find((item) => item.nameI18nJson?.value === '编辑');
                        const delBtn = data.actionLinkDtos.find((item) => item.nameI18nJson?.value === '删除');
                        this.editEnabled = editBtn.actionDto?.enabled ?? true;
                        this.delEnabled = delBtn.actionDto?.enabled ?? true;
                    })
                    .catch((error) => {});
            },
            createFolder(node, data) {
                this.dialogVisible = true;
                this.rowData = data;
                this.openType = 'createTree';
                this.folderTitle = this.i18nMappingObj.createFolder;
            },
            onEdit: function (row) {
                this.rowData = row;
                this.dialogVisible = true;
                this.openType = 'editTree';
                this.folderTitle = this.i18nMappingObj.editFolder;
            },
            onRemove: function (node, data) {
                const formData = {
                    oid: data.oid
                };

                let titleTip = this.i18nMappingObj['confirmDelete'];
                this.$confirm(titleTip, this.i18nMappingObj['tips'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: formData,
                        method: 'delete'
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj['deleteSuccessfully'],
                                showClose: true
                            });
                            this.getListTree();
                        })
                        .catch((error) => {
                            // this.$message({
                            //     type: 'error',
                            //     message: error?.data?.message || this.i18nMappingObj['deleteFailed'],
                            //     showClose: true
                            // });
                        });
                });
            },
            getListTree(Data) {
                const { oid } = Data || '';
                const paramData = {
                    className: this.$store.getters.className('subFolder'),
                    containerRef: this.containerRef
                };
                this.$famHttp({
                    url: '/fam/listAllTree',
                    data: paramData,
                    method: 'get'
                })
                    .then((resp) => {
                        let { data } = resp;
                        data = data.map((item, index) => {
                            item.active = 0;
                            if (index == 0) {
                                item.active = 1;
                            }
                            return item;
                        });
                        this.selectData = {};
                        this.basicsListData = data;
                        this.treeData = data;
                        if (oid) {
                            // 重新获取树节点后，重新定位到之前选中节点
                            this.getSelectData(oid, data);
                            if (_.isEmpty(this.selectData)) {
                                this.selectData = {
                                    oid: oid,
                                    key: oid
                                };
                            }
                            this.$nextTick(() => {
                                this.$refs.globalTree?.setCurrentKey(this.selectData.key);
                                this.$emit('node-folder-click', this.selectData);
                            });
                        } else {
                            this.$nextTick(() => {
                                this.$refs.globalTree?.setCurrentKey(this.currentFolder?.oid || data[0].key);
                                this.$nextTick(() => {
                                    this.$refs.globalTree?.$el?.querySelector('.is-current')?.click();
                                });
                            });
                        }
                        this.getButtonsPermissions();
                    });
            },
            getSelectData(oid, data) {
                let filterData = data.find((item) => item.oid === oid);
                if (filterData) {
                    this.selectData = filterData;
                } else {
                    data.forEach((item) => {
                        if (item.childList?.length) {
                            this.getSelectData(oid, item.childList);
                        }
                    });
                }
            },
            removeNodeById(tree) {
                tree.map((item, index) => {
                    if (item.id === 'create') {
                        tree.splice(index, 1);
                    }
                    if (item.childList) {
                        this.removeNodeById(item.childList);
                    }
                });
                return tree;
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                } // 不区分英文字母大小写
                let newVal = data?.displayName?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            onCommand(val) {
                if (val == 'import') {
                    this.importAll();
                } else if (val == 'export') {
                    this.exportAll();
                }
            },
            importAll() {},
            exportAll() {},
            onSubmit() {
                this.getListTree();
            },
            onCheck(...args) {
                this.breadList = [];
                let data = args[1];
                this.getTreeNode(data);
                this.$emit('node-folder-click', ...args);
            },
            //获取当前树节点和其父级节点
            getTreeNode(node) {
                if (node && node.label) {
                    this.breadList.unshift(node.label);
                    this.getTreeNode(node.parent); //递归
                    this.breadLabel = this.breadList.join('>');
                }
            },
            refreshList() {
                this.getListTree();
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            allowDrag(node) {
                if(this.allowDragFn) {
                    return this.allowDragFn(node)
                }
                return node.level !== 1;
            },
            allowDrop(draggingNode, dropNode, type) {
                return dropNode.level !== 1 && (draggingNode.level !== dropNode.level || type === 'inner');
            },
            handleNodeDragStart() {
                this._treeData = FamKit.deepClone(this.treeData);
            },
            async handleNodeDrop(node, parent, type) {
                if (!node || !parent) {
                    this.treeData = this._treeData;
                }
                const { data: { oid: nodeOid } } = node;
                const {
                    data: { oid: parentOid, parentKey }
                } = parent;
                const { data: nodeDomain } = await this.hasDomain(nodeOid);
                const { data: parentDomain } = await this.hasDomain(parentOid);
                const _this = this;
                function remove() {
                    node.data.folderRef = type === 'inner' ? parentOid : parentKey;
                    _this
                        .updateFolderInfo(node.data)
                        .then((resp) => {
                            if (!resp.success) {
                                _this.treeData = _this._treeData;
                            }
                        })
                        .catch(() => {
                            _this.treeData = _this._treeData;
                        })
                        .finally(() => {
                            _this.$emit('refresh-table');
                        });
                }
                if (nodeDomain && !parentDomain) {
                    this.$confirm(this.i18n.moveFolderNoDomainTips, this.i18n.moveFolder, {
                        type: 'warning',
                        confirmButtonText: this.i18n.continue,
                        cancelButtonText: this.i18n.cancel
                    }).then(() => {
                        remove();
                    }).catch(() => {
                        this.treeData = this._treeData;
                    });
                }
                else if (!nodeDomain && parentDomain) {
                    this.$confirm(this.i18n.moveFolderHaveDomainTips, this.i18n.moveFolder, {
                        type: 'warning',
                        distinguishCancelAndClose: true,
                        confirmButtonText: this.i18n.need,
                        cancelButtonText: this.i18n.noNeed
                    }).then(() => {
                        node.data.isAddDomain = true;
                        remove();
                    }).catch((action) => {
                        if (action === 'cancel') {
                            node.data.isAddDomain = false;
                            remove();
                        } else {
                            this.treeData = this._treeData;
                        }
                    });
                }
                else {
                    remove();
                }
            },
            hasDomain(subFolderOid) {
                return this.$famHttp({
                    url: '/fam/folder/hasDomain',
                    method: 'GET',
                    data: {
                        subFolderOid
                    }
                });
            },
            updateFolderInfo(folder) {
                return this.$famHttp({
                    url: '/fam/update',
                    method: 'POST',
                    data: {
                        oid: folder.oid,
                        containerRef: folder.containerRef,
                        className: folder.idKey,
                        attrRawList: [
                            {
                                attrName: 'name',
                                value: folder.name
                            },
                            {
                                attrName: 'folderRef',
                                value: folder.folderRef
                            },
                            _.isBoolean(folder?.isAddDomain) ? {
                                attrName: 'isAddDomain',
                                value: folder.isAddDomain
                            } : null
                        ].filter(Boolean)
                    }
                });
            }
        }
    };
});
