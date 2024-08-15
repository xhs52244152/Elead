define([], function () {
    return {
        beforeCreate() {
            return new Promise((resolve) => {
                // 注册pdmProductStore
                require(['./store/index.js', 'erdcloud.store'], function (store, ErdcStore) {
                    ErdcStore.registerModule('pdmProductStore', store);
                    resolve();
                });
            });
        },
        beforeMount() {
            return new Promise((resolve) => {
                require([ELMP.resource('erdc-pdm-app/index.js')], function (startPdmApp) {
                    const ErdcStore = require('erdcloud.store');

                    let ps = [];

                    ps.push(startPdmApp());

                    // 注册通用表单配置
                    ps.push(
                        new Promise((resolve) => {
                            require(['./config/common-page-config.js'], (configs) => {
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
                        })
                    );

                    // 注册产品库全局按钮事件
                    ps.push(
                        new Promise((resolve) => {
                            require(['./actions.js'], (actions) => {
                                ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                                    resolve();
                                });
                            });
                        })
                    );

                    Promise.all(ps).then(() => {
                        resolve();
                    });
                });
            });
        },
        mounted() {
            document.querySelector('#global-loading').style.display = 'none';
        }
    };
});
