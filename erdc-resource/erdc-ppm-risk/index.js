define(['erdcloud.store', ELMP.resource('ppm-store/index.js')], function (ErdcStore, ppmStore) {
    async function init() {
        await register();
    }
    function register() {
        let arr = [];
        const getData = () => {
            return ppmStore.state.projectInfo || {};
        };
        arr.push(
            new Promise((resolve) => {
                require([ELMP.func('erdc-ppm-risk/config/menu-actions.js')], function (getActions) {
                    let actions = getActions(getData);
                    ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                        resolve();
                    });
                });
            })
        );
        arr.push(
            new Promise((resolve) => {
                require([ELMP.func('erdc-ppm-risk/config/common-page-config.js')], (getConfigs) => {
                    let configs = getConfigs(getData);
                    Object.keys(configs).forEach((className) => {
                        ErdcStore.dispatch('infoPage/addClassNameConfig', {
                            className,
                            config: configs[className]
                        });
                    });
                    resolve();
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
