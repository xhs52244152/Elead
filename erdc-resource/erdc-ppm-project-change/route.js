define(['erdcloud.kit'], function (ErdcloudKit) {
    return {
        path: '',
        name: 'ErdcppmChange',
        component: ErdcloudKit.asyncComponent(ELMP.func('erdc-ppm-project-change/views/list/index.js')),
        meta: {
            title: '变更',
            parentRouteCode: 'space'
        }
    };
});
