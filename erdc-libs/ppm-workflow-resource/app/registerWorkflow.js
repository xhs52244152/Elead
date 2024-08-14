define([
    ELMP.resource('ppm-workflow-resource/app/store/index.js'),
    'css!' + ELMP.resource('ppm-style/global.css')
], function (store) {
    async function init() {
        registerActions();
        await registerWorkflowConfig();
    }
    function registerWorkflowConfig() {
        return new Promise((resolve) => {
            const FamStore = require('erdcloud.store');
            FamStore.registerModule('businessObjectConfig', store);
            Object.keys(store.state.commonBusinessConfig).forEach((key) => {
                FamStore.dispatch('bpmPartial/registerResource', {
                    key,
                    resource: {
                        url: 'ppm-workflow-resource/index.js',
                        className: store.state.commonBusinessConfig[key]?.className || '',
                        headers: {
                            'App-Name': 'PPM'
                        }
                    }
                });
            });
            resolve();
        });
    }
    function registerActions() {
        new Promise((resolve) => {
            require([ELMP.resource('ppm-workflow-resource/app/config/menu-actions.js'), 'erdcloud.store'], (
                actions,
                ErdcStore
            ) => {
                ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                    resolve();
                });
            });
        });
    }
    return {
        init
    };
});
