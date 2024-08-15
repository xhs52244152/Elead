define([
    ELMP.func('erdc-part/config/viewConfig.js'),
    ELMP.resource('common-page/InfoPage/index.js'),
    ELMP.func('erdc-part/index.js'),
    ELMP.resource('erdc-pdm-app/store/index.js')
], function (viewCfg, InfoPage, partInit, store) {
    const ErdcRouter = require('erdcloud.router');
    const ErdcKit = require('erdc-kit');
    partInit.init();

    function keepAliveRouteKey(route) {
        return `${route.path}/${route.query.oid}`;
    }

    function isSameRoute(source, target, pickArr) {
        if (!_.isArray(pickArr) || (_.isArray(pickArr) && !pickArr.length)) {
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
        let prePath = `${to.meta.prefixRoute}/part/list`;
        // 获取指定path对应的路由信息
        let preRoute = ErdcRouter.resolve(prePath)?.route || {};
        to.meta.resourceCode = preRoute.meta?.resourceCode;
        next();
    }

    return [
        {
            path: 'part/list',
            name: 'partList',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title(route, resource) {
                    return route.query?.title || resource?.name || '部件';
                },
                noAuth: true
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-part/views/list/index.js'))
        },
        {
            path: 'part/create',
            name: 'partCreate',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title(route, resource) {
                    return route.query?.title || resource?.name || '创建部件';
                },
                noAuth: true,
                openType: 'create',
                className: viewCfg.partViewTableMap.className,
                currentRouterIdKey: 'oid'
            },
            beforeEnter,
            component: { ...InfoPage, name: 'PartCreate' }
        },
        {
            path: 'part/edit',
            name: 'partEdit',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                title(route, resource) {
                    return route.query?.title || resource?.name || '编辑部件';
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'edit',
                className: viewCfg.partViewTableMap.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'PartEdit' }
        },
        {
            path: 'part/detail',
            name: 'partDetail',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                title(route, resource) {
                    return route.query?.title || resource?.name || '部件详情';
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'detail',
                className: viewCfg.partViewTableMap.className,
                showGoBack: false
            },
            beforeEnter,
            component: { ...InfoPage, name: 'PartDetail' }
        },
        //信息比较
        {
            path: 'part/infoCompare',
            name: 'partInfoCompare',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '信息比较';
                },
                noAuth: true,
                autoRedirect: false,
                openType: 'infoCompare',
                keepAlive: false
            },
            beforeEnter,
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/InfoCompare/index.js'))
        },
        // 结构比较
        {
            path: 'part/constructCompare',
            name: 'partConstructCompare',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '结构比较';
                },
                keepAliveRouteKey(route) {
                    return `${route.path}/${route.query.compareKey}`;
                },
                isSameRoute(source, target, pickArr) {
                    if (!_.isArray(pickArr) || (_.isArray(pickArr) && !pickArr.length)) {
                        pickArr = ['pid', 'oid', 'compareKey'];
                    }
                    // 如果除了query.activeName外的其它参数以及path都相同，则认为是同一个路由
                    let copySourceQuery = _.pick(source.query, ...pickArr);
                    let copyTargetQuery = _.pick(target.query, ...pickArr);
                    return (
                        source.path === target.path &&
                        _.isEqual(copySourceQuery, copyTargetQuery) &&
                        _.isEqual(source.params, target.params)
                    );
                },
                className: store.state.tableViewMaping.part.className
            },
            beforeEnter(to, from, next) {
                // 高亮列表菜单
                // 设置resourceCode
                let prePath = `${to.meta.prefixRoute}/part/list`;
                // 获取指定path对应的路由信息
                let preRoute = ErdcRouter.resolve(prePath)?.route || {};
                to.meta.resourceCode = preRoute.meta?.resourceCode;
                next();
            },
            component: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionCompare/index.js')
            )
        }
    ];
});
