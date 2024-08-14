define([
    'text!' + ELMP.resource('ppm-component/ppm-components/SystemDefineTree/index.html'),
    'css!' + ELMP.resource('ppm-component/ppm-components/SystemDefineTree/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            className: {
                type: String
            },
            moreOption: {
                type: false
            },
            // 标题
            title: {
                type: String,
                default: () => {
                    return '产品信息';
                }
            },
            checkedKey: {
                type: String,
                default: () => ''
            },
            treeUrl: {
                type: String,
                default: () => '/cbb/listAllTree'
            },
            // 树 icon操作
            buttons: {
                type: Array,
                default: () => {
                    return [
                        {
                            displayName: '创建',
                            type: 'primary',
                            icon: 'erd-iconfont erd-icon-add-document fontSize18',
                            methodsName: 'handleCreate'
                        },
                        {
                            displayName: '编辑',
                            type: 'primary',
                            icon: 'erd-iconfont erd-icon-edit3 fontSize18',
                            methodsName: 'handleEdit'
                        }
                        // {
                        //     displayName: '删除',
                        //     type: 'primary',
                        //     icon: 'erd-iconfont erd-icon-delete fontSize18',
                        //     methodsName: 'handleDelete'
                        // },
                        // {
                        //     displayName: '移动',
                        //     type: 'primary',
                        //     icon: 'erd-iconfont erd-icon-move fontSize18',
                        //     methodsName: 'handleMove'
                        // },
                        // {
                        //     displayName: '失效',
                        //     type: 'primary',
                        //     icon: 'erd-iconfont erd-icon-unlink fontSize18',
                        //     methodsName: 'handleEfficacy'
                        // }
                    ];
                }
            },
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
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/SystemDefineTree/locale/index.js'),
                i18nMappingObj: {
                    searchKeyword: this.getI18nByKey('请输入'),
                    create: this.getI18nByKey('创建'),
                    attrdef: this.getI18nByKey('创建特征定义')
                },
                treeHeight: '100%',
                typeName: '',
                treeData: [
                    // {
                    //     name: '属性定义集合',
                    //     leaf: 'true',
                    //     childList: []
                    // }
                ],
                searchValue: '',
                defaultProps: {
                    children: 'childList',
                    label: 'name',
                    isLeaf: 'leaf',
                    disabled: function (data) {
                        return data.level == '0';
                    }
                },
                basicInforConfigVisible: false,
                defaultCheckedKeys: [],
                defaultExpandedKeys: [],
                clickNode: {}
            };
        },
        watch: {
            searchValue(n) {
                this.$refs.tree.filter(n);
            },
            checkedKey(newVal) {
                if (newVal) {
                    this.$nextTick(() => {
                        this.getListTree(newVal);
                    });
                }
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
            }
        },
        mounted() {
            if (this.$refs.header.clientHeight) {
                this.treeHeight = `calc(100vh - 203px)`;
            }
            this.$nextTick(() => {
                this.getListTree(this.checkedKey);
            });
        },
        methods: {
            handleCommand(type, val) {
                this.$emit('operate-click', { methodsName: type }, val);
            },
            getListTree(oid) {
                console.log('oid===>:', oid);
                this.searchValue = '';
                this.$famHttp({
                    url: this.treeUrl,
                    method: 'get',
                    params: {
                        className: this.className
                    }
                }).then((res) => {
                    this.treeData = res.data || [];

                    if (oid) {
                        let clickNode = null;
                        let expandedList = [];
                        // eslint-disable-next-line no-inner-declarations
                        function treeNode(tree, oid) {
                            tree.forEach((item) => {
                                if (item.oid === oid) {
                                    clickNode = item;
                                    expandedList.push(item.oid);
                                }
                                if (item.childList && item.childList.length) {
                                    treeNode(item.childList, oid);
                                }
                            });
                        }
                        treeNode(this.treeData, oid);
                        this.defaultExpandedKeys = _.uniq(expandedList);

                        this.defaultCheckedKeys = [clickNode.key];
                        this.$nextTick(() => {
                            this.onCheck(clickNode || this.clickNode, 'TypeManageDetail');
                            this.$refs['tree'].setCurrentKey(oid);
                        });
                    } else {
                        this.$nextTick(() => {
                            // 首次进入默认选中第一个，样式没有高亮显示
                            // this.onNodeClick(this.tree[0], 'TypeManageDetail');
                            // this.$refs['tree'].setCurrentKey(this.tree[0].id);                            // 首次进入默认选中第一个，样式高亮显示

                            const firstNode = document.querySelector('.el-tree-node');
                            firstNode.click();
                            this.onCheck(this.treeData[0] || [], 'TypeManageDetail');
                            // this.$nextTick(() => {
                            //     this.onCheck(this.treeData, 'TypeManageDetail');
                            // });
                        });
                    }
                });
            },
            handleClick(type, data) {
                this.$emit('operate-click', type, data);
            },
            handleCreate() {
                this.$emit('operate-click', { methodsName: 'handleCreate' });
            },
            onCheck(...args) {
                if (args[0].oid) {
                    this.$emit('node-type-click', ...args);
                }
            },
            search() {},
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.name?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            // 保存属性定义成更后的回调
            onSubmit() {
                this.getListTree();
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            }
        },
        components: {
            FamTypeButtons: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/FamTypeButtons/index.js'))
        }
    };
});
