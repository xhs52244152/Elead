define(['erdcloud.store'], function (ErdcStore) {
    async function init() {
        await register();
    }
    function register() {
        let arr = [];
        // 注册全局事件
        arr.push(
            new Promise((resolve) => {
                require([ELMP.func('erdc-ppm-review-management/config/menu-actions.js')], function (getActions) {
                    const actions = getActions();
                    ErdcStore.dispatch('registerActionMethods', actions).then(() => resolve());
                });
            })
        );
        return new Promise((resolve) => {
            Promise.all(arr).then(() => {
                resolve();
            });
        });
    }
    return {
        init
    };
});
