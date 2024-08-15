define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'demo',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-components/AbnormalPages/index.js'))
        }
    ];
});
