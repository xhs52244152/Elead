define([ELMP.func('erdc-baseline/const.js')], function (CONSTS) {
    return {
        namespaced: true,
        state: () => ({
            classNameMapping: {
                baseline: {
                    className: CONSTS.className,
                    tableKey: 'BaselineView',
                    actionTableName: 'fff',
                    actionToolBarName: 'dsd'
                }
            },
            selectedForAdd: JSON.parse(localStorage.getItem('baseline_selected_for_add')) || [],
            selectedForMerge: JSON.parse(localStorage.getItem('baseline_selected_for_merge')) || [],
            mergeInfo: {
                masterBaselineOid: '',
                hasEditPermission: true,
                mergedList: [],
                toBeMergedList: [],
                deleteBaseline: false
            },
            customActions: {},
            viewTypesList: []
        }),
        mutations: {
            setSelectedForAdd(state, list) {
                localStorage.setItem('baseline_selected_for_add', JSON.stringify(list));
                state.selectedForAdd = list;
            },
            setSelectedForMerge: (state, selectedForMerge) => {
                localStorage.setItem('baseline_selected_for_merge', JSON.stringify(selectedForMerge));
                state.selectedForMerge = selectedForMerge;
            },
            setMergeInfo: (state, info) => {
                state.mergeInfo = info;
            },
            SET_CUSTOM_ACTIONS(state, actions) {
                state.customActions = actions;
            },
            SET_VIEW_TYPES_LIST(state, data) {
                state.viewTypesList = data;
            }
        },
        actions: {
            setCustomActions({ commit }, actions) {
                commit('SET_CUSTOM_ACTIONS', actions);
            },
            setViewTypesList({ commit }, data) {
                commit('SET_VIEW_TYPES_LIST', data);
            }
        },
        getters: {
            getViewTableMapping:
                (state) =>
                ({ tableName, mappingName }) => {
                    return state?.classNameMapping?.[tableName]?.[mappingName] || state?.classNameMapping?.[tableName];
                },
            getSelectedForAdd: (state) => () => [...state.selectedForAdd],
            getSelectedForMerge: (state) => {
                return state.selectedForMerge;
            },
            getMergeInfo: (state) => {
                return state.mergeInfo;
            },
            getCustomActions: (state) => state.customActions,
            getViewTypesList: (state) => state.viewTypesList
        }
    };
});
