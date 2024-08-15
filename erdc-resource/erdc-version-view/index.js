define([
    ELMP.func('erdc-version-view/store.js'),
    ELMP.func('erdc-version-view/actions.js')
], function (store, actions) {
    const ErdcStore = require('erdcloud.store');

    function init() {
        // 初始化store
        ErdcStore.registerModule('pdmVersionViewStore', store);
        // 初始化actions
        ErdcStore.dispatch('registerActionMethods', actions);
    }

    return {
        init
    };
});
