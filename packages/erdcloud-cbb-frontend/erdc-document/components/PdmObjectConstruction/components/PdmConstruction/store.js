define([], function () {
    return {
        namespaced: true,
        state: () => ({
            constructionEditData: [],
            refreshConstructionTable: null
        }),
        mutations: {
            setConstructionEditData(state, data) {
                state.constructionEditData = data;
            },
            setRefreshConstructionTable(state, data) {
                state.refreshConstructionTable = data;
            }
        },
        getters: {
            getConstructionEditData(state) {
                return state.constructionEditData;
            },
            getRefreshConstructionTable(state) {
                return state.refreshConstructionTable;
            }
        }
    };
});
