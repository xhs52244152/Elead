define([
    'erdc-kit',
    'erdcloud.router',
    'erdcloud.store',
    'erdc-kit',
    'erdcloud.http',
    'erdcloud.mfe',
    'framework',
    'erdcloud-ui',
    'erdcloud.i18n',
    ELMP.resource('erdc-app/screen-lock.js')
], function (
    ErdcloudKit,
    ErdcloudRouter,
    ErdcloudStore,
    ErdcKit,
    $famHttp,
    ErdcloudMfe,
    { useApp },
    { Message },
    i18n,
    screenLock
) {
    let whiteRoutes = ['/404'];

    function jumpDefaultApp() {
        let targetMenu = ErdcloudStore.state.route.allResourceTree.find((i) => i.identifierNo === 'erdc-portal-web');
        targetMenu =
            targetMenu && targetMenu.children.length ? targetMenu : ErdcloudStore.state.route.allResourceTree[0];
        let targetApp = ErdcloudStore.state.mfe.apps.find((i) => i.code === targetMenu.identifierNo);
        return new Promise((resolve) => {
            if (window.__currentAppName__ === targetApp.code) {
                return resolve();
            }
            let duration = 5;
            const $msg = Message({
                message: i18n.translate('emptyResource', {
                    countDown: duration,
                    appCode: targetApp.code,
                    appUrl: targetApp.url
                }),
                duration: 0,
                type: 'warning',
                dangerouslyUseHTMLString: true,
                onClose: () => {
                    resolve();
                }
            });
            const interval = window.setInterval(() => {
                duration--;
                $msg.message = i18n.translate('emptyResource', {
                    countDown: duration,
                    appCode: targetApp.code,
                    appUrl: targetApp.url
                });
                if (duration <= 0) {
                    window.clearInterval(interval);
                    $msg.close();
                }
            }, 1 * 1000);
        })
            .then(() => {
                window.location.replace(targetApp?.url || `/erdc-app/${targetApp.code}/index.html`);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    ErdcloudRouter.beforeEach((to, from, next) => {
        let token = ErdcloudStore.state.app.accessToken;
        let { resourceKey } = ErdcloudStore.getters['mfe/matchResourcePkg'](to.path);
        let targetResource = null;

        if (resourceKey) {
            targetResource = ErdcloudStore.state.mfe.resources.find((i) => i.code === resourceKey);
        }
        if (whiteRoutes.indexOf(to.path) > -1 || targetResource?.erdcData?.whiteResource) {
            next();
        } else if (screenLock.lockingStatus() && token && !_.isEmpty(ErdcloudStore.state.app.user)) {
            // 有锁屏标识 + 有token + 有用户信息 = 别的tab页签进入锁屏了，咱们跟着进
            next();
        } else if (screenLock.lockingStatus() && !token) {
            // 存在锁屏标识 + 没有token(因为在进入锁屏后会清空)     =   在锁屏状态下刷新页面
            ErdcKit.toLogin();
        } else if (ErdcloudStore.state.app.user && !_.isEmpty(ErdcloudStore.state.app.user)) {
            next();
        } else {
            if (token) {
                const appInst = useApp();
                appInst
                    .emitHook('created')
                    .then(() => {
                        const { resourceKey, routePrefix } = ErdcloudStore.getters['mfe/matchResourcePkg'](to.path);
                        // 目标资源包未注册，则尝试注册，再重新匹配
                        if (to.path && resourceKey && !ErdcloudStore.state.mfe.routeLoadFlagMap[routePrefix]) {
                            return ErdcloudStore.dispatch('mfe/registerRoute', {
                                meta: {
                                    prefixRoute: routePrefix
                                },
                                resourceKey: resourceKey,
                                prefixRoute: routePrefix,
                                path: ErdcloudKit.getHash()
                            });
                        } else {
                            return Promise.resolve();
                        }
                    })
                    .then(() => appInst.emitHook('beforeMount'))
                    .then(() => appInst.emitHook('mounted'))
                    .then(() => appInst.emitHook('initialized'))
                    .then(function () {
                        // 锁屏界面刷新依然跑到这里，说明，有一个tab页签，等处之后，又登入了。那么此时就进入到首页
                        // 为什么不进入锁屏之前的地址呢？因为别的tab页签重新登录的时候，可能换了别的账号了
                        if (to.path.indexOf('screenLock') > -1) {
                            return next('/');
                        }
                        return next(to.fullPath);
                    })
                    .catch((error) => {
                        console.error(error);
                        ErdcKit.toLogin(true);
                    });
            } else {
                ErdcKit.toLogin(true);
            }
        }
    });

    let routes = [
        {
            path: '/login',
            name: 'login',
            beforeEnter: function (to, from, next) {
                ErdcKit.clearStorageData();
                require(['css!' + ELMP.func('erdc-login/lib/style.css')], function () {
                    next();
                });
            },
            component: ErdcloudKit.asyncComponent(ELMP.func('erdc-login/lib/erdc-login.umd.js'))
        },
        {
            path: '/screenLock',
            name: 'screenLock',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-app/FamLockScreen/index.js'))
        },
        {
            path: '/redirect',
            name: 'redirect',
            beforeEnter(to, from, next) {
                let appName = to.query.appName;
                if (_.isEmpty(appName)) {
                    next('/');
                } else {
                    let href = to.query.href;
                    let menuCode = to.query.menuCode;
                    let params = Object.assign({}, to.query.params);
                    delete params.appName;
                    delete params.menuCode;
                    delete params.href;
                    if (menuCode) {
                        let targetMenu = ErdcloudStore.getters['route/matchResourcePath'](
                            { name: menuCode },
                            ErdcloudStore.state.route.allResourceTree
                        ).at(-1);
                        targetMenu && targetMenu.href && (href = targetMenu.href);
                    }
                    if (href) {
                        ErdcloudKit.open(href, { appName: appName });
                        return next(false);
                    }
                    next('/');
                }
            }
        },
        {
            path: '/403',
            name: '403',
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/NoPermission.js'))
        },
        {
            path: '/noPermission',
            name: 'NoPermission',
            component: {
                template: `<NoPermission :show403="false" tips="noPermAndContactTip"></NoPermission>`,
                components: {
                    NoPermission: ErdcloudKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/NoPermission.js'))
                }
            }
        },
        {
            path: '/404',
            name: '404',
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/NotFound.js')),
            meta: {}
        }
    ];
    let defaultRoute = [
        {
            path: '*',
            beforeEnter(to, from, next) {
                next('/404');
            }
        }
    ];
    let allRoutes = routes.concat(
        [
            {
                path: '',
                name: 'root',
                component: {
                    name: 'Root',
                    template: '<router-view></router-view>',
                    data() {
                        return {};
                    }
                }
            }
        ],
        defaultRoute
    );

    allRoutes.forEach((route) => {
        ErdcloudRouter.addRoute(route);
    });

    function resetRoute(layoutRoute) {
        if (_.isEmpty(layoutRoute)) {
            return;
        }
        const VueRouter = require('vue-router');
        let tempRouter = new VueRouter({
            routes: routes.concat(layoutRoute, defaultRoute)
        });
        ErdcloudRouter.matcher = tempRouter.matcher;
        let registeredResources = Object.keys(ErdcloudStore.state.mfe.routeLoadFlagMap);
        ErdcloudStore.state.mfe.routeLoadFlagMap = {};
        return Promise.all(
            registeredResources.map((i) => {
                let { resourceKey, routePrefix } = ErdcloudStore.getters['mfe/matchResourcePkg'](i);
                return ErdcloudStore.dispatch('mfe/registerRoute', {
                    resourceKey: resourceKey,
                    prefixRoute: routePrefix,
                    path: i
                });
            })
        );
    }

    return {
        resetRoute: resetRoute,
        jumpDefaultApp
    };
});
