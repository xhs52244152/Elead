define([
    'erdcloud.kit',
    ELMP.resource('ppm-app/config/index.js'),
    ELMP.resource('/ppm-utils/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('knowledge-library-list/index.js')
], function (ErdcloudKit, register, ppmUtils, ppmStore, knowledgeInit) {
    const detailPath = '';
    // 注册通用页面、全局事件
    register.init();
    let documentClassName = ppmStore.state.classNameMapping.document;
    knowledgeInit.init();
    return [
        {
            path: '',
            meta: {
                title: '我的文档',
                keepAlive: false,
                documentType: 'myDocument'
            },
            name: 'projectMyDocument',
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-my-document/index.js'))
        },
        {
            path: 'document/detail',
            name: 'documentDetail',
            component: ErdcloudKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route) {
                    return route.query.title || '查看文档';
                },
                openType: 'detail',
                isSameRoute: ppmUtils.isSameRoute,
                keepAlive: false,
                className: documentClassName,
                documentType: 'myDocument'
            },
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next, detailPath })
        },
        // 编辑文档
        {
            path: 'document/edit',
            name: 'documentEdit',
            component: ErdcloudKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route) {
                    return route.query.title || '编辑文档';
                },
                openType: 'edit',
                isSameRoute: ppmUtils.isSameRoute,
                keepAlive: true,
                className: documentClassName,
                documentType: 'myDocument'
            },
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next, detailPath })
        }
    ];
});
