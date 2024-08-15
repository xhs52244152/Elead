define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'druid',
            name: 'DruidManage',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-druid/DruidManage/index.js'))
        }
    ];
});
