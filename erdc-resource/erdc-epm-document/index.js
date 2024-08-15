define([
    ELMP.func('erdc-epm-document/actions.js'),
    ELMP.func('erdc-epm-document/config/common-page-config.js'),
    ELMP.resource('erdc-cbb-workflow/index.js'),
    ELMP.resource('erdc-part/store.js')
], function (actions, getConfig, registerWorkflow, epmStore) {
    const ErdcStore = require('erdcloud.store');

    function init() {
        // 初始化actions
        let customActions = ErdcStore.getters?.['pdmEpmStore/getCustomActions'] || {};
        ErdcStore.dispatch('registerActionMethods', { ...actions, ...customActions });

        // 初始化通用表单配置
        useConfig();

        // 注册工作流相关配置
        registerWorkflow();
    }

    function useConfig(customConfig) {
        let configs = getConfig(customConfig);
        Object.keys(configs).forEach((className) => {
            // 如果没有客制化配置，并且已有对应className配置，则不处理
            if (!customConfig && ErdcStore.state?.infoPage.commonPageConfig[className]) return;
            ErdcStore.dispatch('infoPage/addClassNameConfig', {
                className,
                config: configs[className]
            });
        });

        return new Promise((resolve) => resolve());
    }

    function useActions(customActions) {
        ErdcStore.registerModule('pdmEpmStore', epmStore);
        ErdcStore.dispatch('pdmEpmStore/setCustomActions', customActions);
    }

    return {
        init,
        useConfig,
        useActions
    };
});
