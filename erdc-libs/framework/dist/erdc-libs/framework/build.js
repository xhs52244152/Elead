({
    baseUrl: './',
    name: 'ErdcApp',
    out: 'index.min.js',
    map: {
        '*': {
            'erdcloud-ui-css': 'node_modules/@erdcloud/erdcloud-ui/lib/erdcloud-ui.common.min',
            'erdcloud-ui-theme-css': 'node_modules/@erdcloud/erdcloud-ui/lib/erdcloud-ui.theme'
        }
    },
    wrap: {
        start: 'window.require.config({map:{"*":{"erdcloud-ui-css":"node_modules/@erdcloud/erdcloud-ui/lib/erdcloud-ui.common.min","erdcloud-ui-theme-css":"node_modules/@erdcloud/erdcloud-ui/lib/erdcloud-ui.theme"}}}); define([\'ErdcApp\'], function(ErdcApp) {return {ErdcApp: ErdcApp,useApp(appName){return ErdcApp.useApp(appName)}}})'
    },
    paths: {
        jquery: 'node_modules/jquery/dist/jquery.min',
        vue: 'node_modules/vue/dist/vue',
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
        'erdcloud-ui': 'node_modules/@erdcloud/erdcloud-ui/lib/erdcloud-ui.umd.all',
        'erd-quill-editor': 'node_modules/@erdcloud/erdcloud-ui/lib/erd-quill-editor.umd.all',
        sockjs: 'node_modules/sockjs-client/dist/sockjs.min',
        stomp: 'node_modules/@stomp/stompjs/bundles/stomp.umd',
        storage: 'plugins/storage',
        watermark: 'plugins/watermark',
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
        'erdcloud.directives': 'erdcloud/directives'
    },
    include: ['FrameworkI18n', 'el-socket', 'erd-quill-editor']
});
