define(['../store/index.js'], function (store) {
    // 注册模板列表页面
    const ErdcStore = require('erdcloud.store');
    const ErdcKit = require('erdc-kit');
    ErdcStore.registerModule('pdmProductStore', store);

    let templateRegister = function () {
        const getObjectMapping = ErdcStore.getters?.['pdmProductStore/getObjectMapping'];
        const productMapping = getObjectMapping({ objectName: 'product' });
        ErdcStore.dispatch('registerTemplateAssets', {
            contentComponent: ErdcKit.asyncComponent(ELMP.resource('product-space/views/template/index.js')),
            className: productMapping?.className || ''
        });
    };

    return templateRegister;
});
