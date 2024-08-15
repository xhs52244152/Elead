define([
    'text!' + ELMP.resource('erdc-type-components/TypeManageTree/template.html'),
    'css!' + ELMP.resource('erdc-type-components/TypeManageTree/style.css'),
    'erdc-kit',
    'EventBus',
    'erdcloud.kit',
    'fam:http',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        data() {
            return {
                i18nPath: ELMP.resource('erdc-type-components/TypeManageTree/locale/index.js'),
                tree: [],
                loading: true,
                keyword: null,
                typeName: '',
                searchValue: '',
                defaultProps: {
                    children: 'children',
                    label: 'displayName',
                    isLeaf: 'leaf'
                },
                titleName: this.i18nMappingObj?.['createType'],
                dialogVisible: false,
                typeOid: null,
                openType: 'edit',
                clickNode: {},
                expandedList: [], // 树形默认展开的节点
                importVisible: false,
                exportVisible: false,
                requestConfig: {}
            };
        },
        components: {
            TypeManageConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageConfig/index.js')), // 编辑子类型
            FamTree: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamTree/index.js')), // 通用树组件
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        watch: {
            searchValue(val) {
                this.$refs['FamTree'].$refs.tree.filter(val);
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init(oid = null) {
                this.loading = true;
                this.$famHttp({
                    url: '/fam/type/typeDefinition/all',
                    method: 'get',
                    headers: {
                        'App-Name': 'ALL'
                    }
                })
                    .then((res) => {
                        this.tree = res.data || [];
                        const clickOid = oid || this.tree[0]?.oid;
                        if (clickOid) {
                            let clickNode = null;
                            let expandedList = [];
                            const treeNode = function (tree, oid) {
                                tree.forEach((item) => {
                                    if (item.oid === oid) {
                                        clickNode = item;
                                        expandedList.push(item.key);
                                    }
                                    if (item.children && item.children.length) {
                                        treeNode(item.children, oid);
                                    }
                                });
                            };

                            treeNode(this.tree, clickOid);
                            this.expandedList = _.uniq(expandedList);
                            this.$nextTick(() => {
                                this.onNodeClick(clickNode || this.clickNode, 'TypeManageDetail');
                                this.$refs['FamTree'].$refs['tree'].setCurrentKey(clickNode?.key || '');
                            });
                        } else {
                            this.$nextTick(() => {
                                // 首次进入默认选中第一个，样式没有高亮显示
                                // this.onNodeClick(this.tree[0], 'TypeManageDetail');
                                // this.$refs['tree'].setCurrentKey(this.tree[0].id);
                                // 首次进入默认选中第一个，样式高亮显示
                                const firstNode = document.querySelector('.type-manage-tree .el-tree-node');
                                firstNode?.click();
                            });
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                        this.$emit('type-tree-loading', this.loading);
                    });
            },
            /* 操作 */
            onCreate(data) {
                this.openType = 'create';
                this.typeOid = data.oid;
                this.titleName = this.i18nMappingObj?.['createType'];
                this.dialogVisible = true;
            },
            onEdit(data) {
                this.clickNode = data;
                this.openType = 'edit';
                // this.onNodeClick(data, node, this);
                this.typeOid = data.oid;
                this.titleName = this.i18nMappingObj?.['editType'];
                this.dialogVisible = true;
            },
            onDelete(data) {
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/type/typeDefinition/delete',
                        params: { oid: data.oid },
                        method: 'delete',
                        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
                    }).then(() => {
                        this.$message({
                            message: this.i18nMappingObj['successfullyDelete'],
                            type: 'success',
                            showClose: true
                        });
                        this.$refs.FamTree?.clearSearch();
                        this.onSubmit();
                    });
                });
            },
            onSubmit(oid) {
                this.init(oid);
            },
            // 提交创建表单
            submitCreateForm() {
                this.dialogVisible = false;
            },
            /* 树形操作 */
            nodeExpand(data) {
                this.expandedList.push(data.id); // 在节点展开是添加到默认展开数组
            },
            nodeCollapse(data) {
                this.expandedList.splice(this.expandedList.indexOf(data.id), 1); // 收起时删除数组里对应选项
            },
            dropSuccess(oid = null) {
                this.init(oid);
            },
            onNodeClick(...args) {
                this.$emit('node-type-click', ...args);
            },
            /* 搜索 */
            onSearch() {
                if (this.searchValue) {
                    this.$refs?.['FamTree']?.$refs?.tree?.filter(this.searchValue);
                }
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = [data?.typeName?.toUpperCase(), data?.displayName?.toUpperCase()];
                const filter = newVal.filter(Boolean).find((item) => item.indexOf(value.toUpperCase()) !== -1);
                return !!filter;
            },
            onImport() {
                this.importVisible = true;
            },
            onExport() {
                this.requestConfig = {
                    headers: {
                        'App-Name': 'ALL'
                    },
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('typeDefinition')
                        }
                    }
                };
                this.exportVisible = true;
            },
            onExportFn(data) {
                const { typeName, key } = data;
                const serviceName = key.split('_')[0];
                this.requestConfig = {
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('typeDefinition')
                        },
                        customParams: {
                            typeName,
                            serviceName,
                            isTree: true
                        }
                    }
                };
                this.exportVisible = true;
            },
            importSuccess() {
                this.init();
            }
        }
    };
});
