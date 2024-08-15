define(['erdcloud.kit'], function (ErdcloudKit) {
    return {
        path: '',
        name: 'bizNotifications',
        component: ErdcloudKit.asyncComponent(ELMP.resource('biz-notifications/index.js'))
    };
});
