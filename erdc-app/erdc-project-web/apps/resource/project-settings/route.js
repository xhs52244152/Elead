define(['erdcloud.kit'], function (ErdcloudKit) {
    return [
        {
            path: 'setting',
            name: 'projectSetting',
            meta: {
                title: '项目设置',
                keepAlive: true
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-settings/index.js'))
        }
    ];
});
