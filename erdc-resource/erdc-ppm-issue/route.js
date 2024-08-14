define(['erdcloud.kit', ELMP.resource('/ppm-utils/index.js')], function (ErdcKit, ppmUtils) {
    const router = require('erdcloud.router');

    return [
        {
            path: '',
            name: 'projectIssue',
            component: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-issue/views/list/index.js')),
            meta: {
                title: '问题',
                resourceCode: 'projectIssue',
                parentRouteCode: 'space',
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, ''),
                keepAlive: false
            }
        },
        {
            path: 'issue/list',
            name: 'myIssueList',
            meta: {
                title: '我的问题',
                resourceCode: 'myIssueList',
                noAuth: true,
                keepAlive: false
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-issue/views/list/index.js'))
        },
        {
            path: 'issue/create',
            name: 'createIssue',
            meta: {
                noAuth: true,
                title: '创建问题',
                className: 'erd.cloud.ppm.issue.entity.Issue',
                openType: 'create',
                keepAlive: true,
                currentRouterIdKey: 'oid'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter(to, from, next) {
                const { $route } = router.app;
                // 用于区分是项目空间还是工作台
                const detailPath = $route.query.pid ? '' : 'issue/list';
                ppmUtils.setResourceCode({ to, next, detailPath });
            }
        },
        {
            path: 'issue/edit',
            name: 'issueEdit',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.title || '编辑问题' || resource?.name || route.path;
                },
                keepAlive: true,
                isSameRoute: ppmUtils.isSameRoute,
                noAuth: true,
                openType: 'edit',
                className: 'erd.cloud.ppm.issue.entity.Issue'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next })
        },
        {
            path: 'issue/detail',
            name: 'issueDetail',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.title || '查看问题' || resource?.name || route.path;
                },
                keepAlive: true,
                noAuth: true,
                isSameRoute: ppmUtils.isSameRoute,
                openType: 'detail',
                className: 'erd.cloud.ppm.issue.entity.Issue'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, next })
        }
    ];
});
