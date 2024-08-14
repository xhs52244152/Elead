define(['erdcloud.store'], function (ErdcStore) {
    async function init() {
        await register();
    }
    function register() {
        let arr = [];
        // 注册表单组件
        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('ppm-app/registerComponent.js')], async (registerComponent) => {
                    await registerComponent.init();
                    resolve();
                });
            })
        );
        // 注册通用表单配置
        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('project-handle-task/config/common-page-config.js')], (configs) => {
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
        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('project-handle-task/config/menu-actions.js')], (actions) => {
                    ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                        resolve();
                    });
                });
            })
        );
        // 注册全局事件、通用表单、流程配置
        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('ppm-app/config/index.js')], async (register) => {
                    await register.init();
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
