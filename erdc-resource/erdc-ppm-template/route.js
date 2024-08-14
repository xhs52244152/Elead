define(['erdcloud.kit', ELMP.resource('ppm-utils/index.js'), ELMP.resource('erdc-ppm-template/index.js')], function (
    ErdcloudKit,
    ppmUtils,
    templateInit
) {
    templateInit.init();
    return [
        {
            path: 'template/list',
            name: 'projectTemplate',
            meta: {
                title: '项目模板',
                keepAlive: true,
                hideSubMenus: true,
                noAuth: true
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-ppm-template/views/list/index.js'))
        },
        {
            path: 'template/create',
            name: 'projectTemplateCreate',
            meta: {
                title: '创建模板'
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'projectInfo', next });
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-ppm-template/component/create/index.js'))
        },
        // 编辑模板
        {
            path: 'template/edit',
            name: 'projectTemplateEdit',
            meta: {
                title(route, resource) {
                    return route.query.templateTitle || resource?.name || route.path;
                }
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, detailPath: 'projectInfo', next });
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-ppm-template/component/edit/index.js'))
        }
    ];
});
