define(['erdcloud.kit', ELMP.func('erdc-ppm-heavy-team/index.js')], function (ErdcloudKit, sysHeavyTeam) {
    sysHeavyTeam.init();
    return {
        path: '',
        name: 'SysHeavyTeam',
        component: ErdcloudKit.asyncComponent(ELMP.func('erdc-ppm-heavy-team/views/list/index.js')),
        meta: {
            title: '重量级团队'
        }
    };
});
