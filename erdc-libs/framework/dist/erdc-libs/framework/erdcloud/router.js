define(['erdcloud.store', 'vue-router', 'vue', 'underscore', 'erdcloud.kit', 'TreeUtil'], function () {
    const Vue = require('vue');
    const VueRouter = require('vue-router');
    const erdcloudStore = require('erdcloud.store');
    const _ = require('underscore');
    const ErdcloudKit = require('erdcloud.kit');

    Vue.use(VueRouter);

    let routerIns = new VueRouter({
        routes: []
    });
    /**
     * 判断是否是微功能的路由,如果是的话，就需要注册一下路由了
     * @param path
     * @returns {boolean}
     */
    function isMicroPath(path) {
        let { resourceKey } = erdcloudStore.getters['mfe/matchResourcePkg'](path);
        if (resourceKey) {
            let targetResource = erdcloudStore.getters['mfe/mfeAssets'].find((i) => i === resourceKey);
            return !!targetResource;
        } else {
            return false;
        }
    }
    function registerRoute(path) {
        let { resourceKey, routePrefix } = erdcloudStore.getters['mfe/matchResourcePkg'](path);
        return erdcloudStore.dispatch('mfe/registerRoute', {
            resourceKey: resourceKey,
            prefixRoute: routePrefix,
            path: path
        });
    }

    /**
     * 是否需要尝试去补充前缀,
     * 1. 如果能直接找到相关的组件,就不需要去补充前缀了
     * 2. 如果找不到,就需要补充一下前缀了
     * @param location
     * @returns {boolean}
     */
    const isTryReplenishPrefix = function (location) {
        let route = originalMatch.call(this, location);
        if (route && _.isEmpty(route.matched)) {
            return true;
        } else if (route && route.matched[0].path === '*') {
            return true;
        }
        return false;
    }.bind(routerIns);

    const parseMicroLocation = function (location) {
        const resourceCode = this.currentRoute?.meta?.resourceCode || '';
        if (_.isString(location)) {
            let routePrefix = this.currentRoute?.meta.prefixRoute;
            location = location.startsWith('/') ? `${routePrefix}${location}` : `${routePrefix}/${location}`;
        } else if (_.isObject(location) && location.name) {
            location.name = `${resourceCode}_${location.name}`;
        } else if (_.isObject(location) && location.path) {
            let routePrefix = this.currentRoute?.meta.prefixRoute;
            location.path = location.path.startsWith('/')
                ? `${routePrefix}${location.path}`
                : `${routePrefix}/${location.path}`;
        }
        return location;
    }.bind(routerIns);

    const doDefault = function (location, onComplete, onAbort, defaultAction) {
        if (isTryReplenishPrefix.call(this, location)) {
            let newLocation = parseMicroLocation.call(this, location);
            // 如果匹配了前缀之后,还是找不到正确的组件的话，就还是按照原来的地址跳
            if (isTryReplenishPrefix.call(this, newLocation)) {
                return defaultAction.call(this, location, onComplete, onAbort).catch(() => {
                    // console.error(err);
                });
            } else {
                return defaultAction.call(this, newLocation, onComplete, onAbort).catch(() => {
                    // console.error(err);
                });
            }
        } else {
            return defaultAction.call(this, location, onComplete, onAbort).catch(() => {
                // console.error(err);
            });
        }
    }.bind(routerIns);
    const originalPush = VueRouter.prototype.push;
    const originalReplace = VueRouter.prototype.replace;
    const originalMatch = VueRouter.prototype.match;
    VueRouter.prototype.match = function (raw, current, redirectedFrom) {
        if (isTryReplenishPrefix(raw)) {
            let newRaw = parseMicroLocation(raw);
            // let newMatchedRoute = originalMatch.call(this, newRaw, current, redirectedFrom);
            if (isTryReplenishPrefix(newRaw)) {
                return originalMatch.call(this, raw, current, redirectedFrom);
            } else {
                return originalMatch.call(this, newRaw, current, redirectedFrom); //newMatchedRoute;
            }
        } else {
            return originalMatch.call(this, raw);
        }
    };
    VueRouter.prototype.push = function (location, onComplete, onAbort) {
        let route = originalMatch.call(this, location);
        if (route && route.fullPath && isMicroPath(route.fullPath)) {
            return registerRoute(route.fullPath).then(() => {
                return doDefault(location, onComplete, onAbort, originalPush);
            });
        } else {
            return doDefault(location, onComplete, onAbort, originalPush);
        }
    };
    VueRouter.prototype.replace = function (location, onComplete, onAbort) {
        let route = originalMatch.call(this, location);
        if (route && route.fullPath && isMicroPath(route.fullPath)) {
            return registerRoute(route.fullPath).then(() => {
                return doDefault(location, onComplete, onAbort, originalReplace);
            });
        } else {
            return doDefault(location, onComplete, onAbort, originalReplace);
        }
    };

    function jumpToFirstMenu() {
        let menus = erdcloudStore.state.mfe.menus.children;
        let tempMenu = menus && menus.length > 0 ? menus[0] : null;
        while (tempMenu && tempMenu.children && !tempMenu.href && tempMenu.children.length > 0) {
            tempMenu = tempMenu.children[0];
        }
        return routerIns.replace(tempMenu?.href);
    }

    let loading = null;

    routerIns.beforeEach((to, from, next) => {
        if (from.path === '/' || from.path === '/login') {
            loading = Vue.prototype.$loading({
                body: true,
                fullscreen: true,
                lock: true
            });
        }
        next();
    });
    routerIns.beforeEach((to, from, next) => {
        const currentPath = ErdcloudKit.getHash();
        const { resourceKey, routePrefix } = erdcloudStore.getters['mfe/matchResourcePkg'](currentPath);
        // 目标资源包未注册，则尝试注册，再重新匹配
        if (
            currentPath &&
            resourceKey &&
            !_.isEmpty(erdcloudStore.state.mfe.menus) &&
            !erdcloudStore.state.mfe.routeLoadFlagMap[routePrefix]
        ) {
            erdcloudStore
                .dispatch('mfe/registerRoute', {
                    resourceKey: resourceKey,
                    prefixRoute: routePrefix,
                    path: ErdcloudKit.getHash()
                })
                .finally(() => {
                    next(currentPath);
                });
        } else {
            next();
        }
    });

    /**
     * 只能在拿到用户的菜单权限之后，只能根据菜单的前缀+微功能的路由，生成一套路由
     */
    routerIns.afterEach((to) => {
        loading && loading.close();
        if (erdcloudStore.state.user && !_.isEmpty(erdcloudStore.state.user)) {
            if (to.path === '/' || !to.path) {
                jumpToFirstMenu()
                    .then(() => {
                        // do nothing
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }
    });

    return routerIns;
});
