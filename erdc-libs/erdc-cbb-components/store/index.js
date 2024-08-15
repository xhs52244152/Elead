define(['erdcloud.store', 'vue'], function (ErdcStore, Vue) {
    const store = {
        namespaced: true,
        state: {
            utils: {},
            containerList: []
        },
        mutations: {
            SET_CUSTOM_UTILS(state, { name, customFunc }) {
                Vue.set(state.utils, name, customFunc);
            },
            SET_CONTAINER_LIST(state, data = []) {
                state.containerList = data;
            }
        },
        actions: {
            setCustomUtils({ commit }, data) {
                commit('SET_CUSTOM_UTILS', data);
            },
            setContainerList({ commit }, data) {
                commit('SET_CONTAINER_LIST', data);
            }
        },
        getters: {
            getCustomUtils: (state) => (name) => {
                return state?.utils?.[name] || {};
            },
            getContainerList: (state) => state.containerList
        }
    };

    // 注册cbb模块store，cbb相关的配置store可以存这里
    ErdcStore.registerModule('cbbStore', store);
});
