define([], function () {
    return {
        namespaced: true,
        state: () => ({
            customActions: {}
        }),
        mutations: {
            SET_CUSTOM_ACTIONS(state, actions) {
                state.customActions = actions;
            }
        },
        actions: {
            setCustomActions({ commit }, actions) {
                commit('SET_CUSTOM_ACTIONS', actions);
            }
        },
        getters: {
            getCustomActions: (state) => state.customActions
        }
    };
});
