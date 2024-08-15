define(['erdc-kit'], function (ErdcKit) {
    return {
        path: '',
        name: 'messageOverview',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-message/MessageOverview/index.js')),
        meta: {
            hideSubMenus: true,
            title: '系统消息',
            noAuth: true,
            parentRouteCode: 'container'
        }
    };
});
