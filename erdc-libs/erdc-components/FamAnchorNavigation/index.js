define([
    'text!' + ELMP.resource('erdc-components/FamAnchorNavigation/index.html'),
    'css!' + ELMP.resource('erdc-components/FamAnchorNavigation/style.css')
], function (template) {
    return {
        template,
        props: {
            panelConfig: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 是否显示tab页
            navigationView: {
                type: Boolean,
                default: true
            },
            // 是否保持tab显示状态
            continueShow: {
                type: Boolean,
                default: false
            }
        },
        components: {},
        data() {
            return {
                unfold: true,
                innerPanelConfig: [],
                height: '100%',
                selectTab: '',
                viewTop: false
            };
        },
        computed: {
            tabPanelConfig() {
                return this.innerPanelConfig.filter((item) => item.isTopTransitionTab && item.isShow);
            },
            innerHoldView() {
                return this.continueShow || (this.navigationView && this.viewTop);
            }
        },
        watch: {
            panelConfig: {
                deep: true,
                immediate: true,
                handler(newVal) {
                    this.innerPanelConfig = newVal || [];
                }
            }
        },
        mounted() {
            window.addEventListener('mousewheel', this.handleScroll, true);
        },
        beforeDestroy() {
            window.removeEventListener('mousewheel', this.handleScroll, true);
        },
        methods: {
            tabClick() {
                this.$nextTick(() => {
                    const topRef = this.$refs?.[this.selectTab]?.[0]?.$el;
                    const $offsetParent = topRef?.parentElement?.parentElement;
                    const offsetHeight = this.$refs?.innerHoldView?.$el?.offsetHeight || 40;
                    if (topRef) {
                        $offsetParent.scrollTop = topRef.offsetTop - offsetHeight;
                    }
                })
            },
            handleScroll: _.debounce(function () {
                this.innerPanelConfig.forEach((item) => {
                    const $top = this.$refs?.[item?.fileId]?.[0]?.$el;
                    setTimeout(() => {
                        // 当前节点的父节点
                        const $offsetParent = $top?.parentElement?.parentElement;
                        // 父节点滚动偏移
                        const parentScrollTop = $offsetParent?.scrollTop;
                        // 子节点距离顶部的偏移量
                        const offsetTop = $top?.offsetTop || 0;
                        // 子节点的高度
                        const clientHeight = $top?.clientHeight || 0;

                        if (item.dynamicRender) {
                            this.$set(item, 'isShow', parentScrollTop > offsetTop);
                        } else {
                            this.$set(item, 'isShow', true);
                        }
                        this.viewTop = parentScrollTop !== undefined ? parentScrollTop > 0 : this.viewTop;
                        if (offsetTop < parentScrollTop && offsetTop + clientHeight > parentScrollTop) {
                            this.selectTab = item.isTopTransitionTab ? item.fileId : this.selectTab;
                        }
                    }, 10);
                });
            }, 300)
        }
    };
});
