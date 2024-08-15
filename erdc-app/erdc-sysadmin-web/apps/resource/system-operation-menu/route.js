define(['erdcloud.kit'], function (ErdcKit) {
    return [
        // 操作列表
        {
            path: 'actionList',
            name: 'actionList',
            component: ErdcKit.asyncComponent(ELMP.resource('system-operation-menu/views/ActionList/index.js'))
        },
        // 操作场景
        {
            path: 'usageScenario',
            name: 'usageScenario',
            component: ErdcKit.asyncComponent(ELMP.resource('system-operation-menu/views/UsageScenario/index.js'))
        }
    ];
});
