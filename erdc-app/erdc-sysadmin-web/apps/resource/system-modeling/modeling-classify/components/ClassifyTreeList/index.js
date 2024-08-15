define([
    'text!' + ELMP.resource('system-modeling/modeling-classify/components/ClassifyTreeList/index.html'),
    'css!' + ELMP.resource('system-modeling/modeling-classify/components/ClassifyTreeList/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {},
        components: {
            ClassifyDefineInfoForm: FamKit.asyncComponent(
                ELMP.resource('system-modeling/modeling-classify/components/ClassifyDefineInfoForm/index.js')
            ),
            FamTree: FamKit.asyncComponent(ELMP.resource('erdc-components/FamTree/index.js')),
            FamImport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-modeling/modeling-classify/locale/index.js'),
                searchValue: '',
                treeHeight: '100%',
                defaultProps: {
                    label: 'displayName',
                    children: 'children'
                },
                defaultExpandedKeys: [],
                treeData: [],
                importVisible: false,
                exportVisible: false,
                requestConfig: {}
            };
        },
        watch: {
            searchValue(n) {
                this.$refs?.famTree?.$refs?.tree.filter(n);
            }
        },
        mounted() {
            if (this.$refs.header?.clientHeight) {
                this.treeHeight = `calc(100vh - ${this.$refs.header.clientHeight + 152}px`;
            }
            this.getTreeList();
        },
        methods: {
            getTreeList(oid) {
                this.$famHttp({
                    url: '/fam/classify/tree',
                    method: 'get',
                    headers: {
                        'App-Name': 'ALL'
                    }
                }).then((resp) => {
                    const { data } = resp;
                    this.treeData = data;
                    if (oid) {
                        let clickNode = null;
                        let expandedList = [];
                        const treeNode = function (tree, oid) {
                            tree.forEach((item) => {
                                if (item.oid === oid) {
                                    clickNode = item;
                                    expandedList.push(item.oid);
                                }
                                if (item.children && item.children.length) {
                                    treeNode(item.children, oid);
                                }
                            });
                        };
                        treeNode(this.treeData, oid);
                        this.expandedList = _.uniq(expandedList);
                        this.$nextTick(() => {
                            this.onCheck(clickNode);
                            this.$refs?.famTree?.$refs['tree'].setCurrentKey(oid);
                        });
                    } else {
                        this.$nextTick(() => {
                            const first = this.treeData.find((item) => item?.children?.length);
                            setTimeout(() => {
                                this.$refs?.famTree?.$refs?.tree?.setCurrentKey(this.treeData[0].oid);
                                this.$nextTick(() => {
                                    this.onCheck(this.treeData[0]);
                                    // document.querySelector(".el-tree-node__children").firstChild.click();
                                });
                            }, 300);
                        });
                    }
                });
            },
            onCheck(args) {
                this.$emit('node-click', args);
                // this.$emit('click', args, 'check');
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                const { displayName = '', code = '' } = data;
                const regExp = new RegExp(value, 'i');
                return regExp.test(displayName) || regExp.test(code);
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            onCreate(data, node) {
                this.$emit('click', data, 'create');
            },
            onEdit(data) {
                this.$emit('click', data, 'update');
            },
            onDelete(data) {
                const { oid } = data;
                this.$confirm('确认删除', '确认删除', {
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/classify/delete',
                        params: {
                            oid
                        },
                        method: 'DELETE'
                    })
                        .then((resp) => {
                            this.getTreeList();
                            this.$message({
                                type: 'success',
                                message: '删除成功',
                                showClose: true
                            });
                        })
                        .catch((error) => {});
                });
            },
            onSubmit() {},
            closeForm() {
                this.visible = false;
                this.oid = '';
                this.formData = {};
            },
            isApp(data) {
                return data?.idKey === 'erd.cloud.foundation.tenant.entity.Application';
            },
            onImport() {
                this.importVisible = true;
            },
            onExport() {
                this.requestConfig = {
                    headers: {
                        'App-Name': 'ALL'
                    }
                };
                this.exportVisible = true;
            },
            importSuccess() {
                this.getTreeList();
            },
            onExportBtn(data) {
                this.exportVisible = true;
                this.requestConfig = {
                    data: {
                        customParams: {
                            appName: data.typeName
                        }
                    }
                };
            }
        }
    };
});
