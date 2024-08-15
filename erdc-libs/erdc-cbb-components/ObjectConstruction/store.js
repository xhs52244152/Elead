define([], function () {
    const axios = require('fam:http');
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
                    // 模型
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'erd.cloud.pdm.epm.entity.EpmMemberLink'
                },
                // 结构视图表格
                structuredTableKeyMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'BomUsageLinkView',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'DocumentStructView',
                    // 模型
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'EpmDocumentStructView'
                },

                nameAttClassMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'erd.cloud.pdm.part.entity.EtPart#name',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'erd.cloud.cbb.doc.entity.EtDocument#name',
                    // 模型
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'erd.cloud.pdm.epm.entity.EpmDocument#name'
                },
                identifierNoAttClassMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'erd.cloud.pdm.part.entity.EtPart#identifierNo',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'erd.cloud.cbb.doc.entity.EtDocument#identifierNo',
                    // 模型
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'erd.cloud.pdm.epm.entity.EpmDocument#identifierNo'
                },
                // 结构列表按钮
                actionConfigMap: {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': 'PDM_PART_STRUCT_MENU_TABLE',
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'DOC_STRUCT_LIST_OP_MENU',
                    // 模型
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
                    // 模型
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'EpmDocument'
                },
                replaceClassName: [
                    'erd.cloud.pdm.part.entity.EtPartSubstituteLink',
                    'erd.cloud.pdm.part.entity.EtPartAlternateLink'
                ]
            },
            // 默认视图首选项配置
            preferenceView: ''
        }),
        mutations: {
            GET_PREFERENCE_VIEW(state, data) {
                state.preferenceView = data;
            }
        },
        actions: {
            // 获取视图的首选项配置
            getPreferenceView: ({ commit }) => {
                return new Promise((resolve, reject) => {
                    let url = '/fam/peferences/defaultView';
                    axios
                        .get(url)
                        .then((resp) => {
                            if (resp.success) {
                                commit('GET_PREFERENCE_VIEW', resp?.data || {});
                            }
                            resolve(resp);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            // 获取对象已创建的视图
            getObjectView: (hook, data) => {
                return new Promise((resolve, reject) => {
                    // let url = '/part-yty/bom/getPartBomView';
                    let url = '/part/bom/getPartBomView';
                    axios
                        .post(url, data)
                        .then((resp) => {
                            resolve(resp);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            }
        },
        getters: {
            getStructuredMapping:
                (state) =>
                ({ mappingName, className }) => {
                    return state?.classNameMapping?.[mappingName]?.[className];
                }
        }
    };
});
