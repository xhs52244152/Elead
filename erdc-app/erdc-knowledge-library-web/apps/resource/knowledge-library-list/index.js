define(['erdcloud.store'], function (ErdcStore) {
    async function init() {
        await register();
    }
    function register() {
        let arr = [];
        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('knowledge-library-list/config/menu-actions.js')], (actions) => {
                    ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                        resolve();
                    });
                });
            })
        );
        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('knowledge-library-list/config/common-page-config.js')], (configs) => {
                    Object.keys(configs).map((className) => {
                        return ErdcStore.dispatch('infoPage/addClassNameConfig', {
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
                require([ELMP.resource('ppm-store/index.js')], function (ppmStore) {
                    // 【我的知识】没有触发注册知识库信息事件，所以这里去注册事件
                    if (
                        !Object.keys(ppmStore.state.knowledgeInfo).length &&
                        window.__currentAppName__ !== 'erdc-knowledge-library-web'
                    ) {
                        ppmStore.dispatch('fetchKnowledgeInfo').then(() => {
                            resolve();
                        });
                    }
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
