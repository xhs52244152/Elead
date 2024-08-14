define([ELMP.resource('ppm-app/register.js'), 'css!' + ELMP.resource('ppm-style/global.css')], function (register) {
    return function startPlatformWeb() {
        return new Promise((resolve) => {
            register().then(resolve);
        });
    };
});
