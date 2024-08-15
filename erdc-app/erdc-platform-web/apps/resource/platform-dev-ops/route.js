define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'cache',
            name: 'cacheManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-dev-ops/views/CacheManagement/index.js'))
        },
        {
            path: 'apiLog',
            name: 'apiLogManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-dev-ops/views/ApiLog/index.js'))
        }
    ];
});
