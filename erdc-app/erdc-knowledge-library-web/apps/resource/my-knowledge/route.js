define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('/ppm-utils/index.js'),
    ELMP.resource('knowledge-library-list/index.js')
], function (ErdcKit, ppmStore, ppmUtils, knowledgeInit) {
    const detailPath = 'myKnowledge/list';
    let documentClassName = ppmStore.state.classNameMapping.document;
    knowledgeInit.init();
    return [
        // 知识库列表
        {
            path: 'myKnowledge/list',
            name: 'myKnowledge',
            component: ErdcKit.asyncComponent(ELMP.resource('my-knowledge/views/list/index.js')),
            meta: {
                noAuth: true,
                title: '我的知识',
                resourceCode: 'myKnowledge',
                sceneName: 'myKnowledge',
                keepAlive: false,
                documentType: 'myKnowledge'
            }
        },
        {
            path: 'document/detail',
            name: 'documentDetail',
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route) {
                    return route.query.title || '查看文档';
                },
                openType: 'detail',
                isSameRoute: ppmUtils.isSameRoute,
                keepAlive: false,
                className: documentClassName,
                documentType: 'myKnowledge'
            },
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next, detailPath })
        },
        // 编辑文档
        {
            path: 'document/edit',
            name: 'documentEdit',
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route) {
                    return route.query.title || '编辑文档';
                },
                openType: 'edit',
                isSameRoute: ppmUtils.isSameRoute,
                keepAlive: true,
                className: documentClassName,
                documentType: 'myKnowledge'
            },
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next, detailPath })
        },
        // 创建文档
        {
            path: 'document/create',
            name: 'documentCreate',
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route) {
                    return '创建文档';
                },
                openType: 'create',
                isSameRoute: ppmUtils.isSameRoute,
                keepAlive: true,
                className: documentClassName,
                documentType: 'myKnowledge'
            },
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next, detailPath })
        }
    ];
});
