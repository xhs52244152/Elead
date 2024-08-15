define([], function () {

    return {
        namespaced: true,
        state: () => ({
            selectedForAdd: JSON.parse(localStorage.getItem('workspace_selected_for_add')) || []
        }),
        mutations: {
            setForAddToWorkspace(state, list) {
                localStorage.setItem('workspace_selected_for_add', JSON.stringify(list));
                state.selectedForAdd = list;
            }
        },
        getters: {
            getSelectedForAddToWorkspace: (state) => () => [...state.selectedForAdd]
        }
    };
});
