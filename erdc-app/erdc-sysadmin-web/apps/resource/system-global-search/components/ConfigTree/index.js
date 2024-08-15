define([
    'text!' + ELMP.resource('system-global-search/components/ConfigTree/template.html'),
    'css!' + ELMP.resource('system-global-search/styles/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            title: {
                type: String,
                default: ''
            },
            treeType: {
                type: String,
                default: ''
            },
            treeList: {
                type: Array,
                default: () => []
            },
            treeConfig: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-global-search/locale/index.js'),
                i18nMappingObj: {},
                searchLeftKey: '',
                treeProps: {
                    children: 'children',
                    label: 'label'
                }
            };
        },
        computed: {
            checkedNodes() {
                return this.$store.getters.getGlobalSearchConfig('checkedNodes') || [];
            },
            currentModel() {
                return this.$store.getters.getGlobalSearchConfig('currentModel') || {};
            },
            isCheckedModel() {
                return this.treeType === 'checkedModelTree';
            }
        },
        watch: {
            searchLeftKey(val) {
                this.$refs.tree.filter(val);
            },
            checkedNodes: {
                immediate: true,
                handler() {
                    this.setCheckedKeys();
                }
            },
            treeList() {
                this.$nextTick(() => {
                    if (this.treeConfig.showCheckbox) {
                        this.setCheckedKeys();
                    }
                });
            }
        },
        mounted() {
            this.clickFirstNode();
        },
        methods: {
            clearSearchLeftKey() {
                this.searchLeftKey = '';
            },
            clickFirstNode() {
                setTimeout(() => {
                    if (this.checkedNodes.length) {
                        this.onNodeClick(this.checkedNodes[0]);
                    }
                }, 500);
            },
            // 设置已选节点
            setCheckedKeys() {
                const treeRef = this.$refs.tree;
                if (treeRef) {
                    treeRef.setCheckedKeys([]);
                    this.$nextTick(() => {
                        this.checkedNodes.forEach((item) => {
                            treeRef.setChecked(item, true);
                        });
                    });
                }
            },

            // 通过关键字过滤节点
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },

            // 节点勾选/取消勾选
            async onNodeCheck(currentNode) {
                let currentNodes = [];
                const recursionFn = (currentNode) => {
                    currentNodes.push(currentNode);
                    if (currentNode.children?.length) {
                        for (let item of currentNode.children) {
                            recursionFn(item);
                        }
                    }
                };
                recursionFn(currentNode);
                const currentNodeIds = currentNodes.map((item) => item.oid);
                const isChecked = !this.checkedNodes.some((item) => item.oid === currentNode.oid);
                let newCheckedNodes = this.checkedNodes.filter((item) => !currentNodeIds.includes(item.oid));
                if (isChecked) {
                    newCheckedNodes = [...currentNodes, ...newCheckedNodes];
                } else {
                    const isSureDelete = await this.deleteConfirm(currentNodeIds);
                    if (!isSureDelete) {
                        const treeRef = this.$refs.tree;
                        currentNodeIds.forEach((item) => {
                            treeRef.setChecked(item, true);
                        });
                        return;
                    }
                }
                this.setCheckedNodes(newCheckedNodes, isChecked);
            },

            async setCheckedNodes(allCheckedNodes, isChecked) {
                const checkedNodes = allCheckedNodes
                    .filter((item) => item.instantiable)
                    .map((item) => {
                        return {
                            ...item,
                            children: []
                        };
                    });
                const node = checkedNodes.length ? checkedNodes[0] : null;
                const isDeleteCurNode = checkedNodes.find((item) => item.oid === this.currentModel.oid);
                if (isChecked || isDeleteCurNode) {
                    document.querySelector('.checkedModelTree .el-scrollbar__wrap').scrollTop = 0;
                }
                this.$store.dispatch('setGlobalSearchConfig', node);
                this.$store.commit('setGlobalSearchConfig', { key: 'checkedNodes', value: checkedNodes });
            },

            // 删除节点
            async onNodeDelete(node) {
                const nodeData = node.data;
                let deleteOids = [];

                // 删除当前节点和子节点
                const recursionChildFn = (data = [], node) => {
                    deleteOids.push(node.oid);
                    for (let item of data) {
                        if (item.parentOid === node.oid) {
                            recursionChildFn(data, item);
                        }
                    }
                };
                recursionChildFn(this.checkedNodes, nodeData);

                // 如果当前节点的父节点只有当前节点这个子节点， 则删除父节点
                const recursionParentFn = (data = [], node) => {
                    deleteOids.push(node.oid);
                    for (let item of data) {
                        if (
                            item.parentOid &&
                            data.filter((subItem) => subItem.parentOid === node.parentOid).length === 1
                        ) {
                            const parentNode = data.find((subItem) => subItem.oid === node.parentOid);
                            if (parentNode) {
                                recursionParentFn(data, parentNode);
                            }
                            break;
                        }
                    }
                };
                recursionParentFn(this.checkedNodes, nodeData);
                deleteOids = [...new Set(deleteOids)];

                const isSureDelete = await this.deleteConfirm(deleteOids);
                if (isSureDelete) {
                    this.setCheckedNodes(
                        this.checkedNodes.filter((item) => !deleteOids.includes(item.oid)),
                        false
                    );
                }
            },

            // 移动节点
            onNodeDrop(node, targetNode, position) {
                let tempCheckedNodes = ErdcKit.deepClone(this.checkedNodes);
                const targetNodeIndex = tempCheckedNodes.findIndex((item) => item.oid === targetNode.data.oid);
                tempCheckedNodes = tempCheckedNodes.filter((item) => item.oid !== node.data.oid);
                if (position === 'before') {
                    tempCheckedNodes.splice(targetNodeIndex, 0, node.data);
                } else {
                    tempCheckedNodes.splice(targetNodeIndex + 1, 0, node.data);
                }
                this.$store.commit('setGlobalSearchConfig', { key: 'checkedNodes', value: tempCheckedNodes });
            },

            // 点击节点
            onNodeClick(node) {
                if (this.isCheckedModel) {
                    this.$store.dispatch('setGlobalSearchConfig', node);
                }
            },

            // 设置拖拽范围
            allowDrop(draggingNode, dropNode, type) {
                if (this.treeConfig.showDrag) {
                    if (draggingNode.level === dropNode.level) {
                        return type === 'prev' || type === 'next';
                    } else {
                        return false;
                    }
                }
            },

            // 删除节点前确认
            deleteConfirm(deleteOids) {
                const { deleteLeafTip, deleteParentTip, info, confirm, cancel } = this.i18n;
                let message = deleteLeafTip;
                if (deleteOids.length > 1) {
                    message = deleteParentTip;
                }
                return new Promise((resolve) => {
                    this.$confirm(message, info, {
                        confirmButtonText: confirm,
                        cancelButtonText: cancel,
                        type: 'warning'
                    })
                        .then(() => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                });
            }
        }
    };
});
