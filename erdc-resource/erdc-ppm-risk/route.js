define(['erdcloud.kit', ELMP.resource('common-page/InfoPage/index.js'), ELMP.resource('ppm-utils/index.js')], function (
    ErdcKit,
    InfoPage,
    ppmUtils
) {
    return [
        // 项目风险
        {
            path: '',
            name: 'projectRiskList',
            meta: {
                isSameRoute: (source, target) => ppmUtils.isSameRoute(source, target, ''),
                resourceCode: 'projectRiskList',
                noAuth: true,
                singleton: true,
                keepAlive: false
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-risk/views/list/index.js'))
        },
        {
            path: 'risk/list',
            name: 'myRisk',
            meta: {
                resourceCode: 'riskLibraryList',
                keepAlive: false
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-risk/views/list/index.js'))
        },
        {
            path: 'create',
            name: 'riskCreate',
            meta: {
                title() {
                    return '创建风险';
                },
                openType: 'create',
                currentRouterIdKey: 'oid',
                className: 'erd.cloud.ppm.risk.entity.Risk'
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, next });
            },
            component: { ...InfoPage, name: 'riskCreate' }
        },
        {
            path: 'edit',
            name: 'riskEdit',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.title || '编辑风险' || resource?.name || route.path;
                },
                isSameRoute: ppmUtils.isSameRoute,
                singleton: true,
                keepAlive: true,
                openType: 'edit',
                className: 'erd.cloud.ppm.risk.entity.Risk',

                currentRouterIdKey: 'oid' // 当前路由表单的key,通用表达根据会根据此key去查询详情信息
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, next });
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
        },
        {
            path: 'detail',
            name: 'riskDetail',
            meta: {
                keepAliveRouteKey: ppmUtils.keepAliveRouteKey,
                title(route, resource) {
                    return route.query.title || '查看风险' || resource?.name || route.path;
                },
                isSameRoute: ppmUtils.isSameRoute,
                keepAlive: false,
                openType: 'detail',
                className: 'erd.cloud.ppm.risk.entity.Risk'
            },
            beforeEnter(to, from, next) {
                // 编辑页面，高亮“信息”二级菜单
                // 设置resourceCode
                // let detailPath = `${to.meta.prefixRoute}`;
                // 获取指定path对应的路由信息
                ppmUtils.setResourceCode({ to, next });
                // let detailRoute = ErdcRouter.resolve(detailPath)?.route || {};
                // to.meta.resourceCode = detailRoute.meta?.resourceCode;
                // next();
            },
            component: ErdcKit.asyncComponent(ELMP.resource('common-page/InfoPage/index.js'))
        },
        // 我的风险列表
        {
            path: 'myRisk/list',
            name: 'myRiskList',
            component: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-risk/views/list/index.js'))
        }
    ];
});
