define([ELMP.func('erdc-epm-document/config/viewConfig.js'), ELMP.func('erdc-epm-document/views/template/index.js')], function (
    viewConfig,
    contentComponent
) {
    const ErdcStore = require('erdcloud.store');

    // 初始化模板列表页面
    ErdcStore.dispatch('registerTemplateAssets', {
        contentComponent,
        className: viewConfig?.epmDocumentViewTableMap?.className || ''
    });
});