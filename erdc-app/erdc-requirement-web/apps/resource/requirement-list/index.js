define(['erdcloud.store', ELMP.resource('ppm-utils/index.js')], function (ErdcStore, ppmUtils) {
    async function init() {
        await register();
    }
    function register() {
        let arr = [];
        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('requirement-list/config/menu-actions.js')], (getActions) => {
                    const getContainerRef = () => {
                        return new Promise((resolve) => {
                            resolve(
                                ErdcStore.state?.space?.object?.containerRef ||
                                    'OR:erd.cloud.foundation.core.container.entity.OrgContainer'
                            );
                        });
                    };
                    let actions = getActions(getContainerRef);
                    ErdcStore.dispatch('registerActionMethods', actions).then(() => {
                        resolve();
                    });
                });
            })
        );
        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('requirement-list/config/common-page-config.js')], (getConfigs) => {
                    const getData = () => {
                        return ErdcStore.state?.space?.object || '';
                    };
                    let configs = getConfigs(getData);
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
        return new Promise((resolve) => {
            Promise.all(arr).then(() => {
                resolve();
            });
        });
    }
    function setResourceCode({ to, next }) {
        const pathMaps = {
            'erdc-requirement-web': 'require/list',
            'erdc-portal-web': 'myRequire/list',
            'erdc-project-web': 'projectRequire/list'
        };
        let identifierNo = ErdcStore.state.route.resources.identifierNo;
        const detailPath = pathMaps[identifierNo];
        ppmUtils.setResourceCode({ to, next, detailPath });
    }
    return {
        init,
        setResourceCode
    };
});
