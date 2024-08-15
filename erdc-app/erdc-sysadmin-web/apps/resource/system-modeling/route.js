define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'type',
            component: ErdcKit.asyncComponent(ELMP.resource('system-modeling/modeling-type/index.js'))
        },
        {
            path: 'classify',
            component: ErdcKit.asyncComponent(ELMP.resource('system-modeling/modeling-classify/index.js'))
        }
    ];
});
