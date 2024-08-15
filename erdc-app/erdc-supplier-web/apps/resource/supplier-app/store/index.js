define([], function () {
    const store = {
        namespaced: true,
        state: () => ({
            viewTableMapping: {
                supplier: {
                    className: 'erd.cloud.pdm.manufacturer.entity.EtManufacturer',
                    tableKey: 'SupplierView',
                    actionTableName: 'SUPPLIER_OPERATE',
                    actionToolBarName: 'SUPPLIER_LIST_OPERATE_MENU',
                    detailInfoName: 'LIBRARY_INFO_OPERATE',
                    folderInfo: {
                        actionTableName: 'MENU_ACTION_FOLDER_OPERATE_MENU',
                        actionToolBarName: 'PDM_FOLDER_OPERATE'
                    },
                    templateInfo: {
                        actionTableName: 'PDM_LIBRARY_MODEL_MENU'
                    }
                },
                linkMan: {
                    className: 'erd.cloud.pdm.manufacturer.entity.EtSupplierContact',
                    tableKey: 'SupplierConcatView',
                    actionTableName: '',
                    actionToolBarName: 'SUPPLIER_CONTACT_OPERATE',
                    detailInfoName: ''
                }
            }
        }),
        mutations: {},
        actions: {},
        getters: {
            getViewTableMapping:
                (state) =>
                ({ tableName, mappingName }) => {
                    return state?.viewTableMapping?.[tableName]?.[mappingName] || state?.viewTableMapping?.[tableName];
                }
        }
    };
    return store;
});
