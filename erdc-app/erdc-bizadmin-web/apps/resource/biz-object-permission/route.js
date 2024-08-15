define(['erdcloud.kit'], function (ErdcloudKit) {
    return {
        path: '',
        name: 'bizObjectPermission',
        component: ErdcloudKit.asyncComponent(ELMP.resource('biz-object-permission/index.js'))
    };
});
