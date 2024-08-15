define([
    'text!' + ELMP.resource('erdc-type-components/GlobalAttributesTree/index.html'),
    'css!' + ELMP.resource('erdc-type-components/GlobalAttributesTree/style.css')
], function (template) {
    const ErdcKit = require('fam:kit');

    return {
        template,
        data() {
            return {
                visible: false,
                i18nLocalePath: ELMP.resource('erdc-type-components/GlobalAttributesTree/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    searchKeyword: this.getI18nByKey('搜索关键字'),
                    create: this.getI18nByKey('创建'),
                    moreActions: this.getI18nByKey('更多操作'),
                    completeImport: this.getI18nByKey('全量导入'),
                    completeExport: this.getI18nByKey('全量导出'),
                    globalAttr: this.getI18nByKey('全局属性'),
                    tips: this.getI18nByKey('提示'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    deleteClass: this.getI18nByKey('删除分类'),
                    noDelete: this.getI18nByKey('有子分类不能删除'),
                    deleteSuccessfully: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    globalPropertyClassification: this.getI18nByKey('全局属性分类')
                },
                treeHeight: 'calc(100vh - 306px)',
                isAdd: false,
                searchValue: '',
                treeList: [],
                basicsListData: [],
                treeChildData: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'children'
                },
                defaultExpandedKeys: [],
                defaultCheckedKeys: [],
                selectKey: '',
                editingNodeId: null,
                edit: false,
                typeAttrGlobal: false,
                newCategory: {
                    id: 'create',
                    parentId: '-1',
                    displayName: '',
                    children: []
                }
            };
        },
        watch: {
            searchValue(n) {
                this.$refs.globalTree.filter(n);
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
            lan() {
                const lan = this.$store.state.i18n?.lang || 'zh_cn';
                this.treeData[0].name = this.i18nMappingObj['propertyDefCollection'];
                return lan;
            },
            treeData: {
                get() {
                    return [
                        {
                            displayName: this.i18nMappingObj.globalPropertyClassification,
                            key: 'globalPropertyClassification',
                            oid: 'OR:erd.cloud.foundation.type.entity.Catalog:0',
                            children: this.treeChildData
                        }
                    ];
                },
                set() {}
            }
        },
        mounted() {
            if (this?.$store?.state?.app?.typeAttrGlobal) {
                this.typeAttrGlobal = true;
            }
            this.getListTree();
        },
        methods: {
            // 处理输入框件间距
            inputPadding() {
                const { globalTree } = this.$refs;
                $(globalTree.$el).find('.outdent').parent('.el-tree-node__content').addClass('outdent-tree-node');
                $(globalTree.$el)
                    .find('.outdent')
                    .parent('.el-tree-node__content')
                    .find('.tree-content')
                    .css('width', 'calc(100% - 0px)');
                $(globalTree.$el)
                    .find('.outdent')
                    .parent('.el-tree-node__content')
                    .find('.el-tree-node__expand-icon')
                    .hide();
                if (!this.editingNodeId) {
                    $(globalTree.$el).find('.el-tree-node__content').removeClass('outdent-tree-node');
                    $(globalTree.$el)
                        .find('.el-tree-node__content')
                        .find('.tree-content')
                        .css('width', 'calc(100% - 25px)');
                    $(globalTree.$el).find('.el-tree-node__content').find('.el-tree-node__expand-icon').show();
                }
            },
            inputBlur() {
                this.$refs.inputEditNode.blur();
            },
            createCategory(node, data) {
                node.expanded = true;
                this.newCategory = {
                    id: 'create',
                    parentId: '-1',
                    displayName: '',
                    children: []
                };
                this.editingNodeId = this.newCategory.id;
                if (node.level == 1) {
                    this.newCategory.parentId = 0;
                    this.newCategory.type = 'GLOBAL_ATTR';
                    this.newCategory.parentRef = 'OR:erd.cloud.foundation.type.entity.Catalog:0';
                } else {
                    this.newCategory.parentId = data.id;
                    this.newCategory.parentRef = data.oid;
                    this.newCategory.type = data.type;
                }
                if (!data.children) {
                    this.$set(data, 'children', []);
                }
                data.children.unshift(this.newCategory);
                this.defaultExpandedKeys.push(data.oid);
                this.$nextTick(() => {
                    setTimeout(() => {
                        $(this.$refs.globalTree.$el).find('input:visible').focus();
                        this.inputPadding();
                    }, 0);
                });
            },
            append(node, data) {
                const that = this;
                let { oid, displayName = '', type, parentRef } = data;
                displayName = displayName.trim();
                if (data.id === 'create') {
                    if (!displayName) {
                        that.removeNodeById(this.$refs.globalTree.data);
                        return false;
                    }
                    let obj = {
                        className: 'erd.cloud.foundation.type.entity.Catalog',
                        attrRawList: [
                            {
                                attrName: 'nameI18nJson',
                                value: {
                                    value: displayName,
                                    zh_cn: '',
                                    zh_tw: '',
                                    en_gb: ''
                                }
                            },
                            {
                                attrName: 'type',
                                value: type
                            },
                            {
                                attrName: 'parentRef',
                                value: parentRef
                            }
                        ]
                    };
                    this.$famHttp({
                        url: '/fam/create',
                        data: obj,
                        method: 'post'
                    }).then((resp) => {
                        // 局部添加
                        this.getDataByOid(resp.data).then((newData) => {
                            this.$refs.globalTree.remove(node);
                            this.$refs.globalTree.append(newData, parentRef);
                        });
                    });
                } else {
                    if (!displayName) {
                        data.displayName = this.editingNodeTitle;
                        return false;
                    }
                    let obj = {
                        oid,
                        className: 'erd.cloud.foundation.type.entity.Catalog',
                        attrRawList: [
                            {
                                attrName: 'nameI18nJson',
                                value: {
                                    value: displayName,
                                    zh_cn: '',
                                    zh_tw: '',
                                    en_gb: ''
                                }
                            },
                            {
                                attrName: 'type',
                                value: type
                            }
                        ]
                    };
                    this.$famHttp({
                        url: '/fam/update',
                        data: obj,
                        method: 'post'
                    }).then((resp) => {
                        // 局部更新
                        this.getDataByOid(resp.data).then((newData) => {
                            data.displayName = newData.displayName;
                            this.$nextTick(() => {
                                this.inputPadding();
                            });
                        });
                        this.editingNodeId = null;
                    });
                }
            },
            onEdit: function (data) {
                this.editingNodeTitle = data.displayName;
                this.editingNodeId = data.id;
                this.newCategory = data;

                this.$nextTick(() => {
                    setTimeout(() => {
                        $(this.$refs.globalTree.$el).find('input:visible').focus();
                        this.inputPadding();
                    });
                });
            },
            onRemove: function (node, data) {
                const formData = {
                    oid: data.oid
                };
                let titleTip = this.i18nMappingObj['deleteClass'];
                let deleteTip = this.i18nMappingObj['confirmDelete'];
                if (data.children && data.children.length > 0) {
                    titleTip = this.i18nMappingObj['noDelete'];
                    deleteTip = this.i18nMappingObj['tips'];
                }
                this.$confirm(titleTip, deleteTip, {
                    showCancelButton: !data.children,
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    type: 'warning'
                }).then(() => {
                    if (!data.children || data.children.length < 1) {
                        this.$famHttp({
                            url: '/fam/delete',
                            params: formData,
                            method: 'delete'
                        }).then(() => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj['deleteSuccessfully'],
                                showClose: true
                            });
                            // 局部移除
                            this.$refs.globalTree.remove(node);
                            this.$nextTick(() => {
                                if (this.treeData[0].children.length > 0) {
                                    const oid = this.treeData[0].children[0].oid;
                                    this.$refs.globalTree?.setCurrentKey(oid);
                                    this.$nextTick(() => {
                                        document
                                            .querySelector('#GlobalAttributesTree .el-tree-node__children')
                                            .firstChild.click();
                                    });
                                } else {
                                    this.$refs.globalTree?.setCurrentKey(this.treeData[0].oid);
                                }
                            });
                        });
                    }
                });
            },
            getListTree(Data) {
                const { oid } = Data || '';
                const paramData = {
                    type: 'GLOBAL_ATTR'
                };
                this.$famHttp({
                    url: '/fam/type/catalog/listTree',
                    data: paramData,
                    method: 'get'
                }).then((resp) => {
                    let data = resp.data || [];
                    if (data.length > 0) {
                        data = data.map((item, index) => {
                            item.active = 0;
                            if (index == 0) {
                                item.active = 1;
                            }
                            return item;
                        });
                        let selectData = [];
                        let expandData = [];
                        this.basicsListData = data;
                        this.treeChildData = data;
                        this.$emit('global-attr-tree-data', data);
                        if (oid) {
                            const treeData = function (data) {
                                data.forEach((item, i) => {
                                    if (item.oid === oid) {
                                        selectData.push(item);
                                        expandData.push(data[i]);
                                    } else if (item.children && item.children.length) {
                                        treeData(item.children);
                                    }
                                });
                            };
                            treeData(data);
                            this.defaultExpandedKeys.push(...expandData.map((item) => item.oid));
                            this.defaultCheckedKeys.push(selectData[0].oid);
                            this.$nextTick(() => {
                                this.$refs.globalTree?.setCurrentKey(selectData[0].oid);
                                this.$emit('onclick', selectData[0]);
                                this.$emit('node-type-click', selectData[0]);
                            });
                        } else {
                            this.defaultExpandedKeys.push(data[0].oid);
                            this.$nextTick(() => {
                                this.$refs.globalTree?.setCurrentKey(data[0].oid);
                                this.$nextTick(() => {
                                    document
                                        .querySelector('#GlobalAttributesTree .el-tree-node__children')
                                        .firstChild.click();
                                });
                            });
                        }
                    }
                });
            },
            removeNodeById(tree) {
                tree.map((item, index) => {
                    if (item.id === 'create') {
                        tree.splice(index, 1);
                    }
                    if (item.children) {
                        this.removeNodeById(item.children);
                    }
                });
                return tree;
            },
            // search() {
            //     this.treeList = this.basicsListData.filter(item => (item.displayName?.includes(this.searchValue)))
            // },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.displayName?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            onCreate() {
                this.visible = true;
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
            onCheck(...args) {
                if (args[1].level != 1) {
                    this.$emit('node-type-click', ...args);
                    this.selectKey = args[1].key;
                } else {
                    this.$nextTick(() => {
                        this.$refs.tree?.setCurrentKey(this.selectKey);
                    });
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
            /**
             * 根据oid获取节点的最新数据
             * @param {*} oid
             * @returns
             */
            getDataByOid(oid) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/fam/attr',
                        data: {
                            oid
                        }
                    })
                        .then((resp) => {
                            let data = ErdcKit.deserializeAttr(resp.data.rawData, {
                                valueMap: {
                                    parentRef({ oid }) {
                                        return oid;
                                    }
                                }
                            });
                            data.displayName = ErdcKit.translateI18n(data.nameI18nJson.value);

                            resolve(data);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            }
        },
        components: {}
    };
});
