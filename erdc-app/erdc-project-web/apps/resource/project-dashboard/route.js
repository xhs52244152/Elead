define(['erdcloud.kit'], function (ErdcloudKit) {
    return [
        {
            path: 'dashboard',
            name: 'projectDashboard',
            meta: {
                title: '仪表盘',
                keepAlive: false
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-dashboard/index.js'))
        }
    ];
});
