define(['erdcloud.kit'], function (ErdcloudKit) {
    return [
        {
            path: 'workflowLauncher/:engineModelKey',
            name: 'workflowLauncher',
            component: ErdcloudKit.asyncComponent(ELMP.func('bpm-resource/bpm-launcher/index.js')),
            meta: {
                noAuth: true,
                title(to) {
                    return ['发起流程', to.query?.title].filter((i) => i).join('-');
                },
                isSameRoute: function (source, target) {
                    if (source.query.routeKey && target.query.routeKey) {
                        return source.query.routeKey === target.query.routeKey;
                    }
                    return (
                        source.path === target.path &&
                        _.isEqual(source.query, target.query) &&
                        _.isEqual(source.params, target.params)
                    );
                },
                keepAliveRouteKey: function (to) {
                    return to.query.routeKey || `${to.path}_${to.query.containerRef}_${to.query.holderRef}`;
                },
                keepAlive: true
            }
        },
        // 草稿详情
        {
            path: 'workflowDraft/:pboOid',
            name: 'workflowDraft',
            component: ErdcloudKit.asyncComponent(ELMP.func('bpm-resource/bpm-launcher/index.js')),
            meta: {
                noAuth: true,
                title(to) {
                    return ['发起流程', to.query?.title].filter((i) => i).join('-');
                },
                hideSubMenus: true,
                keepAlive: true,
                singleton: true,
                parentRouteCode: 'container'
            }
        },
        // 流程审批
        {
            path: 'workflowActivator/:processInstanceOId',
            name: 'workflowActivator',
            component: ErdcloudKit.asyncComponent(ELMP.func('bpm-resource/bpm-activator/index.js')),
            meta: {
                title: '任务处理/查看',
                noAuth: true,
                hideSubMenus: true,
                keepAlive: true,
                singleton: true,
                parentRouteCode: 'container',
                isSameRoute: function (source, target) {
                    return (
                        source.path === target.path &&
                        _.isEqual(source.query, target.query) &&
                        _.isEqual(source.params, target.params)
                    );
                },
                keepAliveRouteKey: function (to) {
                    return `${to.path}_${to.query.taskOId}`;
                }
            }
        }
    ];
});
