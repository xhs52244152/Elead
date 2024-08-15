define([
    ELMP.resource('common-page/InfoPage/index.js'),
    ELMP.func('erdc-document/index.js'),
    ELMP.resource('erdc-pdm-app/store/index.js')
], function (InfoPage, documentInit, store) {
    const ErdcRouter = require('erdcloud.router');
    const ErdcKit = require('erdc-kit');
    const documentClassName = 'erd.cloud.cbb.doc.entity.EtDocument';
    documentInit.init();

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
        let prePath = `${to.meta.prefixRoute}/document/list`;
        // 获取指定path对应的路由信息
        let preRoute = ErdcRouter.resolve(prePath)?.route || {};
        to.meta.resourceCode = preRoute.meta?.resourceCode;
        next();
    }

    return [
        {
            path: 'document/list',
            name: 'documentList',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title: '文档列表',
                noAuth: true
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-document/views/list/index.js'))
        },
        // 创建文档
        {
            path: 'document/create',
            name: 'documentCreate',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                title: '创建文档',
                className: documentClassName,
                openType: 'create',
                currentRouterIdKey: 'oid',
                noAuth: true
            },
            beforeEnter,
            component: { ...InfoPage, name: 'DocumentCreate' }
        },
        // 编辑文档
        {
            path: 'document/edit',
            name: 'documentEdit',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                title: '编辑文档',
                className: documentClassName,
                openType: 'edit',
                keepAlive: true,
                singleton: true,
                noAuth: true
            },
            beforeEnter,
            component: { ...InfoPage, name: 'DocumentEdit' }
        },
        // 查看详情
        {
            path: 'document/detail',
            name: 'documentDetail',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                title: '查看文档',
                className: documentClassName,
                openType: 'detail',
                keepAlive: true,
                singleton: true,
                noAuth: true
            },
            beforeEnter,
            component: { ...InfoPage, name: 'DocumentDetail' }
        },
        //信息比较
        {
            path: 'document/infoCompare',
            name: 'documentInfoCompare',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '信息比较';
                },
                noAuth: true,
                openType: 'infoCompare',
                keepAlive: false
            },
            beforeEnter,
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/InfoCompare/index.js'))
        },
        // 结构比较
        {
            path: 'document/constructCompare',
            name: 'documentConstructCompare',
            meta: {
                title(route, resource) {
                    return route.query?.title || resource?.name || '结构比较';
                },
                keepAliveRouteKey(route) {
                    return `${route.path}/${route.query.compareKey}`;
                },
                isSameRoute(source, target, pickArr) {
                    if (!_.isArray(pickArr) || _.isArray(pickArr) && !pickArr.length) {
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
                className: store.state.tableViewMaping.document.className
            },
            beforeEnter,
            component: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionCompare/index.js')
            )
        }
    ];
});
