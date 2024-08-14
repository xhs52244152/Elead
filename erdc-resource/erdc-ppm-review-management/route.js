define(['erdcloud.kit', ELMP.func('erdc-ppm-review-management/index.js')], function (ErdcloudKit, reviewInit) {
    reviewInit.init();
    return {
        path: '',
        name: 'ErdcPpmReviewManagement',
        component: ErdcloudKit.asyncComponent(ELMP.func('erdc-ppm-review-management/views/list/index.js')),
        meta: {
            title: '评审',
            keepAlive: false,
            parentRouteCode: 'space'
        }
    };
});
