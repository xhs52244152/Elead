define(['erdcloud.kit', ELMP.resource('ppm-utils/index.js'), ELMP.resource('project-budget/index.js')], function (
    ErdcloudKit,
    ppmUtils,
    templateInit
) {
    templateInit.init();
    let detailPath = 'budget';
    return [
        {
            path: detailPath,
            name: 'budgetInfo', // 该路由name有在views/list/index.js中判断使用，修改时需同步修改
            meta: {
                title: '项目预算',
                resourceCode: 'finance', // 此resourceCode需与“菜单配置”里面对应的“编码”值一致
                isSameRoute: ppmUtils.isSameRoute,
                keepAlive: false
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-budget/views/enter/index.js'))
        },
        {
            path: 'subjectBudgetEdit',
            name: 'subjectBudgetEdit',
            meta: {
                title: '科目预算信息',
                isSameRoute: (source, target) => {
                    let copySourceQuery = _.pick(source.query, 'pid');
                    let copyTargetQuery = _.pick(target.query, 'pid');
                    return (
                        source.path === target.path &&
                        _.isEqual(copySourceQuery, copyTargetQuery) &&
                        _.isEqual(source.params, target.params)
                    );
                },
                keepAlive: false
            },
            props: {
                type: 'edit'
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-budget/views/detail/index.js')),
            beforeEnter: (to, from, next) => ppmUtils.setResourceCode({ to, detailPath, next })
        }
    ];
});
