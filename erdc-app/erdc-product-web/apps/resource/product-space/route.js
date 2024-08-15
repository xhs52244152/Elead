define([
    ELMP.resource('common-page/InfoPage/index.js'),
    ELMP.resource('erdc-pdm-components/CommonPage/index.js')
], function (InfoPage, CommonPage) {
    const ErdcKit = require('erdc-kit');
    const ErdcRouter = require('erdcloud.router');
    const ErdcStore = require('erdcloud.store');
    const getObjectMapping = ErdcStore.getters?.['pdmProductStore/getObjectMapping'];
    const productMapping = getObjectMapping({ objectName: 'product' });

    function keepAliveRouteKey(route) {
        return `${route.path}/${route.query.pid}`;
    }

    function isSameRoute(source, target, pickArr) {
        if (!_.isArray(pickArr) || _.isArray(pickArr) && !pickArr.length) {
            pickArr = ['pid'];
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
        // 复制页面，高亮“信息”二级菜单
        // 设置resourceCode
        let detailPath = `${to.meta.prefixRoute}/detail`;
        // 获取指定path对应的路由信息
        let detailRoute = ErdcRouter.resolve(detailPath)?.route || {};
        to.meta.resourceCode = detailRoute.meta?.resourceCode;
        next();
    }

    return [
        // 信息
        {
            path: 'detail',
            name: 'productDetail',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                className: productMapping?.className || '',
                noAuth: true,
                openType: 'detail'
            },
            component: { ...InfoPage, name: 'ProductDetail' }
        },
        // 创建
        {
            path: 'create',
            name: 'productCreate',
            meta: {
                isSameRoute,
                className: productMapping?.className || '',
                noAuth: true,
                openType: 'create',
                title(route, resource) {
                    return route?.query?.title || resource?.name || route?.path || '';
                }
            },
            component: { ...InfoPage, name: 'ProductCreate' }
        },
        // 编辑
        {
            path: 'edit',
            name: 'productEdit',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                className: productMapping?.className || '',
                noAuth: true,
                openType: 'edit',
                title(route, resource) {
                    return route?.query?.title || resource?.name || route?.path || '';
                }
            },
            beforeEnter,
            component: { ...InfoPage, name: 'ProductEdit' }
        },
        // 复制
        {
            path: 'copy',
            name: 'productCopy',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                className: productMapping?.className || '',
                noAuth: true,
                openType: 'copy',
                title(route, resource) {
                    return route?.query?.title || resource?.name || route?.path || '';
                }
            },
            beforeEnter,
            component: { ...CommonPage, name: 'ProductCopy' }
        },
        // 另存为
        {
            path: 'saveas',
            name: 'productSaveas',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                className: productMapping?.className || '',
                noAuth: true,
                openType: 'saveas',
                title(route, resource) {
                    return route?.query?.title || resource?.name || route?.path || '';
                }
            },
            beforeEnter,
            component: { ...CommonPage, name: 'ProductSaveas' }
        },
        // 文件夹
        {
            path: 'folder',
            name: 'productFolder',
            meta: {
                // title(route, resource) {
                //     return route?.query?.title || resource?.name || route?.path || '';
                // },
                noAuth: true,
                className: productMapping?.className || ''
            },
            component: ErdcKit.asyncComponent(ELMP.resource('product-space/views/folder/index.js'))
        },
        // 团队
        {
            path: 'team',
            name: 'productTeam',
            meta: {
                // title(route, resource) {
                //     return route?.query?.title || resource?.name || route?.path || '';
                // },
                noAuth: true,
                className: productMapping?.className || ''
            },
            component: ErdcKit.asyncComponent(ELMP.resource('product-space/views/team/index.js'))
        },
        // 产品权限管理
        {
            path: 'access/object',
            name: 'productAccessObject',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/views/access/object.js')),
            meta: {
                // title(route, resource) {
                //     return route.params.title || resource?.name || route.path;
                // }
            }
        },
        {
            path: 'access/attribute',
            name: 'productAccessAttribute',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/views/access/attribute.js')),
            meta: {
                // title(route, resource) {
                //     return route.params.title || resource?.name || route.path;
                // }
            }
        },
        {
            path: 'access/functional',
            name: 'productAccessFunctional',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/views/access/functional.js')),
            meta: {
                title(route, resource) {
                    return route.params.title || resource?.name || route.path;
                }
            }
        }
    ];
});
