define([
    ELMP.resource('erdc-pdm-app/register.js'),
    ELMP.resource('erdc-pdm-icon/index.js'),
    'css!' + ELMP.resource('erdc-pdm-app/style/index.css')
], function (register) {
    return async function startPlatformWeb() {
        await register();
    };
});
