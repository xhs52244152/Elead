define(['erdcloud.store', ELMP.resource('ppm-store/index.js')], function (ErdcStore, ppmStore) {
    const asyncTasks = [];
    const registerAsyncTasks = function () {
        for (let i = 0; i < arguments.length; i++) {
            const callback = arguments[i];
            if (typeof callback === 'function') {
                asyncTasks.push(
                    new Promise((resolve) => {
                        const result = callback(resolve);
                        if (result instanceof Promise) {
                            result.then(resolve);
                        }
                    })
                );
            }
        }
    };
    return function () {
        // const ErdcKit = require('erdcloud.kit');
        const erdcloudRouter = require('erdcloud.router');
        // const store = require('erdcloud.store');
        /**
         * 路由守卫：项目信息
         */
        // erdcloudRouter.beforeEach(async (to, from, next) => {

        //     next();
        // });
        erdcloudRouter.afterEach((to, from) => {
            let id = to.query.pid || to.params.pid;
            // 判断是否跳入项目空间 id第一次是${pid}所以要进行判断
            let isJumpProjectSpace = to.matched[1]?.name === 'space' ? true : false;
            let idIsChange = to.query.pid !== from.query.pid;
            if (id && isJumpProjectSpace && id != '${pid}' && idIsChange) {
                console.log('update info');
                ppmStore.dispatch('fetchProjectInfo', { id });
            }
        });
        // 注册选择对象界面的列配置
        registerAsyncTasks(function setObjectSelectColumns(next) {
            require([
                ELMP.resource('erdc-components/FamObjectSelectDialog/store.js'),
                ELMP.resource('ppm-app/config/object_select_config.js')
            ], (store, configs) => {
                configs.forEach((item) => {
                    store.dispatch('FamObjectSelect/setConfig', item);
                });
                next();
            });
        });
        registerAsyncTasks(function registerComponents(next) {
            require([ELMP.resource('ppm-app/registerComponent.js')], (registerComponent) => {
                registerComponent.init();
                next();
            });
        });
        // 注册通用表单和全局事件
        registerAsyncTasks(function registerActionsCommonPageConfigs(next) {
            require([ELMP.resource('ppm-app/config/index.js')], (register) => {
                register.init();
                next();
            });
        });
        // 注册模板列表页面
        // registerAsyncTasks(function setTemplatePage(next) {
        //     store.dispatch('registerTemplateAssets', {
        //         contentComponent: ErdcKit.asyncComponent(ELMP.resource('project-template/index.js')),
        //         className: 'erd.cloud.ppm.project.entity.Project'
        //     });
        //     next();
        // });
        return Promise.all([...asyncTasks]);
    };
});
