define([
    'text!' + ELMP.resource('erdc-components/FamRoleTree/index.html'),
    'erdc-kit',
    ELMP.resource('erdc-components/FamTree/index.js'),
    'css!' + ELMP.resource('erdc-components/FamRoleTree/style.css')
], function (template, ErdcKit, FamTree) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            ResizableContainer: FamKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            FamTree
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
                listData: [],
                defaultProps: {
                    children: 'childList',
                    label: 'name',
                    isLeaf: 'leaf'
                },
                loading: false,
                searchVal: '',
                debounceTimer: null,
                treeHeight: '100%',
                defaultCheckedKeys: [],
                defaultExpandedKeys: [],
                current: ''
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
            }
        },
        mounted() {
            this.getTree();
        },
        methods: {
            nodeClick(data, node) {
                this.$set(data, 'show', false);
                this.$emit('select', data, node);
            },
            mouseenter(data) {
                this.$set(data, 'show', true);
            },
            mouseleave(data) {
                this.$set(data, 'show', false);
            },
            getTree: function (current, appName = 'ALL') {
                this.loading = true;
                this.$famHttp({
                    url: '/fam/role/type',
                    headers: {
                        'App-Name': appName
                    }
                })
                    .then((resp) => {
                        this.listData = resp.data || [];
                        this.initIcons(this.listData);
                        this.listData.forEach((ite) => {
                            if (ite.childList && ite.childList.length) {
                                ite.appNameKey = ite.appName + '-' + ite.key;
                                ite.childList.forEach((item) => {
                                    item.appNameKey = item.appName + '-' + item.key;
                                });
                            }
                        });
                        this.$nextTick(() => {
                            if (this.listData && this.listData.length) {
                                this.defaultExpandedKeys.push(this.listData[0].appNameKey);
                                if (current) {
                                    this.listData.forEach((ite) => {
                                        if (ite.childList && ite.childList.length) {
                                            ite.childList.forEach((item) => {
                                                if (item.appNameKey === current) {
                                                    this.defaultExpandedKeys.push(ite.appNameKey);
                                                }
                                            });
                                        }
                                    });
                                }
                                setTimeout(() => {
                                    if (current) {
                                        this.current = current;
                                        this.$refs['FamTree']?.$refs.tree?.setCurrentKey(current);
                                    } else {
                                        document.querySelector('.el-tree-node__content').click();
                                        this.$refs['FamTree']?.$refs.tree?.setCurrentKey(this.listData[0].appNameKey);
                                    }
                                    this.$nextTick(() => {
                                        const selectNode = this.$refs.FamTree.getNode(current || resp.data[0]);
                                        this.$emit('select', selectNode.data, selectNode);
                                    });
                                }, 200);
                            }
                        });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            onSearch() {
                this.$refs.FamTree.$refs.tree?.filter(this.searchVal);
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.name?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            initIcons(applications) {
                if (applications) {
                    applications.forEach((app) => {
                        app.icon && (app.icon = ErdcKit.imgUrlCreator(app.icon));
                    });
                }
            },
            isApplication(data) {
                return data.idKey === this.$store.getters.className('Application');
            }
        }
    };
});
