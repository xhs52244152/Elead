window.ELCONF = {};

console.info(
    `%c
       ____  ____   ____ _                 _ 
   ___|  _ \\|  _ \\ / ___| | ___  _   _  __| |
  / _ \\ |_) | | | | |   | |/ _ \\| | | |/ _\` |
 |  __/  _ <| |_| | |___| | (_) | |_| | (_| |
  \\___|_| \\_\\____/ \\____|_|\\___/ \\__,_|\\__,_|
                                             
`,
    'color: #2779FF;font-size: 12px;'
);
console.info('© 2024 上海易立德信息技术股份有限公司. All Rights Reserved https://www.e-lead.cn/');

window.require.config({
    baseUrl: '/',
    waitSeconds: 0,
    paths: {
        text: 'erdc-thirdparty/platform/requirejs/text.min',
        css: 'erdc-thirdparty/platform/requirejs/css.min',
        jsencrypt: 'erdc-thirdparty/platform/jsencrypt/bin/jsencrypt.min',
        '@erdcloud/erdcloud-icon': 'erdc-thirdparty/platform/@erdcloud/erdcloud-icon',
        quill: 'erdc-thirdparty/platform/quill/dist/quill.min',
        vue: 'erdc-thirdparty/platform/vue/dist/vue',
        'vue-simple-uploader': 'erdc-thirdparty/platform/vue-simple-uploader/dist/vue-uploader',
        vs: 'erdc-thirdparty/platform/monacoEditor/min/vs',
        vuedraggable: 'erdc-thirdparty/platform/vuedraggable/dist/vuedraggable.umd.min',
        'jquery.cookie': 'erdc-thirdparty/platform/jquery-plugins/jquery.cookie',
        'vue-grid-layout': 'erdc-thirdparty/platform/vue-grid-layout/dist/vue-grid-layout.umd.min',
        'erdcloud-ui': 'erdc-thirdparty/platform/@erdcloud/erdcloud-ui/lib/erdcloud-ui.umd',
        'erd-quill-editor': 'erdc-thirdparty/platform/@erdcloud/erdcloud-ui/lib/erd-quill-editor.umd',
        sockjs: 'erdc-thirdparty/platform/sockjs-client/dist/sockjs.min',
        stomp: 'erdc-thirdparty/platform/@stomp/stompjs/bundles/stomp.umd.min',
        sortablejs: 'erdc-thirdparty/platform/sortablejs/Sortable.min',
        'file-saver': '/erdc-thirdparty/platform/file-save/fileSaver',
        'word-export': '/erdc-thirdparty/platform/jquery-plugins/wordexport'
    },
    shim: {
        'word-export': { deps: ['jquery', 'file-saver'] }
    },
    deps: [
        'css!erdc-thirdparty/platform/@erdcloud/erdcloud-ui/lib/erdcloud-ui.common.min.css',
        'css!erdc-thirdparty/platform/@erdcloud/erdcloud-ui/lib/erdcloud-ui.theme.css'
    ]
});

/**
 * require 方法的 Promise 封装
 * @description 传入多个依赖项，并返回一个包含所有依赖模块的 Promise
 * @param {Array|string} deps 依赖项
 * @param {Function} [callback] 回调函数 - 不推荐使用
 * @param {Function} [onError] 出错回调函数 - 不推荐使用
 * @returns {Promise<Array<any>>}
 *
 * @example
 * ```javascript
 * // 1
 * const [Vue, Vuex] = await require.promise('vue', 'vuex');
 * // 2
 * const [Vue, Vuex] = await require.promise(['vue', 'vuex']);
 * // 3
 * require.promise('vue').then(([Vue]) => console.log(Vue));
 * ```
 */
require.promise = function (deps, callback = () => ({}), onError = () => ({})) {
    const args = Array.from(arguments);
    const _deps = args.every((i) => typeof i === 'string') ? args : deps;
    return new Promise((resolve, reject) => {
        require(_deps, function (...mds) {
            resolve(mds);
            if (typeof callback === 'function') {
                callback(...mds);
            }
        }, (error) => {
            reject(error);
            if (typeof onError === 'function') {
                onError(error);
            }
        });
    });
};

// findLast 未降级处理
if (typeof [].findLast !== 'function') {
    Array.prototype.findLast = function (callbackfn, thisArg) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.findLast called on null or undefined');
        }
        if (typeof callbackfn !== 'function') {
            throw new TypeError('callbackfn must be a function');
        }
        let length = this.length >>> 0;
        let index = length - 1;
        while (index >= 0) {
            if (callbackfn.call(thisArg, this[index], index, this)) {
                return this[index];
            }
            index--;
        }
        return undefined;
    };
}

/*
 * 劫持 require.js load 方法，用于实现在生产环境下，所有资源包均加载 bundle 文件
 */
(function () {
    const originalRequireJsLoad = window.require.s.contexts._.load;
    const originRequire = window.require.s.contexts._.require;

    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {string} moduleId the name of the module.
     * @param {string} url the URL to the module.
     */
    require.s.contexts._.load = function (moduleId, url) {
        if (originRequire.defined('erdcloud.store') && originRequire.defined('ErdcApp')) {
            let store = originRequire('erdcloud.store');
            let ErdcApp = originRequire('ErdcApp');
            if (
                ErdcApp.useApp().env !== 'production' ||
                window.startErdcCliClient ||
                window.__FRAMEWORK__VERSION__ === 'development'
            ) {
                originalRequireJsLoad(moduleId, url);
                return;
            }
            const { resourceKey, routePrefix } = store.getters['mfe/matchResourcePkg'](url);
            let pureUri = url ? url.split('?')[0] : url;
            if (moduleId === pureUri && resourceKey && !['framework', 'erdc-app'].includes(resourceKey)) {
                const bundleUrl =
                    getBundleName(url, { routePrefix, resourceKey }, store.getters['mfe/mfeAssetInfos']) || url;
                originalRequireJsLoad(moduleId, bundleUrl);
            } else if ('erdc-app' === resourceKey && !url.match(/\/erdc-bundle\.js$/)) {
                originalRequireJsLoad(moduleId, '/erdc-libs/erdc-app/erdc-bundle.js');
            } else {
                originalRequireJsLoad(moduleId, url);
            }
        } else {
            originalRequireJsLoad(moduleId, url);
        }
    };

    const getBundleName = (function () {
        return function (uri, { resourceKey, routePrefix }, mfeAssets) {
            const asset = mfeAssets.find((item) => item.code === resourceKey);
            if (!asset || !asset.erdcData) {
                return uri;
            }
            let erdcData = asset.erdcData || {};
            const bundles = erdcData.bundles;

            if (!bundles) {
                return uri;
            }
            const pureUri = uri.split('?')[0];
            const targetBundle = bundles.find((item) => {
                const files = item.files || [];
                return files.some((filePath) => ELMP.resource(filePath, item.packageName) === pureUri);
            });
            if (!targetBundle) {
                return uri;
            }
            return `${routePrefix}/${targetBundle.bundle || 'erdc-bundle.js'}?${uri.split('?')[1] || 'ver=' + window.__version__}`;
        };
    })();
})();

define(['css!/erdc-libs/erdc-app/style/global.css'], function () {
    let ErdcApp = null;

    async function useAccessToken(token) {
        const [axios] = await require.promise(['erdcloud.http']);
        axios.interceptors.request.use(function (config) {
            config.headers = {
                Authorization: token,
                ...config.headers
            };
            return config;
        });
        return axios;
    }

    async function setUserCenterList({ tenantList = [], tenantId, themes = [], layouts = [] } = {}) {
        const [i18n, store, ErdcKit] = await require.promise(['erdcloud.i18n', 'erdcloud.store', 'erdc-kit']);
        const userCenterMenu = [
            {
                key: 'LANGUAGE_SWITCH',
                props: {
                    name: '语言切换',
                    icon: 'el-icon-refresh',
                    nameI18nJson: {
                        zh_cn: '语言切换',
                        en_us: 'Switch Language'
                    },
                    children: i18n.languages()
                },
                listeners: {},
                isActive(checked, item) {
                    return checked.language === item.language;
                }
            },
            {
                key: 'THEME_SWITCH',
                props: {
                    name: '主题切换',
                    icon: 'erd-iconfont erd-icon-theme',
                    nameI18nJson: {
                        zh_cn: '主题切换',
                        en_us: 'Switch Theme'
                    },
                    children: themes.map((theme) => ({
                        displayName: ErdcKit.translateI18n(theme.nameI18nJson),
                        active: theme.code === store.state.mfe.currentTheme,
                        ...theme
                    }))
                },
                listeners: {
                    check(theme) {
                        store.dispatch('app/changeTheme', theme.code).then(() => {
                            window.location.reload();
                        });
                    }
                },
                isActive(checked, item) {
                    return checked.key === item.key;
                }
            },
            {
                key: 'LAYOUT_SWITCH',
                props: {
                    name: '布局切换',
                    icon: 'erd-iconfont erd-icon-layout',
                    nameI18nJson: {
                        zh_cn: '布局切换',
                        en_us: 'Switch Layout'
                    },
                    children: layouts.map((layout) => ({
                        displayName: ErdcKit.translateI18n(layout.nameI18nJson),
                        active: layout.code === store.state.mfe.currentLayout,
                        ...layout
                    }))
                },
                listeners: {
                    check(layout) {
                        store.dispatch('app/changeLayout', layout.code).then(() => {
                            window.location.reload();
                        });
                    }
                },
                isActive(checked, item) {
                    return checked.value === item.value;
                }
            },
            {
                key: 'TENANT_SWITCH',
                props: {
                    name: '切换租户',
                    icon: 'erd-iconfont erd-icon-transform',
                    nameI18nJson: {
                        zh_cn: '切换租户',
                        en_us: 'Switch Tenant'
                    },
                    children: tenantList.map((i) => {
                        return {
                            ...i,
                            displayName: ErdcKit.translateI18n(i.nameI18nJson),
                            active: i.identifierNo === tenantId
                        };
                    })
                }
            }
        ];

        store.commit('app/PUSH_MENULIST', userCenterMenu);
    }

    async function prepareLayoutAndTheme(appIns) {
        const [store] = await require.promise(['erdcloud.store', 'erdcloud.router']);
        const user = store.state.app.user || {};

        const defaultLayoutAndTheme = store.getters['app/defaultLayoutAndTheme'] || {};
        let currentLayout = user.layout?.configValue || defaultLayoutAndTheme.layout;
        let currentTheme = user.theme?.configValue || defaultLayoutAndTheme.theme;
        const tenantList = store.state.app.tenantList || [];
        const tenantId = store.state.app.tenantId;
        const currentAppOptionalThemes = defaultLayoutAndTheme.currentAppOptionalThemes || [];
        const currentAppOptionalLayouts = defaultLayoutAndTheme.currentAppOptionalLayouts || [];

        if (!currentLayout || currentAppOptionalLayouts.every((i) => i.code !== currentLayout)) {
            currentLayout = currentAppOptionalLayouts[0]?.code;
        }
        if (!currentTheme || currentAppOptionalThemes.every((i) => i.code !== currentTheme)) {
            currentTheme = currentAppOptionalThemes[0]?.code;
        }

        store.commit('mfe/SET_CURRENT_LAYOUT', currentLayout);
        store.commit('mfe/SET_CURRENT_THEME', currentTheme);
        await appIns.initLayout(currentAppOptionalThemes);
        let layoutRoute = null;
        if (_.isFunction(store.state.mfe.currentLayoutComponent)) {
            let layoutRoutes = store.state.mfe.currentLayoutComponent();
            if (_.isArray(layoutRoutes)) {
                layoutRoute = layoutRoutes;
            } else {
                layoutRoute = [layoutRoutes];
            }
        } else if (_.isArray(store.state.mfe.currentLayoutComponent)) {
            layoutRoute = store.state.mfe.currentLayoutComponent;
        } else if (_.isObject(store.state.mfe.currentLayoutComponent)) {
            layoutRoute = [
                {
                    path: '',
                    name: 'root',
                    component: store.state.mfe.currentLayoutComponent
                }
            ];
        }
        await setUserCenterList({
            tenantList,
            tenantId,
            themes: currentAppOptionalThemes,
            layouts: currentAppOptionalLayouts
        });
        return layoutRoute;
    }

    function isLoginRoute(store) {
        const loginRoutes = store.state.mfe.resources.filter((r) => r.code.includes('login'));
        return loginRoutes.some(({ code }) => window.location.hash.startsWith(`#/${code}`));
    }

    // 一个状态锁，用于保证 prepareUserMe 只被执行一次
    let userMePrepared = false;

    // 准备用户信息与布局环境。在初始化或路由阶段被调用；可能会被调用多次。
    async function prepareUserMe(isCheckLogin) {
        if (userMePrepared) {
            return Promise.resolve();
        }
        const [store, ErdcKit, { useApp }, { jumpDefaultApp, resetRoute }] = await require.promise([
            'erdcloud.store',
            'erdc-kit',
            'ErdcApp',
            ELMP.resource('erdc-app/router.js')
        ]);
        if (isCheckLogin && isLoginRoute(store)) {
            // 用于截断应用生命周期钩子的调用；
            // 设置为空信息的原因：此时需要跳去登录页面，无需弹出错误信息。
            return Promise.reject(new Error());
        }

        let token = store.state?.app?.accessToken;
        if (!token) {
            throw new Error('no token');
        }
        const erdcAuth = await ErdcKit.getErdcAuth();
        const erdcAuthInst = await erdcAuth.init(token);
        const { code } = await erdcAuthInst.validateToken(token);
        if (code !== 200) {
            throw new Error('invalid token');
        }
        await useAccessToken(token);
        await Promise.all([store.dispatch('app/fetchUserMe'), store.dispatch('app/fetchTenantList')]);
        const appIns = useApp(window.__currentAppName__);
        const user = store.state.app.user || {};
        let menus = store.state.route.resources || {};
        if (
            _.isEmpty(menus.children) &&
            _.isEmpty(appIns.$options.devMenus) &&
            store.state.route.allResourceTree.length
        ) {
            await jumpDefaultApp();
        }
        await appIns.initUsersInfo(user, menus);
        menus = store.state.mfe.menus;
        store.commit('route/PUSH_RESOURCES', { resources: menus });
        const layoutRoute = await prepareLayoutAndTheme(appIns);
        await resetRoute(layoutRoute);
        const [initialize] = await require.promise(ELMP.resource('erdc-app/initialize.js'));
        await initialize();
        userMePrepared = true;
    }

    function useErdcloudUI() {
        const Vue = require('vue');
        const ErdcKit = require('erdc-kit');
        const i18n = require('erdcloud.i18n');
        const erdcloudUI = require('erdcloud-ui');

        const useMessage = (type) => {
            return (config) => {
                const _config = typeof config === 'string' ? { message: config, type } : config;
                const defaultDuration = ErdcKit.getDurationByMessage(_config.message, config.type || type || 'info');
                const showClose = _config.duration === 0 || defaultDuration === 0;
                return (originalMessage[type] || originalMessage)({
                    duration: defaultDuration,
                    showClose,
                    ..._config
                });
            };
        };

        const originalMessage = Vue.prototype.$message;
        Vue.prototype.$message = useMessage();
        Vue.prototype.$message.success = useMessage('success');
        Vue.prototype.$message.info = useMessage('info');
        Vue.prototype.$message.error = useMessage('error');
        Vue.prototype.$message.warning = useMessage('warning');

        const language = i18n.currentLanguage();
        const langMap = {
            en_us: 'en',
            'en-US': 'en',
            zh_cn: 'zh-CN'
        };
        const langPack = erdcloudUI.languages[langMap[language] || language || 'zh-CN'];
        Vue.use(erdcloudUI.default, {
            locale: langPack
        });
    }

    function lifeCycleExecuteInfo(name) {
        console.info(`\x1B[42mErdcApp\x1B[0m \x1B[2m[hook]\x1B[0m ${name} triggered`);
    }

    function startApp(options) {
        return new ErdcApp(
            Object.assign({
                ...options,
                beforeInitialize: function () {
                    return require
                        .promise(
                            'erdcloud.http',
                            'erdcloud.store',
                            'erdcloud-ui',
                            'erdc-kit',
                            'erdcloud.i18n',
                            'vue',
                            'css!' + ELMP.resource('erdc-app/style/index.css')
                        )
                        .then(function ([ErdcloudHttp, ErdcloudStore, erdcloudUI, ErdcKit]) {
                            define('fam:store', [], function () {
                                return ErdcloudStore;
                            });
                            define('@erdcloud/erdcloud-ui', [], function () {
                                return erdcloudUI.default;
                            });
                            define('fam:kit', [], function () {
                                return ErdcKit;
                            });
                            define('fam:http', [], function () {
                                return ErdcloudHttp;
                            });
                            require(['fam:kit', 'fam:http', '@erdcloud/erdcloud-ui', 'fam:store']);
                            useErdcloudUI();
                        })
                        .then(() => {
                            options.beforeInitialize && options.beforeInitialize();
                        })
                        .then(() => {
                            lifeCycleExecuteInfo('beforeInitialize');
                        });
                },
                beforeCreate: function () {
                    return require
                        .promise([ELMP.resource('erdc-app/router.js'), ELMP.resource('erdc-app/store/index.js')])
                        .then(() => {
                            require(['erdcloud.store'], function (store) {
                                if (isLoginRoute(store)) {
                                    store.commit('app/PUSH_ACCESS_TOKEN', '');
                                }
                            });
                        })
                        .then(() => Promise.resolve(options.beforeCreate && options.beforeCreate()))
                        .then(() => {
                            lifeCycleExecuteInfo('beforeCreate');
                        });
                },
                created: function () {
                    return prepareUserMe(!ErdcApp.useApp()._created)
                        .then(() => {
                            return Promise.resolve(options.created && options.created());
                        })
                        .then(() => {
                            lifeCycleExecuteInfo('created');
                        })
                        .catch((error) => {
                            userMePrepared = false;
                            console.debug(error);
                        });
                },
                beforeMount() {
                    const asyncTasks = [
                        ErdcApp.useApp()._beforeMount
                            ? null
                            : require.promise(['erdcloud.http', 'erdcloud.store']).then(([$famHttp, ErdcloudStore]) => {
                                  return $famHttp.get('/fam/getPublicConfig').then((res) => {
                                      let data = res.headers ? res.data : res;
                                      if (data.success) {
                                          let threeMemberEnv = data.data.threeMemberEnv;
                                          ErdcloudStore.commit('app/SET_THREEMEMBER', {
                                              threeMemberEnv,
                                              threeMemberOtherConfig: data.data
                                          });
                                      }
                                  });
                              }),
                        userMePrepared ? ELMP.resource('erdc-app/interceptors.js') : null
                    ];

                    return Promise.all(asyncTasks.filter(Boolean)).then(() =>
                        !userMePrepared
                            ? Promise.resolve()
                            : Promise.resolve(options.beforeMount && options.beforeMount()).then(() => {
                                  lifeCycleExecuteInfo('beforeMount');
                              })
                    );
                },
                mounted() {
                    document.querySelector('#global-loading').style.display = 'none';
                    if (userMePrepared) {
                        return Promise.resolve(options.mounted && options.mounted()).then(() => {
                            lifeCycleExecuteInfo('mounted');
                        });
                    }
                    return Promise.resolve();
                },
                // 用户数据拿到手之后，可以初始化http拦截器、一些核心组件了
                initialized: async function () {
                    if (!userMePrepared) {
                        throw new Error();
                    }
                    const useWatermark = async () => {
                        const store = require('erdcloud.store');
                        const user = store.state.app.user;
                        if (user.watermark) {
                            await require.promise(ELMP.resource('erdc-app/erdc-watermark.js'));
                        }
                    };
                    const useScreenLock = async () => {
                        await require.promise(ELMP.resource('erdc-app/screen-lock.js'));
                    };
                    const useResetPassword = async () => {
                        await require.promise([ELMP.resource('erdc-app/erdc-password.js')]);
                    };
                    const useSaveLogo = async () => {
                        await require.promise(ELMP.resource('erdc-app/erdc-safelogo.js'));
                    };
                    const useSocket = async () => {
                        await require.promise('erdc-socket');
                    };

                    await Promise.resolve(options.initialized && options.initialized())
                        .then(() => {
                            lifeCycleExecuteInfo('initialized');
                        })
                        .then(async () => {
                            const [{ registerIdleTasks }] = await require.promise('erdc-idle');
                            registerIdleTasks([useWatermark, useScreenLock, useResetPassword, useSaveLogo, useSocket]);
                        });
                }
            })
        );
    }

    const moduleMaps = {
        'erdc-auth': '/erdc-libs/erdc-auth/auth-login.js',
        'erdc-kit': '/erdc-libs/erdc-app/kit.js',
        'erdc-idle': '/erdc-libs/erdc-app/erdc-idle.js',
        'erdc-socket': '/erdc-libs/erdc-app/erdc-socket.js',
        'el-socket': '/erdc-libs/erdc-app/plugins/el-socket.js'
    };
    Object.keys(moduleMaps).forEach((key) => {
        define(key, [moduleMaps[key]], function (module) {
            return module;
        });
    });

    return function (appOptions) {
        return new Promise((resolve) => {
            window.__currentAppName__ = appOptions.appName;
            window.name = window.name || appOptions.appName;
            window.addEventListener('beforeunload', () => {
                window.name = '';
            });
            window.__version__ = appOptions.appVersion;
            require.config({
                urlArgs: function (id, url) {
                    let args = 'ver=' + window.__version__;
                    return (url.indexOf('?') === -1 ? '?' : '&') + args;
                }
            });
            const start = function () {
                let erdcloudI18n = require('erdcloud.i18n');

                let ins = startApp({
                    env: /^__(\S+)__$/.test(window.__version__) ? 'development' : 'production',
                    ...appOptions
                });
                erdcloudI18n
                    .registerI18n({
                        i18nLocalePath: ELMP.resource('erdc-app/locale/index.js'),
                        global: true
                    })
                    .then(() => {
                        resolve(ins);
                    });
            };

            function useFramework(entry) {
                window.__FRAMEWORK_VERSION__ = entry[0]?.indexOf('index.min.js') > -1 ? 'production' : 'development';
                require(entry, function (Framework) {
                    define('framework', [], function () {
                        return Framework;
                    });
                    ErdcApp = Framework.ErdcApp;
                    start();
                }, function () {
                    const idx = entry.findIndex((item) => /erdc-libs\/framework/.test(item));
                    if (idx !== -1) {
                        entry.splice(idx, 1, '/erdc-libs/framework/index.js');
                        useFramework(entry);
                    }
                });
            }

            let entryModule = [];
            if (window.__version__ === '__LOCAL__') {
                entryModule.push('/erdc-libs/framework/index.js');
            } else {
                entryModule.push('/erdc-libs/framework/index.min.js');
                if (window.__version__ === '__VERSION__' || window.startErdcCliClient) {
                    entryModule.push('vue');
                }
            }
            useFramework(entryModule);
        });
    };
});
