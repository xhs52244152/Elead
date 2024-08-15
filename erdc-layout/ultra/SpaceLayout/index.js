define([
    'text!/erdc-layout/ultra/SpaceLayout/template.html',
    'erdcloud.store',
    'erdcloud.router',
    'framework',
    'mfeHelper',
    'css!/erdc-layout/ultra/style/index.css'
], function (template) {
    const { ref, computed, nextTick } = require('vue');
    const Vue = require('vue');
    const store = require('erdcloud.store');
    const router = require('erdcloud.router');
    const { useApp } = require('framework');
    const ErdcKit = require('erdc-kit');
    const i18n = require('erdcloud.i18n');
    const { stringToRegexpCompile } = require('mfeHelper');

    const execMenuHook = (menus, spaceContext, spaceDetail, parentMenu) => {
        const convertMenus = (secondMenus) => {
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
        };

        const resources = useApp()?.$options?.layout?.space?.resources;
        if (typeof resources === 'function') {
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
    };

    const getRootResource = () => {
        const listPage = useApp()?.$options?.layout?.space?.listPage;
        let currentRoute = router.currentRoute;
        if (listPage) {
            currentRoute = {
                path: listPage
            };
        }
        return ErdcKit.deepClone(store.getters['route/matchResourcePath'](currentRoute)?.[1] || {});
    };

    const getRouterViewKey = (routerViewKey) => {
        const { currentRoute } = router;
        if (currentRoute.matched[2]?.meta?.keepAliveRouteKey) {
            return currentRoute.matched[2]?.meta?.keepAliveRouteKey(currentRoute);
        }
        if (currentRoute.matched[2]) {
            const filler = stringToRegexpCompile(currentRoute.matched[2].path);
            return filler(currentRoute.params, { pretty: true });
        }
        return routerViewKey?.value || null;
    };

    const getSpaceDetail = () => {
        return store.state.space.objectMap[router.currentRoute.query.pid] || {};
    };
    const getSpaceContext = (spaceDetail) => {
        return store.state.space.contextMap[spaceDetail.containerRef];
    };

    return {
        setup() {
            const collapsed = ref(false);
            const rootResource = ref(getRootResource());
            const currentActiveRoutePath = ref(null);

            const menuRef = ref(null);
            const routerViewKey = ref(getRouterViewKey(null));
            const spaceDetail = ref(getSpaceDetail());
            const spaceContext = ref(getSpaceContext(spaceDetail.value));
            const spaceSelectComponent = ref('LayoutSpaceSelect');

            const secondaryResources = computed(() => rootResource.value.children);
            const cachedViews = computed(() => {
                return store.state.route.cachedViews || [];
            });
            const typeName = computed(() => {
                if (router.currentRoute.meta.typeName) {
                    return router.currentRoute.meta.typeName;
                }
                if (router.currentRoute.query.pid) {
                    return router.currentRoute.query.pid.split(':')[1];
                }
                return null;
            });
            const extendParams = computed(() => {
                return Object.assign({}, router.currentRoute.query);
            });
            const readonly = computed(() => {
                return _.isUndefined(extendParams.value.isTemplate)
                    ? !!store.state.space.object['templateInfo.tmplTemplated']
                    : !!extendParams.value.isTemplate;
            });
            const showMenu = computed(() => store.state.route.isMenuShows);

            const routeTo = (href, resource) => {
                let input = document.createElement('input');
                input.style.display = 'none';
                document.body.appendChild(input);
                input.focus();
                currentActiveRoutePath.value = null;
                nextTick(() => {
                    input.remove();
                    input = null;
                    menuRef.value.$el.querySelectorAll('.el-menu-item.is-active').forEach(($item) => {
                        $item.classList.remove('is-active');
                    });
                    currentActiveRoutePath.value = resource.identifierNo;
                    router.push(href);
                });

                if (resource.target === 'link') {
                    if (/^(http|https|ftp)/.test(href)) {
                        window.open(href, '_blank');
                    } else {
                        const matchedRoute = router.resolve(href);
                        window.open(matchedRoute.href, resource.identifierNo);
                    }
                } else {
                    router.push(href);
                }
            };

            const handleSpaceChange = (params) => {
                const { spaceOid, spaceObject } = params;
                if (spaceOid && spaceOid !== spaceDetail.value.oid) {
                    let paths = store.getters['route/matchResourcePath'](router.currentRoute);
                    let newPath = router.currentRoute.path;
                    if (paths.length > 1) {
                        newPath = paths[paths.length - 1].href;
                    }
                    const spaceChange = useApp()?.$options?.layout?.space?.spaceChange;
                    if (typeof spaceChange === 'function') {
                        spaceChange(newPath, spaceOid, spaceObject);
                    } else {
                        router.push({
                            path: newPath,
                            query: {
                                pid: spaceOid,
                                isTemplate: readonly.value
                            }
                        });
                    }
                }
            };
            const gotoListPage = (replace) => {
                const listPage = useApp()?.$options?.layout?.space.listPage;
                const gotoObjectList = useApp()?.$options?.layout?.space.gotoObjectList;
                if (typeof gotoObjectList === 'function') {
                    gotoObjectList(listPage);
                } else if (listPage) {
                    if (JSON.parse(readonly.value)) {
                        ErdcKit.open('biz-template/template/objectTemplate', {
                            appName: 'erdc-bizadmin-web'
                        });
                    } else {
                        router.push({
                            path: listPage,
                            replace
                        });
                    }
                }
            };

            const injectSpace = useApp()?.$options?.layout?.space?.injectSpace;

            if (typeof injectSpace === 'function') {
                Promise.resolve(injectSpace()).then((res) => {
                    if (res) {
                        spaceSelectComponent.value = res.componentName;
                    }
                });
            }
            const setTargetRouteTitle = (targetRoute) => {
                let currentRoute = targetRoute;
                let listPage = useApp()?.$options?.layout?.space.listPage;
                if (listPage) {
                    currentRoute = {
                        path: listPage
                    };
                }

                let currentResourcePath = store.getters['route/matchResourcePath'](currentRoute);
                let _rootResource = currentResourcePath[1] || {};
                _rootResource = ErdcKit.deepClone(_rootResource);
                // 这里的spaceDetail不是computed的那个spaceDetail,因为切换路由，新的spaceDetail还没有生成
                let spaceDetail = store.state.space.objectMap[targetRoute.query.pid] || {};
                let spaceContext = store.state.space.contextMap[spaceDetail.containerRef] || {};
                return execMenuHook(_rootResource?.children, spaceContext, spaceDetail, _rootResource).then(
                    (newSecondaryResources) => {
                        _rootResource.children = newSecondaryResources;
                        let targetRouteConfig = store.getters['route/matchResourcePath'](targetRoute, _rootResource).at(
                            -1
                        );

                        rootResource.value = {
                            ...rootResource.value,
                            children: newSecondaryResources
                        };

                        if (_.isFunction(targetRoute.meta.title)) {
                            return Promise.resolve(
                                targetRoute.meta.title(targetRoute, targetRouteConfig, _rootResource)
                            );
                        } else {
                            let languages = i18n.languages();
                            let titleI18nJson = {};
                            languages.forEach((i) => {
                                let titleArray = [
                                    ErdcKit.translateI18n(_rootResource?.nameI18nJson || _rootResource.displayName)
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
                                titleI18nJson[i.language] = Array.from(new Set(titleArray)).join('-');
                            });
                            targetRoute.meta.titleI18nJson = titleI18nJson;
                            return Promise.resolve(titleI18nJson);
                        }
                    }
                );
            };

            return {
                collapsed,
                rootResource,
                currentActiveRoutePath,
                menuRef,
                secondaryResources,
                cachedViews,
                routerViewKey,
                spaceSelectComponent,
                typeName,
                extendParams,
                readonly,
                spaceDetail,
                spaceContext,
                showMenu,
                /* ------------ */
                routeTo,
                setTargetRouteTitle,
                handleSpaceChange,
                gotoListPage
            };
        },
        components: {
            FamSideMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamMenu/FamSideMenu/index.js')),
            LayoutSpaceSelect: ErdcKit.asyncComponent('/erdc-layout/ultra/components/LayoutSpaceSelect/index.js')
        },
        watch: {
            $route(route) {
                if (this.$route.query.hideMenu && this.$route.query.hideMenu !== 'true') {
                    this.$store.dispatch('route/hideMenus');
                } else {
                    this.$store.dispatch('route/showMenus');
                }
                if (
                    route.matched[1] &&
                    route.matched[1]?.name === 'space' &&
                    this.spaceDetail.oid === route.query.pid
                ) {
                    this.routerViewKey = getRouterViewKey(this.routerViewKey);
                }
            }
        },
        beforeRouteEnter(to, from, next) {
            let { pid: objectOid, typeOid } = to.query;
            if (!objectOid) {
                objectOid = to.params.pid;
            }
            if (objectOid) {
                const loadingIns = Vue.prototype.$loading({
                    text: i18n.translate('loading'),
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
                const loadingIns = Vue.prototype.$loading({
                    text: i18n.translate('loading'),
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
        template
    };
});
