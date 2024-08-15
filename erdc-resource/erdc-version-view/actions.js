define([], function () {
    return {
        PDM_CORE_VIEW_CREATE: (vm) => {
            vm.handleCreateView();
        },
        PDM_CORE_VIEW_EDIT: (vm, row) => {
            vm.handleEditView(row);
        },
        PDM_CORE_VALID_EDIT: (vm, row) => {
            vm.handleUnEnabled(row, true);
        },
        PDM_CORE_INVALID_EDIT: (vm, row) => {
            vm.handleUnEnabled(row, false);
        }
    };
});
