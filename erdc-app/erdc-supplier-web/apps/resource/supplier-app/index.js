define([
    ELMP.resource('erdc-pdm-app/index.js'),
    ELMP.resource('erdc-pdm-app/cbb.js'),
    'erdcloud.router',
    'erdcloud.store',
    'erdc-kit'
], function (startPdmApp, { useCBB }) {
    const FamRouter = require('erdcloud.router');
    const FamStore = require('erdcloud.store');
    const ErdcKit = require('erdc-kit');

    return async function () {
        await startPdmApp();

        // 注册pdmSupplierStore
        await new Promise((resolve) => {
            require([ELMP.resource('supplier-app/store/index.js'), ELMP.resource('supplier-app/store.js')], function (
                store,
                useStore
            ) {
                useStore(store).then(() => {
                    resolve();
                });
            });
        });
        // 注册pdmSupplierRouter
        await new Promise((resolve) => {
            require([ELMP.resource('supplier-app/router.js')], function (useRoutes) {
                useRoutes(FamRouter).then(() => {
                    resolve();
                });
            });
        });
        // 注册模板列表页面
        await new Promise((resolve) => {
            require([], function () {
                const getViewTableMapping =
                    FamStore.getters?.['pdmSupplierStore/getViewTableMapping'] ||
                    (() => {
                        return {};
                    });
                const supplierMapping = getViewTableMapping({ tableName: 'supplier' });
                FamStore.dispatch('registerTemplateAssets', {
                    contentComponent: ErdcKit.asyncComponent(ELMP.resource('supplier-template/index.js')),
                    className: supplierMapping?.className || ''
                }).then(() => {
                    resolve();
                });
            });
        });

        // 注册通用表单配置
        await new Promise((resolve) => {
            require([ELMP.resource('supplier-app/config/common-page-config.js')], (configs) => {
                let asynchronousQueueList = Object.keys(configs).map((className) => {
                    return FamStore.dispatch('infoPage/addClassNameConfig', {
                        className,
                        config: configs[className]
                    });
                });
                Promise.all(asynchronousQueueList).then(() => {
                    resolve();
                });
            });
        });

        // 注册供应商全局按钮事件
        await new Promise((resolve) => {
            require([ELMP.resource('supplier-app/actions.js')], (actions) => {
                FamStore.dispatch('registerActionMethods', actions).then(() => {
                    resolve();
                });
            });
        });

        const Part = await useCBB('erdc-part');
        Part?.useRoutes('supplierSpace', 'supplierPart', '/supplier/:pid');
        const Document = await useCBB('erdc-document');
        Document?.useRoutes('supplierSpace', 'supplierDocument', '/supplier/:pid');
        const EpmDocument = await useCBB('erdc-epm-document');
        EpmDocument?.useRoutes('supplierSpace', 'supplierEpmDocument', '/supplier/:pid');
        const Baseline = await useCBB('erdc-baseline');
        Baseline?.useRoutes('supplierSpace', { resourceCode: 'supplierBaseline' });
        const Workspace = await useCBB('erdc-workspace');
        Workspace?.useRoutes('supplierSpace', 'supplierWorkspace', '/supplier/:pid');
    };
});
