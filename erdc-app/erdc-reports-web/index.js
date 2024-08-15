require(['/erdc-libs/erdc-app/index.js'], function (startApp) {
    startApp({
        appName: 'erdc-reports-web',
        appVersion: '__LOCAL__',
        mounted() {
            document.querySelector('#global-loading').style.display = 'none';
        }
    });
});
