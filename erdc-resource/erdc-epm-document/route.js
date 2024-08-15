define([
    ELMP.func('erdc-epm-document/config/viewConfig.js'),
    ELMP.resource('common-page/InfoPage/index.js'),
    ELMP.func('erdc-epm-document/index.js'),
    ELMP.resource('erdc-pdm-app/store/index.js')
], function (viewCfg, InfoPage, epmDocumentInit, store) {
    const ErdcKit = require('erdc-kit');
    const ErdcRouter = require('erdcloud.router');
    epmDocumentInit.init();

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
        // 详情页面，高亮列表菜单
        // 设置resourceCode
        let prePath = `${to.meta.prefixRoute}/epmDocument/list`;
        // 获取指定path对应的路由信息
        let preRoute = ErdcRouter.resolve(prePath)?.route || {};
        to.meta.resourceCode = preRoute.meta?.resourceCode;
        next();
    }

    return [
        {
            path: 'epmDocument/list',
            name: 'epmDocumentList',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title(route, resource) {
                    return route.query?.title || resource?.name || '模型';
                },
                noAuth: true
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-epm-document/views/list/index.js'))
        },
        {
            path: 'epmDocument/create',
            name: 'epmDocumentCreate',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title(route, resource) {
                    return route.query?.title || resource?.name || '创建模型';
                },
                noAuth: true,
                openType: 'create',
                className: viewCfg.epmDocumentViewTableMap.className,
                currentRouterIdKey: 'oid'
            },
            beforeEnter,
            component: { ...InfoPage, name: 'CreateEpmDocument' }
        },
        {
            path: 'epmDocument/edit',
            name: 'epmDocumentEdit',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                title(route, resource) {
                    return route.query?.title || resource?.name || '编辑模型';
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'edit',
                className: viewCfg.epmDocumentViewTableMap.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'EpmDocumentEdit' }
        },
        {
            path: 'epmDocument/detail',
            name: 'epmDocumentDetail',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                title(route, resource) {
                    return route.query?.title || resource?.name || '模型详情';
                },
                noAuth: true,
                keepAlive: true,
                singleton: true,
                openType: 'detail',
                className: viewCfg.epmDocumentViewTableMap.className
            },
            beforeEnter,
            component: { ...InfoPage, name: 'EpmDocumentDetail' }
        },
        //信息比较
        {
            path: 'epmDocument/infoCompare',
            name: 'epmDocumentInfoCompare',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '信息比较';
                },
                noAuth: true,
                autoRedirect: false,
                openType: 'infoCompare',
                keepAlive: false
            },
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/InfoCompare/index.js'))
        },
        // 结构比较
        {
            path: 'epmDocument/constructCompare',
            name: 'epmConstructCompare',
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
                className: store.state.tableViewMaping.epmDocument.className
            },
            beforeEnter,
            component: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionCompare/index.js')
            )
        }
    ];
});
