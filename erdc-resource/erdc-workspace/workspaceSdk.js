define([
    ELMP.func('erdc-workspace/index.js')
], function (init) {
    const ErdcStore = require('erdcloud.store');
    const ErdcRouter = require('erdcloud.router');

    function goWorkspaceAddPage(data, query, params, targetResourceCode) {
        init.initStore();
        ErdcStore.commit('Workspace/setForAddToWorkspace', Array.isArray(data) ? data : [data]);
        if (targetResourceCode) {
            ErdcRouter.push({
                path: 'workspace/addTo',
                params: params || ErdcRouter.currentRoute.params,
                query: query || ErdcRouter.currentRoute.query
            });
        } else if (ErdcRouter.currentRoute && ErdcRouter.currentRoute.matched.length >= 2) {
            let prefixRoute = ErdcRouter.currentRoute?.meta?.prefixRoute || '';
            let prePath = prefixRoute.split('/')?.slice(0, -1)?.join('/');
            ErdcRouter.push({
                path: `${prePath}/erdc-workspace/workspace/addTo`,
                query: query || ErdcRouter.currentRoute.query
            });
        }
    }
    return {
        goWorkspaceAddPage
    };
});
