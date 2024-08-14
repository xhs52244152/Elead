define(['erdcloud.kit', ELMP.func('erdc-ppm-products/index.js')], function (ErdcloudKit, sysProducts) {
    sysProducts.init();
    return {
        path: '',
        name: 'SysProducts',
        component: ErdcloudKit.asyncComponent(ELMP.func('erdc-ppm-products/views/list/index.js')),
        meta: {
            title: '产品信息',
            parentRouteCode: 'container'
        }
    };
});
