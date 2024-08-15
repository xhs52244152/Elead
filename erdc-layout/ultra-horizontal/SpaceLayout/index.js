/**
 * @description 对象空间布局
 */
define([
    'text!/erdc-layout/ultra-horizontal/SpaceLayout/index.html',
    'fam:store',
    'framework',
    'mfeHelper',
    'erdc-kit',
    'css!/erdc-layout/ultra-horizontal/SpaceLayout/index.css'
], function (template, store, { useApp }, mfeHelper) {
    const ErdcKit = require('erdc-kit');
    const vue = require('vue');
    const globalI18n = require('erdcloud.i18n');
    const router = require('erdcloud.router');
    const { stringToRegexpCompile } = require('mfeHelper');
    function execMenuHook(menus, spaceContext, spaceDetail, parentMenu) {
        function convertMenus(secondMenus) {
            return (secondMenus || []).map((i) => {
                let children = [];
                if (i.children && i.children.length) {
                    children = i.children.map((i) => {
                        let filler = i.href ? stringToRegexpCompile(i.href) : null;
                        const query = router.currentRoute.query || {};
                        delete query.title;
                        delete query.oid;
                        delete query.templateTitle;
                        let params = Object.assign({}, query, {
                            pid: spaceDetail.oid || ''
                        });
                        return {
                            ...i,
                            isTemplate: i.isTemplate === 'true',
                            readonly: i.readonly === 'true',
                            href: i.href ? ErdcKit.joinUrl(filler(params, { pretty: true }), params) : i.href
                        };
                    });
                }
                let filler = i.href ? stringToRegexpCompile(i.href) : null;
                const query = router.currentRoute.query || {};
                delete query.title;
                delete query.templateTitle;
                let params = Object.assign({}, query, {
                    pid: spaceDetail.oid || ''
                });
                return {
                    ...i,
                    href: i.href ? ErdcKit.joinUrl(filler(params, { pretty: true }), params) : i.href,
                    children: children
                };
            });
        }
        if (_.isFunction(useApp()?.$options?.layout?.space.resources)) {
            return Promise.resolve(
                useApp()?.$options?.layout?.space.resources(menus || [], spaceContext, spaceDetail, parentMenu)
            ).then((newSecondaryResources) => {
                newSecondaryResources = convertMenus(newSecondaryResources);
                store.commit('space/SET_SPACE_MENU', { object: spaceDetail, menus: newSecondaryResources });
                return newSecondaryResources;
            });
        } else {
            let newSecondaryResources = convertMenus(menus);
            store.commit('space/SET_SPACE_MENU', { object: spaceDetail, menus: newSecondaryResources });
            return Promise.resolve(newSecondaryResources);
        }
    }
    return {
        name: 'ObjectSpace',
        template,
        components: {
            FamSecondaryMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamSecondaryMenu/index.js')),
            FamThirdMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamThirdMenu/index.js')),
            LayoutSpaceSelect: ErdcKit.asyncComponent(
                '/erdc-layout/ultra-horizontal/components/LayoutSpaceSelect/index.js'
            )
        },
        data() {
            let spaceDetail = this.$store.state.space.objectMap[this.$route.query.pid] || {};
            let spaceContext = this.$store.state.space.contextMap[spaceDetail.containerRef] || {};
            let extendParams = Object.assign({}, this.$route.query);
            let currentRoute = this.$route;
            let listPage = useApp()?.$options?.layout?.space.listPage;
            if (listPage) {
                currentRoute = {
                    path: listPage
                };
            }
            let currentResourcePath = this.$store.getters['route/matchResourcePath'](currentRoute);
            let rootResource = currentResourcePath[1] || {};
            let typeName = this.$route.meta.typeName;
            if (_.isEmpty(typeName) && this.$route.query.pid) {
                typeName = this.$route.query.pid.split(':')[1];
            }
            return {
                i18nLocalePath: '/erdc-layout/ultra-horizontal/locale/index.js',
                spaceDetail,
                spaceContext,
                extendParams,
                rootResource: ErdcKit.deepClone(rootResource),
                typeName,
                routerViewKey: this._routerViewKey(),
                defaultComponent: 'LayoutSpaceSelect'
            };
        },
        computed: {
            secondaryResources() {
                return this.rootResource?.children || [];
            },
            readonly() {
                return _.isUndefined(this.$route.query.isTemplate)
                    ? !!store.state.space.object['templateInfo.tmplTemplated']
                    : !!this.$route.query.isTemplate === 'true';
            },
            cachedViews() {
                return this.$store.state.route?.cachedViews || [];
            },
            secondaryResource() {
                return this.$store.getters['route/matchResourcePath'](this.$route, this.rootResource)[1];
            },
            thirdResources() {
                return this.secondaryResource?.children || [];
            },
            showSecondaryMenu() {
                return this.secondaryResources.length && this.isMenuShows;
            },
            showThirdMenu() {
                return this.thirdResources.length > 0 && this.isMenuShows;
            },
            isMenuShows() {
                return this.$store.state.route.isMenuShows;
            },
            contentHeight() {
                let heightDiff = 40;
                heightDiff += this.showSecondaryMenu ? 40 : 0;
                heightDiff += this.showThirdMenu ? 40 : 0;
                return `calc(100vh - ${heightDiff}px)`;
            }
        },
        watch: {
            $route: function () {
                if (this.$route.query.hideMenu && this.$route.query.hideMenu !== 'true') {
                    this.$store.dispatch('route/hideMenus');
                } else {
                    this.$store.dispatch('route/showMenus');
                }
                if (
                    this.$route.matched[1] &&
                    this.$route.matched[1].name === 'space' &&
                    this.spaceDetail.oid === this.$route.query.pid
                ) {
                    this.routerViewKey = this._routerViewKey();
                }
            }
        },
        created() {
            this.setTargetRouteTitle(this.$route);
            if (_.isFunction(useApp()?.$options?.layout?.space.injectSpace)) {
                Promise.resolve(useApp()?.$options?.layout?.space.injectSpace()).then((res) => {
                    if (res) {
                        this.defaultComponent = res.componentName;
                    }
                });
            }
        },
        beforeRouteEnter(to, from, next) {
            let { pid: objectOid, typeOid } = to.query;
            if (!objectOid) {
                objectOid = to.params.pid;
            }
            if (objectOid) {
                const loadingIns = vue.prototype.$loading({
                    text: globalI18n.translate('loading'),
                    target: document.querySelector('.object-common-space') || document.body
                });
                store
                    .dispatch('space/switchContextByObject', { objectOid, typeOid })
                    .then(() => {
                        next((vm) => {
                            setTimeout(function () {
                                vm.setTargetRouteTitle(to).then(() => {
                                    loadingIns.close();
                                });
                            }, 500);
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                        loadingIns.close();
                        next('/');
                    });
            } else {
                next();
            }
        },
        beforeRouteUpdate(to, from, next) {
            let { pid: objectOid, typeOid } = to.query;
            let { pid: oldObjectOid } = from.query;
            if (!objectOid) {
                objectOid = to.params.pid;
            }
            if (!oldObjectOid) {
                oldObjectOid = from.params.pid;
            }
            if (objectOid !== oldObjectOid && objectOid) {
                const loadingIns = vue.prototype.$loading({
                    text: globalI18n.translate('loading'),
                    target: document.querySelector('.object-common-space') || document.body
                });
                store
                    .dispatch('space/switchContextByObject', { objectOid, typeOid })
                    .then(() => {
                        this.setTargetRouteTitle(to).then(() => {
                            loadingIns.close();
                            next();
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                        loadingIns.close();
                        next('/');
                    });
            } else {
                this.setTargetRouteTitle(to).then(() => {
                    next();
                });
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
            gotoObjectList(replace) {
                let listPage = useApp()?.$options?.layout?.space.listPage;
                if (_.isFunction(useApp()?.$options?.layout?.space.gotoObjectList)) {
                    useApp()?.$options?.layout?.space.gotoObjectList(listPage);
                } else if (listPage) {
                    if (JSON.parse(this.readonly)) {
                        ErdcKit.open('biz-template/template/objectTemplate', {
                            appName: 'erdc-bizadmin-web'
                        });
                    } else {
                        this.$router.push({
                            path: useApp()?.$options?.layout?.space.listPage,
                            replace
                        });
                    }
                }
            },
            setTargetRouteTitle(targetRoute) {
                let currentRoute = targetRoute;
                let listPage = useApp()?.$options?.layout?.space.listPage;
                if (listPage) {
                    currentRoute = {
                        path: listPage
                    };
                }

                let currentResourcePath = store.getters['route/matchResourcePath'](currentRoute);
                let rootResource = currentResourcePath[1] || {};
                rootResource = ErdcKit.deepClone(rootResource);
                // 这里的spaceDetail不是computed的那个spaceDetail,因为切换路由，新的spaceDetail还没有生成
                let spaceDetail = store.state.space.objectMap[targetRoute.query.pid] || {};
                let spaceContext = store.state.space.contextMap[spaceDetail.containerRef] || {};
                return execMenuHook(rootResource?.children, spaceContext, spaceDetail, rootResource).then(
                    (newSecondaryResources) => {
                        rootResource.children = newSecondaryResources;
                        let targetRouteConfig = store.getters['route/matchResourcePath'](targetRoute, rootResource).at(
                            -1
                        );

                        this.rootResource = {
                            ...rootResource
                        };

                        if (_.isFunction(targetRoute.meta.title)) {
                            return Promise.resolve(
                                targetRoute.meta.title(targetRoute, targetRouteConfig, rootResource)
                            );
                        } else {
                            let languages = globalI18n.languages();
                            let titleI18nJson = {};
                            languages.forEach((i) => {
                                let titleArray = [
                                    ErdcKit.translateI18n(rootResource?.nameI18nJson || rootResource.displayName)
                                ];
                                titleArray.push(ErdcKit.translateI18n(spaceDetail?.nameI18nJson || spaceDetail.name));
                                if (targetRouteConfig && targetRouteConfig.displayName) {
                                    titleArray.push(
                                        ErdcKit.translateI18n(
                                            targetRouteConfig?.nameI18nJson || targetRouteConfig.displayName
                                        )
                                    );
                                }
                                if (typeof targetRoute.meta.title === 'string') {
                                    titleArray.push(targetRoute.meta.title);
                                }
                                titleI18nJson[i.language] = titleArray.join('-');
                            });
                            targetRoute.meta.titleI18nJson = titleI18nJson;
                        }
                    }
                );
            },
            onObjectChange(params) {
                const { spaceOid, spaceObject } = params;
                if (spaceOid && spaceOid !== this.spaceDetail.oid) {
                    let paths = store.getters['route/matchResourcePath'](this.$route);
                    let newPath = this.$route.path;
                    if (paths.length) {
                        newPath = paths[paths.length - 1].href;
                    }
                    if (_.isFunction(useApp()?.$options?.layout?.space.spaceChange)) {
                        useApp().$options.layout.space.spaceChange(newPath, spaceOid, spaceObject);
                    } else {
                        this.$router.push({
                            path: newPath,
                            query: {
                                pid: spaceOid,
                                isTemplate: this.readonly
                            }
                        });
                    }
                }
            }
        }
    };
});
