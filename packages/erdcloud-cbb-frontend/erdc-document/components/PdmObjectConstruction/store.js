define([], function () {
    return {
        namespaced: true,
        state: () => ({
            classNameMapping: {
                // 结构className
                structuredClassNameMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'erd.cloud.pdm.part.entity.EtPartUsageLink',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'erd.cloud.cbb.doc.entity.EtDocumentUsageLink',
                    // 图文档
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'erd.cloud.pdm.epm.entity.EpmMemberLink'
                },
                // 结构视图表格
                structuredTableKeyMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'BomUsageLinkView',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'DocumentStructView',
                    // 图文档
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'EpmDocumentStructView'
                },

                nameAttClassMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'erd.cloud.pdm.part.entity.EtPart#name',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'erd.cloud.cbb.doc.entity.EtDocument#name',
                    // 图文档
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'erd.cloud.pdm.epm.entity.EpmDocument#name'
                },
                identifierNoAttClassMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'erd.cloud.pdm.part.entity.EtPart#identifierNo',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'erd.cloud.cbb.doc.entity.EtDocument#identifierNo',
                    // 图文档
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'erd.cloud.pdm.epm.entity.EpmDocument#identifierNo'
                },
                // 结构列表按钮
                actionConfigMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'PDM_PART_STRUCT_MENU_TABLE',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'DOC_STRUCT_LIST_OP_MENU',
                    // 图文档
                    'erd.cloud.pdm.epm.entity.EpmDocument': ''
                },
                // 视图表格的tableKey(如部件,文档)
                tableViewKeyMap: {
                    'erd.cloud.pdm.part.entity.EtPart': 'partForm',
                    'erd.cloud.cbb.doc.entity.EtDocument': 'DocumentView',
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'epmDocumentView'
                },
                moduleMap: {
                    'erd.cloud.pdm.part.entity.EtPart': 'EtPart',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'EtDocument',
                    // 图文档
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'EpmDocument'
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
