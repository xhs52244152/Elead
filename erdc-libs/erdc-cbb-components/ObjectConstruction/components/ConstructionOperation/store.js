define([], function () {
    const FamStore = require('erdcloud.store');
    const store = {
        namespaced: true,
        state: {
            classNameMapping: {
                // 结构className
                operationClassNameMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'PDM_PART_STRUCT_MENU',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'DOC_STRUCT_OP_MENU',
                    // 模型
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'PDM_EPM_DOCUMENT_STRUCT_MENU'
                }
            },
            refreshOperBtnFunction: null,
            setSubstitutePartFunction: null
        },
        mutations: {
            setRefreshOperBtnFunction(state, data) {
                state.refreshOperBtnFunction = data;
            },
            setSubstitutePartFunction(state, data) {
                state.setSubstitutePartFunction = data;
            }
        },
        actions: {},
        getters: {
            getStructuredMapping:
                (state) =>
                ({ mappingName, className }) => {
                    return state?.classNameMapping?.[mappingName]?.[className];
                },
            getRefreshOperBtnFunction(state) {
                return state.refreshOperBtnFunction;
            },
            getSubstitutePartFunction(state) {
                return state.setSubstitutePartFunction;
            }
        }
    };
    FamStore.registerModule('ConstructionOperation', store);

    return FamStore;
});
