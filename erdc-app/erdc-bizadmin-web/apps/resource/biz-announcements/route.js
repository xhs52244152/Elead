define(['erdcloud.kit'], function (ErdcloudKit) {
    return {
        path: '',
        name: 'bizAnnouncements',
        component: ErdcloudKit.asyncComponent(ELMP.resource('biz-announcements/index.js'))
    };
});
