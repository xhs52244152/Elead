define([
    ELMP.func('erdc-baseline/index.js')
], function (init) {
    const ErdcStore = require('erdcloud.store');
    const ErdcRouter = require('erdcloud.router');

    /**
     * 添加至基线
     * @param data 添加至基线需要携带的数据
     * @param params 路由跳转的参数, 如果没有,默认就是当前路由携带的params
     * @param query 跳转路由的查询参数,如果没有,默认就是当前路由携带的query
     * @param targetResourceCode
     */
    function goBaselineAddPage(data, params, query, targetResourceCode) {
        init.initStore();
        ErdcStore.commit('CbbBaseline/setSelectedForAdd', Array.isArray(data) ? data : [data]);
        if (targetResourceCode) {
            ErdcRouter.push({
                name: targetResourceCode + '_' + 'baselineAdd',
                params: params || ErdcRouter.currentRoute.params,
                query: query || ErdcRouter.currentRoute.query
            });
        } else if (ErdcRouter.currentRoute && ErdcRouter.currentRoute.matched.length >= 2) {
            let prefixRoute = ErdcRouter.currentRoute?.meta?.prefixRoute || '';
            let prePath = prefixRoute.split('/')?.slice(0, -1)?.join('/');
            ErdcRouter.push({
                path: `${prePath}/erdc-baseline/baseline/add`,
                query: query || ErdcRouter.currentRoute.query
            });
        }
    }
    return {
        goBaselineAddPage
    };
});
