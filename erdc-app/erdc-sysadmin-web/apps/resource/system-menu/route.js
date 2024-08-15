define(['erdcloud.kit'], function (ErdcKit) {
    return [
        // 菜单配置
        {
            path: 'menu',
            component: ErdcKit.asyncComponent(ELMP.resource('system-menu/views/MenuManagement/index.js')),
            name: 'menuManagement'
        }
    ];
});
