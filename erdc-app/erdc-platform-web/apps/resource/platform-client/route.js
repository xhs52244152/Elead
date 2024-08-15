define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: '',
            name: 'clientManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js'))
        }
    ];
});
