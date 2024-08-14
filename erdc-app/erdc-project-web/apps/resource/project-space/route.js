define([
    'erdcloud.kit',
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-app/config/index.js'),
    ELMP.resource('common-page/InfoPage/index.js')
], function (ErdcloudKit, ppmUtils, register, InfoPage) {
    // 注册通用页面、全局事件
    register.init();

    return [
        {
            path: 'projectInfo',
            name: 'projectInfo',
            meta: {
                title(route) {
                    return route.query.title || '信息';
                },
                resourceCode: 'projectInfo',
                openType: 'detail',
                currentRouterIdKey: 'pid',
                isSameRoute: ppmUtils.isSameRoute,
                className: 'erd.cloud.ppm.project.entity.Project'
            },
            component: { ...InfoPage, name: 'projectInfo' }
        },
        {
            path: 'create',
            name: 'projectCreate',
            meta: {
                title: '创建项目',
                className: 'erd.cloud.ppm.project.entity.Project',
                openType: 'create',
                hideSubMenus: true,
                noAuth: true,
                currentRouterIdKey: 'oid'
            },
            component: { ...InfoPage, name: 'ProjectCreate' }
        },
        {
            path: 'edit',
            name: 'projectEdit',
            meta: {
                title: '编辑项目',
                isSameRoute: ppmUtils.isSameRoute,
                className: 'erd.cloud.ppm.project.entity.Project',
                openType: 'edit'
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'projectInfo', next });
            },
            component: { ...InfoPage, name: 'projectEdit' }
        },
        {
            path: 'projectCopy',
            name: 'projectCopy',
            meta: {
                title: '复制项目',
                isSameRoute: ppmUtils.isSameRoute
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'projectInfo', next });
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-space/views/project-info/copy-info/index.js'))
        },
        {
            path: 'saveTemplate',
            name: 'saveTemplate',
            meta: {
                title: '另存为模板',
                isSameRoute: ppmUtils.isSameRoute,
                className: 'erd.cloud.ppm.project.entity.Project'
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'projectInfo', next });
            },
            component: ErdcloudKit.asyncComponent(
                ELMP.resource('project-space/views/project-info/save-template/index.js')
            )
        },
        // 暂时放在项目下
        // 财务
        {
            path: 'finance',
            name: 'projectFinance',
            meta: {
                title: '财务'
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js'))
        },
        // 暂时放在项目下
        // 报表
        {
            path: 'report',
            name: 'projectReport',
            meta: {
                title: '报表'
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js'))
        },
        // 对象权限配置
        {
            path: 'object',
            name: 'projectObjectAccess',
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-product-components/views/access/object.js')),
            meta: {
                keepAlive: false,
                title(route, resource) {
                    return route.params.title || resource?.name || '对象权限配置';
                }
            }
        }
    ];
});
