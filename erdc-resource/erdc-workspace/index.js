define([
    ELMP.func('erdc-workspace/store.js'),
    ELMP.func('erdc-workspace/actions.js'),
    ELMP.func('erdc-workspace/config/common-page-config.js')
], function (store, actions, getConfig) {
    const ErdcStore = require('erdcloud.store');

    function init() {
        // 初始化store
        initStore();

        // 初始化actions
        ErdcStore.dispatch('registerActionMethods', actions);

        // 初始化通用表单配置
        useConfig();
    }

    function useConfig(customConfig) {
        const config = getConfig(customConfig);
        Object.keys(config).forEach((className) => {
            // 如果没有客制化配置，并且已有对应className配置，则不处理
            if (!customConfig && ErdcStore.state?.infoPage.commonPageConfig[className]) return;
            ErdcStore.dispatch('infoPage/addClassNameConfig', {
                className,
                config: config[className]
            });
        });
        return new Promise((resolve) => resolve(config));
    }

    function initStore() {
        // 初始化通用页面store
        if (ErdcStore.hasModule('Workspace')) {
            return;
        }
        ErdcStore.registerModule('Workspace', store);
    }

    return {
        init,
        initStore,
        useConfig
    };
});
