define([
    ELMP.resource('common-page/InfoPage/index.js'),
    ELMP.resource('erdc-pdm-components/CommonPage/index.js')
], function (InfoPage, CommonPage) {
    const ErdcKit = require('erdc-kit');
    const ErdcRouter = require('erdcloud.router');
    const ErdcStore = require('erdcloud.store');
    const getObjectMapping = ErdcStore.getters?.['pdmLibraryStore/getObjectMapping'];
    const libraryMapping = getObjectMapping({ objectName: 'library' });

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
            name: 'libraryDetail',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                className: libraryMapping?.className || '',
                noAuth: true,
                openType: 'detail'
            },
            component: { ...InfoPage, name: 'LibraryDetail' }
        },
        // 创建
        {
            path: 'create',
            name: 'libraryCreate',
            meta: {
                isSameRoute,
                className: libraryMapping?.className || '',
                noAuth: true,
                openType: 'create',
                title(route, resource) {
                    return route?.query?.title || resource?.name || route?.path || '';
                }
            },
            component: { ...InfoPage, name: 'LibraryCreate' }
        },
        // 编辑
        {
            path: 'edit',
            name: 'libraryEdit',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                className: libraryMapping?.className || '',
                noAuth: true,
                openType: 'edit',
                title(route, resource) {
                    return route?.query?.title || resource?.name || route?.path || '';
                }
            },
            beforeEnter,
            component: { ...InfoPage, name: 'LibraryEdit' }
        },
        // 复制
        {
            path: 'copy',
            name: 'libraryCopy',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                className: libraryMapping?.className || '',
                noAuth: true,
                openType: 'copy',
                title(route, resource) {
                    return route?.query?.title || resource?.name || route?.path || '';
                }
            },
            beforeEnter,
            component: { ...CommonPage, name: 'LibraryCopy' }
        },
        // 另存为
        {
            path: 'saveas',
            name: 'librarySaveas',
            meta: {
                keepAliveRouteKey,
                isSameRoute,
                className: ErdcRouter?.currentRoute?.query?.className || libraryMapping?.className || '',
                noAuth: true,
                openType: 'saveas',
                title(route, resource) {
                    return route?.query?.title || resource?.name || route?.path || '';
                }
            },
            beforeEnter,
            component: { ...CommonPage, name: 'LibrarySaveas' }
        },
        // 文件夹
        {
            path: 'folder',
            name: 'libraryFolder',
            meta: {
                // title(route, resource) {
                //     return route?.params?.title || route?.query?.title || resource?.name || route?.path || '';
                // },
                noAuth: true,
                className: libraryMapping?.className || ''
            },
            component: ErdcKit.asyncComponent(ELMP.resource('library-space/views/folder/index.js'))
        },
        // 团队
        {
            path: 'team',
            name: 'libraryTeam',
            meta: {
                // title(route, resource) {
                //     return route?.params?.title || route?.query?.title || resource?.name || route?.path || '';
                // },
                noAuth: true,
                className: libraryMapping?.className || ''
            },
            component: ErdcKit.asyncComponent(ELMP.resource('library-space/views/team/index.js'))
        },
        // 资源库权限管理
        {
            path: 'access/object',
            name: 'libraryAccessObject',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/views/access/object.js')),
            meta: {
                // title(route, resource) {
                //     return route.params.title || resource?.name || route.path;
                // }
            }
        },
        {
            path: 'access/attribute',
            name: 'libraryAccessAttribute',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/views/access/attribute.js')),
            meta: {
                // title(route, resource) {
                //     return route.params.title || resource?.name || route.path;
                // }
            }
        },
        {
            path: 'access/functional',
            name: 'libraryAccessFunctional',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/views/access/functional.js')),
            meta: {
                // title(route, resource) {
                //     return route.params.title || resource?.name || route.path;
                // }
            }
        }
    ];
});
