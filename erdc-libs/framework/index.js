let getPrefixPath = function () {
    const scriptPath = document.currentScript.src;
    const url = scriptPath.replace(window.location.origin, '');
    const path = url.split('?')[0];
    return path.replace('index.js', '');
};
let currentPath = getPrefixPath();

window.require.config({
    paths: {
        // 第三方资源结束
        jquery: currentPath + 'node_modules/jquery/dist/jquery.min',
        vue: currentPath + 'node_modules/vue/dist/vue',
        'vue-router': currentPath + 'node_modules/vue-router/dist/vue-router.min',
        vuex: currentPath + 'node_modules/vuex/dist/vuex.min',
        axios: currentPath + 'node_modules/axios/dist/axios.min',
        dayjs: currentPath + 'node_modules/dayjs/dayjs.min',
        'dayjs-advancedFormat': currentPath + 'node_modules/dayjs/plugin/advancedFormat',
        'dayjs-weekOfYear': currentPath + 'node_modules/dayjs/plugin/weekOfYear',
        'dayjs-isBetween': currentPath + 'node_modules/dayjs/plugin/isBetween',
        underscore: currentPath + 'node_modules/underscore/underscore-umd-min',
        TreeUtil: currentPath + 'node_modules/@erdc-libs/erdc-kit/lib/tree-util.umd',
        EventBus: currentPath + 'node_modules/@erdc-libs/erdc-kit/lib/event-bus.umd',
        'erdcloud.kit': currentPath + 'node_modules/@erdc-libs/erdc-kit/lib/index.umd',
        storage: currentPath + 'plugins/storage',
        mapping: currentPath + 'erdcloud/mapping',
        'el-dayjs': currentPath + 'plugins/el-dayjs',
        'erdcloud.router': currentPath + 'erdcloud/router',
        'erdcloud.mfe': currentPath + 'erdcloud/mfe',
        'erdcloud.store': currentPath + 'erdcloud/store',
        'erdcloud.http': currentPath + 'erdcloud/http',
        'erdcloud.i18n': currentPath + 'erdcloud/i18n',
        'erdcloud.directives': currentPath + 'erdcloud/directives',
        ErdcApp: currentPath + 'ErdcApp',
        FrameworkI18n: currentPath + 'locale/index',
        mfeHelper: currentPath + 'util/mfeHelper'
    },
    urlArgs: function (id, url) {
        let args = 'ver=' + '__VERSION__';
        return (url.indexOf('?') === -1 ? '?' : '&') + args;
    }
});

define(['ErdcApp'], function (ErdcApp) {
    return {
        ErdcApp,
        useApp(appName) {
            return ErdcApp.useApp(appName);
        }
    };
});
