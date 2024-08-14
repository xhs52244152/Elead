define(['erdcloud.kit', ELMP.func('erdc-ppm-review-library/index.js')], function (ErdcloudKit, reviewLibrary) {
    // 初始化配置
    reviewLibrary.init();
    return {
        path: '',
        name: 'reviewLibrary',
        component: ErdcloudKit.asyncComponent(ELMP.func('erdc-ppm-review-library/views/list/index.js')),
        meta: {
            title: '评审配置',
            parentRouteCode: 'container'
        }
    };
});
