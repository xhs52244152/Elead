define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'member',
            name: 'memberManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('system-participant/member-management/index.js'))
        }
    ];
});
