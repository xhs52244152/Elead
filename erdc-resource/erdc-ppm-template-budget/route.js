define([
    'erdcloud.kit',
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('erdc-ppm-template-budget/index.js')
], function (ErdcloudKit, ppmUtils, templateInit) {
    templateInit.init();
    return [
        {
            path: 'subject/list',
            name: 'budgetSubjectList',
            meta: {
                title: '科目池',
                resourceCode: 'budgetSubject'
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-ppm-template-budget/views/list/subject.js'))
        },
        {
            path: 'template/list',
            name: 'budgetTemplateList',
            meta: {
                title: '预算模板',
                resourceCode: 'budgetTemplate',
                keepAlive: false
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('erdc-ppm-template-budget/views/list/index.js'))
        },
        {
            path: 'template/create',
            name: 'budgetTemplateCreate',
            meta: {
                title: '创建预算模板',
                keepAlive: false
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, next, detailPath: 'template/list' });
            },
            component: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-ppm-template-budget/components/TemplateEdit/index.js')
            )
        },
        {
            path: 'template/edit',
            name: 'budgetTemplateEdit',
            meta: {
                title: '编辑预算模板',
                keepAlive: false
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, next, detailPath: 'template/list' });
            },
            component: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-ppm-template-budget/components/TemplateEdit/index.js')
            )
        },
        {
            path: 'template/detail',
            name: 'budgetTemplateDetail',
            meta: {
                title: '查看预算模板',
                keepAlive: false
            },
            beforeEnter(to, from, next) {
                // 设置高亮二级菜单
                ppmUtils.setResourceCode({ to, next, detailPath: 'template/list' });
            },
            component: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-ppm-template-budget/components/TemplateEdit/index.js')
            )
        }
    ];
});
