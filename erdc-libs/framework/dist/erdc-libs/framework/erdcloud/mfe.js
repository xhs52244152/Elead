define([
    'erdcloud.store',
    'erdcloud.http',
    'erdcloud.router',
    'erdcloud.kit',
    'TreeUtil',
    'mfeHelper',
    'storage'
], function (erdcloudStore, $famHttp, erdcloudRouter, ErdcloudKit, TreeUtil, mfeHelper) {
    const { parseErdcData, extractCustomInfo, adjustPrefixRoute, relateRouteAndMenuInfo, matchResourcePath } =
        mfeHelper;

    const mfeStore = {
        namespaced: true,
        state: {
            menus: [],
            currentLayout: null,
            currentLayoutComponent: null,
            currentTheme: null,
            // mfe那里的配置数据：分为两部分：
            // 登录之后才能拿到的配置：资源包数据
            // 不用登录就能拿到的配置：布局数据
            config: {},
            apps: [],
            layouts: [],
            themes: [],
            resources: [],
            libs: [],
            // 路径和资源包的映射关系，为了在进入某个资源包之前，找到该资源包下面是否有route.js、optimize.js
            // hrefResourceMap: {},
            // 某个资源包的route是否加载过
            routeLoadFlagMap: {},
            // 图标库
            iconResources: [],
            // mapping用到的前缀映射
            resourceMapping: {},
            // 微功能映射
            resourceCustomMapping: {}
        },
        mutations: {
            PUSH_LAYOUT_COMPONENT(state, currentLayoutComponent) {
                state.currentLayoutComponent = currentLayoutComponent;
            },
            PUSH_ICON_RESOURCE(state, iconResource) {
                state.iconResources = [
                    ...state.iconResources.filter((item) => item.key !== iconResource.key),
                    iconResource
                ];
            },
            UPDATE_ICON_RESOURCE(state, iconResource) {
                const targetIndex = state.iconResources.findIndex((item) => item.key === iconResource.key);
                const target = state.iconResources[targetIndex];
                if (target && iconResource) {
                    state.iconResources.splice(targetIndex, 1, {
                        ...target,
                        ...iconResource
                    });
                }
            },
            SET_CONFIG(state, config) {
                ErdcloudKit.stringExpressionToObject(config, 'window');
                state.config = Object.assign({}, state.config, config);
            },
            SET_APPS(state, apps) {
                parseErdcData(apps);
                state.apps = apps || [];
            },
            SET_LIBS(state, libs) {
                parseErdcData(libs);
                state.libs = libs || [];
            },
            SET_LAYOUT(state, { layouts, apps }) {
                const ErdcApp = require('ErdcApp');
                const ErdcAppIns = ErdcApp.useApp();
                parseErdcData(layouts);
                state.layouts = layouts || [];
                let layout = window.LS.get(`${ErdcAppIns.appName}_layout`);
                if (!layout) {
                    let currentAppInfo = apps.find((i) => i.code === ErdcAppIns.$options.appName);
                    if (currentAppInfo?.layout) {
                        window.LS.set(`${ErdcAppIns.appName}_layout`, currentAppInfo?.layout);
                        layout = currentAppInfo?.layout;
                    }
                }
                state.currentLayout = layout || layouts[0]?.code;
            },
            SET_THEME(state, themes) {
                parseErdcData(themes);
                state.themes = themes || [];
                let theme = window.LS.get(`theme`);
                let currentThemeDetail = null;
                if (theme) {
                    currentThemeDetail = themes.find((i) => i.code === theme);
                }
                if (currentThemeDetail) {
                    state.currentTheme = theme;
                } else {
                    currentThemeDetail = themes[0];
                    state.currentTheme = currentThemeDetail.code;
                }
            },
            SET_CURRENT_THEME(state, theme) {
                state.currentTheme = theme;
            },
            SET_RESOURCE(state, resources) {
                parseErdcData(resources);
                state.resourceCustomMapping = extractCustomInfo(resources);
                state.resources = resources || [];
            },
            SET_RESOURCE_MAPPING(state, resourceMapping) {
                state.resourceMapping = resourceMapping;
            },
            // SET_HREF_RESOURCE_MAP(state, hrefResourceMap) {
            //     state.hrefResourceMap = hrefResourceMap;
            // },
            SET_MENUS(state, menus) {
                state.menus = menus || [];
            }
        },
        actions: {
            loadCurrentTheme({ dispatch, state }) {
                return dispatch('switchTheme', state.currentTheme);
            },
            switchTheme({ commit, state }, theme) {
                const ErdcApp = require('ErdcApp');
                const ErdcAppIns = ErdcApp.useApp();
                window.LS.set(`theme`, theme);
                commit('SET_CURRENT_THEME', theme);
                const loadStyle = function (href) {
                    return new Promise((resolve, reject) => {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = href;
                        link.onload = resolve;
                        link.onerror = reject;
                        document.head.appendChild(link);
                    });
                };

                return new Promise(function (resolve, reject) {
                    if (state.currentTheme) {
                        require([`/erdc-theme/${theme}/index.js`], function (module) {
                            if (module && module.load) {
                                module.load().then(resolve).catch(reject);
                            } else if (module.resources) {
                                Promise.all(module.resources.map(loadStyle)).then(resolve).catch(reject);
                            } else {
                                console.error('加载主题失败', `未发现主题资源（需要resources或load字段）`);
                            }
                        }, () => {
                            console.error('加载主题失败', `/erdc-theme/${theme}/index.js`);
                            reject();
                        });
                    } else {
                        resolve();
                    }
                });
            },
            switchLayout(context, layout) {
                const ErdcApp = require('ErdcApp');
                const ErdcAppIns = ErdcApp.useApp();
                window.LS.set(`${ErdcAppIns.appName}_layout`, layout);
                window.location.reload();
            },
            registerIconResource({ commit, state }, iconResource) {
                const { styleHref, definitionUrl, displayName, key } = iconResource;
                if (!styleHref || !definitionUrl || !key) {
                    console.error(new Error(`${displayName} 图标集未指定 key/styleHref/definitionUrl`));
                    return;
                }
                if (state.iconResources.some((item) => item.key === key)) {
                    console.error(new Error(`${displayName} 图标集重复，请检查 key`));
                    return;
                }
                commit('PUSH_ICON_RESOURCE', iconResource);
                const link = document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('href', styleHref);
                document.head.appendChild(link);
                require(['text!' + iconResource.definitionUrl], function (jsonString) {
                    let iconfont = {};
                    try {
                        iconfont = JSON.parse(jsonString);
                    } catch (error) {
                        console.error(error);
                    }
                    commit('UPDATE_ICON_RESOURCE', {
                        key,
                        iconfont
                    });
                });
            },
            registerIconResources({ dispatch, state }) {
                let libs = state.libs || [];
                _.each(libs, function (i) {
                    if (i.erdcData && !_.isEmpty(i.erdcData.icons)) {
                        _.each(i.erdcData.icons, function (icon) {
                            icon.styleHref = icon.styleHref.startsWith('/')
                                ? `/erdc-libs/${i.code}${icon.styleHref}`
                                : `/erdc-libs/${i.code}/${icon.styleHref}`;
                            icon.definitionUrl = icon.definitionUrl.startsWith('/')
                                ? `/erdc-libs/${i.code}${icon.definitionUrl}`
                                : `/erdc-libs/${i.code}/${icon.definitionUrl}`;
                            dispatch('registerIconResource', icon);
                        });
                    }
                });
            },
            loadNoAuthInfo({ commit }) {
                return $famHttp.get('/platform/mfe/apps/info').then(({ data }) => {
                    const resp = data;
                    if (resp.success) {
                        let resources = resp.data.resources || [];
                        let configArr = resp.data.configs || [];
                        let config = {};
                        configArr.map((i) => {
                            config[i.key] = i.value;
                        });

                        commit('SET_LAYOUT', {
                            layouts: resp.data.layouts,
                            apps: resp.data.apps || []
                        });
                        commit('SET_RESOURCE', resources);
                        commit('SET_LIBS', resp.data.libs);
                        commit('SET_APPS', resp.data.apps || []);
                        commit('SET_CONFIG', config);
                        commit('SET_THEME', resp.data.themes || []);
                    }
                });
            },
            registerRoute({ state, getters }, { resourceKey, prefixRoute, path }) {
                let resource = getters.mfeAssets.find((i) => i === resourceKey);
                let _prefixRoute = prefixRoute;
                if (state.routeLoadFlagMap[_prefixRoute]) {
                    return Promise.resolve();
                }
                if (resource) {
                    return new Promise((resolve) => {
                        let originName = state.resourceCustomMapping[resourceKey] || resourceKey;
                        require([ELMP.resource(`${originName}/route.js`)], function (resourceRoute) {
                            resourceRoute = ErdcloudKit.deepClone(resourceRoute);
                            if (!_.isArray(resourceRoute)) {
                                resourceRoute = [resourceRoute].filter(Boolean);
                            }
                            /**
                             * meta: {
                             *     resourceKey: 微功能包的名字
                             *     resourceCode: 微功能绑定菜单的编码
                             *     prefixRoute: 【parentRouteCode对应的路径】/【resourceKey】
                             * }
                             */
                            let layoutPaths = erdcloudRouter.getRoutes().filter((i) => i?.meta?._layoutPath) || [];
                            let currentPrefixPath = path.substring(0, path.indexOf(resourceKey));
                            let parentRoutePath = '/';
                            let parentRouteName = 'root';
                            layoutPaths.forEach((i) => {
                                if (currentPrefixPath.startsWith(i.path) && i.path.length > parentRoutePath.length) {
                                    parentRoutePath = i.path;
                                    parentRouteName = i.name;
                                }
                            });
                            adjustPrefixRoute(resourceRoute, resourceKey, prefixRoute);
                            relateRouteAndMenuInfo(resourceRoute);
                            let parentPath = parentRoutePath === '/' ? '' : parentRoutePath;
                            prefixRoute = prefixRoute.substring(prefixRoute.indexOf(parentPath) + parentPath.length);
                            if (prefixRoute.startsWith('/')) {
                                prefixRoute = prefixRoute.substring(1);
                            }
                            _.each(resourceRoute, (route) => {
                                if (route.path.startsWith('/')) {
                                    route.path = `/${prefixRoute}${route.path}`;
                                    if (route.path.endsWith('/')) {
                                        route.path = route.path.substring(0, route.path.length - 1);
                                    }
                                    erdcloudRouter.addRoute(route);
                                } else {
                                    route.path = `${prefixRoute}/${route.path}`;
                                    if (route.path.endsWith('/')) {
                                        route.path = route.path.substring(0, route.path.length - 1);
                                    }
                                    erdcloudRouter.addRoute(parentRouteName, route);
                                }
                            });
                            state.routeLoadFlagMap[_prefixRoute] = true;
                            resolve();
                        });
                    });
                } else {
                    console.error('路由注册失败', resourceKey, prefixRoute);
                }
                return Promise.resolve();
            }
        },
        getters: {
            /**
             * MFE 资产单，返回主题、布局、资源、共享等资源包的 key
             */
            mfeAssets(state, getters) {
                let originNames = _.keys(state.resourceCustomMapping);
                return getters.mfeAssetInfos
                    .map((item) => item.code)
                    .filter(Boolean)
                    .concat(originNames);
            },
            mfeAssetInfos(state) {
                return [
                    // 主题对象无 code 属性
                    ...state.themes.map((theme) => ({ ...theme, code: theme.code || theme.name })),
                    ...state.layouts,
                    ...state.resources,
                    ...state.libs
                ].filter(Boolean);
            },
            /**
             * 通过路径提取资源包信息
             * @returns {{ resourceKey: string|null, routePrefix: string|null }}
             */
            matchResourcePkg: (state, getter) => (path) => {
                let resourceKey = null;
                const filePath = path.split('?')[0];
                if (/\.\w+$/.test(filePath)) {
                    if (/[^/]+\/apps\/([^/]+)\//.test(path)) {
                        resourceKey = path.split('/apps/')[1].split('/')[1];
                    } else {
                        resourceKey = path.split('/')[/^\//.test(path) ? 2 : 1];
                    }
                } else {
                    const assets = getter.mfeAssets || [];
                    let tempPath = filePath.endsWith('/') ? filePath : filePath + '/';
                    resourceKey = new RegExp(`/(${assets.join('|')})/`).exec(tempPath)?.[1];
                }
                if (resourceKey) {
                    return {
                        resourceKey,
                        routePrefix: path.substring(0, path.indexOf(resourceKey) + resourceKey.length)
                    };
                }
                return { resourceKey: null, routePrefix: null };
            },
            matchResourcePath
        }
    };
    erdcloudStore.registerModule('mfe', mfeStore);

    function switchApp(appName) {
        let apps = erdcloudStore.state.mfe.apps || [];
        let app = apps.find((a) => a.code === appName);
        if (app) {
            let url = app?.url || `/erdc-app/${appName}/index.html`;
            if (app?.url && /^https?:/i.test(app.url)) {
                require(['erdcloud.http', 'erdcloud.kit'], function (ErdcloudHttp, ErdcKit) {
                    ErdcloudHttp({
                        url: '/platform/mfe/token/getCode',
                        params: {
                            token: window.LS.get('accessToken'),
                            appName: appName
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            let appUrl = ErdcKit.joinUrl(app.url, {
                                code: resp.data
                            });
                            window.open(appUrl, appName);
                        }
                    });
                });
            } else {
                window.open(url, appName);
            }
        }
    }

    function getCurrentLayout() {
        return erdcloudStore.state.mfe.currentLayout;
    }

    return {
        switchApp,
        matchResourcePath,
        getCurrentLayout
    };
});
