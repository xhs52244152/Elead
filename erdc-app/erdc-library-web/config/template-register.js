define(['../store/index.js'], function (store) {
    // 注册模板列表页面
    const ErdcStore = require('erdcloud.store');
    const ErdcKit = require('erdc-kit');
    ErdcStore.registerModule('pdmLibraryStore', store);

    let templateRegister = function () {
        const getObjectMapping = ErdcStore.getters?.['pdmLibraryStore/getObjectMapping'];
        const libraryMapping = getObjectMapping({ objectName: 'library' });
        ErdcStore.dispatch('registerTemplateAssets', {
            contentComponent: ErdcKit.asyncComponent(ELMP.resource('library-space/views/template/index.js')),
            className: libraryMapping?.className || ''
        });
    };

    return templateRegister;
});
