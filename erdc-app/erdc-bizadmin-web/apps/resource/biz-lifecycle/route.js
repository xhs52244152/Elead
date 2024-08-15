define(['erdcloud.kit'], function (ErdcloudKit) {
    return {
        path: '',
        name: 'bizLifecycle',
        component: ErdcloudKit.asyncComponent(ELMP.resource('biz-lifecycle/index.js'))
    };
});
