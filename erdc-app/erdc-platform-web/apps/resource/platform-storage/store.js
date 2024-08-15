define(['fam:store'], function () {
    const FamStore = require('fam:store');

    const store = {
        namespaced: true,
        state: {
            userSite: {}
        },
        mutations: {
            SET_USER_SITE(state, site) {
                state.userSite = site;
            }
        },
        actions: {
            setUserSite({ commit }, site) {
                commit('SET_USER_SITE', site);
            }
        },
    };

    FamStore.registerModule('erdcloudDoc', store);

    return FamStore;
});
