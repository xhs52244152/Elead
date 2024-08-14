define(['erdcloud.kit', ELMP.resource('ppm-utils/index.js'), ELMP.resource('project-task/index.js')], function (
    ErdcKit,
    ppmUtils,
    taskInit
) {
    taskInit.init();
    return [
        {
            path: 'task/list',
            name: 'taskList',
            meta: {
                title(route, resource) {
                    return route.params.title || resource?.name || '任务';
                },
                resourceCode: 'taskList',
                keepAlive: false,
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, '')
            },
            component: ErdcKit.asyncComponent(ELMP.resource('project-task/views/list/index.js'))
        },
        {
            path: 'taskCreate',
            name: 'taskCreate',
            meta: {
                title: '创建任务',
                className: 'erd.cloud.ppm.plan.entity.Task',
                openType: 'create',
                hideSubMenus: true,
                currentRouterIdKey: 'oid'
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'taskList', next });
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
            // component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
        },
        {
            path: 'taskEdit',
            name: 'taskEdit',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.planTitle || resource?.name || route.path;
                },
                currentRouterIdKey: 'planOid',
                className: 'erd.cloud.ppm.plan.entity.Task',
                openType: 'edit',
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, 'planOid'),
                sceneName: 'task'
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'task/list', next });
            },
            // component: ErdcKit.asyncComponent(ELMP.resource('project-plan/edit-plan/index.js'))
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
        },
        {
            path: 'taskDetail',
            name: 'taskDetail',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.planTitle || resource?.name || route.path;
                },
                currentRouterIdKey: 'planOid',
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, 'planOid'),
                className: 'erd.cloud.ppm.plan.entity.Task',
                openType: 'detail'
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'task/list', next });
            },
            // component: ErdcKit.asyncComponent(ELMP.resource('project-plan/edit-plan/index.js'))
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
        },
        {
            path: 'myTask/list',
            name: 'myTaskList',
            component: ErdcKit.asyncComponent(ELMP.resource('project-task/views/list/index.js'))
        }
    ];
});
