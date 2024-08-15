define(['erdcloud.kit'], function (ErdcKit) {
    return [
        // 首选项
        {
            path: 'preference',
            name: 'preferenceManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('system-preference/views/PreferenceManage/index.js'))
        },
        // 偏好
        {
            path: 'prefer',
            name: 'preferManage',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js'))
        }
    ];
});
