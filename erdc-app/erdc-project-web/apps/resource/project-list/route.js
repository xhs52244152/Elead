define(['erdcloud.kit', ELMP.resource('ppm-app/config/index.js')], function (ErdcloudKit, register) {
    // 注册通用页面、全局事件
    register.init();

    return [
        {
            path: '',
            meta: {
                title: '项目列表',
                keepAlive: false
            },
            name: 'projectProject',
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-list/index.js'))
        }
    ];
});
