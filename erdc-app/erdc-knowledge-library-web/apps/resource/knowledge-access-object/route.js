define(['erdcloud.kit'], function (ErdcKit) {
    return [
        // 知识库列表
        {
            path: 'knowledge/accessObject',
            name: 'knowledgeAccessObject',
            component: ErdcKit.asyncComponent(ELMP.resource('knowledge-access-object/views/list/index.js')),
            meta: {
                noAuth: true,
                sceneName: 'knowledgeAccessObject',
                keepAlive: false
            }
        }
    ];
});
