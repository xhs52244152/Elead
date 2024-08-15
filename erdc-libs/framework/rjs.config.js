const join = require('path').join;

module.exports = function (context) {
    const appDir = join(context, 'erdc-libs/framework');
    return {
        baseUrl: appDir,
        name: 'ErdcApp',
        out: appDir + '/index.min.js',
        include: ['FrameworkI18n'],
        exclude: ['text', 'normalize', 'css'],
        wrap: {
            start: "define(['ErdcApp'], function(ErdcApp) {return {ErdcApp: ErdcApp,useApp(appName){return ErdcApp.useApp(appName)}}})"
        },
        paths: {
            jquery: 'node_modules/jquery/dist/jquery.min',
            vue: 'node_modules/vue/dist/vue.min',
            'vue-router': 'node_modules/vue-router/dist/vue-router.min',
            vuex: 'node_modules/vuex/dist/vuex.min',
            axios: 'node_modules/axios/dist/axios.min',
            dayjs: 'node_modules/dayjs/dayjs.min',
            underscore: 'node_modules/underscore/underscore-umd-min',
            text: 'node_modules/requirejs-text/text',
            css: 'node_modules/require-css/css',
            'css-builder': 'node_modules/require-css/css-builder',
            normalize: 'node_modules/require-css/normalize',
            TreeUtil: 'node_modules/@erdc-libs/erdc-kit/lib/tree-util.umd',
            EventBus: 'node_modules/@erdc-libs/erdc-kit/lib/event-bus.umd',
            'erdcloud.kit': 'node_modules/@erdc-libs/erdc-kit/lib/index.umd',
            storage: 'plugins/storage',
            mapping: 'erdcloud/mapping',
            'el-dayjs': 'plugins/el-dayjs',
            'dayjs-advancedFormat': 'node_modules/dayjs/plugin/advancedFormat',
            'dayjs-weekOfYear': 'node_modules/dayjs/plugin/weekOfYear',
            'dayjs-isBetween': 'node_modules/dayjs/plugin/isBetween',
            'erdcloud.router': 'erdcloud/router',
            'erdcloud.mfe': 'erdcloud/mfe',
            'erdcloud.store': 'erdcloud/store',
            'erdcloud.http': 'erdcloud/http',
            'erdcloud.i18n': 'erdcloud/i18n',
            'el-socket': 'plugins/el-socket',
            FrameworkI18n: 'locale/index',
            'erdcloud.directives': 'erdcloud/directives',
            mfeHelper: 'util/mfeHelper'
        }
    };
};
