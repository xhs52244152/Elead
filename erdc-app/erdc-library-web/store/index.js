define([], function () {
  const store = {
    namespaced: true,
    state: () => ({
      // 资源库
      library: {
        className: 'erd.cloud.pdm.core.container.entity.Library',
        tableKey: 'pdmLibraryViewTable',
        actionTableName: 'PDM_LIBRARY_LIST_MENU',
        actionToolBarName: 'PDM_LIBRARY_MENU'
      },
      // 文件夹
      folder: {
        actionTableName: 'MENU_ACTION_FOLDER_OPERATE_MENU',
        actionToolBarName: 'PDM_FOLDER_OPERATE'
      },
      // 模板
      template: {
        actionTableName: 'PDM_LIBRARY_MODEL_MENU',
        actionToolBarName: 'PDM_LIBRARY_TEMPLATE_EDIT'
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
