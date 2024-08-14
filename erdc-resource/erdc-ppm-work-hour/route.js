define(['erdcloud.kit', ELMP.func('erdc-ppm-work-hour/index.js')], function (ErdcKit, workhour) {
    // 初始化配置
    workhour.init();
    return [
        {
            path: 'workHourList',
            name: 'workHourList',
            meta: {
                resourceCode: 'workHourList',
                keepAlive: false
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-work-hour/views/work-hour-list/index.js'))
        },
        {
            path: 'myWorkHour',
            name: 'myWorkHour',
            meta: {
                resourceCode: 'myWorkHour',
                keepAlive: false
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-work-hour/views/my-work-hour/index.js'))
        },
        {
            path: 'my-work-hour/create',
            name: 'workHourCreate',
            meta: {
                resourceCode: 'myWorkHour',
                openType: 'create',
                title: '创建工时'
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-work-hour/views/my-work-hour/form.js'))
        },
        {
            path: 'my-work-hour/edit',
            name: 'workHourEdit',
            meta: {
                resourceCode: 'myWorkHour',
                openType: 'edit',
                keepAlive: false,
                title: '编辑工时'
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-work-hour/views/my-work-hour/form.js'))
        }
    ];
});
