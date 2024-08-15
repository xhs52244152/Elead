define([
    'text!' + ELMP.resource('supplier-components/SupplierSpace/index.html'),
    'css!' + ELMP.resource('supplier-components/SupplierSpace/index.css'),
    'fam:store',
    'erdc-kit'
], function (template) {
    const FamStore = require('fam:store');
    const ErdcKit = require('erdc-kit');

    return {
        name: 'SupplierSpace',
        template,
        components: {
            FamSecondaryMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamSecondaryMenu/index.js')),
            FamThirdMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamThirdMenu/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('supplier-components/SupplierSpace/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['查看全部供应商', '业务管理-供应商模板']),
                // 当前对象oid
                objectOid: this.$route.params.pid
            };
        },
        computed: {
            title() {
                const titleArray = [this.rootResource.displayName];
                if (this?.$route?.query?.title) {
                    titleArray.push(this?.$route?.query?.title);
                }
                if (this.currentResource && this.currentResource.displayName) {
                    titleArray.push(this.currentResource.displayName);
                }
                return titleArray.join('-');
            },
            rootRoute() {
                return this.$route.matched[1];
            },
            secondaryRoute() {
                return this.$route.matched[2];
            },
            rootResource() {
                return this.$store.getters['route/matchResource'](this.rootRoute);
            },
            secondaryResource() {
                return this.$store.getters['route/matchResourcePath'](
                    this.secondaryRoute,
                    this.rootResource?.children
                ).at(-1);
            },
            currentResource() {
                return this.$store.getters['route/matchResourcePath'](this.$route, this.rootResource.children).at(-1);
            },
            secondaryResources() {
                return this.rootResource?.children || [];
            },
            thirdResources() {
                return this.secondaryResource?.children || [];
            },
            showSecondaryMenu() {
                return !this.hideSubMenus;
            },
            showThirdMenu() {
                return this.thirdResources.length > 0 && !this.hideSubMenus;
            },
            hideSubMenus() {
                return this.$route.meta.hideSubMenus;
            },
            contentHeight() {
                let heightDiff = 40;
                heightDiff += this.showSecondaryMenu ? 40 : 0;
                heightDiff += this.showThirdMenu ? 40 : 0;
                return `calc(100vh - ${heightDiff}px)`;
            },
            routeName() {
                return this.$route.matched[this.$route.matched.length - 1]?.name;
            }
        },
        watch: {
            objectOid: {
                immediate: true,
                handler(objectOid) {
                    objectOid && this.enterSpace(objectOid);
                }
            }
        },
        beforeRouteEnter(to, from, next) {
            const resource = FamStore.getters['route/matchResource'](to);
            const resources = resource?.children || [];
            if (resources.length && resource.oid !== resources[0].oid) {
                next({
                    path: resources[0].href.replace(/\${(\S+)}/, to.params.pid),
                    params: {
                        ...to.params
                    },
                    query: {
                        ...to.query
                    },
                    replace: true
                });
            } else {
                next();
            }
        },
        beforeRouteUpdate(to, from, next) {
            // 空间内导航
            if (/\${(\S+)}/.test(to.path) && this.objectOid) {
                this.enterSpace(this.objectOid, {
                    ...to,
                    replace: true
                });
            } else {
                this.objectOid = to.params.pid;
                next();
            }
        },
        methods: {
            handleRoute(key) {
                const resource = this.secondaryResources?.find((resource) => resource.identifierNo === key);
                this.$router.push({
                    path: resource.href,
                    params: {
                        ...this.$route.params
                    },
                    query: {
                        ...this.$route.query
                    }
                });
            },
            /**
             * 进入对象空间
             * @param { string }objectOid
             * @param {{params: {}}} route - 指定页面和参数
             */
            enterSpace(objectOid, route = {}) {
                if (!route.name && !route.path) {
                    route = this.$route;
                }
                if (!objectOid || objectOid === `\${pid}`) {
                    return;
                }
                if (objectOid === this.$route.params.pid && this.$route.matched.at(-1)?.path === route.path) {
                    return this.$set(this.$route.params, 'title', this.title);
                }
                this.$router
                    .push({
                        ...route,
                        params: {
                            ...route.params,
                            pid: objectOid,
                            containerRef: this?.$store?.state?.app?.container?.oid,
                            title: ''
                        },
                        query: {
                            ...route.query
                        }
                    })
                    .then(() => {
                        this.$set(this.$route.params, 'title', this.title);
                    });
            }
        }
    };
});
