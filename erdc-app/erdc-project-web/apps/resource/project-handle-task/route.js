define(['erdcloud.kit', ELMP.resource('ppm-utils/index.js')], function (ErdcKit, ppmUtils) {
    let detailPath = 'handleTask/list';
    let projectDetailPath = 'supervisionTask/list';
    let className = 'erd.cloud.ppm.plan.entity.DiscreteTask';
    return [
        /** start 工作台 -> 项目数据 -> 我的督办 */
        {
            path: 'handleTask/list',
            name: 'handleTaskTable',
            meta: {
                keepAlive: false,
                resourceCode: 'handleTaskTable',
                title: '督办任务'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('project-handle-task/views/list/index.js'))
        },
        {
            path: 'handleTask/create',
            name: 'createHandleTask',
            meta: {
                noAuth: true,
                title: '创建督办任务',
                className: className,
                openType: 'create',
                keepAlive: false
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath, next })
        },
        {
            path: 'handleTask/edit',
            name: 'editHandleTask',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.handleTaskTitle || resource?.name || '编辑督办任务';
                },
                keepAlive: false,
                isSameRoute: ppmUtils.isSameRoute,
                className: className,
                openType: 'edit'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath, next })
        },
        {
            path: 'handleTask/detail',
            name: 'detailHandleTask',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.handleTaskTitle || resource?.name || '查看督办任务';
                },
                noAuth: true,
                isSameRoute: ppmUtils.isSameRoute,
                keepAlive: true,
                className: className,
                openType: 'detail'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath, next })
        },
        /** end 工作台 -> 项目数据 -> 我的督办 */

        /** start 项目管理 -> 单项目 -> 督办 */
        {
            path: 'supervisionTask/list',
            name: 'supervisionTaskList',
            meta: {
                keepAlive: false,
                resourceCode: 'supervisionTaskList',
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, ''),
                title: '督办任务'
            },
            props: {
                type: 'inProjectMenu'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('project-handle-task/views/list/index.js'))
        },
        {
            path: 'supervisionTask/create',
            name: 'createSupervisionTask',
            meta: {
                noAuth: true,
                title: '创建督办任务',
                isSameRoute: ppmUtils.isSameRoute,
                className: className,
                openType: 'create',
                keepAlive: false
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath: projectDetailPath, next })
        },
        {
            path: 'supervisionTask/edit',
            name: 'editSupervisionTask',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.handleTaskTitle || resource?.name || '编辑督办任务';
                },
                keepAlive: false,
                isSameRoute: ppmUtils.isSameRoute,
                className: className,
                openType: 'edit'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath: projectDetailPath, next })
        },
        {
            path: 'supervisionTask/detail',
            name: 'detailSupervisionTask',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.handleTaskTitle || resource?.name || '查看督办任务';
                },
                noAuth: true,
                isSameRoute: ppmUtils.isSameRoute,
                keepAlive: true,
                className: className,
                openType: 'detail'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath: projectDetailPath, next })
        }
        /** end 项目管理 -> 单项目 -> 督办 */
    ];
});
