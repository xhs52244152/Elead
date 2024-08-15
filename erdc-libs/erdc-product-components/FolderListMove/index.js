define([
    'text!' + ELMP.resource('erdc-product-components/FolderListMove/index.html'),
    'erdcloud.kit',
    'TreeUtil'
], function(template) {
    const ErdcKit = require('erdcloud.kit');
    const TreeUtil = require('TreeUtil');

    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // 上下文
            containerRef: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // 文件夹
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // 列表数据
            rowData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-product-components/FolderListMove/locale/index.js'),
                tableData: [],
                loading: false,
                containerRow: {
                    componentName: 'virtual-select',
                    viewProperty: 'displayName',
                    valueProperty: 'oid',
                    requestConfig: {
                        url: '/fam/listByKey',
                        method: 'get',
                        params: {
                            className: 'erd.cloud.foundation.core.container.entity.ScalableContainer'
                        }
                    }
                },
                treeProps: {
                    children: 'childList',
                    label: 'displayName',
                    value: 'oid',
                    checkStrictly: true,
                    emitPath: false
                }
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            }
        },
        watch: {
            rowData: {
                immediate: true,
                handler(val) {
                    this.tableData = ErdcKit.deepClone(val) || [];
                }
            }
        },
        created() {
            this.initFolderInfo();
        },
        methods: {
            // 获取文件所在位置
            getListTree(containerRef) {
                return this.$famHttp({
                    url: '/fam/listAllTree',
                    method: 'get',
                    data: {
                        className: this.$store.getters.className('subFolder'),
                        containerRef: containerRef || this.containerRef
                    }
                });
            },
            initFolderInfo() {
                this.getListTree().then((resp) => {
                    const treeData = resp.data || [];
                    const target = TreeUtil.getNode(treeData, {
                        childrenField: 'childList',
                        target: { oid: this.oid },
                        isSome: true
                    });
                    target && (target.disabled = true);
                    _.each(this.tableData, row => {
                        this.$set(row, 'folderRefName', target?.displayName);
                        this.$set(row, 'treeData', treeData);
                    });
                });
            },
            newContainerRefChange: _.debounce(function(row, value, obj) {
                this.$set(row, 'newContainerName', obj?.displayName || '');
                this.$set(row, 'newFolderRef', '');
                this.$set(row, 'newFolderRefName', '');
                this.getListTree(row.newContainerRef).then((resp) => {
                    const treeData = resp.data || [];
                    const target = TreeUtil.getNode(treeData, {
                        childrenField: 'childList',
                        target: { oid: this.oid },
                        isSome: true
                    });
                    target && (target.disabled = true);
                    this.$set(row, 'treeData', treeData);
                });
            }, 0, 100),
            newFolderRefChange(row) {
                const obj = this.$refs.newFolderRef.getCheckedNodes() || [];
                this.$set(row, 'newFolderRefName', obj[0]?.label);
            },
            onSubmit() {
                let valid = true;
                const data = _.reduce(this.tableData, (result, item) => {
                    const { oid, newContainerRef, newFolderRef } = item;
                    const newContainer = newContainerRef || this.containerRef || '';
                    const newFolder = newFolderRef || '';
                    if (valid && !newFolderRef) {
                        valid = false;
                    }
                    result.push({
                        memberList: [oid],
                        newContainerId: newContainer.split(':')?.[2],
                        newContainerKey: newContainer.split(':')?.[1],
                        newFolderId: newFolder.split(':')?.[2],
                        newFolderKey: newFolder.split(':')?.[1]
                    });
                    return result;
                }, []);
                if (!valid) {
                    return this.$message.error(this.i18n.folderTips);
                }
                this.$famHttp({
                    url: '/fam/folder/batchMoveObjectContainer',
                    method: 'POST',
                    data
                }).then(resp => {
                    if (resp.success) {
                        this.$message.success(this.i18n.movedSuccess);
                        this.innerVisible = false;
                        this.$emit('onsubmit', this.oid);
                    } else {
                        this.$message.error(resp.message);
                    }
                });
            },
            onCancel() {
                this.$emit('update:visible', false);
            }
        }
    };
});
