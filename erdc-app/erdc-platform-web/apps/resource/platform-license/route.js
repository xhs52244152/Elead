define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: '',
            name: 'license',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-license/views/AuthList/index.js'))
        }
    ];
});
