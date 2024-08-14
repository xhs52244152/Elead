define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'project/calendar',
            name: 'projectCalendar',
            component: ErdcKit.asyncComponent(ELMP.resource('project-calendar/index.js')),
            meta: {
                keepAlive: true,
                noAuth: true,
                title(route, resource) {
                    return route.params.title || resource?.name || '项目日历';
                },
                singleton: true,
                resourceCode: 'project:permission:calendar'
            }
        }
    ];
});
