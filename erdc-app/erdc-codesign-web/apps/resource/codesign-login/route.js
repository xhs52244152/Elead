define([], function () {
    const ErdcKit = require('erdc-kit');

    return [
        {
            path: 'login',
            name: 'codesignLogin',
            meta: {
                title: 'codesign登录'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('codesign-login/index.js'))
        }
    ];
});
