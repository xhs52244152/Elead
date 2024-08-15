define(['fam:store'], function (FamStore) {
    const axios = require('fam:http');
    const store = {
        namespaced: true,
        state: {
            constructionEditData: [],
            refreshConstructionTable: null,
            constructionTableCheck: null
        },
        mutations: {
            setConstructionEditData(state, data) {
                state.constructionEditData = data;
            },
            setRefreshConstructionTable(state, data) {
                state.refreshConstructionTable = data;
            },
            setConstructionTableCheck(state, data) {
                state.constructionTableCheck = data;
            }
        },
        actions: {
            // 获取所有视图
            getAllView: (hook, data) => {
                return new Promise((resolve, reject) => {
                    let url = '/fam/view/all';
                    axios
                        .get(url, data)
                        .then((resp) => {
                            resolve(resp);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            }
        },
        getters: {
            getConstructionEditData(state) {
                return state.constructionEditData;
            },
            getRefreshConstructionTable(state) {
                return state.refreshConstructionTable;
            },
            getConstructionTableCheck(state) {
                return state.constructionTableCheck;
            }
        }
    };

    FamStore.registerModule('ConstructionList', store);
    return FamStore;
});
