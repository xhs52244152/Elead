/**
 * FAM统一状态库
 */
define([
    'erdcloud.store',
    'fam:store:module:common',
    'fam:store:module:app',
    'fam:store:module:route',
    'fam:store:module:famTemplateManagement',
    'fam:store:module:infoPage',
    'fam:store:module:personalPreference',
    'fam:store:module:operationRecords',
    'bpm:store:module:bpmProcessProperty',
    'bpm:store:module:bpmPartial',
    'bpm:store:module:bpmProcessPanel',
    'fam:store:module:space'
], function (ErdcloudStore) {
    const common = require('fam:store:module:common');
    const app = require('fam:store:module:app');
    const infoPage = require('fam:store:module:infoPage');
    const route = require('fam:store:module:route');
    const famTemplateManagement = require('fam:store:module:famTemplateManagement');
    const personalPreference = require('fam:store:module:personalPreference');
    const operationRecords = require('fam:store:module:operationRecords');
    const bpmProcessProperty = require('bpm:store:module:bpmProcessProperty');
    const bpmPartial = require('bpm:store:module:bpmPartial');
    const bpmProcessPanel = require('bpm:store:module:bpmProcessPanel');
    const spaceStore = require('fam:store:module:space');
    ErdcloudStore.registerModule('common', common);
    ErdcloudStore.registerModule('app', app);
    ErdcloudStore.registerModule('route', route);
    ErdcloudStore.registerModule('infoPage', infoPage);
    ErdcloudStore.registerModule('famTemplateManagement', famTemplateManagement);
    ErdcloudStore.registerModule('personalPreference', personalPreference);
    ErdcloudStore.registerModule('operationRecords', operationRecords);
    ErdcloudStore.registerModule('bpmProcessProperty', bpmProcessProperty);
    ErdcloudStore.registerModule('bpmPartial', bpmPartial);
    ErdcloudStore.registerModule('bpmProcessPanel', bpmProcessPanel);
    ErdcloudStore.registerModule('space', spaceStore);
});

/**
 * 系统路由状态
 */
define('fam:store:module:route', ['erdcloud.mfe', 'erdcloud.kit', 'erdcloud.store', 'erdcloud.router'], function () {
    const ErdcloudMfe = require('erdcloud.mfe');
    const ErdcKit = require('erdcloud.kit');
    const ErdcStore = require('erdcloud.store');
    const ErdcRouter = require('erdcloud.router');
    const Vue = require('vue');

    function tryReadLs(key, defaultValue) {
        let result = defaultValue;
        try {
            result = JSON.parse(window.localStorage.getItem(key)) || {};
        } catch (e) {
            console.error(e);
            window.localStorage.setItem('key', JSON.stringify(defaultValue));
        }
        return result;
    }

    function getIsSameRouteFun(route) {
        let allFun = [
            function defaultJudge(source, target) {
                return source.path === target.path;
            }
        ].concat(
            (_.isArray(route.matched) ? route.matched : [])
                .filter((i) => i?.meta?.isSameRoute)
                .map((i) => i.meta.isSameRoute)
        );
        return allFun[allFun.length - 1];
    }

    let lastRoute = tryReadLs('lastRoute', {});
    let visitedRouteMap = tryReadLs('visitedRoutes', {});

    function filterShowResources(resources) {
        return toSortedTree(
            _.filter(resources, function (item) {
                !_.isEmpty(item.children) && (item.children = filterShowResources(item.children));
                if (_.isEmpty(item.children) && _.isEmpty(item.href)) {
                    return false;
                }
                return item.isShow;
            }),
            (a, b) => a.sort - b.sort
        );
    }

    function toSortedTree(resource, compareFn) {
        return resource.toSorted(compareFn).map((item) => {
            if (item.children) {
                item.children = toSortedTree(item.children, compareFn);
            }
            return item;
        });
    }

    const stateDesc = {
        // 菜单信息
        resources: {},
        // 当前根菜单
        customRootResource: null,
        // 路由记录，参考 github hipi用户的实现
        visitedRoutes: visitedRouteMap[window.__currentAppName__] || [],
        // 被缓存的路由
        cachedViews: [],
        // 基于一级菜单的路有记录，用来实现切换一级菜单时记录当前位置
        lastRoute,
        allResourceTree: [],
        unCachedViews: [],
        isMenuShows: true
    };

    const mutations = {
        SET_CUSTOM_ROOT_RESOURCE(state, resource) {
            state.customRootResource = resource;
        },
        SET_ALL_RESOURCES(state, resources) {
            state.allResourceTree = resources;
        },
        PUSH_RESOURCES(state, { resources }) {
            resources.children = filterShowResources(resources.children);
            state.resources = resources;
        },
        PUSH_LAST_ROUTE(state, [rootResourceCode, route]) {
            state.lastRoute = {
                ...state.routeHistory,
                [rootResourceCode]: route
            };
            window.localStorage.setItem('lastRoute', JSON.stringify(state.lastRoute));
        },
        PUSH_ROUTE_HISTORY(state, [rootResourceCode, route]) {
            state.routeHistory = {
                ...state.routeHistory,
                [rootResourceCode]: route
            };
            window.localStorage.setItem('routeHistory', JSON.stringify(state.routeHistory));
        },
        SET_VISITED_ROUTES(state, visitedRoutes) {
            state.visitedRoutes = visitedRoutes;
            let visitedRoutesMap = tryReadLs('visitedRoutes', {});
            window.localStorage.setItem(
                'visitedRoutes',
                JSON.stringify({
                    ...visitedRoutesMap,
                    [window.__currentAppName__]: state.visitedRoutes.map((item) => {
                        const meta = item.meta || {};
                        return {
                            path: item.path,
                            fullPath: item.fullPath,
                            name: item.name,
                            query: item.query,
                            params: item.params,
                            meta
                        };
                    })
                })
            );
        },
        addVisitedRoute(state, route) {
            if (
                route.path === '' ||
                route.path === '/' ||
                route.path === '/screenLock' ||
                route.path === '/NoPermission' ||
                route.path === '/403' ||
                route.path === '/404'
            ) {
                return;
            }
            let isSameRoute = getIsSameRouteFun(route);
            let target = state.visitedRoutes.find((item) => isSameRoute(item, route));
            /**
             * 这里要克隆一份路由数据，因为空间那块用的是同一个route对象,这个时候，切换空间那么之前的那个route也变了
             */
            let titleI18nJson = route.meta.titleI18nJson;
            if (_.isFunction(route.meta.title)) {
                titleI18nJson = route.meta.title(route);
            }
            let newMeta = ErdcKit.deepClone(route.meta);
            newMeta.titleI18nJson = titleI18nJson;
            let visitedItem = {
                path: route.path,
                meta: newMeta,
                query: ErdcKit.deepClone(route.query),
                params: ErdcKit.deepClone(route.params),
                matched: route.matched.map((i) => {
                    return {
                        components: {
                            default: {
                                name: i.components.default.name
                            }
                        },
                        meta: ErdcKit.deepClone(i.meta)
                    };
                })
            };
            if (target) {
                Object.assign(target, visitedItem);
                // 如果是下拉里隐藏的页签，则转至第一位
                if (target.isInvisible) {
                    return this.dispatch('route/setVisitedRouteSort', {
                        fullPath: target.fullPath,
                        newIndex: 0
                    });
                }
                return;
            }
            state.visitedRoutes.unshift(visitedItem);
            this.commit('route/SET_VISITED_ROUTES', [...state.visitedRoutes]);
        },
        // 设置路由到指定位置，其它路由按原相对顺序排
        setVisitedRouteSort(state, { fullPath, newIndex }) {
            let visitedRoutes = state.visitedRoutes;
            let activeIndex = 0;
            visitedRoutes.forEach((item, index) => {
                if (item.fullPath === fullPath) {
                    activeIndex = index;
                }
            });

            visitedRoutes.splice(newIndex, 0, visitedRoutes.splice(activeIndex, 1)?.[0]);
            state.visitedRoutes = visitedRoutes;
            this.commit('route/SET_VISITED_ROUTES', [...state.visitedRoutes]);
        },
        delVisitedRoute(state, route) {
            let isSameRoute = getIsSameRouteFun(route);
            state.visitedRoutes.forEach((item, index) => {
                if (isSameRoute(item, route)) state.visitedRoutes.splice(index, 1);
            });
            this.commit('route/SET_VISITED_ROUTES', [...state.visitedRoutes]);
        },
        delOthersVisitedRoute(state, route) {
            let isSameRoute = getIsSameRouteFun(route);
            state.visitedRoutes = state.visitedRoutes.filter((item) => item.meta.affix || isSameRoute(item, route));
            this.commit('route/SET_VISITED_ROUTES', [...state.visitedRoutes]);
        },
        delLeftVisitedRoute(state, route) {
            let index = state.visitedRoutes.length;
            state.visitedRoutes = state.visitedRoutes.filter((item) => {
                if (item.name === route.name) index = state.visitedRoutes.indexOf(item);
                return item.meta.affix || index <= state.visitedRoutes.indexOf(item);
            });
            this.commit('route/SET_VISITED_ROUTES', [...state.visitedRoutes]);
        },
        delRightVisitedRoute(state, route) {
            let index = state.visitedRoutes.length;
            state.visitedRoutes = state.visitedRoutes.filter((item) => {
                if (item.name === route.name) index = state.visitedRoutes.indexOf(item);
                return item.meta.affix || index >= state.visitedRoutes.indexOf(item);
            });
            this.commit('route/SET_VISITED_ROUTES', [...state.visitedRoutes]);
        },
        delAllVisitedRoutes(state) {
            state.visitedRoutes = state.visitedRoutes.filter((item) => item.meta.affix);
            this.commit('route/SET_VISITED_ROUTES', [...state.visitedRoutes]);
        },
        updateVisitedRoute(state, route) {
            state.visitedRoutes.forEach((item) => {
                if (item.path === route.path) {
                    Object.assign(item, route);
                }
            });
            this.commit('route/SET_VISITED_ROUTES', [...state.visitedRoutes]);
        },
        ADD_CACHED_VIEW: (state, view) => {
            let keepAliveComponentNames = view.matched
                .filter((v) => {
                    return v.components.default?.name && v.meta.keepAlive;
                })
                .map((v) => {
                    return v.components.default.name;
                });
            state.cachedViews = Array.from(new Set([...state.cachedViews, ...keepAliveComponentNames]));
        },
        DEL_CACHED_VIEW: (state, view) => {
            let componentName = !_.isEmpty(view.matched) ? view.matched[view.matched.length - 1] : '';
            if (_.isObject(componentName)) {
                componentName = componentName.components.default.name;
            }
            const index = state.cachedViews.indexOf(componentName);
            if (index > -1) {
                state.cachedViews.splice(index, 1);
            }
        },
        DEL_OTHERS_CACHED_VIEWS: (state, view) => {
            let componentName = !_.isEmpty(view.matched) ? view.matched[view.matched.length - 1] : '';
            if (_.isObject(componentName)) {
                componentName = componentName.components.default.name;
            }
            const index = state.cachedViews.indexOf(componentName);
            if (index > -1) {
                state.cachedViews = state.cachedViews.slice(index, index + 1);
            } else {
                // if index = -1, there is no cached tags
                state.cachedViews = [];
            }
        },
        DEL_ALL_CACHED_VIEWS: (state) => {
            state.cachedViews = [];
        },
        SET_IS_MENU_SHOWS: (state, isMenuShows) => {
            state.isMenuShows = isMenuShows;
        }
    };

    const matchResourcePath = ErdcloudMfe.matchResourcePath;

    const getters = {
        rootResource: (state) => (route) => {
            const path = matchResourcePath(state)(route);
            return path[0] || null;
        },
        parentResource: (state) => (route) => {
            const path = matchResourcePath(state)(route);
            return path[path.length - 2] || null;
        },
        matchResource: (state) => (route) => {
            const path = matchResourcePath(state)(route);
            return path[path.length - 1] || null;
        },
        matchResourcePath,
        visitedRoutes: (state) => state.visitedRoutes
    };

    const actions = {
        loadAllMenu: function (context) {
            return new Promise(function (resolve, reject) {
                if (context.state.allResourceTree && context.state.allResourceTree.length) {
                    resolve(context.state.allResourceTree);
                } else {
                    require(['erdcloud.http'], function (axios) {
                        axios
                            .get('/fam/resource/tree')
                            .then(({ data }) => {
                                context.commit('SET_ALL_RESOURCES', data);
                                resolve(data);
                            })
                            .catch(reject);
                    });
                }
            });
        },
        registerCommonPageRoutes(store, resources) {
            return new Promise((resolve) => {
                require(['erdcloud.router', 'vue-router'], function (router) {
                    let routes = [];
                    let handler = function (resourceList = []) {
                        resourceList.forEach((item) => {
                            let pathData = item.href?.split('/') || [];
                            if (pathData[1] === 'commonPage') {
                                let className = pathData[2];
                                const classNameAttr = className.split('.');
                                const classNameKey = classNameAttr[classNameAttr.length - 1];
                                let displayName = item.displayName;
                                let resourceCode = item.identifierNo;
                                routes = routes.concat([
                                    // 列表
                                    {
                                        path: item.href,
                                        name: `${classNameKey}CommonList`,
                                        meta: {
                                            noAuth: true,
                                            title: `${displayName}列表`,
                                            keepAlive: false,
                                            className,
                                            classNameKey,
                                            resourceCode
                                        },
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('common-page/ListPage/index.js')
                                        )
                                    },
                                    // 创建
                                    {
                                        path: `commonPage/${classNameKey}/create`,
                                        name: `${classNameKey}CommonCreate`,
                                        meta: {
                                            noAuth: true,
                                            title: `创建${displayName}`,
                                            keepAlive: false,
                                            className,
                                            resourceCode,
                                            openType: 'create'
                                        },
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('common-page/InfoPage/index.js')
                                        )
                                    },
                                    // 编辑
                                    {
                                        path: `commonPage/${classNameKey}/edit/:oid`,
                                        name: `${classNameKey}CommonEdit`,
                                        meta: {
                                            noAuth: true,
                                            title: `编辑${displayName}`,
                                            keepAlive: false,
                                            className,
                                            resourceCode,
                                            openType: 'edit'
                                        },
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('common-page/InfoPage/index.js')
                                        )
                                    },
                                    // 详情
                                    {
                                        path: `commonPage/${classNameKey}/info/:oid`,
                                        name: `${classNameKey}CommonInfo`,
                                        meta: {
                                            noAuth: true,
                                            keepAlive: false,
                                            hideSubMenus: true,
                                            className,
                                            resourceCode,
                                            openType: 'detail'
                                        },
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('common-page/InfoPage/index.js')
                                        )
                                    }
                                ]);
                            }

                            if (item.children) {
                                handler(item.children);
                            }
                        });
                    };
                    handler(resources);
                    routes.forEach((route) => {
                        router.addRoute('root', route);
                    });
                    resolve();
                });
            });
        },
        // 根据一级菜单获取子级菜单
        fetchResource(_, { containerRef, parentResource }) {
            const { idKey, appName, oid } = parentResource || {};
            return new Promise((resolve, reject) => {
                require(['fam:http'], function (axios) {
                    axios
                        .get('/fam/listByParentKey', {
                            data: {
                                className: idKey, // 'erd.cloud.foundation.core.menu.entity.Resource'
                                appNames: appName,
                                containerRef: containerRef || '',
                                isGetLinkCount: false,
                                parentKey: oid
                            }
                        })
                        .then(({ data }) => {
                            resolve(data);
                        })
                        .catch(reject);
                });
            });
        },
        recordRoute({ commit }, [parentName, { route }]) {
            commit('PUSH_LAST_ROUTE', [
                parentName,
                {
                    path: route.path,
                    fullPath: route.fullPath,
                    meta: route.meta
                }
            ]);
        },
        addVisitedRoute({ commit }, route) {
            commit('addVisitedRoute', route);
            commit('ADD_CACHED_VIEW', route);
        },
        delVisitedRoute({ commit, state }, route) {
            commit('delVisitedRoute', route);
            commit('DEL_CACHED_VIEW', route);
            return [...state.visitedRoutes];
        },
        delOthersVisitedRoute({ commit, state }, route) {
            commit('delOthersVisitedRoute', route);
            commit('DEL_OTHERS_CACHED_VIEWS', route);
            return [...state.visitedRoutes];
        },
        delAllVisitedRoutes({ commit, state }) {
            commit('delAllVisitedRoutes');
            commit('DEL_ALL_CACHED_VIEWS');
            return [...state.visitedRoutes];
        },
        toggleMenuShows({ dispatch, state }) {
            return dispatch('setMenuShows', !state.isMenuShows);
        },
        showMenus({ dispatch }) {
            return dispatch('setMenuShows', true);
        },
        hideMenus({ dispatch }) {
            return dispatch('setMenuShows', false);
        },
        setMenuShows({ commit }, isMenuShows) {
            return commit('SET_IS_MENU_SHOWS', isMenuShows);
        }
    };

    let cachedVisitedRoutes = [];

    // clean route cache
    ErdcStore.subscribe((mutation, state) => {
        if (mutation.type === 'route/SET_VISITED_ROUTES') {
            const payload = mutation.payload || [];
            state.route.unCachedViews = (_.difference(cachedVisitedRoutes, mutation.payload, _.isEqual) || []).map(
                (r) => ErdcRouter.match(r)
            );
            cachedVisitedRoutes = [...payload];
        }
    });

    const deleteCache = (vm) => {
        if (vm.$vnode?.parent?.componentInstance?.cache) {
            if (vm.$vnode.componentOptions) {
                const key =
                    vm.$vnode.key == null
                        ? vm.$vnode.componentOptions.Ctor.cid +
                          (vm.$vnode.componentOptions.tag ? `::${vm.$vnode.componentOptions.tag}` : '')
                        : vm.$vnode.key;
                const cache = vm.$vnode.parent.componentInstance.cache;
                const keys = vm.$vnode.parent.componentInstance.keys;
                if (cache[key]) {
                    if (keys.length) {
                        const index = keys.indexOf(key);
                        if (index > -1) {
                            keys.splice(index, 1);
                        }
                    }
                    delete cache[key];
                }
                vm.$destroy();
            }
        }
    };

    Vue.mixin({
        beforeRouteLeave(to, from, next) {
            if (this.$store.state.route.unCachedViews.some((item) => item.fullPath === from.fullPath)) {
                deleteCache(this);
            }
            next();
        }
    });

    return {
        state: stateDesc,
        namespaced: true,
        actions,
        mutations,
        getters
    };
});

/**
 * 系统运作性状态
 */
define('fam:store:module:app', ['erdcloud.router', 'erdc-kit'], function () {
    const erdcloudStore = require('erdcloud.store');
    const Vue = require('vue');

    return {
        namespaced: true,
        state: {
            user: {},
            appNames: [],
            settings: [],
            menuList: [],
            tenantList: [],
            tenantId: window.localStorage.getItem('tenantId'),
            site: {},
            container: {},
            icon: '',
            loginTimeout: false,
            accessToken: window.LS.get('accessToken') || '',
            fileSite: null,
            threeMemberEnv: false,
            threeMemberOtherConfig: {},
            updatePwd: 0
        },
        mutations: {
            PUSH_ACCESS_TOKEN(state, accessToken) {
                window.LS.set('accessToken', accessToken);
                state.accessToken = accessToken;
            },
            PUSH_SETTINGS(state, settings) {
                state.settings = settings;
            },
            PUSH_USER(state, user) {
                state.user = user;
            },
            PUSH_APPNAMES(state, appNames) {
                state.appNames = appNames;
            },
            PUSH_MENULIST(state, menu) {
                state.menuList = menu;
            },
            PUSH_SITE(state, site) {
                state.site = site;
            },
            PUSH_FILE_SITE(state, fileSite) {
                state.fileSite = fileSite;
            },
            PUSH_CONTAINER(state, container) {
                state.container = container;
            },
            PUSH_ICON(state, icon) {
                state.icon = icon;
            },
            PUSH_LOGINTIMEOUT(state, loginTimeout) {
                state.loginTimeout = loginTimeout;
            },
            SET_TENANT_LIST(state, tenantList) {
                state.tenantList = tenantList;
            },
            SET_TENANT_ID(state, tenantId) {
                state.tenantId = tenantId;
            },
            SET_THREEMEMBER(state, { threeMemberEnv, threeMemberOtherConfig }) {
                state.threeMemberEnv = threeMemberEnv;
                state.threeMemberOtherConfig = threeMemberOtherConfig || {};
            },
            PUSH_PASSWORD(state, updatePwd) {
                state.updatePwd = updatePwd;
            }
        },
        actions: {
            fetchUserMe({ commit, state }) {
                return new Promise((resolve, reject) => {
                    require([ELMP.resource('erdc-app/api/app.js'), 'erdcloud.i18n'], function (AppApi, i18n) {
                        let tenantId = localStorage.getItem('tenantId');
                        tenantId = tenantId ? window.encodeURIComponent(JSON.parse(tenantId)) : '';
                        AppApi.fetchUserMe({
                            headers: {
                                Authorization: state.accessToken,
                                'Tenant-Id': tenantId,
                                'User-Language': i18n.currentLanguage()
                            }
                        })
                            .then((response) => {
                                if (response.data.success) {
                                    const data = response.data.data;
                                    let settings = data?.settings || [];
                                    let userLayout = settings.findLast((i) => i.configModule === 'LAYOUT');
                                    let userTheme = settings.findLast((i) => i.configModule === 'THEME');
                                    localStorage.setItem('loginInfo', JSON.stringify(data.user));
                                    data.user.watermark = data.watermark;
                                    if (userLayout) {
                                        data.user.layout = userLayout;
                                    }
                                    if (userTheme) {
                                        data.user.theme = userTheme;
                                    }
                                    commit('PUSH_USER', data.user);
                                    commit('PUSH_APPNAMES', data.appNames);
                                    commit('PUSH_SITE', data?.siteAndOrganizationRes?.site);
                                    commit('PUSH_CONTAINER', data?.siteAndOrganizationRes?.organization);
                                    commit('PUSH_ICON', data?.icon);
                                    commit('PUSH_SETTINGS', data?.settings);
                                    commit('PUSH_PASSWORD', data?.updatePwd);
                                    const allResources = data?.resources || [];
                                    erdcloudStore.commit('route/SET_ALL_RESOURCES', allResources);
                                    let resource =
                                        allResources.find((i) => i.identifierNo === window.__currentAppName__) || {};
                                    erdcloudStore.commit('route/PUSH_RESOURCES', { resources: resource });
                                    resolve();
                                } else {
                                    Vue.prototype.$message({
                                        type: 'error',
                                        message: response.data.message || '获取用户失败',
                                        showClose: false,
                                        onClose: function () {
                                            reject(response.data);
                                        }
                                    });
                                }
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    });
                });
            },
            fetchTenantList({ commit }) {
                return new Promise((resolve, reject) => {
                    require([ELMP.resource('erdc-app/api/app.js')], function (AppApi) {
                        AppApi.fetchTenantList()
                            .then((response) => {
                                const data = response.data.data;
                                commit('SET_TENANT_LIST', data);
                                let tenantId = null;
                                try {
                                    tenantId = JSON.parse(localStorage.getItem('tenantId'));
                                } catch (e) {
                                    // do noting
                                }
                                if (!tenantId) {
                                    tenantId = data[0]?.identifierNo;
                                }
                                if (tenantId) {
                                    commit('SET_TENANT_ID', tenantId);
                                    resolve();
                                } else {
                                    reject();
                                }
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    });
                });
            },
            changeLayout({ state }, layoutCode) {
                const $famHttp = require('erdcloud.http');
                const saveLayout = () => {
                    if (layoutCode) {
                        return $famHttp({
                            url: `/fam/create`,
                            method: 'post',
                            data: {
                                className: 'erd.cloud.foundation.principal.entity.SystemSetting',
                                attrRawList: [
                                    {
                                        attrName: 'configType',
                                        value: 'USER_PREFERENCE'
                                    },
                                    {
                                        attrName: 'configModule',
                                        value: 'LAYOUT'
                                    },
                                    {
                                        attrName: 'configValue',
                                        value: layoutCode
                                    }
                                ]
                            }
                        });
                    } else {
                        return Promise.resolve();
                    }
                };
                return new Promise((resolve, reject) => {
                    let currentLayout = state.settings.filter((i) => i.configModule === 'LAYOUT').map((i) => i.oid);
                    if (currentLayout && currentLayout.length) {
                        $famHttp({
                            url: '/fam/deleteByIds',
                            method: 'delete',
                            data: {
                                oidList: currentLayout
                            }
                        })
                            .then(() => {
                                return saveLayout();
                            })
                            .then(() => {
                                resolve();
                            })
                            .catch(() => {
                                reject();
                            });
                    } else {
                        saveLayout()
                            .then(() => {
                                resolve();
                            })
                            .catch(() => {
                                reject();
                            });
                    }
                });
            },
            changeTheme({ state }, themeCode) {
                const $famHttp = require('erdcloud.http');
                const saveTheme = () => {
                    if (themeCode) {
                        return $famHttp({
                            url: `/fam/create`,
                            method: 'post',
                            data: {
                                className: 'erd.cloud.foundation.principal.entity.SystemSetting',
                                attrRawList: [
                                    {
                                        attrName: 'configType',
                                        value: 'USER_PREFERENCE'
                                    },
                                    {
                                        attrName: 'configModule',
                                        value: 'THEME'
                                    },
                                    {
                                        attrName: 'configValue',
                                        value: themeCode
                                    }
                                ]
                            }
                        });
                    } else {
                        return Promise.resolve();
                    }
                };
                return new Promise((resolve, reject) => {
                    let currentTheme = state.settings.filter((i) => i.configModule === 'THEME').map((i) => i.oid);
                    if (currentTheme && currentTheme.length) {
                        $famHttp({
                            url: '/fam/deleteByIds',
                            method: 'delete',
                            data: {
                                oidList: currentTheme
                            }
                        })
                            .then(() => {
                                return saveTheme();
                            })
                            .then(() => {
                                resolve();
                            })
                            .catch(() => {
                                reject();
                            });
                    } else {
                        saveTheme()
                            .then(() => {
                                resolve();
                            })
                            .catch(() => {
                                reject();
                            });
                    }
                });
            }
        },
        getters: {
            currentTenant: (state) => {
                let tenant = state.tenantList?.find((tenant) => tenant.identifierNo === state.tenantId);
                return tenant || {};
            },
            defaultLayoutAndTheme: (state, getters, rootState) => {
                let layouts = rootState.mfe.layouts;
                let themes = rootState.mfe.themes;
                /**
                 * 1. 如果存在应用级别的配置的话，那么就用应用级别的配置，匹配出来合适的布局和主题
                 * 2. 默认用全局的布局和主题
                 * 3. 使用布局和主题的第一个
                 */
                let defaultLayout = null;
                let defaultTheme = null;
                let currentAppOptionalLayouts = [];
                let currentAppOptionalThemes = [];
                if (ELCONF.layout?.[window.__currentAppName__]) {
                    let includes = ELCONF.layout?.[window.__currentAppName__].include || [];
                    let excludes = ELCONF.layout?.[window.__currentAppName__].exclude || [];
                    defaultLayout = ELCONF.layout?.[window.__currentAppName__].default;
                    if (!defaultLayout && !_.isEmpty(includes)) {
                        for (let i of includes) {
                            if (layouts.find((ii) => ii.code === i)) {
                                defaultLayout = i;
                                break;
                            }
                        }
                    }
                    if (!defaultLayout && !_.isEmpty(excludes)) {
                        for (let i of layouts) {
                            if (excludes.indexOf(i.code) === -1) {
                                defaultLayout = i.code;
                                break;
                            }
                        }
                    }

                    if (includes && includes.length) {
                        currentAppOptionalLayouts = layouts.filter((i) => includes.indexOf(i.code) > -1);
                    } else if (excludes && excludes.length) {
                        currentAppOptionalLayouts = layouts.filter((i) => excludes.indexOf(i.code) === -1);
                    } else {
                        currentAppOptionalLayouts = layouts;
                    }
                } else {
                    currentAppOptionalLayouts = layouts;
                }

                if (ELCONF.theme?.[window.__currentAppName__]) {
                    let includes = ELCONF.theme?.[window.__currentAppName__].include || [];
                    let excludes = ELCONF.theme?.[window.__currentAppName__].exclude || [];
                    defaultTheme = ELCONF.theme?.[window.__currentAppName__].default;
                    if (!defaultTheme && !_.isEmpty(includes)) {
                        for (let i of includes) {
                            if (themes.find((ii) => ii.code === i)) {
                                defaultTheme = i;
                                break;
                            }
                        }
                    }
                    if (!defaultTheme && !_.isEmpty(excludes)) {
                        for (let i of themes) {
                            if (excludes.indexOf(i.code) === -1) {
                                defaultTheme = i.code;
                                break;
                            }
                        }
                    }

                    if (includes && includes.length) {
                        currentAppOptionalThemes = themes.filter((i) => includes.indexOf(i.code) > -1);
                    } else if (excludes && excludes.length) {
                        currentAppOptionalThemes = themes.filter((i) => excludes.indexOf(i.code) === -1);
                    } else {
                        currentAppOptionalThemes = themes;
                    }
                } else {
                    currentAppOptionalThemes = themes;
                }
                if (!defaultLayout) {
                    defaultLayout = ELCONF.globalDefaultLayout;
                }
                if (!defaultTheme) {
                    defaultTheme = ELCONF.globalDefaultTheme;
                }
                if (!defaultLayout) {
                    defaultLayout = layouts[0].code;
                }
                if (!defaultTheme) {
                    defaultTheme = themes[0].code;
                }
                return {
                    layout: defaultLayout,
                    theme: defaultTheme,
                    currentAppOptionalThemes: currentAppOptionalThemes,
                    currentAppOptionalLayouts: currentAppOptionalLayouts
                };
            },
            threeMemberUserType: (state) => {
                return (groupCode) => groupCode === state.user.threeMemberGroup;
            },
            // 系统管理员
            isSystem: (state, getters) => {
                return getters.threeMemberUserType('system');
            },
            // 安全保密员
            isSecurity: (state, getters) => {
                return getters.threeMemberUserType('security');
            },
            // 安全审计员
            isAudit: (state, getters) => {
                return getters.threeMemberUserType('audit');
            }
        }
    };
});

/**
 * 代码配置性状态
 */
define('fam:store:module:common', ['underscore', 'fam:kit'], function () {
    const _ = require('underscore');
    const ErdcKit = require('fam:kit');
    const axios = require('fam:http');
    return {
        state: {
            serviceRouteMapping: {},
            entityMapping: {},
            classNameMapping: {
                // 组织
                organization: 'erd.cloud.foundation.principal.entity.Organization',
                // 用户
                user: 'erd.cloud.foundation.principal.entity.User',
                // 角色
                Role: 'erd.cloud.foundation.principal.entity.Role',
                PropertyDefinition: 'erd.cloud.foundation.type.entity.PropertyDefinition',
                organizationLink: 'erd.cloud.foundation.principal.entity.OrganizationLink',
                OrgContainer: 'erd.cloud.foundation.core.container.entity.OrgContainer',
                principalTarget: 'erd.cloud.core.principal.enums.PrincipalTarget',
                Group: 'erd.cloud.foundation.principal.entity.Group',
                TypeGroupDefinition: 'erd.cloud.foundation.type.entity.TypeGroupDefinition',
                GroupLink: 'erd.cloud.foundation.principal.entity.GroupLink',
                layoutDefinition: 'erd.cloud.foundation.layout.entity.LayoutDefinition',
                attributeDefinition: 'erd.cloud.foundation.type.entity.AttributeDefinition',
                componentDefinition: 'erd.cloud.foundation.layout.entity.Component',
                layoutAttrDefinition: 'erd.cloud.foundation.layout.entity.LayoutAttrDefinition',
                attributeCategoryEnum: 'erd.cloud.core.enums.AttributeCategory',
                layoutTypeEnum: 'erd.cloud.core.layout.enums.LayoutType',
                dictItem: 'erd.cloud.foundation.core.dictionary.entity.DictionaryItem',
                tableDefinition: 'erd.cloud.foundation.core.tableview.entity.TableDefinition',
                fieldDefinition: 'erd.cloud.foundation.core.tableview.entity.FieldDefinition',
                fieldCondition: 'erd.cloud.foundation.core.tableview.entity.FieldCondition',
                RuleCondition: 'erd.cloud.foundation.core.tableview.entity.RuleCondition',
                tableView: 'erd.cloud.foundation.core.tableview.entity.TableView',
                BaseFilterField: 'erd.cloud.foundation.core.tableview.entity.BaseFilterField',
                tableViewUserConfig: 'erd.cloud.foundation.core.tableview.entity.TableViewUserConfig',
                productDemo: 'erd.cloud.fam.example.entity.Product',
                DemoSimpleLink: 'erd.cloud.fam.example.entity.DemoSimpleLink',
                actionList: 'erd.cloud.foundation.core.menu.entity.MenuAction',
                preferences: 'erd.cloud.foundation.core.preferences.entity.Preferences',
                preferencesFile: 'erd.cloud.foundation.core.preferences.entity.PreferencesFile',
                preferencesConfig: 'erd.cloud.foundation.core.preferences.entity.PreferencesConfig',
                // 生命周期状态
                lifecycleState: 'erd.cloud.foundation.lifecycle.entity.LifecycleState',
                codeRule: 'erd.cloud.foundation.core.coderule.entity.CodeRule',
                exportBusinessInfo: 'erd.cloud.foundation.export.entity.ExportBusinessInfo',
                codeMaxSerial: 'erd.cloud.foundation.core.coderule.entity.CodeMaxSerial',
                exportTemplate: 'erd.cloud.foundation.export.entity.ExportTemplate',
                EtOperationConfig: 'erd.cloud.message.entity.EtOperationConfig',
                EtOperationLink: 'erd.cloud.message.entity.EtOperationLink',
                EtOperationApi: 'erd.cloud.message.entity.EtOperationApi',
                // 日历
                calendar: 'erd.cloud.foundation.calendar.entity.SystemCalendar',
                calendarHoliday: 'erd.cloud.foundation.calendar.entity.SystemCalendarHoliday',
                // 动态脚本
                groovyScript: 'erd.cloud.groovy.entity.GroovyScript',
                // 通用示例
                DemoBizObject: 'erd.cloud.foundation.dynamic.entity.DemoBizObject',
                // 流程定义
                processDef: 'erd.cloud.bpm.process.entity.ProcessDef',
                // 流程模板著对象
                processDefMaster: 'erd.cloud.bpm.process.entity.ProcessDefMaster',
                // 流程模板
                processDefinition: 'erd.cloud.bpm.process.entity.ProcessDef',
                // 流程分类
                processCategory: 'erd.cloud.bpm.common.entity.ProcessCategory',
                // 流程实例
                processInstance: 'erd.cloud.bpm.pbo.entity.ProcessInstance',
                // 流程记录
                processRecord: 'erd.cloud.bpm.pbo.entity.ProcessRecord',
                // PBO 对象
                pbo: 'erd.cloud.bpm.pbo.entity.Pbo',
                // 任务对象
                processTask: 'erd.cloud.bpm.infrastructure.proctask.entity.ProcessTask',
                // 流程节点定义
                processNodeDef: 'erd.cloud.bpm.process.entity.ProcessNodeDef',
                // 类型管理
                typeDefinition: 'erd.cloud.foundation.type.entity.TypeDefinition',
                // 类型管理-常量定义
                constantDefinition: 'erd.cloud.foundation.type.entity.ConstantDefinition',
                // 工作代理关联
                workProxyLink: 'erd.cloud.bpm.proxy.entity.WorkProxyLink',
                // 工作代理
                workProxy: 'erd.cloud.bpm.proxy.entity.WorkProxy',
                // 工作项
                workItem: 'erd.cloud.bpm.task.entity.Workitem',
                // 接口配置
                businessInterface: 'erd.cloud.bpm.bussiness.entity.BusinessInterface',
                // 调用日志
                callLog: 'erd.cloud.bpm.log.entity.InterfaceInvokLog',
                // 消息通知模板
                msgNotify: 'erd.cloud.notify.entity.MsgNotify',
                // 消息发送类型
                notifySendType: 'erd.cloud.core.notify.enums.NotifySendType',
                plugin: 'erd.cloud.plugin.entity.Plugin',
                // 普通文件夹
                subFolder: 'erd.cloud.foundation.core.folder.entity.SubFolder',
                // 版本对象
                itemVersion: 'erd.cloud.fam.example.entity.DemoItemVersion',
                // 普通对象
                simpleFolderItem: 'erd.cloud.fam.example.entity.SimpleFolderItem',
                // 操作列表按钮
                menuActionFilter: 'erd.cloud.foundation.core.menu.entity.MenuActionFilter',
                // 容器团队
                ContainerTeam: 'erd.cloud.foundation.core.team.entity.ContainerTeam',
                // 容器团队关联对象
                RolePrincipalLink: 'erd.cloud.core.team.entity.RolePrincipalLink',
                Application: 'erd.cloud.foundation.tenant.entity.Application',
                // 流程应用规则
                procApplicationRule: 'erd.cloud.ppm.common.entity.ProcApplicationRule'
            },
            classNameAppMap: {},
            resourceAppNameMap: {},
            // 特殊常量
            specialConst: {
                specialOrganization: ['ORG000002', 'ORG000003', 'ORG000004', 'ORG999999'] // 02：未分配部门，03：已禁用，：04：已离职；99：已锁定
            },
            // 组件配置参数
            componentConfigs: {
                // 角色下拉框数据源配置
                'role-select': {
                    url: '/fam/role/list',
                    method: 'get',
                    data: {
                        appName: 'plat',
                        isGetVirtualRole: true
                    },
                    viewProperty: 'displayName',
                    valueProperty: 'oid'
                },
                'group-select': {
                    url: '/fam/group/list',
                    viewProperty: 'displayName',
                    valueProperty: 'oid',
                    data: {}
                },
                'enum-select': function (row) {
                    let data = row?.data || new FormData();
                    if ((row?.enumClass || row?.dataKey) && !row?.requestConfig?.params?.realType) {
                        data.append('realType', row.enumClass || row?.dataKey);
                    }
                    return {
                        url: '/fam/type/component/enumDataList',
                        viewProperty: 'name',
                        valueProperty: 'value',
                        method: 'post',
                        data,
                        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                        transformResponse: [
                            function (resp) {
                                let resData = resp;
                                try {
                                    resData = resp && JSON.parse(resp);
                                } catch (error) {
                                    console.error(error);
                                }
                                if (Array.isArray(resData.data)) {
                                    resData.data = resData.data.map((item) => ({
                                        ...item,
                                        value: item.name,
                                        name: item.value
                                    }));
                                }
                                return resData;
                            }
                        ]
                    };
                },
                'context-select': {
                    url: '/fam/listByKey',
                    viewProperty: 'value',
                    valueProperty: 'name',
                    data: {
                        className: 'erd.cloud.foundation.core.container.entity.ScalableContainer'
                    }
                },
                'custom-virtual-select': function (row) {
                    if (row?.dataKey) {
                        return {
                            url: '/fam/listByKey',
                            viewProperty: 'displayName',
                            valueProperty: 'key',
                            params: {
                                className: row.dataKey
                            }
                        };
                    }
                },
                'custom-virtual-tree-select': function (row) {
                    if (row?.dataKey) {
                        return {
                            url: '/fam/listByKey1',
                            viewProperty: 'displayName',
                            valueProperty: 'key',
                            data: {
                                className: row.dataKey
                            }
                        };
                    }
                }
            },
            // 组件之间的映射关系
            componentMapping: {
                'custom-virtual-select': 'custom-select',
                'custom-constant-select': 'custom-select',
                'custom-virtual-enum-select': 'custom-select',
                'custom-virtual-context-select': 'custom-select', // 上下文组件
                'custom-virtual-group-select': 'custom-select', // 群组
                'custom-virtual-role-select': 'custom-select', // 角色下拉框
                'custom-virtual-tree-select': 'custom-select',
                'custom-constant-enum-select': 'custom-select', // 枚举下拉框
                user: 'fam-member-select',
                'custom-user': 'fam-member-select',
                date: 'custom-date-time',
                'custom-date-range': 'custom-date-time'
            },
            // 全局搜索配置参数
            advancedSearch: {},

            // 全局搜索配置
            globalSearchConfig: {},
            // 全局搜索应用
            globalSearchConsum: {},
            // 供布局消费的一些小控件
            layoutComponentRegistry: {
                // 页头部小组件
                headerWidgets: []
            },
            // 操作按钮事件处理
            actionMethods: {},
            // 全局配置筛选等操作时，需要隐藏组件的条件
            conditionsNeedHideComponent: [
                'IS_NULL',
                'IS_NOT_NULL',
                'CURRENT_USER',
                'BETWEEN_CURRENT_WEEK',
                'NE_CURRENT_WEEK',
                'BETWEEN_NEXT_WEEK',
                'BETWEEN_LAST_WEEK',
                'BETWEEN_CURRENT_MONTH',
                'NE_CURRENT_MONTH',
                'BETWEEN_NEXT_MONTH',
                'BETWEEN_LAST_MONTH',
                'EQ_TODAY',
                'EQ_TOMORROW',
                'CURRENT_USER_DEPT',
                'LT_TODAY',
                'GT_TODAY'
            ],
            // 视图表格基础筛选条件映射
            basicFilterOperMapping: {
                'fam-member-select': 'EQ',
                'custom-date-time': 'BETWEEN',
                'custom-date-picker': 'BETWEEN',
                'erd-input': 'LIKE',
                'fam-i18nbasics': 'LIKE'
            },
            securityLabels: []
        },
        mutations: {
            PUSH_ENTITY_MAPPING(state, entityMapping) {
                state.entityMapping = _.extend({}, entityMapping);
            },
            PUSH_SERVICE_ROUTE_MAPPING(state, serviceRouteMapping) {
                state.serviceRouteMapping = _.extend({}, serviceRouteMapping);
            },
            PUSH_CLASSNAME_MAPPING(state, classNameMapping) {
                state.classNameMapping = _.extend({}, state.classNameMapping, classNameMapping);
            },
            setCompConfigs(state, pram) {
                state.componentConfigs = pram;
            },
            setComponentMapping(state, fieldType = {}) {
                // 将传入进来的组件名称转换成为 '-' 连接
                let newFieldType = {};
                _.keys(fieldType).forEach((key) => {
                    newFieldType[ErdcKit.hyphenate(key)] = fieldType[key];
                });
                state.componentMapping = _.extend({}, state.componentMapping, fieldType, newFieldType);
            },
            setGlobalSearchConfig(state, { key, value }) {
                state.globalSearchConfig = _.extend({}, state.globalSearchConfig, { [key]: value });
            },
            setGlobalSearchConsum(state, { key, value }) {
                state.globalSearchConsum = _.extend({}, state.globalSearchConsum, { [key]: value });
            },
            setAdvancedSearch(state, advancedSearch) {
                state.advancedSearch = _.extend({}, advancedSearch);
            },
            registerLayoutComponent(state, { name, component }) {
                state.layoutComponentRegistry = {
                    ...state.layoutComponentRegistry,
                    [name]: component
                };
            },
            registerLayoutHeaderWidgets(state, headerWidgets) {
                state.layoutComponentRegistry = {
                    ...state.layoutComponentRegistry,
                    headerWidgets: [...state.layoutComponentRegistry.headerWidgets, ...headerWidgets]
                };
            },
            setActionMethods(state, event) {
                state.actionMethods = _.extend({}, state.actionMethods, event);
            },
            setConditionsNeedHideComponent(state, conditions = []) {
                state.conditionsNeedHideComponent = _.union(state.conditionsNeedHideComponent, conditions);
            },
            PUSH_CLASSNAME_APP_MAP(state, classNameAppMap) {
                state.classNameAppMap = {
                    ...state.classNameAppMap,
                    ...classNameAppMap
                };
            },
            PUSH_RESOURCE_APP_MAP(state, resourceAppNameMap) {
                state.resourceAppNameMap = {
                    ...state.resourceAppNameMap,
                    ...resourceAppNameMap
                };
            },
            SET_OPER_RECORDS_TABS(state, tabs) {
                state.operRecordsTabs = tabs;
            },
            SET_BASIC_FILTER_OPER_MAP(state, operMap = {}) {
                state.basicFilterOperMapping = _.extend({}, state.basicFilterOperMapping, operMap);
            },
            SET_SECURITY_LABELS(state, securityLabels = []) {
                state.securityLabels = securityLabels;
            }
        },
        actions: {
            fetchRoutePrefix({ commit, state }) {
                return new Promise((resolve, reject) => {
                    require([ELMP.resource('erdc-app/api/app.js')], function (AppApi) {
                        AppApi.fetchRoutePrefix()
                            .then(({ data }) => {
                                const serviceRouteMapping = data.serviceRouteMapping || {};
                                const entityMapping = data.entityMapping || {};
                                const classNameAppMap = state.classNameAppMap || {};
                                Object.assign(
                                    classNameAppMap,
                                    Object.keys(entityMapping).reduce((prev, className) => {
                                        prev[className] = serviceRouteMapping[entityMapping[className]]?.appName;
                                        return prev;
                                    }, {})
                                );
                                commit('PUSH_SERVICE_ROUTE_MAPPING', data.serviceRouteMapping);
                                commit('PUSH_ENTITY_MAPPING', data.entityMapping);
                                commit('PUSH_CLASSNAME_APP_MAP', classNameAppMap);
                                localStorage.setItem('serviceRoute', JSON.stringify(data));
                                resolve(data);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    });
                });
            },
            setCompConfigs({ commit }, payload) {
                commit('setCompConfigs', payload);
            },
            setComponentMapping({ commit }, payload) {
                commit('setComponentMapping', payload);
            },
            registerLayoutComponent({ commit }, { name, component }) {
                commit('registerLayoutComponent', { name, component });
            },
            registerLayoutComponents({ commit }, payload) {
                if (Array.isArray(payload)) {
                    payload.forEach(({ name, component }) => commit('registerLayoutComponent', { name, component }));
                }
                Object.keys(payload).forEach((name) => {
                    commit('registerLayoutComponent', { name, component: payload[name] });
                });
            },
            registerLayoutHeaderWidget({ commit }, widget) {
                if (!widget) {
                    throw new Error('布局部件错误');
                }
                commit('registerLayoutHeaderWidgets', [widget]);
            },
            registerLayoutHeaderWidgets({ commit }, headerWidgets) {
                commit('registerLayoutHeaderWidgets', headerWidgets);
            },
            setAdvancedSearch({ commit }, advancedSearch) {
                commit('setAdvancedSearch', advancedSearch);
                return Promise.resolve();
            },
            registerActionMethods({ commit }, actionMethods) {
                commit('setActionMethods', actionMethods);
                return Promise.resolve();
            },
            setConditionsNeedHideComponent({ commit }, payload) {
                commit('setConditionsNeedHideComponent', payload);
            },
            setBasicFilterOperMap({ commit }, payload) {
                commit('SET_BASIC_FILTER_OPER_MAP', payload);
            },
            setGlobalSearchConfig({ commit }, node) {
                if (node) {
                    axios({
                        url: 'fam/globalSearch/findTableViewByTypeName',
                        className: 'erd.cloud.foundation.search.entity.GlobalSearch',
                        params: {
                            typeName: node.typeName
                        }
                    }).then((resp) => {
                        const { data } = resp || [];
                        commit('setGlobalSearchConfig', { key: 'viewList', value: data });
                        commit('setGlobalSearchConfig', { key: 'currentModel', value: node });
                    });
                } else {
                    commit('setGlobalSearchConfig', { key: 'viewList', value: [] });
                    commit('setGlobalSearchConfig', { key: 'currentModel', value: {} });
                }
            },
            setGlobalSearchConsum({ dispatch }, { action, key, params }) {
                dispatch(action, { key, params });
            },
            getModelTypeList({ commit }, { key }) {
                axios({
                    url: '/fam/listAllTree',
                    params: {
                        className: 'erd.cloud.foundation.search.entity.GlobalSearch'
                    }
                }).then((resp) => {
                    const { data } = resp || [];
                    const recursionFn = (data) => {
                        data = data.map((item) => {
                            if (!item.target) {
                                return;
                            }
                            item = {
                                oid: item.key,
                                label: item.displayName,
                                value: item.identifierNo,
                                tableKey: item.target,
                                children: item.childList
                            };
                            if (item.children?.length) {
                                item.children = recursionFn(item.children);
                            }
                            return item;
                        });
                        return data.filter((item) => item);
                    };
                    const modelTypeList = recursionFn(data);
                    const flattenModelTypeList = ErdcKit.TreeUtil.flattenTree2Array(modelTypeList);
                    commit('setGlobalSearchConsum', { key, value: modelTypeList });
                    commit('setGlobalSearchConsum', { key: 'flattenModelTypeList', value: flattenModelTypeList });
                });
            },
            getTableViews({ commit, state }, { key }) {
                axios({
                    url: '/fam/globalSearch/tableList',
                    params: {
                        typeName: state.globalSearchConsum.mainModelType
                    }
                }).then((resp) => {
                    const { data } = resp || [];
                    commit('setGlobalSearchConsum', { key, value: data });
                });
            },
            fetchSecurityLabels({ commit }) {
                const data = new FormData();
                data.append('realType', 'erd.cloud.core.enums.SecurityLabel');
                return axios.post('/fam/type/component/enumDataList', data).then((resp) => {
                    commit('SET_SECURITY_LABELS', resp.data || []);
                });
            }
        },
        getters: {
            routePrefix: (state) => (url) => {
                const serviceRouteMapping = state.serviceRouteMapping;
                const service = /\/?(\S+)\//.exec(url)[1]?.split('/')[0];
                const mapInfo = serviceRouteMapping[service];
                if (mapInfo) {
                    return (mapInfo.contextPath + '/' + url).replace(/\/\//g, '/');
                }
                return url;
            },
            className: (state) => (shortName) => {
                const classNameMapping = state.classNameMapping;
                const className = classNameMapping[shortName];
                return className || shortName;
            },
            specialConstName: (state) => (constName) => {
                const res = state.specialConst[constName];
                return res || constName;
            },
            componentConf: (state) => {
                return state.componentConfigs;
            },
            advancedConf: (state) => (key) => {
                const advancedConfMap = state.advancedSearch;
                const advanced = advancedConfMap[key];
                return advanced || {};
            },
            getGlobalSearchConfig: (state) => (key) => {
                return state.globalSearchConfig[key];
            },
            getGlobalSearchConsum: (state) => (key) => {
                return state.globalSearchConsum[key];
            },
            getEntityPrefix: (state) => (className) => {
                const entityMapping = state.entityMapping;
                return entityMapping[className];
            },
            getServicePath: (state) => (serviceName) => {
                const service = state.serviceRouteMapping[serviceName];
                if (service) {
                    return [service.contextPath.replace(/\/\//g, '/'), service.shortName].join('/');
                }
                return '';
            },
            headerWidgets(state) {
                const headerWidgets = state.layoutComponentRegistry.headerWidgets.filter((widget) => {
                    if (typeof widget.hidden === 'boolean') {
                        return widget.hidden;
                    }
                    if (typeof widget.hidden === 'function') {
                        return widget.hidden();
                    }
                    return true;
                });
                return _.sortBy(headerWidgets, 'sort');
            },
            getActionMethod: (state) => (actionName) => {
                const actionMethods = state.actionMethods;
                const methodName = actionMethods[actionName];

                return methodName || undefined;
            },
            getComponent: (state) => (originalName) => {
                const componentMapping = state.componentMapping;
                const componentName = componentMapping[originalName];
                return componentName || originalName;
            },
            getConditionsNeedHideComponent: (state) => () => {
                return state.conditionsNeedHideComponent;
            },
            /**
             * 根据服务名称获取对应的应用名, 支持服务长名与短名
             * @returns {(serviceName: string) => string}
             */
            appNameByService: (state) => (serviceName) => {
                const serviceRouteMapping = state.serviceRouteMapping || {};
                if (serviceRouteMapping[serviceName]) {
                    return serviceRouteMapping[serviceName].appName;
                }
                return Object.values(serviceRouteMapping).find((service) => service.identifierNo === serviceName)
                    ?.appName;
            },
            /**
             * 根据className获取对应的应用名
             * @returns {(className: string) => (string|string[])}
             */
            appNameByClassName: (state) => (className) => {
                const classNameAppMap = state.classNameAppMap || {};
                const appNames = classNameAppMap[className];
                if (appNames?.length === 1) {
                    return appNames[0];
                }
                return appNames || null;
            },
            appNameByResourceKey: (state) => (resourceKey) => {
                const resourceAppNameMap = state.resourceAppNameMap || {};
                return resourceAppNameMap[resourceKey];
            },
            getBasicFilterOper: (state) => (originalName) => {
                const basicFilterOperMapping = state.basicFilterOperMapping;
                return basicFilterOperMapping[originalName];
            }
        }
    };
});

/**
 * 系统管理-模板管理-客制化
 */
define('fam:store:module:famTemplateManagement', function () {
    return {
        state: {
            // 当前对象上下文
            pageComponentNameMapping: {
                'erd.cloud.fam.example.entity.Product': 'FamAdvancedTable'
            },
            tableConfigMapping: {
                // 'erd.cloud.fam.example.entity.Product': function(this) { return {}}
            }
        },
        getters: {
            getTableConfig: (state) => (className, vueContext) => {
                const tableConfigMapping = state.tableConfigMapping;
                const tableConfigFn = tableConfigMapping[className];
                return typeof tableConfigFn === 'function' ? tableConfigFn(vueContext) : tableConfigFn;
            }
        },
        mutations: {
            SET_TABLE_CONFIG_MAPPING(state, { context, type }) {
                state.tableConfigMapping[type] = context;
            },
            UPDATE_PAGE_COMPONENT_NAME_MAPPING(state, { className, contentComponent }) {
                state.pageComponentNameMapping[className] = contentComponent;
            }
        },
        actions: {
            registerTemplateAssets({ commit }, payload) {
                const payloadArray = Array.isArray(payload) ? payload : [payload];
                return new Promise((resolve) => {
                    payloadArray.forEach(({ className, contentComponent }) => {
                        commit('UPDATE_PAGE_COMPONENT_NAME_MAPPING', { className, contentComponent });
                    });
                    resolve();
                });
            }
        }
    };
});

/**
 * 业务管理-流程管理-流程属性
 */
define('bpm:store:module:bpmProcessProperty', [], function () {
    return {
        namespaced: true,
        state: {
            // Reference to FamStore.state.component.widgets
            supportedWidgets: [
                'ErdInput',
                'CustomSelect',
                'CustomVirtualEnumSelect',
                'CustomVirtualSelect',
                'CustomDateTime',
                'FamI18nbasics',
                'FamBoolean',
                'FamCheckbox',
                'ErdSwitch',
                'FamMemberSelect',
                'FamParticipantSelect',
                'FamIconSelect'
            ],
            unsupportedConfigurations: {
                common: [
                    'field',
                    'component',
                    'ref',
                    'listeners',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'defaultValue',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild',
                    'timeLowerLimit',
                    'timeUpperLimit'
                ]
            }
        },
        mutations: {
            SET_SUPPORTED_WIDGETS(state, supportedWidgets) {
                state.supportedWidgets = supportedWidgets;
            },
            PUSH_SUPPORTED_WIDGETS(state, supportedWidgets) {
                state.supportedWidgets = [...state.supportedWidgets, ...supportedWidgets].reduce((prev, widgetKey) => {
                    if (!prev.includes(widgetKey)) {
                        prev.push(widgetKey);
                    }
                    return prev;
                }, []);
            }
        },
        actions: {
            setSupportedWidgets({ commit }, supportedWidgetKeys = []) {
                commit('SET_SUPPORTED_WIDGETS', supportedWidgetKeys);
            },
            pushSupportedWidgets({ commit }, supportedWidgetKeys = []) {
                commit('PUSH_SUPPORTED_WIDGETS', supportedWidgetKeys);
            }
        }
    };
});

/**
 * 业务管理-流程管理-表单配置
 */
define('bpm:store:module:bpmPartial', ['underscore'], function () {
    const _ = require('underscore');

    return {
        namespaced: true,
        state: {
            registeredResources: {}
        },
        mutations: {
            REGISTER_RESOURCE(state, { key, resource }) {
                key && resource && (state.registeredResources[key] = resource);
            }
        },
        actions: {
            registerResource({ commit }, { key, resource }) {
                commit('REGISTER_RESOURCE', { key, resource });
            }
        },
        getters: {
            // 获取评审对象
            getResource:
                ({ registeredResources }) =>
                (resourceKey) => {
                    const { processDefinitionKey, activityId } = resourceKey;
                    return (
                        registeredResources[`${processDefinitionKey}-${activityId}`] ||
                        registeredResources[processDefinitionKey]
                    );
                },
            getResources: (state) => (resourceKey, resourceValue) => {
                return _.filter(state.registeredResources, { [resourceKey]: resourceValue });
            },
            // 获取评审对象路径
            getResourceUrl: (state, getters) => (resourceKey) => {
                const resource = getters?.getResource(resourceKey);
                return _.isObject(resource) ? resource?.url : resource;
            },
            // 获取评审对象自定义配置
            getResourceConfig: (state, getters) => (resourceKey) => {
                const resource = getters?.getResource(resourceKey);
                return resource?.config;
            },
            // 获取自定义接口className
            getResourceClassName: (state, getters) => (resourceKey) => {
                const resource = getters?.getResource(resourceKey);
                return resource?.className;
            },
            // 获取自定义接口请求头
            getResourceInterfaceHeaders: (state, getters) => (resourceKey) => {
                const resource = getters?.getResource(resourceKey);
                return resource?.headers;
            }
        }
    };
});

/**
 * 业务管理-处理流程
 */
define('bpm:store:module:bpmProcessPanel', ['underscore'], function () {
    const _ = require('underscore');

    return {
        namespaced: true,
        state: {
            processPanel: {},
            // 自定义回显
            afterEcho: {
                resourceKey: {
                    launcher: {
                        handlerConf: function (data) {
                            return data;
                        }
                    },
                    draft: {
                        handlerConf: function (data) {
                            return data;
                        }
                    },
                    activator: {
                        handlerConf: function (data) {
                            return data;
                        }
                    }
                }
            },
            // 自定义提交
            beforeSubmit: {
                launcher: function (data) {
                    return data.data;
                },
                activator: function (data) {
                    return data.data;
                }
            },
            // 自定义团队成员
            teamMember: {
                TEAM_MEMBER: function () {
                    return [];
                }
            },
            eventObject: {},
            callback: {
                goBack: {
                    launcher: null,
                    activator: null
                },
                successCallback: {},
                errorCallback: {}
            }
        },
        mutations: {
            // 处理流程页面自定义折叠面板
            REGISTER_PROCESS_PANEL(state, { key, panelSection, resource }) {
                panelSection && !state.processPanel[panelSection] && (state.processPanel[panelSection] = {});
                panelSection && key && (state.processPanel[panelSection][key] = resource);
            },
            REGISTER_AFTER_ECHO(state, { key, processState, resource }) {
                state.afterEcho[key] = state.afterEcho[key] || {};
                state.afterEcho[key][processState] = resource;
            },
            REGISTER_BEFORE_SUBMIT(state, { key, func }) {
                state.beforeSubmit[key] = func;
            },
            REGISTER_TEAM_MEMBER(state, { key, func }) {
                state.teamMember[key] = func;
            },
            // 缓存流程页面vm
            SET_EVENT_OBJECT(state, payload) {
                if (payload) {
                    payload = { ...state.eventObject, ...payload };
                    payload = _.pick(payload, (value) => _.isFunction(value));
                    state.eventObject = payload;
                }
            },
            // 处理流程回调函数
            SET_CALLBACK(state, { type, key, func }) {
                if (type && key) {
                    state.callback[type] = state.callback[type] || {};
                    state.callback[type][key] = func;
                }
            }
        },
        actions: {
            // 处理流程页面自定义折叠面板
            registerProcessPanel({ commit }, bpmProcessPanel) {
                commit('REGISTER_PROCESS_PANEL', bpmProcessPanel);
            },
            // 发起流程自定义数据回显
            setAfterEcho({ commit }, { key, processState, resource }) {
                commit('REGISTER_AFTER_ECHO', { key, processState, resource });
            },
            // 处理流程自定义数据封装
            setBeforeSubmit({ commit }, { key, func }) {
                commit('REGISTER_BEFORE_SUBMIT', { key, func });
            },
            // 流程自定义参与者角色团队成员
            setTeamMember({ commit }, { key, func }) {
                commit('REGISTER_TEAM_MEMBER', { key, func });
            },
            // 缓存流程页面vm
            setEventObjectAction({ commit }, payload) {
                commit('SET_EVENT_OBJECT', payload);
            },
            // 处理流程回调函数
            setCallback({ commit }, { type, key, func }) {
                commit('SET_CALLBACK', { type, key, func });
            }
        },
        getters: {
            // 获取流程区块配置
            getProcessPanelSection:
                (state) =>
                ({ panelSection }) => {
                    const processPanel = state?.processPanel || {};
                    return processPanel && _.isObject(processPanel) ? processPanel?.[`${panelSection}`] : {};
                },
            getProcessPanelResource: (state) => (data) => {
                const { processStep, processDefinitionKey, activityId, panelResource = {} } = data;
                _.each(state?.processPanel, (value, key) => {
                    if (value[`${processStep}-${processDefinitionKey}-${activityId}`] !== undefined) {
                        panelResource[key] = value[`${processStep}-${processDefinitionKey}-${activityId}`];
                    } else if (value[`${processDefinitionKey}-${activityId}`] !== undefined) {
                        panelResource[key] = value[`${processDefinitionKey}-${activityId}`];
                    } else {
                        panelResource[key] = value[processDefinitionKey];
                    }
                });
                return panelResource;
            },
            // 获取对应缓存
            getResource: (state) => (resourceName, resourceKey) => {
                const { processDefinitionKey, activityId } = resourceKey;
                return (
                    state[resourceName][`${processDefinitionKey}-${activityId}`] ||
                    state[resourceName][processDefinitionKey] ||
                    state[resourceName][activityId]
                );
            },
            // 获取处理流程自定义数据
            getProcessBeforeSubmit: (state) => (result) => {
                const { key, data } = result;
                return _.isFunction(state.beforeSubmit[key]) ? state.beforeSubmit[key](result) : data;
            },
            // 获取参与者角色团队成员自定义接口数据
            getProcessRoleList:
                (state, getters) =>
                ({ processDefinitionKey, activityId }) => {
                    const resource = getters?.getResource('teamMember', { processDefinitionKey, activityId });
                    return _.isFunction(resource) ? resource : null;
                },
            getEventObject: (state) => {
                return state?.eventObject;
            },
            getCallback:
                (state) =>
                ({ type, key }) =>
                    type && key ? state.callback[type][key] : null
        }
    };
});

/**
 * 公共表单页面配置
 */
define('fam:store:module:infoPage', ['underscore'], function () {
    return {
        namespaced: true,
        state: {
            commonPageConfig: {},
            pagePathConfig: {}
        },
        mutations: {
            ADD_CLASSNAME_CONFIG(state, { className, config }) {
                state.commonPageConfig[className] = {
                    config,
                    custom: {}
                };
            },
            UPDATE_CLASSNAME_CONFIG(state, { className, updateKey, config }) {
                state.commonPageConfig[className]['custom'][updateKey] = config;
            },
            ADD_PATH_CONFIG(state, { className, configPath, handleModule }) {
                state.pagePathConfig[className] = {
                    className,
                    configPath,
                    handleModule
                };
            }
        },
        actions: {
            // playpoad: { className: 'erd.cloud.ppm.project.entity.Project', config: this.options}
            addClassNameConfig({ commit }, payload) {
                commit('ADD_CLASSNAME_CONFIG', payload);
            },
            // playpoad: { className: 'erd.cloud.ppm.project.entity.Project',updateKey: 'detail', config: this.options}
            updateClassNameConfig({ commit }, payload) {
                commit('UPDATE_CLASSNAME_CONFIG', payload);
            },
            // playpoad: { className: 'erd.cloud.ppm.project.entity.Project', configPath: 'library-app/config/common-page-config.js' }
            addPathConfig({ commit }, payload) {
                commit('ADD_PATH_CONFIG', payload);
            }
        },
        getters: {
            getClassNameConfig: (state) => (className) => {
                const commonPageConfig = state.commonPageConfig;
                return commonPageConfig[className];
            }
        }
    };
});

/*
 * 本地缓存模块
 */
define('fam:store:module:personalPreference', ['underscore', 'fam:store:module:app', 'erdcloud.kit'], function () {
    const app = require('fam:store:module:app');
    const ErdcKit = require('erdcloud.kit');

    const tryReadLocalStorage = (localStorageKey, defaultValue) => {
        try {
            return JSON.parse(window.LS.get(localStorageKey));
        } catch {
            return defaultValue;
        }
    };
    let preferenceConfig = tryReadLocalStorage('preferenceConfig', {});

    return {
        state: {
            preferenceConfig: preferenceConfig
        },
        mutations: {
            PREFERENCE_CONFIG(state, { config, resource }) {
                const userOid = app.state.user.oid || '';
                const { user = userOid, configType = 'viewTableConfig', viewOid, type, _this = null } = config;
                let LSViewTableConfig = state.preferenceConfig;
                const filed = `${user}_${configType}${viewOid ? '_' + viewOid : ''}${type ? '_' + type : ''}`;
                ErdcKit.setFieldValue(LSViewTableConfig, filed, resource, _this, '_');

                window.LS.set('preferenceConfig', JSON.stringify(LSViewTableConfig));
                state.preferenceConfig = LSViewTableConfig;
            }
        },
        // actions: {
        //     preferenceConfig({ commit }, config, resource) {
        //         commit('PREFERENCE_CONFIG', config, resource);
        //     }
        // },
        getters: {
            getPreferenceConfig: (state) => (config) => {
                const userOid = app.state.user.oid || '';
                const { user = userOid, configType = 'viewTableConfig', viewOid, type, _this = null } = config;
                let LSConfig = state.preferenceConfig || tryReadLocalStorage('preferenceConfig', {});
                const filed = `${user}_${configType}${viewOid ? '_' + viewOid : ''}${type ? '_' + type : ''}`;
                return LSConfig ? ErdcKit.getFieldValue(LSConfig, filed, _this, '_') : LSConfig;
            }
        }
    };
});

/*
 * 工作台-操作记录
 */
define('fam:store:module:operationRecords', function () {
    return {
        state: {
            /**
             * 操作记录 默认tab栏：我的导入、我的导出
             * @label 国际化key值
             * @name 标签栏的name
             * @componentPath 组件路径
             */
            operRecordsTabs: [
                {
                    label: 'myImport',
                    name: 'taskTabPanelImport',
                    componentPath: 'biz-import-export/ImportAndExportTaskList/index.js'
                },
                {
                    label: 'myExport',
                    name: 'taskTabPanelExport',
                    componentPath: 'biz-import-export/ImportAndExportTaskList/index.js'
                },
                {
                    label: 'signTask',
                    name: 'taskCenter',
                    componentPath: 'biz-signature/taskCenter/index.js'
                }
            ]
        },
        mutations: {
            SET_OPER_RECORDS_TABS(state, tabs) {
                state.operRecordsTabs = tabs;
            },
            PUSH_OPER_RECORDS_TABS(state, tab) {
                state.operRecordsTabs.push(tab);
            }
        },
        actions: {
            setOperRecordsTabs({ commit }, tabs) {
                commit('SET_OPER_RECORDS_TABS', tabs);
            },
            pushOperRecordsTabs({ commit }, tab) {
                commit('PUSH_OPER_RECORDS_TABS', tab);
            }
        }
    };
});

/**
 * 空间容器
 */
define('fam:store:module:space', ['erdcloud.http', 'erdc-kit'], function (axios, ErdcKit) {
    return {
        namespaced: true,
        state: {
            // 当前对象上下文
            context: null,
            // 当前空间对象
            object: null,
            // 原始对象
            rawObject: null,
            rawObjectMap: {},
            contextMap: {},
            objectMap: {},
            spaceMenu: {}
        },
        mutations: {
            SET_SPACE_CONTEXT(state, context) {
                state.context = context;
                if (context && context.oid) {
                    state.contextMap[context.oid] = context;
                }
            },
            SET_OBJECT(state, object) {
                state.object = object;
                if (object && object.oid) {
                    state.objectMap[object.oid] = object;
                }
            },
            SET_SPACE_MENU(state, { object, menus }) {
                state.spaceMenu[object.oid] = menus;
            },
            SET_RAW_OBJECT(state, rawObject) {
                state.rawObject = rawObject;
                if (rawObject?.oid?.value) {
                    state.rawObjectMap[rawObject?.oid?.value] = rawObject;
                }
            }
        },
        actions: {
            switchContext({ commit, state }, { containerOid, force }) {
                if (!containerOid) {
                    commit('SET_SPACE_CONTEXT', {});
                    commit('SET_OBJECT', {});
                    return Promise.resolve(state.contextMap[containerOid]);
                }
                if (state.contextMap[containerOid] && !force) {
                    return Promise.resolve(state.contextMap[containerOid]);
                }
                return axios
                    .get('/fam/container/getCurrentContainerInfo', {
                        data: {
                            oid: containerOid
                        }
                    })
                    .then((res) => Promise.resolve(res.data));
            },
            switchContextByObject({ dispatch, state, commit }, { objectOid, typeOid, force }) {
                return new Promise((resolve, reject) => {
                    const store = require('erdcloud.store');
                    const appName = store.state.app?.site?.appName;
                    if (
                        state.objectMap[objectOid] &&
                        !force &&
                        ([state.objectMap[objectOid].appName, state.objectMap[objectOid].appName?.value].includes(
                            appName
                        ) ||
                            [state.objectMap[objectOid].appName, state.objectMap[objectOid].appName?.value].includes(
                                'plat'
                            ))
                    ) {
                        const context = state.contextMap[state.objectMap[objectOid].containerRef];
                        const object = state.objectMap[objectOid];

                        commit('SET_OBJECT', object);
                        commit('SET_SPACE_CONTEXT', context);

                        resolve({
                            context,
                            object
                        });
                        return;
                    }
                    return dispatch('fetchObjectByOid', { objectOid, typeOid, force: force })
                        .then((objectDetail) => {
                            if (objectDetail) {
                                return dispatch('switchContext', {
                                    containerOid: objectDetail.containerRef,
                                    force: force
                                });
                            }
                        })
                        .then((context) => {
                            commit('SET_SPACE_CONTEXT', context);
                        })
                        .then(resolve)
                        .catch(() => {
                            const Vue = require('vue');
                            Vue.prototype.$message({
                                message: '您可能无权限访问此上下文。请尝试切换租户，或联系系统管理员处理',
                                type: 'error',
                                duration: 5000
                            });
                            reject(new Error('您可能无权限访问此上下文。请尝试切换租户，或联系系统管理员处理'));
                        });
                });
            },
            fetchObjectByOid({ state, commit }, { objectOid, typeOid, typeReference, force }) {
                let typeName = objectOid.split(':')[1];
                const store = require('erdcloud.store');
                const appName = store.state.app?.site?.appName;
                if (
                    state.objectMap[objectOid] &&
                    !force &&
                    ([state.objectMap[objectOid].appName, state.objectMap[objectOid].appName?.value].includes(
                        appName
                    ) ||
                        [state.objectMap[objectOid].appName, state.objectMap[objectOid].appName?.value].includes(
                            'plat'
                        ))
                ) {
                    return Promise.resolve(state.objectMap[objectOid]);
                }
                return new Promise((resolve, reject) => {
                    let url = '/fam/attr';
                    let data = {
                        oid: objectOid,
                        typeReference
                    };
                    if (typeOid) {
                        data.typeOid = typeOid;
                    }
                    axios
                        .get(url, {
                            className: typeName,
                            errorMessage: false,
                            data
                        })
                        .then((resp) => {
                            if (resp.success) {
                                const rawData = resp.data?.rawData;
                                commit('SET_RAW_OBJECT', rawData || {});

                                let object = {};
                                if (rawData) {
                                    object = ErdcKit.deserializeAttr(rawData, {
                                        valueMap: { containerRef: (val) => val.oid }
                                    });
                                }
                                commit('SET_OBJECT', object);
                                resolve(object);
                            } else {
                                reject(resp);
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            }
        },
        getters: {
            objectOid(state) {
                return state.object?.oid || state.object?.rawData?.oid?.value || null;
            }
        }
    };
});
