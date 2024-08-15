define([
    ELMP.func('erdc-document/actions.js'),
    ELMP.func('erdc-document/config/common-page-config.js'),
    ELMP.resource('erdc-cbb-workflow/index.js'),
    ELMP.resource('erdc-document/store.js')
], function (actions, getConfig, registerWorkflow, docStore) {
    const ErdcStore = require('erdcloud.store');

    function init() {
        // 初始化actions
        let customActions = ErdcStore.getters?.['Document/getCustomActions'] || {};
        ErdcStore.dispatch('registerActionMethods', { ...actions, ...customActions });

        // 初始化通用表单配置
        useConfig();

        // 注册工作流相关配置
        registerWorkflow();
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

    function useActions(customActions) {
        ErdcStore.registerModule('Document', docStore);
        ErdcStore.dispatch('Document/setCustomActions', customActions);
    }

    return {
        init,
        useConfig,
        useActions
    };
});
