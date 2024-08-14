define(['erdcloud.kit', ELMP.resource('ppm-utils/index.js')], function (ErdcKit, ppmUtils) {
    const detailPath = 'baseline/list';
    return [
        {
            path: detailPath,
            name: 'projectBaselineList',
            meta: {
                nameInner: 'baselineList',
                title(route) {
                    return '基线列表' || route.path;
                },
                resourceCode: 'projectBaselineList'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('project-baseline/baseline-list/index.js'))
        },
        {
            path: 'baseline/detail',
            name: 'projectBaselineDetail',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                nameInner: 'baselineDetail',
                title(route) {
                    if (route.query.title) {
                        return `${route.query.title}-详情`;
                    } else {
                        return '基线详情' || route.path;
                    }
                },
                openType: 'detail',
                className: 'erd.cloud.cbb.baseline.entity.Baseline',
                singleton: true
            },
            component: ErdcKit.asyncComponent(ELMP.resource('project-baseline/baseline-detail/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath, next })
        },
        {
            path: 'baseline/create',
            name: 'projectBaselineCreate',
            meta: {
                nameInner: 'baselineCreate',
                title(route, resource) {
                    return route.params.title || '创建基线' || resource?.name || route.path;
                },
                keepAlive: true,
                noAuth: true,
                openType: 'create',
                className: 'erd.cloud.cbb.baseline.entity.Baseline'
            },
            // component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
            component: ErdcKit.asyncComponent(ELMP.resource('project-baseline/baseline-create/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath, next })
        },
        {
            path: 'baseline/update',
            name: 'projectBaselineUpdate',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                nameInner: 'baselineUpdate',
                title(route) {
                    return '编辑基线' || route.path;
                },
                singleton: true
            },
            component: ErdcKit.asyncComponent(ELMP.resource('project-baseline/baseline-create/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath, next })
        },
        // 基线信息比较
        {
            path: 'baseline/infoCompare',
            name: 'projectBaselineInfoCompare',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                nameInner: 'baselineInfoCompare',
                title(route, resource) {
                    return route.query.title || '基线对比' || resource?.name || route.path;
                },
                noAuth: true,
                parentPath: 'baseline',
                openType: 'infoCompare'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('project-baseline/components/InfoCompare/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath, next })
        }
    ];
});
