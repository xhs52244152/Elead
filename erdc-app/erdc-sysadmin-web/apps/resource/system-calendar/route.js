define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'calendar',
            name: 'calendarManage',
            component: ErdcKit.asyncComponent(ELMP.resource('system-calendar/views/CalendarManage/index.js'))
        }
    ];
});
