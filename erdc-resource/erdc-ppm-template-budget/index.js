define(['erdcloud.store'], function (ErdcStore) {
    async function init() {
        await register();
    }
    function register() {
        let arr = [];
        arr.push(
            new Promise((resolve) => {
                require([ELMP.func('erdc-ppm-template-budget/config/menu-actions.js')], function (getActions) {
                    ErdcStore.dispatch('registerActionMethods', getActions()).then(() => {
                        resolve();
                    });
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
