define(['erdcloud.kit'], function (ErdcloudKit) {
    return [
        // 模板管理
        {
            path: 'template/objectTemplate',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-template/index.js')),
            name: 'objectTemplateManagement',
            meta: {
                resourceCode: 'objectTemplateManagement'
            }
        },
        // 团队模板管理
        {
            path: 'template/teamTemplate',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-template/team-template/index.js')),
            name: 'teamTemplateManagement',
            meta: {
                resourceCode: 'teamTemplateManagement'
            }
        }
    ];
});
