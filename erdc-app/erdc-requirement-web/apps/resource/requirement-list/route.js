define([
    'erdcloud.kit',
    ELMP.resource('requirement-list/index.js'),
    'erdcloud.store',
    ELMP.resource('ppm-utils/index.js')
], function (ErdcKit, requireInit, ErdcStore, ppmUtils) {
    return [
        // 需求池列表
        {
            path: 'require/list',
            name: 'requirementList',
            component: ErdcKit.asyncComponent(ELMP.resource('requirement-list/views/list/index.js')),
            meta: {
                noAuth: true,
                title: '需求',
                sceneName: 'requireLibrary',
                keepAlive: false
            }
        },
        // 我的需求
        {
            path: 'myRequire/list',
            name: 'myRequireList',
            meta: {
                sceneName: 'myRequirement',
                tableKey: 'workbenchRequirementView'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('requirement-list/views/list/index.js'))
        },
        // 项目需求
        {
            path: 'projectRequire/list',
            name: 'projectRequireList',
            meta: {
                actionName: 'PPM_PROJ_REQ_MENU_MODULE',
                keepAlive: false,
                sceneName: 'projectRequirement',
                tableKey: 'ProjAssignReqView',
                rowKey: 'relationOid',
                requestData: {
                    relationshipRef: ErdcStore.state?.space?.object?.oid
                },
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, '')
            },
            component: ErdcKit.asyncComponent(ELMP.resource('requirement-list/views/list/index.js'))
        },
        // 我的仪表盘
        {
            path: 'dashboard',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js')),
            name: 'requirementDashboard'
        },
        // 团队
        {
            path: 'team',
            name: 'requirementTeam',
            component: ErdcKit.asyncComponent(ELMP.resource('requirement-list/components/RequirementTeam/index.js'))
        },
        {
            path: 'require/create',
            name: `requireCreate`,
            meta: {
                title(route) {
                    return route.params.title || '创建需求';
                },
                noAuth: true,
                openType: 'create',
                keepAlive: true,
                currentRouterIdKey: 'oid',
                className: 'erd.cloud.ppm.require.entity.Requirement'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => requireInit.setResourceCode({ to, from, next })
        },
        {
            path: 'require/edit',
            name: `requireEdit`,
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route) {
                    return route.query.title || '编辑需求';
                },
                singleton: true,
                keepAlive: true,
                isSameRoute: ppmUtils.isSameRoute,
                noAuth: true,
                openType: 'edit',
                className: 'erd.cloud.ppm.require.entity.Requirement'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => requireInit.setResourceCode({ to, from, next })
        },
        {
            path: 'require/detail',
            name: `requireDetail`,
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route) {
                    return route.query.title || '查看需求';
                },
                isSameRoute: ppmUtils.isSameRoute,
                noAuth: true,
                openType: 'detail',
                keepAlive: true,
                className: 'erd.cloud.ppm.require.entity.Requirement'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => requireInit.setResourceCode({ to, from, next })
        }
    ];
});
