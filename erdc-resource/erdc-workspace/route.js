define([
    ELMP.func('erdc-workspace/config/viewConfig.js'),
    ELMP.resource('common-page/InfoPage/index.js'),
    ELMP.func('erdc-workspace/index.js'),
], function (viewCfg, InfoPage, workspaceInit) {
    const ErdcKit = require('erdc-kit');
    const ErdcRouter = require('erdcloud.router');
    workspaceInit.init();

    function keepAliveRouteKey(route) {
        return `${route.path}/${route.query.oid}`;
    }

    function isSameRoute(source, target, pickArr) {
        if (!_.isArray(pickArr) || _.isArray(pickArr) && !pickArr.length) {
            pickArr = ['pid', 'oid'];
        }
        // 如果除了query.activeName外的其它参数以及path都相同，则认为是同一个路由
        let copySourceQuery = _.pick(source.query, ...pickArr);
        let copyTargetQuery = _.pick(target.query, ...pickArr);
        return (
            source.path === target.path &&
            _.isEqual(copySourceQuery, copyTargetQuery) &&
            _.isEqual(source.params, target.params)
        );
    }

    function beforeEnter(to, from, next) {
        // 高亮列表菜单
        // 设置resourceCode
        let prePath = `${to.meta.prefixRoute}/workspace/list`;
        // 获取指定path对应的路由信息
        let preRoute = ErdcRouter.resolve(prePath)?.route || {};
        to.meta.resourceCode = preRoute.meta?.resourceCode;
        next();
    }

    return [
        {
            path: 'workspace/list',
            name: 'workspaceList',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title(route, resource) {
                    return route.query?.title || resource?.name || '工作区';
                },
                noAuth: true
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-workspace/views/list/index.js'))
        },
        {
            path: 'workspace/edit',
            name: 'workspaceEdit',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                title(route, resource) {
                    return route.query?.title || resource?.name || '编辑工作区';
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'edit',
                className: viewCfg.workspaceViewTableMap.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'WorkspaceEdit' }
        },
        {
            path: 'workspace/detail',
            name: 'workspaceDetail',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                title(route, resource) {
                    return route.query?.title || resource?.name || '工作区详情';
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                currentRouterIdKey: 'oid',
                openType: 'detail',
                className: viewCfg.workspaceViewTableMap.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'WorkspaceDetail' }
        },
        // 添加至工作区
        {
            path: 'workspace/addTo',
            name: 'workspaceAddTo',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '添加至工作区';
                },
                noAuth: true
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-workspace/views/add/index.js')),
            beforeEnter
        }
    ];
});
