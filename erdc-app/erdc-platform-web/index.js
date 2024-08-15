require(['/erdc-libs/erdc-app/index.js'], function (startApp) {
    startApp({
        appName: 'erdc-platform-web',
        appVersion: '__LOCAL__',
        mounted: function () {
            document.querySelector('#global-loading').style.display = 'none';
        }
    });
});
