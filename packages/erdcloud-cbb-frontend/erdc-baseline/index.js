define([ELMP.func('erdc-baseline/actions.js'), ELMP.func('erdc-baseline/store.js')], function (actions, store) {
    const ErdcStore = require('erdcloud.store');

    function init() {
        // 初始化store
        initStore();

        // 初始化actions
        let customActions = ErdcStore.getters?.['CbbBaseline/getCustomActions'] || {};
        ErdcStore.dispatch('registerActionMethods', { ...actions, ...customActions });
    }

    function initStore() {
        // 初始化通用页面store
        if (ErdcStore.hasModule('CbbBaseline')) {
            return;
        }
        ErdcStore.registerModule('CbbBaseline', store);
    }

    function useActions(customActions) {
        initStore();
        ErdcStore.dispatch('CbbBaseline/setCustomActions', customActions);
    }

    return {
        init,
        initStore,
        useActions
    };
});
