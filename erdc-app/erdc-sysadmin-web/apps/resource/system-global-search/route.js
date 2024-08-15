define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'globalSearch',
            component: ErdcKit.asyncComponent(ELMP.resource('system-global-search/views/GlobalSearchManagement/index.js')),
            name: 'globalSearchManagement'
        }
    ];
});
