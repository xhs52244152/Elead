define([
    'erdc-idle',
    ELMP.resource('erdc-app/interceptors.js'),
    'css!' + ELMP.resource('erdc-app/style/index.css')
], function ({ registerIdleTasks }) {
    const asyncTasks = [
        function initFormDesigner() {
            return new Promise((resolve) => {
                require(['erdcloud.store', ELMP.resource('erdc-components/FamFormDesigner/store.js')], function (
                    store,
                    { registerModule }
                ) {
                    registerModule(store);
                    resolve();
                });
            });
        },
        function initCommComponents() {
            return new Promise((resolve) => {
                require([
                    'vue',
                    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js')
                ], function (Vue, mappingType) {
                    Vue.mixin(mappingType);
                    resolve();
                });
            });
        },
        function registerBpmDirective() {
            return new Promise((resolve) => {
                require([ELMP.resource('erdc-app/directives.js')], function () {
                    resolve();
                });
            });
        },
        function loadInitFile() {
            let store = require('erdcloud.store');
            let needInitApps = store.state.mfe.apps.filter((i) => i?.erdcData?.init);
            let needResources = store.state.mfe.resources.filter((i) => i?.erdcData?.init);
            needInitApps = needInitApps.concat(needResources || []);
            let weight = {},
                appInitFileMaps = {},
                appInitDepMaps = {},
                weightArrary = [];
            needInitApps.forEach((i) => {
                if (_.isString(i.erdcData.init)) {
                    appInitDepMaps[i.code] = [];
                    appInitFileMaps[i.code] = i.erdcData.init;
                } else {
                    appInitDepMaps[i.code] = i.erdcData.init.deps;
                    appInitFileMaps[i.code] = i.erdcData.init.path;
                }
                weight[i.code] = 1;
            });

            //递归计算每个app的init的依赖
            function recursionDeps(appCode, deps) {
                if (_.isEmpty(deps)) {
                    return;
                }
                deps.forEach((i) => {
                    // 这里没有处理为undefined的场景，因为如果是undefined，那么意味着没有init配置
                    if (!_.isUndefined(weight[i])) {
                        weight[i] = weight[i] + weight[appCode];
                    }
                    recursionDeps(i, appInitDepMaps[i]);
                });
            }

            needInitApps.forEach((i) => {
                recursionDeps(i.code, appInitDepMaps[i.code]);
            });
            _.each(weight, function (value, key) {
                weightArrary.push({
                    sort: value,
                    path: appInitFileMaps[key]
                });
            });
            weightArrary = weightArrary.sort(function (i, j) {
                return j.sort - i.sort;
            });
            weightArrary = _.pluck(weightArrary, 'path');
            weightArrary = weightArrary.concat(window.ELCONF.initPath || []);
            if (_.isEmpty(weightArrary)) {
                return Promise.resolve();
            }
            // 执行运行态配置的js
            return new Promise((resolve) => {
                require(['erdc-kit'], function (ErdcKit) {
                    ErdcKit.runQueueAsync(
                        weightArrary,
                        function (path, index, next) {
                            require([path], function (module) {
                                Promise.resolve(_.isFunction(module) ? module() : module).then(() => {
                                    next();
                                });
                            }, function () {
                                console.error(path, '加载失败');
                                next();
                            });
                        },
                        function () {
                            resolve();
                        }
                    );
                });
            });
        },
        function initServicePrefix() {
            return require.promise('erdcloud.store', 'erdc-kit').then(([store, { TreeUtil }]) => {
                const resources = TreeUtil.flattenTree2Array([store.state.route.resources]);
                store.commit(
                    'PUSH_RESOURCE_APP_MAP',
                    resources.reduce((prev, resource) => {
                        prev[resource.identifierNo] = resource.appName;
                        return prev;
                    }, {})
                );
                return store.dispatch('fetchRoutePrefix');
            });
        }
    ];

    function useFamCore() {
        return new Promise((resolve) => {
            define('fam:ccc', [ELMP.resource('erdc-app/ccc/index.js')], (CCC) => CCC);
            require([ELMP.resource('erdc-app/components/index.js')], function (useComponents) {
                useComponents(function () {
                    resolve();
                });
            });
        });
    }

    function registerLayoutComponents() {
        return new Promise((resolve) => {
            require(['erdcloud.store', 'erdcloud.kit'], function (store, ErdcKit) {
                let headerWidgets = store.state.mfe.resources
                    .filter((i) => {
                        return i?.erdcData?.resourceType === 'widget' || i?.erdcData?.widget;
                    })
                    .map((i) => {
                        return {
                            key: i.code,
                            description: i.name,
                            position: i?.erdcData?.position || 'right',
                            sort: i.sort || 10,
                            component: ErdcKit.asyncComponent(ELMP.resource(`${i.code}/index.js`))
                        };
                    });

                if (_.isFunction(window.ELCONF.widgetSort)) {
                    headerWidgets = window.ELCONF.widgetSort(headerWidgets);
                }
                if (Array.isArray(window.ELCONF.widgetSort)) {
                    const sortOrder = window.ELCONF.widgetSort;
                    headerWidgets = headerWidgets.sort((a, b) => {
                        const indexA = sortOrder.indexOf(a.key);
                        const indexB = sortOrder.indexOf(b.key);
                        if (indexA === -1 && indexB === -1) {
                            return 0;
                        } else if (indexA === -1) {
                            return 1;
                        } else if (indexB === -1) {
                            return -1;
                        } else {
                            return indexA - indexB;
                        }
                    });
                }
                store.dispatch(
                    'registerLayoutHeaderWidgets',
                    [
                        {
                            key: 'LayoutAvatar',
                            description: '头像',
                            position: 'right',
                            sort: 100,
                            component: ErdcKit.asyncComponent(ELMP.resource('erdc-app/layout/LayoutAvatar/index.js'))
                        }
                    ].concat(headerWidgets)
                );
                resolve();
            });
        });
    }

    return async function initialize() {
        registerIdleTasks([
            registerLayoutComponents,
            function loadFontCss() {
                require.promise(ELMP.css('erdc-fonts/libs/font.css'));
            }
        ]);

        await useFamCore();
        const [store] = await require.promise(['erdcloud.store']);
        await store.dispatch('fetchSecurityLabels');
        await Promise.allSettled(asyncTasks.map((task) => task()));
    };
});
