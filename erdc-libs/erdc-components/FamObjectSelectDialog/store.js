define(['fam:store'], function () {
    const FamStore = require('fam:store');

    const store = {
        namespaced: true,
        state: {
            config: {}
        },
        mutations: {
            SET_CONFIG(state, context) {
                let className = context.className;
                state.config[className] = context;
            }
        },
        actions: {
            setConfig({ commit }, config) {
                commit('SET_CONFIG', config);
            }
        },
        getters: {
            getConfig: (state) => (className) => {
                return state.config[className];
            }
        }
    };

    FamStore.registerModule('FamObjectSelect', store);

    return FamStore;
});
