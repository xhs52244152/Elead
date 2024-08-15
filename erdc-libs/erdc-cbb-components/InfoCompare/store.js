define([], function () {

    return {
        namespaced: true,
        state: () => ({
            Info_Compare: JSON.parse(localStorage.getItem('Info_Compare')) || {}
        }),
        mutations: {
            SET_INFO_COMPARE: (state, payload) => {
                const { className, infoCompare } = payload || {};
                const Info_Compare = {
                    ...state.Info_Compare,
                    [className]: infoCompare || []
                };
                state.Info_Compare = Info_Compare;
                localStorage.setItem('Info_Compare', JSON.stringify(Info_Compare));
            }
        },
        getters: {
            getCompareDataList: (state) => (className) => {
                return state?.Info_Compare?.[className] || [];
            }
        }
    };
});
