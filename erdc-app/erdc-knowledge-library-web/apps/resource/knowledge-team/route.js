define(['erdcloud.kit'], function (ErdcKit) {
    return [
        // 知识库列表
        {
            path: 'knowledge/team',
            name: 'knowledgeTeam',
            component: ErdcKit.asyncComponent(ELMP.resource('knowledge-team/views/list/index.js')),
            meta: {
                noAuth: true,
                title: '团队列表',
                sceneName: 'knowledgeTeam',
                keepAlive: false
            }
        }
    ];
});
