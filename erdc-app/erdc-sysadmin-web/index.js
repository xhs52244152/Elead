require(['/erdc-libs/erdc-app/index.js'], function (startApp) {
    startApp({
        appName: 'erdc-sysadmin-web',
        appVersion: '__LOCAL__',
        beforeMount() {
            require(['erdcloud.store', './actions.js'], function (store, actions) {
                store.dispatch('registerActionMethods', actions);
            });
        },
        mounted: function () {
            document.querySelector('#global-loading').style.display = 'none';
        }
    });
});
