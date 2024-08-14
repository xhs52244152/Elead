define(['erdcloud.kit', ELMP.func('erdc-ppm-review-config/index.js')], function (ErdcloudKit, reviewConfig) {
    // 初始化配置
    reviewConfig.init();
    return {
        path: '',
        name: 'ReviewConfig',
        component: ErdcloudKit.asyncComponent(ELMP.func('erdc-ppm-review-config/views/list/index.js')),
        meta: {
            title: '评审配置',
            parentRouteCode: 'container'
        }
    };
});
