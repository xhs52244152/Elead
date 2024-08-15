define([
    ELMP.func('erdc-baseline/index.js'),
    ELMP.func('erdc-baseline/views/create/index.js')
], function (baselineInit, Create) {
    const ErdcKit = require('erdc-kit');
    const ErdcRouter = require('erdcloud.router');
    baselineInit.init();

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
        let prePath = `${to.meta.prefixRoute}/baseline/list`;
        // 获取指定path对应的路由信息
        let preRoute = ErdcRouter.resolve(prePath)?.route || {};
        to.meta.resourceCode = preRoute.meta?.resourceCode;
        next();
    }

    return [
        {
            path: 'baseline/list',
            name: 'baselineList',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                nameInner: 'baselineList',
                title(route) {
                    if (route?.query?.title) {
                        return `产品-${route?.query?.title}-基线`;
                    } else {
                        return '基线列表' || route.path;
                    }
                }
            },
            component: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/views/list/index.js'))
        },
        // 创建基线
        {
            path: 'baseline/create',
            name: 'baselineCreate',
            meta: {
                isSameRoute(...args) {
                    const pickArr = ['pid'];
                    return isSameRoute(...args, pickArr);
                },
                nameInner: 'baselineCreate',
                title(route) {
                    if (route?.query?.title) {
                        return `产品-${route?.query?.title}-创建基线`;
                    } else {
                        return '创建基线' || route.path;
                    }
                }
            },
            beforeEnter,
            component: { ...Create, name: 'BaselineCreate' }
        },
        // 添加至基线
        {
            path: 'baseline/add',
            name: 'baselineAdd',
            meta: {
                nameInner: 'baselineAdd',
                title() {
                    return '添加至基线';
                }
            },
            beforeEnter,
            component: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/views/add/index.js'))
        },
        // 编辑基线
        {
            path: 'baseline/edit',
            name: 'baselineEdit',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                nameInner: 'baselineEdit',
                title(route) {
                    if (route?.query?.title) {
                        return `产品-${route?.query?.title}-更新基线`;
                    } else {
                        return '编辑基线' || route.path;
                    }
                },
                keepAlive: true,
                singleton: true
            },
            beforeEnter,
            component: { ...Create, name: 'BaselineEdit' }
        },
        {
            path: 'baseline/detail',
            name: 'baselineDetail',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
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
                keepAlive: true,
                singleton: true
            },
            beforeEnter,
            component: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/views/detail/index.js'))
        },
        {
            path: 'baseline/merge',
            name: 'baselineMerge',
            meta: {
                nameInner: 'baselineMerge',
                title(route) {
                    if (route.query.title) {
                        return `${route.query.title}-基线合并`;
                    } else {
                        return '基线合并' || route.path;
                    }
                }
            },
            beforeEnter,
            component: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/views/merge/index.js'))
        },
        //信息比较
        {
            path: 'baseline/infoCompare',
            name: 'baselineInfoCompare',
            meta: {
                nameInner: 'baselineInfoCompare',
                title(route, resource) {
                    return route.query.title || '信息比较' || resource?.name || route.path;
                },
                noAuth: true,
                autoRedirect: false,
                parentPath: 'baseline',
                openType: 'infoCompare',
                keepAlive: false
            },
            beforeEnter,
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/InfoCompare/index.js'))
        }
    ];
});
