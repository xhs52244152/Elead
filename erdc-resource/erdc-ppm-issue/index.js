define(['erdcloud.store', ELMP.resource('ppm-store/index.js')], function (ErdcStore, ppmStore) {
    async function init() {
        await register();
    }
    function register() {
        let arr = [];
        // 注册通用表单配置
        arr.push(
            new Promise((resolve) => {
                require([ELMP.func('erdc-ppm-issue/config/common-page-config.js')], (configs) => {
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
        // 注册全局事件
        arr.push(
            new Promise((resolve) => {
                require([ELMP.func('erdc-ppm-issue/config/menu-actions.js')], function (getActions) {
                    const getData = () => {
                        return ppmStore.state.projectInfo || {};
                    };
                    const actions = getActions(getData);
                    ErdcStore.dispatch('registerActionMethods', actions).then(() => resolve());
                });
            })
        );

        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('ppm-app/registerComponent.js')], function (registerComponent) {
                    registerComponent.init();
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
