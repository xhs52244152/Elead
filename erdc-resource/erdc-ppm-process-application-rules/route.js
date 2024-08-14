define(['erdcloud.kit', ELMP.func('erdc-ppm-process-application-rules/index.js')], function (
    ErdcloudKit,
    SysProcessApplicationRules
) {
    SysProcessApplicationRules.init();
    return {
        path: '',
        name: 'sysProcessApplicationRules',
        component: ErdcloudKit.asyncComponent(ELMP.func('erdc-ppm-process-application-rules/views/list/index.js')),
        meta: {
            title: '流程应用规则',
            parentRouteCode: 'container'
        }
    };
});
