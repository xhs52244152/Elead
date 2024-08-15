define(['erdc-kit'], function () {
    const ErdcKit = require('erdc-kit');

    return {
        namespaced: true,
        state: () => ({
            reviewObject: JSON.parse(localStorage.getItem('pdmProcessData')) || {}
        }),
        mutations: {
            SET_REVIEW_OBJECT(state, payload) {
                if (payload) {
                    state.reviewObject = { ...state.reviewObject, ...ErdcKit.deepClone(payload) };
                    localStorage.setItem('pdmProcessData', JSON.stringify(ErdcKit.deepClone(state.reviewObject)));
                }
            }
        },
        actions: {
            SET_REVIEW_OBJECT_ACTION({ commit }, payload) {
                commit('SET_REVIEW_OBJECT', payload);
            }
        },
        getters: {
            getReviewObject:
                ({ reviewObject }) =>
                ({ processDefinitionKey, activityId }) => {
                    return reviewObject[`${processDefinitionKey}-${activityId}`] || reviewObject[processDefinitionKey];
                }
        }
    };
});
