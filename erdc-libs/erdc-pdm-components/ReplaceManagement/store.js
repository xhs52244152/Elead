define([], function () {
    return {
        namespaced: true,
        state: () => ({
            globalSubstituteModule: 'erd.cloud.pdm.part.entity.EtPartAlternateLink',
            localSubstituteModule: 'erd.cloud.pdm.part.entity.EtPartSubstituteLink',
            classNameMapping: {
                tableKeyMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'partForm',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'DocumentView',
                    // 全局
                    'erd.cloud.pdm.part.entity.EtPartAlternateLink': 'ManageAlternateView',
                    // 局部
                    'erd.cloud.pdm.part.entity.EtPartSubstituteLink': 'ManageSubstituteView'
                }
            }
        }),
        getters: {
            getMapping:
                (state) =>
                ({ mappingName, className }) => {
                    return state?.classNameMapping?.[mappingName]?.[className];
                }
        }
    };
});
