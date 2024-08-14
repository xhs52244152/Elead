define([], function () {
    const ErdcStore = require('erdcloud.store');

    async function init() {
        // 初始化actions
        require([ELMP.func('erdc-ppm-heavy-team/config/menu-actions.js')], (actions) => {
            ErdcStore.dispatch('registerActionMethods', actions);
        });
    }

    return {
        init
    };
});
