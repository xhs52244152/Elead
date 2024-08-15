define([
    'text!' + ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/LeftBoxTabs/index.html'),
    'css!' + ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/LeftBoxTabs/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            FamSideMenu: (apply) =>
                require([ELMP.resource('erdc-components/FamMenu/FamSideMenu/index.js')], (module) => apply(module))
        },
        props: {
            maxHeight: Number,
            selectNodeKey: {
                type: [String, Number],
                default: ''
            },
            menuTreeData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            activeTab: {
                type: String,
                default: 'role'
            }
        },
        data() {
            return {
                tabList: [],
                searchValue: '',
                treeProps: {
                    children: 'childList',
                    label: 'displayName',
                    isLeaf: 'leaf'
                },
                currentTab: 'role'
            };
        },
        created() {},
        computed: {
            treeHeight() {
                return this.maxHeight ? `${this.maxHeight - 100}px` : '100%';
            }
        },
        watch: {
            activeTab(val) {
                this.currentTab = val;
            },
            selectNodeKey: {
                immediate: true,
                handler(val) {
                    val && this.setSelectedNode();
                }
            }
        },
        mounted() {
            this.generateTabList();
        },
        methods: {
            setSelectedNode() {
                this.$nextTick(() => {
                    this.$refs.menuTree.setCurrentKey(this.selectNodeKey);
                });
            },
            generateTabList() {
                this.tabList = [
                    {
                        label: '角色',
                        name: 'role'
                    },
                    {
                        label: '功能操作',
                        name: 'operation'
                    }
                ];
            },
            handlerTabChange(tab) {
                this.$emit('handler-tab-change', tab.name);
            },
            onKeywordChange(keyword) {
                return this.$refs.menuTree.filter(keyword);
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.displayName?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            handleNodeClick(data) {
                if (data.level === 1) {
                    return; // 如果节点为第一层，则不执行点击事件
                }
                this.$emit('handle-node-click', data);
            }
        }
    };
});
