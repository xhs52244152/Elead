define([], function () {
    const store = {
        namespaced: true,
        state: () => ({
            // 产品
            product: {
                className: 'erd.cloud.pdm.core.container.entity.PdmProduct',
                tableKey: 'pdmProductViewTable',
                actionTableName: 'PDM_PRODUCT_LIST_MENU',
                actionToolBarName: 'PDM_PRODUCT_MENU'
            },
            // 成品列表
            endItemsProduct: {
                className: 'erd.cloud.pdm.part.entity.EtPart',
                tableKey: 'pdmEndItemsTable',
                actionTableName: '',
                actionToolBarName: ''
            },
            // 文件夹
            folder: {
                actionTableName: 'MENU_ACTION_FOLDER_OPERATE_MENU',
                actionToolBarName: 'PDM_FOLDER_OPERATE'
            },
            // 模板
            template: {
                actionTableName: 'PDM_PRODUCT_MODEL_MENU',
                actionToolBarName: 'PDM_PRODUCT_TEMPLATE_EDIT'
            }
        }),
        getters: {
            getObjectMapping: (state) => ({ objectName, attrName }) => {
                return state?.[objectName]?.[attrName] || state?.[objectName] || {};
            }
        }
    };
    return store;
});
