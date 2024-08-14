define([
    'erdcloud.kit',
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('common-page/InfoPage/index.js'),
    ELMP.resource('ppm-app/config/index.js')
], function (ErdcKit, ppmUtils, InfoPage, register) {
    // 注册通用页面、全局事件
    register.init();
    return [
        {
            path: 'list',
            name: 'planList',
            meta: {
                resourceCode: 'planList',
                keepAlive: false,
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, ''),
                singleton: true
            },
            component: ErdcKit.asyncComponent(ELMP.resource('project-plan/index.js'))
        },
        {
            path: 'planCreate',
            name: 'planCreate',
            meta: {
                keepAliveRouteKey: function (to) {
                    return to.query.collectId;
                },
                title(route) {
                    return route.query.createPlanTitle || '创建任务';
                },
                className: 'erd.cloud.ppm.plan.entity.Task',
                openType: 'create',
                keepAlive: true,
                noAuth: true,
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, ''),
                sceneName: 'plan',
                hideSubMenus: true,
                currentRouterIdKey: 'oid'
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'list', next });
            },
            // component: ErdcKit.asyncComponent(ELMP.resource('project-plan/create-plan/index.js'))
            // component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
            component: { ...InfoPage, name: 'planCreate' }
        },
        {
            path: 'planEdit',
            name: 'planEdit',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.planTitle || resource?.name || route.path;
                },
                currentRouterIdKey: 'planOid',
                className: 'erd.cloud.ppm.plan.entity.Task',
                openType: 'edit',
                keepAlive: true,
                noAuth: true,
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, 'planOid'),
                sceneName: 'plan'
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'list', next });
            },
            // component: ErdcKit.asyncComponent(ELMP.resource('project-plan/edit-plan/index.js'))
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
        },
        {
            path: 'planDetail',
            name: 'planDetail',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.planTitle || resource?.name || route.path;
                },
                currentRouterIdKey: 'planOid',
                className: 'erd.cloud.ppm.plan.entity.Task',
                openType: 'detail',
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, 'planOid'),
                keepAlive: false,
                noAuth: true
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'list', next });
            },
            // component: ErdcKit.asyncComponent(ELMP.resource('project-plan/edit-plan/index.js'))
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
        },
        {
            path: 'phasePlanCreate',
            name: 'phasePlanCreate',
            meta: {
                title(route) {
                    return route.query.createPlanTitle || '创建阶段任务';
                },
                className: 'erd.cloud.ppm.plan.entity.Task',
                openType: 'create',
                keepAlive: true,
                noAuth: true,
                sceneName: 'plan',
                hideSubMenus: true
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'list', next });
            },
            component: { ...InfoPage, name: 'phasePlanCreate' }
        }
    ];
});
