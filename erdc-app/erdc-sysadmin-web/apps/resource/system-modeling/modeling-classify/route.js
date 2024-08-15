define(['erdcloud.kit'], function (ErdcloudKit) {
    return {
        path: '',
        name: 'bizClassify',
        component: ErdcloudKit.asyncComponent(ELMP.resource('system-modeling/modeling-classify/index.js'))
    };
});
