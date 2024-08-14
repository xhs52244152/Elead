define(['erdcloud.store', ELMP.resource('ppm-store/index.js')], function (ErdcStore, ppmStore) {
    async function init() {
        await register();
    }
    function register() {
        let arr = [];

        arr.push(
            new Promise((resolve) => {
                require([ELMP.func('erdc-ppm-template/config/menu-actions.js')], function (actions) {
                    ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                        resolve();
                    });
                });
            })
        );

        // arr.push(
        //     new Promise((resolve) => {
        //         require([], function () {
        //             ErdcStore.dispatch('registerTemplateAssets', {
        //                 ontentComponent: ErdcKit.asyncComponent(ELMP.resource('erdc-ppm-template/views/list/index.js')),
        //                 className: 'erd.cloud.ppm.project.entity.Project'
        //             }).then(() => {
        //                 resolve();
        //             });
        //         });
        //     })
        // );

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
