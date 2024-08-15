// TODO framework支持日志级别

define([
    'jquery',
    'erdcloud.router',
    'erdcloud.store',
    'erdcloud.http',
    'erdcloud-ui',
    'vue',
    'underscore',
    'erdcloud.i18n',
    'erdcloud.kit',
    'erdcloud.directives',
    'storage',
    'el-dayjs',
    'mapping',
    'watermark',
    'EventBus',
    'css!erdcloud-ui-css',
    'css!erdcloud-ui-theme-css'
], function ($, router, store, axios, erdcloudUI, Vue, _, i18n, ErdcloudKit) {
    const appPool = {};

    /**
     * @typedef ErdcAppOptions ErdcApp 应用配置
     * @property { string } [el='app'] 应用挂载的 DOM 元素
     * @property { string } appName 应用名
     * @property { string } appVersion 应用版本
     * @property { 'development'|'production' } [env='production'] 当前运行环境
     * @property { function(): Promise<void> } beforeInitialize 应用钩子 - 应用准备之前，此时可以使用框架提供的工具
     * @property { function(): Promise<void> } beforeCreate 应用钩子 - 应用创建阶段，此时MFE信息获取完成，但没有进行布局、路由初始化
     * @property { function(): Promise<void> } created 应用钩子 - 应用创建完成，此时布局已经准备完成
     * @property { function(): Promise<void> } beforeMount 应用钩子 - 应用准备挂载到页面
     * @property { function(): Promise<void> } mounted 应用钩子 - 应用挂载到页面
     * @property { function(): Promise<void> } initialized 应用钩子 - 应用准备完成
     * @property { Object } languages 国际化
     * @property { Object } [requireJsShim] requirejs.shim
     * @property { Object } [requireJsPath] requirejs.paths
     * @property { boolean } [enableDefaultMFE=true] 是否启用内置的 MFE 集成逻辑
     * @property { Array<{ name: string, code: string, appCode?: string, hasRouteJS?: boolean, hasOptimizeJS?: boolean, hasI18nJS?: boolean }> } resources 当内置的 MFE 逻辑被屏蔽时生效，外部提供微功能资源
     * @property { Array<{ name: string, code: string, active?: boolean }> } layouts 当内置的 MFE 逻辑被屏蔽时生效，外部提供的布局资源
     * @property { Array<{ name: string, code: string, erdData?: Object }> } libs 当内置的 MFE 逻辑被屏蔽时生效，外部提供的平台资源
     */

    /**
     * @class {Object} ErdcApp
     * @constructor {function(options: ErdcAppOptions): ErdcApp}
     * @property {ErdcAppOptions|{}} $options
     * @param {ErdcAppOptions} [options = {}]
     */
    function ErdcApp(options = {}) {
        this.$options = options || {};
        this.start();
    }
    ErdcApp.prototype.start = function () {
        this.init()
            .then(this.initMfeData.bind(this))
            .then(() => this.emitHook('beforeCreate'))
            .then(this.initLayout.bind(this))
            .then(() => this.emitHook('beforeMount'))
            .then(this.insVue.bind(this))
            .catch((error) => {
                Vue.prototype.$message.error(error.message);
            });
        appPool[this.$options.appName] = this;
    };
    ErdcApp.prototype.emitHook = function (hookName) {
        return Promise.resolve(this.$options[hookName] && this.$options[hookName]()).then(() => {
            console.info(`\x1B[42mErdcApp\x1B[0m \x1B[2m[hook]\x1B[0m ${hookName} triggered`);
        });
    };
    ErdcApp.prototype.init = function () {
        const self = this;
        const productStr = 'production';
        this.appName = this.$options.appName;
        this.el = this.$options.el || 'app';
        this.env = this.$options.env || productStr;
        this.isProduct = this.env === productStr;

        window.require.config({
            paths: self.$options.requireJsPath || {},
            shim: self.$options.requireJsShim || {},
            urlArgs: function urlArgs(id, url) {
                const args = 'ver=' + self.$options.appVersion;
                return (url.indexOf('?') === -1 ? '?' : '&') + args;
            }
        });

        return new Promise(function (resolve) {
            window._ = _;
            define('fam:kit', [], function () {
                return ErdcloudKit;
            });
            define('fam:http', [], function () {
                return axios;
            });
            define('@erdcloud/erdcloud-ui', [], function () {
                return erdcloudUI.default;
            });
            require(['fam:kit', 'fam:http']);
            ErdcloudKit.translateI18n = function (nameI18nJson) {
                if (!nameI18nJson) {
                    return null;
                }
                const currentLang = i18n.currentLanguage();
                let json = nameI18nJson;
                if (typeof json === 'string') {
                    try {
                        json = JSON.parse(nameI18nJson);
                        if (typeof json === 'number') {
                            return nameI18nJson;
                        }
                    } catch (e) {
                        // 非json结构，直接返回
                        return nameI18nJson;
                    }
                }
                return json[currentLang] || json[currentLang.toLowerCase()] || json.value;
            };

            i18n.init(self.$options.languages)
                .then(function () {
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
                })
                .then(function () {
                    self.emitHook('beforeInitialize').then(function () {
                        resolve();
                    });
                });
        });
    };
    ErdcApp.prototype.initMfeData = function () {
        const self = this;
        return new Promise(function (resolve) {
            require(['erdcloud.store', 'erdcloud.mfe'], function (erdcloudStore) {
                const emitHookAndInitResourceMapping = function emitHookAndInitResourceMapping() {
                    const resourceMapping = {};
                    const resources = erdcloudStore.state.mfe.resources;
                    _.each(resources, function (i) {
                        if (i.parentCode) {
                            let resourceType = i?.erdcData?.resourceType || 'resource';
                            resourceMapping[i.code] = '/erdc-app/'.concat(i.parentCode, `/apps/${resourceType}`);
                        } else {
                            resourceMapping[i.code] = '/erdc-resource';
                        }
                    });
                    erdcloudStore.commit('mfe/SET_RESOURCE_MAPPING', resourceMapping);
                    erdcloudStore.dispatch('mfe/registerIconResources');
                    resolve();
                };
                if (self.$options.enableDefaultMFE === false && self.$options.layouts && self.$options.resources) {
                    erdcloudStore.commit('mfe/SET_LAYOUT', self.$options.layouts || []);
                    erdcloudStore.commit('mfe/SET_RESOURCE', self.$options.resources || []);
                    erdcloudStore.commit('mfe/SET_LIBS', self.$options.libs || []);
                    emitHookAndInitResourceMapping();
                } else {
                    erdcloudStore.dispatch('mfe/loadNoAuthInfo').then(function () {
                        if (self.env !== 'production') {
                            if (!_.isEmpty(self.$options.devResources)) {
                                let resources = erdcloudStore.state.mfe.resources
                                    .filter(
                                        (resource) =>
                                            !self.$options.devResources?.includes((item) => item.code === resource.code)
                                    )
                                    .concat(self.$options.devResources);
                                erdcloudStore.commit('mfe/SET_RESOURCE', resources);
                            }
                            if (!_.isEmpty(self.$options.devLayouts)) {
                                let layouts = erdcloudStore.state.mfe.layouts
                                    .filter(
                                        (layout) =>
                                            !self.$options.devLayouts?.includes((item) => item.code === layout.code)
                                    )
                                    .concat(self.$options.devLayouts);
                                erdcloudStore.commit('mfe/SET_LAYOUT', { layouts });
                            }
                            if (!_.isEmpty(self.$options.devLibs)) {
                                let libs = erdcloudStore.state.mfe.libs
                                    .filter((lib) => !self.$options.devLibs?.includes((item) => item.code === lib.code))
                                    .concat(self.$options.devLibs);
                                erdcloudStore.commit('mfe/SET_LIBS', libs);
                            }
                            if (!_.isEmpty(self.$options.devThemes)) {
                                let themes = erdcloudStore.state.mfe.themes
                                    .filter(
                                        (theme) =>
                                            !self.$options.devThemes?.includes((item) => item.code === theme.code)
                                    )
                                    .concat(self.$options.devThemes);
                                erdcloudStore.commit('mfe/SET_THEME', themes);
                            }
                            if (!_.isEmpty(self.$options.devApps)) {
                                let apps = erdcloudStore.state.mfe.apps
                                    .filter((app) => !self.$options.devApps?.includes((item) => item.code === app.code))
                                    .concat(self.$options.devApps);
                                erdcloudStore.commit('mfe/SET_APPS', apps);
                            }
                        }
                        emitHookAndInitResourceMapping();
                    });
                }
            });
        });
    };
    ErdcApp.prototype.initLayout = function () {
        const self = this;
        return new Promise(function (resolve, reject) {
            require(['erdcloud.mfe', 'erdcloud.router', 'erdcloud.kit', 'erdcloud.store'], function (
                erdcloudMfe,
                erdcloudRouter,
                kit,
                ErdcloudStore
            ) {
                let currentLayout = erdcloudMfe.getCurrentLayout();
                if (_.isEmpty(currentLayout)) {
                    reject(new Error('当前系统缺少有效布局，请联系运维管理员处理'));
                    return;
                }
                require(['/erdc-layout/'.concat(currentLayout || 'ultra', '/index.js')], function (layout) {
                    layout
                        .init()
                        .then(function (layoutComponent) {
                            ErdcloudStore.commit('mfe/PUSH_LAYOUT_COMPONENT', layoutComponent);
                        })
                        .then(function () {
                            self.emitHook('created').then(function () {
                                const removeHook = erdcloudRouter.beforeEach(function (to, from, next) {
                                    removeHook();
                                    // 看到这里不要觉得疑惑，这里是为了 直接刷新界面 http://localhost:5006/erdc-app/erdc-bizadmin-web/index.html#/business/biz-announcements
                                    // 进入系统的时候,重新让vue-router去匹配一下路径，因为现在匹配到的路由可能会是那个 “*” 的404
                                    if (
                                        (_.isEmpty(to.matched) || to.matched[0].path === '*') &&
                                        to.path === kit.getHash().split('?')[0]
                                    ) {
                                        next(kit.getHash());
                                    } else {
                                        next();
                                    }
                                });
                                resolve();
                            });
                        });
                });
            });
        });
    };
    ErdcApp.prototype.insVue = function () {
        const self = this;
        return new Promise(function (resolve) {
            require(['erdcloud.router', 'erdcloud.store', 'vue'], function (router, store, _Vue) {
                window.__erdcRoot__ = new _Vue({
                    template: '<div id="'.concat(self.el, '"><router-view></router-view></div>'),
                    store: store,
                    router: router,
                    mounted: function mounted() {
                        self.emitHook('mounted').then(function () {
                            resolve();
                        });
                    }
                }).$mount('#'.concat(self.el));
            });
        });
    };
    ErdcApp.prototype.initUsersInfo = function (user, menus) {
        const self = this;
        return new Promise(function (resolve, reject) {
            require(['erdcloud.store', 'erdcloud.kit', 'vue'], function (erdcloudStore, ErdcloudKit, Vue) {
                erdcloudStore.commit('PUSH_USER', user);
                if (self.env !== 'production' && !_.isEmpty(self.$options.devMenus)) {
                    menus = menus || { children: [] };
                    self.$options.devMenus.forEach((i) => (i.isShow = true));
                    menus.children = menus.children.concat(self.$options.devMenus);
                }
                if (_.isEmpty(menus?.children)) {
                    Vue.prototype.$message.error({
                        message: '没有菜单数据',
                        onClose: function () {
                            reject();
                        }
                    });
                    return;
                }
                erdcloudStore.commit('mfe/SET_MENUS', menus);

                self.emitHook('initialized').then(function () {
                    resolve();
                });
            });
        });
    };

    /**
     * @static
     * @param {string} [appName]
     * @returns {ErdcApp|null}
     */
    ErdcApp.useApp = function (appName = window.__currentAppName__) {
        return appPool[appName] || null;
    };
    return ErdcApp;
});
