define([ELMP.func('erdc-change/config/viewConfig.js'), ELMP.func('erdc-change/utils.js')], function (
    { prChangeTableView, ecrChangeTableView, ecnChangeTableView, ecaChangeTableView, documentTableView },
    { IStorage }
) {
    const NEED_KEYS = ['className', 'tableKey', 'actionName', 'operateName', 'rowActionName'],
        classNameMapFilter = (obj) => _.pick(obj, NEED_KEYS);
    let classNameMapping = {
        PR: classNameMapFilter(prChangeTableView),
        ECR: classNameMapFilter(ecrChangeTableView),
        ECN: classNameMapFilter(ecnChangeTableView),
        ECA: classNameMapFilter(ecaChangeTableView),
        document: classNameMapFilter(documentTableView)
    };

    const commonLoaclStoragePrefix = 'change/',
        localStorageKeys = {
            containerRef: 'containerRef',
            relatedChangeObject: 'relatedChangeObject',
            backRouteInfo: 'backRouteInfo',
            requestToNoticeMap: 'requestToNoticeMap'
        },
        { getItem, setItem } = IStorage;
    Object.keys(localStorageKeys).forEach((key) => {
        localStorageKeys[key] = commonLoaclStoragePrefix + localStorageKeys[key];
    });

    return {
        namespaced: true,
        state: () => ({
            classNameMapping,
            OperateMapping: {
                [prChangeTableView.className]: prChangeTableView.rowActionName,
                [ecrChangeTableView.className]: ecrChangeTableView.rowActionName,
                [ecnChangeTableView.className]: ecnChangeTableView.rowActionName,
                [ecaChangeTableView.className]: ecaChangeTableView.rowActionName
            },
            changeTaskList: [],
            containerRef: getItem(localStorageKeys.containerRef, '') || '',
            relatedChangeObject: getItem(localStorageKeys.relatedChangeObject, []) || [],
            backRouteInfo: getItem(localStorageKeys.backRouteInfo, {}) || {},
            // 这里存了从变更请求流程创建变更通告的变更请求的 oid => identifierNo 的映射
            // TODO 这里要清除的 ， 但是需要关注当前的tab是否有变更流程的路由 ， 没有才可以清除 ， 否则就会存在直接访问创建变更通告页面无法通过oid转化identifierNo的情况
            requestToNoticeMap: getItem(localStorageKeys.requestToNoticeMap, {}) || {},
            // 客制化的菜单事件缓存
            customActions: {}
        }),
        mutations: {
            setChangeTaskList(state, data) {
                state.changeTaskList.push(data.storeData);
            },
            containerRef: (state, params) => {
                setItem(localStorageKeys.containerRef, params);
                state.containerRef = params;
            },
            //关联的变更对象
            relatedChangeObject: (state, params) => {
                setItem(localStorageKeys.relatedChangeObject, params);
                state.relatedChangeObject = params;
            },
            requestToNoticeMap: (state, params = []) => {
                const [oid, identifierNo] = params;
                if (!oid || !identifierNo) {
                    return;
                }
                state.requestToNoticeMap[oid] = identifierNo;
                setItem(localStorageKeys.requestToNoticeMap, state.requestToNoticeMap);
            },
            backRouteInfo: (state, params) => {
                setItem(localStorageKeys.backRouteInfo, params);
                state.backRouteInfo = params;
            },
            SET_CUSTOM_ACTIONS(state, actions) {
                state.customActions = actions;
            }
        },
        actions: {
            fetchSaveChangeTaskList({ commit }, data) {
                return new Promise((resolve) => {
                    commit('setChangeTaskList', data);
                    resolve();
                });
            },
            setCustomActions({ commit }, actions) {
                commit('SET_CUSTOM_ACTIONS', actions);
            }
        },
        getters: {
            getViewTableMapping:
                (state) =>
                ({ tableName, mappingName }) => {
                    return state?.classNameMapping?.[tableName]?.[mappingName] || state?.classNameMapping?.[tableName];
                },
            getOperateMapping:
                (state) =>
                ({ tableName, mappingName }) => {
                    return state?.OperateMapping?.[tableName]?.[mappingName] || state?.OperateMapping?.[tableName];
                },
            getChangeTaskList: (state) => {
                return state?.changeTaskList || [];
            },
            getRelatedChangeObject: (state) => {
                return state?.relatedChangeObject || [];
            },
            getRequestToNoticeMap: (state) => {
                return state?.requestToNoticeMap || {};
            },
            getBackRouteInfo: (state) => {
                return state?.backRouteInfo || [];
            },
            getCustomActions: (state) => state.customActions
        }
    };
});
