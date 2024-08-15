define(['erdcloud.kit'], function (ErdcloudKit) {
    return {
        path: '',
        name: 'AdvancedSearch',
        component: ErdcloudKit.asyncComponent(ELMP.func('advanced-search/views/GlobalSearchList/index.js')),
        meta: {
            title: '全局搜索',
            parentRouteCode: 'container',
            keepAlive: true
        }
    };
});
