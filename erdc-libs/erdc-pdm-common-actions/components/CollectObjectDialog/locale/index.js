define([ELMP.resource('erdc-pdm-common-actions/locale/index.js')], function (rootI18n) {
    return {
        i18n: {
            ..._.pick(rootI18n.i18n, ['collectObjs'])
        }
    };
});
