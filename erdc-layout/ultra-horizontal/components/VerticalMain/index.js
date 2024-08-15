define(['erdcloud.kit', 'css!/erdc-layout/ultra-horizontal/style/index.css'], function () {
    const ErdcloudKit = require('erdcloud.kit');
    const mfeHelper = require('mfeHelper');

    return {
        name: 'VerticalMain',
        /*html*/
        template: `
            <div class="fam-main"
                :class="{ 'fam-main--collapsed': collapsed }"
            >
                <div 
                    v-if="secondaryMenuType !== 'horizontal'"
                    class="fam-main__left"
                    :class="{ 'fam-main__left--collapsed': collapsed }"
                >
                    <FamSideMenu
                        ref="menu"
                        :resources="resources"
                        :collapsed.sync="collapsed"
                        :current-root="currentRoot"
                        :default-active="defaultActive"
                        :showChildren="showSecondary"
                        @routeTo="routeTo"
                    ></FamSideMenu>
                </div>
                <div :class="{
                    'fam-main__right': true,
                    'fam-main__right--full-width': secondaryMenuType === 'horizontal'
                }">
                    <FamThirdMenu v-if="showThirdMenu"></FamThirdMenu>
                    <div 
                        class="fam-main__right-content flex flex-column m-normal bg-white" 
                        :class="{ 'fam-main__right-content--include-margin': secondaryMenuType !== 'horizontal' }"
                     >
                     <keep-alive :include="cachedViews" >
                       <router-view :key="routerViewKey"></router-view>
                     </keep-alive>
                    </div>
                </div>
            </div>
        `,
        components: {
            FamSideMenu: ErdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamMenu/FamSideMenu/index.js')),
            FamThirdMenu: ErdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamThirdMenu/index.js'))
        },
        props: {
            secondaryMenuType: String
            // showSecondaryMenu: Boolean
        },
        data() {
            return {
                collapsed: false,
                defaultActive: null,
                routerViewKey: this._routerViewKey()
            };
        },
        computed: {
            cachedViews() {
                return this.$store.state.route?.cachedViews || [];
            },
            showSecondaryMenu() {
                return this.secondaryResources.length;
            },
            rootResource() {
                return this.$store.state.route.resources;
            },
            // secondaryResource() {
            //     return this.$store.getters['route/matchResource'](this.secondaryRoute);
            // },
            secondaryResources() {
                return this.rootResource?.children || [];
            },
            // route() {
            //     return this.$route;
            // },
            currentRoot() {
                return this.$store.state.route.resources || {};
            },
            currentResourcePath() {
                return this.$store.getters['route/matchResourcePath'](this.$route);
            },
            // secondaryRoute() {
            //     return this.currentResourcePath[1] || {};
            // },
            resources() {
                return this.currentRoot.children || [];
            },
            secondaryResource() {
                return this.currentResourcePath[1] || {};
            },
            hideSubMenus() {
                return this.$route.meta.hideSubMenus === undefined
                    ? this.rootRoute?.meta?.hideSubMenus
                    : this.$route.meta.hideSubMenus;
            },
            showSecondary() {
                return this.showSecondaryMenu && !this.hideSubMenus;
            },
            rootCollapsed() {
                return this.$store.state.layout.collapsed;
            },
            showThirdMenu() {
                return (
                    ![this.secondaryResource.identifierNo, this.secondaryResource.href].some((i) =>
                        this.hideResourceChildren?.includes(i)
                    ) && this.thirdResources.length > 0
                );
            },
            thirdResources() {
                return this.secondaryResource?.children || [];
            },
            space() {
                return require('ErdcApp').useApp()?.$options?.layout?.space;
            },
            listPage() {
                return this.space?.listPage;
            },
            hideResourceChildren() {
                return [this.listPage].filter(Boolean);
            }
        },
        watch: {
            $route: function () {
                if (this.$route.matched[1] && this.$route.matched[1]?.name === 'root') {
                    this.routerViewKey = this._routerViewKey();
                }
            },
            secondaryResource: {
                immediate: true,
                handler(secondaryResource) {
                    this.defaultActive = secondaryResource.href;
                }
            }
        },
        methods: {
            _routerViewKey() {
                if (_.isFunction(this.$route.matched[2]?.meta.keepAliveRouteKey)) {
                    return this.$route.matched[2]?.meta.keepAliveRouteKey(this.$route);
                } else if (this.$route.matched[2]) {
                    let filler = mfeHelper.stringToRegexpCompile(this.$route.matched[2].path);
                    return filler(this.$route.params, { pretty: true });
                } else {
                    return this.routerViewKey;
                }
            },
            routeTo(href, resource) {
                let input = document.createElement('input');
                input.style.display = 'none';
                document.body.appendChild(input);
                input.focus();
                this.defaultActive = null;
                this.$nextTick(() => {
                    input.remove();
                    input = null;
                    this.$refs.menu.$el.querySelectorAll('.el-menu-item.is-active').forEach(($item) => {
                        $item.classList.remove('is-active');
                    });
                    this.defaultActive = this.secondaryResource?.href;
                    if (resource.target === 'link') {
                        if (/^(http|https|ftp)/.test(href)) {
                            window.open(href, '_blank');
                        } else {
                            const matchedRoute = this.$router.resolve(href);
                            window.open(matchedRoute.href, resource.identifierNo);
                        }
                    } else {
                        this.$router.push(href);
                    }
                    this.$forceUpdate();
                });
            }
        }
    };
});
