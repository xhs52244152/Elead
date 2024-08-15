define([
    ELMP.func('erdc-change/config/viewConfig.js'),
    ELMP.resource('common-page/InfoPage/index.js'),
    ELMP.func('erdc-change/index.js')
], function (viewCfg, InfoPage, changeInit) {
    const ErdcKit = require('erdc-kit');
    const ErdcRouter = require('erdcloud.router');
    changeInit.init();

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
        let prePath = `${to.meta.prefixRoute}/change/list`;
        // 获取指定path对应的路由信息
        let preRoute = ErdcRouter.resolve(prePath)?.route || {};
        to.meta.resourceCode = preRoute.meta?.resourceCode;
        next();
    }

    return [
        {
            path: 'change/list',
            name: 'changeList',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title(route, resource) {
                    return route.query?.title || resource?.name || '变更列表';
                },
                noAuth: true
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-change/views/list/index.js'))
        },
        // 问题报告
        {
            path: 'change/prCreate',
            name: 'changePrCreate',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title(route, resource) {
                    return route.query?.title || resource?.name || '创建问题报告';
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'create',
                className: viewCfg.prChangeTableView.className,
                currentRouterIdKey: 'oid'
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangePrCreate' }
        },
        {
            path: 'change/prEdit',
            name: 'changePrEdit',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '编辑问题报告';
                },
                keepAliveRouteKey,
                isSameRoute,
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'edit',
                className: viewCfg.prChangeTableView.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangePrEdit' }
        },
        {
            path: 'change/prDetail',
            name: 'changePrDetail',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '问题报告详情';
                },
                keepAliveRouteKey,
                isSameRoute,
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'detail',
                className: viewCfg.prChangeTableView.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangePrDetail' }
        },
        // 变更请求
        {
            path: 'change/ecrCreate',
            name: 'changeEcrCreate',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '创建变更请求';
                },
                keepAliveRouteKey: function (route) {
                    return `${route.path}_${route.query.type}`;
                },
                isSameRoute(...args) {
                    const pickArr = ['pid', 'typeOid', 'oid', 'type'];
                    return isSameRoute(...args, pickArr);
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'create',
                className: viewCfg.ecrChangeTableView.className,
                currentRouterIdKey: 'oid'
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangeEcrCreate' }
        },
        {
            path: 'change/ecrEdit',
            name: 'changeEcrEdit',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '编辑变更请求';
                },
                keepAliveRouteKey,
                isSameRoute,
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'edit',
                className: viewCfg.ecrChangeTableView.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangeEcrEdit' }
        },
        {
            path: 'change/ecrDetail',
            name: 'changeEcrDetail',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '变更请求详情';
                },
                keepAliveRouteKey,
                isSameRoute,
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'detail',
                className: viewCfg.ecrChangeTableView.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangeEcrDetail' }
        },
        // 变更通告
        {
            path: 'change/ecnCreate',
            name: 'changeEcnCreate',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title(route, resource) {
                    return route.query?.title || resource?.name || '创建变更通告';
                },
                keepAliveRouteKey: function (route) {
                    return `${route.path}_${route.query.type}`;
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'create',
                className: viewCfg.ecnChangeTableView.className,
                currentRouterIdKey: 'oid'
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangeEcnCreate' }
        },
        {
            path: 'change/ecnEdit',
            name: 'changeEcnEdit',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '编辑变更通告';
                },
                keepAliveRouteKey,
                isSameRoute,
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'edit',
                className: viewCfg.ecnChangeTableView.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangeEcnEdit' }
        },
        {
            path: 'change/ecnDetail',
            name: 'changeEcnDetail',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '变更通告详情';
                },
                keepAliveRouteKey,
                isSameRoute,
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'detail',
                className: viewCfg.ecnChangeTableView.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangeEcnDetail' }
        },
        // 变更任务
        {
            path: 'change/ecaCreate',
            name: 'changeEcaCreate',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title(route, resource) {
                    return route.query?.title || resource?.name || '创建变更任务';
                },
                keepAliveRouteKey: function (route) {
                    return `${route.path}_${route.query.type}`;
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'create',
                className: viewCfg.ecaChangeTableView.className,
                currentRouterIdKey: 'oid'
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangeEcaCreate' }
        },
        {
            path: 'change/ecaEdit',
            name: 'changeEcaEdit',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '编辑变更任务';
                },
                keepAliveRouteKey,
                isSameRoute,
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'edit',
                className: viewCfg.ecaChangeTableView.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangeEcaEdit' }
        },
        {
            path: 'change/ecaDetail',
            name: 'changeEcaDetail',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '变更任务详情';
                },
                keepAliveRouteKey,
                isSameRoute,
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'detail',
                className: viewCfg.ecaChangeTableView.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ChangeEcaDetail' }
        }
    ];
});
