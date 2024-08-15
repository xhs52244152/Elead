define([], function () {
    return {
        namespaced: true,
        state: () => ({
            commonPageObject: {},
            object: {}
        }),
        mutations: {
            SET_COMMON_PAGE_OBJECT(state, payload) {
                if (payload) {
                    payload = { ...state.commonPageObject, ...payload };
                    payload = _.pick(payload, (value) => _.isFunction(value));
                    state.commonPageObject = payload;
                }
            },
            SET_OBJECT(state, payload) {
                if (payload) {
                    state.object = payload;
                }
            }
        },
        actions: {
            setCommonPageObjectAction({ commit }, payload) {
                commit('SET_COMMON_PAGE_OBJECT', payload);
            },
            setBusinessObjectAction({ commit }, payload) {
                commit('SET_OBJECT', payload);
            }
        },
        getters: {
            getCommonPageObject: (state) => {
                return state?.commonPageObject;
            }
        }
    };
});
