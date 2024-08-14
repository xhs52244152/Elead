define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'erdcloud.store',
    ELMP.resource('knowledge-library-list/index.js')
], function (ErdcKit, ppmStore, ppmUtils, ErdcStore, knowledgeInit) {
    let documentClassName = ppmStore.state.classNameMapping.document;
    const subFolder = ErdcStore.getters.className('subFolder');
    // 在这里注册通用页面是因为和CBB共用一个className，如果放在registerPage.js注册就会导致刷新页面的时候会出现CBB的页面
    knowledgeInit.init();
    const detailPath = 'knowledge/list';
    return [
        // 知识库列表
        {
            path: 'knowledge/list',
            name: 'knowledgeList',
            component: ErdcKit.asyncComponent(ELMP.resource('knowledge-library-list/views/list/index.js')),
            meta: {
                noAuth: true,
                title: '知识库',
                sceneName: 'knowledgeList',
                keepAlive: false,
                documentType: 'knowledgeList'
            }
        },
        // 创建文档
        {
            path: 'document/create',
            name: 'documentCreate',
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route) {
                    return route.query.title || '创建文档';
                },
                openType: 'create',
                keepAlive: true,
                isSameRoute: ppmUtils.isSameRoute,
                className: documentClassName,
                currentRouterIdKey: 'oid',
                documentType: 'knowledgeList'
            }
        },
        // 查看文档
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
                currentRouterIdKey: 'oid',
                documentType: 'knowledgeList'
            },
            beforeEnter(to, from, next) {
                ppmUtils.setResourceCode({ to, next, detailPath });
            }
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
                currentRouterIdKey: 'oid',
                documentType: 'knowledgeList'
            },
            beforeEnter(to, from, next) {
                ppmUtils.setResourceCode({ to, next, detailPath });
            }
        },
        {
            path: 'folder/create',
            name: 'createFolder',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                noAuth: true,
                title: '创建文件夹',
                className: subFolder,
                openType: 'create',
                keepAlive: true,
                currentRouterIdKey: 'oid',
                isSameRoute: ppmUtils.isSameRoute
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
        },
        {
            path: 'folder/edit',
            name: 'editFolder',
            meta: {
                noAuth: true,
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title: '编辑文件夹',
                className: subFolder,
                openType: 'edit',
                keepAlive: true,
                currentRouterIdKey: 'oid',
                isSameRoute: ppmUtils.isSameRoute
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter(to, from, next) {
                ppmUtils.setResourceCode({ to, next, detailPath });
            }
        }
    ];
});
