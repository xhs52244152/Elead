define([
    'erdcloud.kit',
    ELMP.resource('/ppm-utils/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('knowledge-library-list/index.js')
], function (ErdcKit, ppmUtils, ppmStore, knowledgeInit) {
    const detailPath = 'project/folder';
    let documentClassName = ppmStore.state.classNameMapping.document;
    const famStore = require('fam:store');
    // 在这里注册通用页面是因为和CBB共用一个className，如果放在registerPage.js注册就会导致刷新页面的时候会出现CBB的页面
    knowledgeInit.init();
    return [
        {
            path: 'project/folder',
            name: 'projectFolder',
            // component: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/views/folder.js')),
            component: ErdcKit.asyncComponent(ELMP.resource('project-folder/index.js')),
            meta: {
                title(route, resource) {
                    return route.params.title || resource?.name || '文档';
                },
                resourceCode: 'project:folder',
                documentType: 'projectDocument',
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, '')
            }
        },
        {
            path: 'folder/create',
            name: 'createFolder',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                noAuth: true,
                title: () => {
                    return '创建文件夹';
                },
                className: famStore.getters.className('subFolder'),
                openType: 'create',
                keepAlive: true,
                currentRouterIdKey: 'oid',
                isSameRoute: ppmUtils.isSameRoute
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next, detailPath })
        },
        {
            path: 'folder/edit',
            name: 'editFolder',
            meta: {
                noAuth: true,
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title: () => {
                    return '编辑文档';
                },
                className: famStore.getters.className('subFolder'),
                openType: 'edit',
                keepAlive: true,
                currentRouterIdKey: 'oid',
                isSameRoute: ppmUtils.isSameRoute
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter(to, from, next) {
                ppmUtils.setResourceCode({ to, next, detailPath });
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
                documentType: 'projectDocument'
            },
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next, detailPath })
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
                documentType: 'projectDocument'
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
                documentType: 'projectDocument'
            },
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next, detailPath })
        }
    ];
});
