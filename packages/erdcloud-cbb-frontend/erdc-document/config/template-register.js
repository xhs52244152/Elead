define([ELMP.func('erdc-document/config/viewConfig.js'), ELMP.func('erdc-document/views/template/index.js')], function (
    viewConfig,
    contentComponent
) {
    const ErdcStore = require('erdcloud.store');

    ErdcStore.dispatch('registerTemplateAssets', {
        contentComponent,
        className: viewConfig?.docViewTableMap?.className || ''
    });
});
