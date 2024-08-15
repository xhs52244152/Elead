define(['erdcloud.kit'], function (ErdcKit) {
    return [
        // 客制化

        // 脚本
        {
            path: 'scripting',
            name: 'dynamicScriptManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('system-customizing/views/CustomScripting/index.js'))
        },
        // 工程
        {
            path: 'engineering',
            name: 'pluginManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('system-customizing/views/CustomEngineering/index.js'))
        }
    ];
});
