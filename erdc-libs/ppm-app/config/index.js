define(['erdcloud.store', 'erdcloud.kit'], function (ErdcStore, ErdcKit, registerWorkflow1) {
    async function init() {
        // 注册流程相关配置
        await registerForm();
    }
    function registerForm() {
        return new Promise((resolve) => {
            let ps = [];

            // 注册通用表单配置
            ps.push(
                new Promise((resolve) => {
                    require([ELMP.resource('ppm-app/config/common-page-config.js')], (configsAsync) => {
                        configsAsync.then((configs) => {
                            let asynchronousQueueList = Object.keys(configs).map((className) => {
                                return ErdcStore.dispatch('infoPage/addClassNameConfig', {
                                    className,
                                    config: configs[className]
                                });
                            });
                            Promise.all(asynchronousQueueList).then(() => {
                                resolve();
                            });
                        });
                    });
                })
            );

            // 注册全局按钮事件
            ps.push(
                new Promise((resolve) => {
                    require([ELMP.resource('/ppm-app/config/menu-actions.js')], (actionsAsync) => {
                        actionsAsync.then((actions) => {
                            ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                                resolve();
                            });
                        });
                    });
                })
            );
            Promise.all(ps).then(() => {
                resolve();
            });
        });
    }
    return {
        init
    };
});
