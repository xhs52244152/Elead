define([], function () {
    return {
        namespaced: true,
        state: () => ({
            classNameMapping: {
                // 结构className
                operationClassNameMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'PDM_PART_STRUCT_MENU',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'DOC_STRUCT_OP_MENU',
                    // 图文档
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'PDM_EPM_DOCUMENT_STRUCT_MENU'
                }
            }
        }),
        getters: {
            getStructuredMapping:
                (state) =>
                    ({ mappingName, className }) => {
                        return state?.classNameMapping?.[mappingName]?.[className];
                    }
        }
    };
});
