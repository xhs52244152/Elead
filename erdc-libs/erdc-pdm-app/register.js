define([ELMP.resource('erdc-pdm-app/cbb.js'), 'erdcloud.store'], function ({ useCBB }) {
    let lock = true;
    return async function () {
        const ErdcKit = require('erdc-kit');
        const erdcloudRouter = require('erdcloud.router');
        const store = require('erdcloud.store');

        // 先要把系统管理的路由引入注册,不然会有执行顺序的问题,我们的应用先加载,系统管理慢加载,导致初始化的时候没有丢进去
        // await new Promise((resolve) => {
        //     require([ELMP.resource('system-app/router.js')], function (useSysRouter) {
        //         useSysRouter(erdcloudRouter);
        //         resolve();
        //     });
        // });

        // await new Promise((resolve) => {
        //     require([ELMP.resource('portal-app/index.js')], function (userPortalRouter) {
        //         userPortalRouter(erdcloudRouter);
        //         resolve();
        //     });
        // });

        // await new Promise((resolve) => {
        //     require([ELMP.resource('biz-app/index.js')], function (useRoutes) {
        //         useRoutes(erdcloudRouter);
        //         resolve();
        //     });
        // });

        // 首页产品管理路由
        // const portalRoutes = [
        //     {
        //         path: `/portal/productData`,
        //         name: 'productDataPortal',
        //         component: {
        //             name: 'ProductDataPortal',
        //             template: `<KeepAliveRouterView></KeepAliveRouterView>`
        //         },
        //         meta: {
        //             noAuth: true,
        //             singleton: true,
        //             layoutSecondaryMenuType: 'vertical',
        //             resourceCode: 'productDataPortal'
        //         }
        //     }
        // ];

        // portalRoutes.forEach((route) => {
        //     erdcloudRouter.addRoute('portal', route);
        // });

        // useCBB('erdc-part').then((Part) => {
        //     // 注册部件路由到首页(产品管理)
        //     Part?.useRoutes('productDataPortal', 'productDataPart', '/portal/productData');
        //     Part?.useConfig();
        // });

        // useCBB('erdc-document').then((Document) => {
        //     Document?.useRoutes('productDataPortal', 'productDataDocument', '/portal/productData');
        // });

        // useCBB('erdc-epm-document').then((EpmDocument) => {
        //     EpmDocument?.useRoutes('productDataPortal', 'productDataEpmDocument', '/portal/productData');
        //     EpmDocument?.useConfig();
        // });
        // useCBB('erdc-workspace').then((Workspace) => {
        //     Workspace?.useRoutes('productDataPortal', 'productDataWorkspace', '/portal/productData');
        //     Workspace?.useConfig();
        // });

        // useCBB('erdc-baseline').then((Baseline) => {
        //     Baseline?.useRoutes('productDataPortal', {
        //         resourceCode: 'productDataBaseline'
        //     });
        // });

        // useCBB('erdc-change').then((ChangeManage) => {
        //     ChangeManage?.useRoutes('productDataPortal', 'productDataChange', '/portal/productData');
        //     ChangeManage?.useConfig();
        // });

        await new Promise((resolve) => {
            require([ELMP.resource('erdc-pdm-app/actions.js')], function (actions) {
                store.dispatch('registerActionMethods', actions).then(() => {
                    resolve();
                });
            });
        });

        // 注册工作流相关配置
        // await new Promise((resolve) => {
        //     require([ELMP.resource('erdc-cbb-workflow/index.js')], function (registerWorkflow) {
        //         registerWorkflow().then(() => {
        //             resolve();
        //         });
        //     });
        // });
        
        return Promise.resolve();
    };
});
