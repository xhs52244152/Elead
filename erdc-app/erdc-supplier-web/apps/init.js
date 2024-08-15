define([], function () {
    const appConfig = {
        name: 'erdc-supplier-web',
        beforeCreate(callback) {
            require([ELMP.resource('supplier-app/index.js')], function (statApp) {
                statApp().then(() => {
                    callback();
                });
            });
        },
        resources: [
            'supplier-app',
            'supplier-list',
            'supplier-folder',
            'supplier-parts',
            'supplier-team',
            'supplier-template',
            'supplier-components'
        ]
    };

    return function (registerApp) {
        registerApp(appConfig);
    };
});
