define(['vue', 'vuex'], function () {
    const Vue = require('vue');
    const Vuex = require('vuex');
    Vue.use(Vuex);
    let erdcloudStore = new Vuex.Store({
        state: {
            user: null
        },
        mutations: {
            PUSH_USER(state, user) {
                state.user = user;
            }
        },
        actions: {
            loadCurrentTheme({ dispatch }) {
                return dispatch('mfe/loadCurrentTheme');
            }
        },
        getters: {}
    });

    define('fam:store', [], function () {
        return erdcloudStore;
    });

    return erdcloudStore;
});
