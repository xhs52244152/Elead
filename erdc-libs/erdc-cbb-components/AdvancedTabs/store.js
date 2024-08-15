define([], function () {
    const Vue = require('vue');

    return {
        namespaced: true,
        state: () => ({
            tabs: {}
        }),
        mutations: {
            /**
             * 设置
             * @param { Object } obj  {data:要添加的数据,className:tab的唯一标识}
             * */
            SET_TABS(state, obj) {
                let { data, className } = obj;
                Vue.prototype.$set(state.tabs, className, data);
            },
            /**
             *  添加
             * @param { Object } obj  {data:要添加的数据,className:tab的唯一标识}
             * */
            ADD_TABS(state, obj) {
                let { data, className } = obj;
                data.forEach((item) => {
                    if (parseInt(item.place) > state.tabs[className]['tabList'].length) {
                        state.tabs[className]['tabList'].push(item);
                    } else {
                        state.tabs[className]['tabList'].splice(item.place, 0, item);
                    }
                });
            },
            /**
             *  删除
             * @param { Object } obj  {data:要添加的数据,className:tab的唯一标识,place:位置}
             * */
            DELETE_TABS(state, obj) {
                let { className, placeList } = obj;
                if (_.isEmpty(placeList)) {
                    state.tabs[className]['tabList'] = [];
                } else {
                    placeList.forEach((item) => {
                        state.tabs[className]['tabList'].splice(item, 1);
                    });
                }
            },
            /**
             * 更新(替换)
             * @param { Object } obj  {data:要添加的数据,className:tab的唯一标识}
             * */
            UPDATE_TABS(state, obj) {
                let { data, className } = obj;
                data.forEach((item) => {
                    state.tabs[className]['tabList'].splice(item.place, 1, item);
                });
            }
        },
        getters: {
            getTabs: (state) => (className) => {
                return state?.tabs?.[className] || {};
            }
        }
    };
});
