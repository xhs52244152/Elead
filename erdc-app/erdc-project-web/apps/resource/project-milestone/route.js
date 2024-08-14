define(['erdcloud.kit'], function (ErdcloudKit) {
    return [
        {
            path: 'milestone',
            name: 'projectMilestone',
            meta: {
                title: '里程碑',
                parentRouteCode: 'space',
                keepAlive: false
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-milestone/index.js'))
        }
    ];
});
