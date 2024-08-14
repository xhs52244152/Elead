define(['erdcloud.kit'], function (ErdcloudKit) {
    return [
        {
            path: 'team',
            name: 'projectTeam',
            meta: {
                title: '项目团队',
                parentRouteCode: 'space'
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-team/index.js'))
        }
    ];
});
