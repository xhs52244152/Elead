define(['vue', 'vuex'], function () {
    const Vue = require('vue');
    const Vuex = require('vuex');

    Vue.use(Vuex);

    const store = new Vuex.Store({
        state: {
            classNameMapping: {
                versionView: 'erd.cloud.pdm.part.view.entity.View'
            },
            tableViewMaping: {
                // 产品
                product: {
                    className: 'erd.cloud.pdm.core.container.entity.PdmProduct',
                    tableKey: 'pdmProductViewTable'
                },
                // 部件
                part: {
                    className: 'erd.cloud.pdm.part.entity.EtPart',
                    tableKey: 'partForm'
                },
                // 文档
                document: {
                    className: 'erd.cloud.cbb.doc.entity.EtDocument',
                    tableKey: 'DocumentView'
                },
                // 模型
                epmDocument: {
                    className: 'erd.cloud.pdm.epm.entity.EpmDocument',
                    tableKey: 'epmDocumentView'
                },
                // 基线
                baseline: {
                    className: 'erd.cloud.cbb.baseline.entity.Baseline',
                    tableKey: 'BaselineView'
                },

                // 问题报告
                prChange: {
                    className: 'erd.cloud.cbb.change.entity.EtChangeIssue',
                    tableKey: 'ChangeIssueView'
                },
                // 变更请求
                ecrChange: {
                    className: 'erd.cloud.cbb.change.entity.EtChangeRequest',
                    tableKey: 'changeRequestView'
                },
                // 变更通告
                ecnChange: {
                    className: 'erd.cloud.cbb.change.entity.EtChangeOrder',
                    tableKey: 'changeOrderView'
                },
                // 变更任务
                ecaChange: {
                    className: 'erd.cloud.cbb.change.entity.EtChangeActivity',
                    tableKey: 'changeActivityView'
                }
            },
            // 容器className映射
            containerPathMapping: {
                'erd.cloud.pdm.core.container.entity.PdmProduct': '/space/product',
                'erd.cloud.foundation.core.container.entity.Library': '/space/library', // 貌似后端类型有改过
                'erd.cloud.pdm.core.container.entity.Library': '/space/library'
            },
            // 应用名称映射
            appNameMapping: {
                '/space/library': 'erdc-library-web',
                '/space/product': 'erdc-product-web',
                '/portal': 'erdc-portal-web'
            },
            // 详情路由名称映射
            detailRouteNameMapping: {
                'erd.cloud.cbb.doc.entity.EtDocument': '/erdc-document/document/detail',
                'erd.cloud.pdm.part.entity.EtPart': '/erdc-part/part/detail',
                'erd.cloud.pdm.epm.entity.EpmDocument': '/erdc-epm-document/epmDocument/detail',
                'erd.cloud.cbb.baseline.entity.Baseline': '/erdc-baseline/baseline/detail',
                'erd.cloud.cbb.change.entity.EtChangeIssue': '/erdc-change/change/prDetail',
                'erd.cloud.cbb.change.entity.EtChangeRequest': '/erdc-change/change/ecrDetail',
                'erd.cloud.cbb.change.entity.EtChangeOrder': '/erdc-change/change/ecnDetail',
                'erd.cloud.cbb.change.entity.EtChangeActivity': '/erdc-change/change/ecaDetail'
            }
        },
        mutations: {
            SET_CONTAINRE_PATH_MAPPING(state, data) {
                state.containerPathMapping = { ...state.containerPathMapping, ...data };
            },
            SET_APP_NAME_MAPPING(state, data) {
                state.appNameMapping = { ...state.appNameMapping, ...data };
            },
            SET_DETAIL_ROUTE_NAME_MAPPING(state, data) {
                state.detailRouteNameMapping = { ...state.detailRouteNameMapping, ...data };
            }
        },
        actions: {
            setContainerPathMapping({ commit }, data) {
                commit('SET_CONTAINRE_PATH_MAPPING', data);
            },
            setAppNameMapping({ commit }, data) {
                commit('SET_APP_NAME_MAPPING', data);
            },
            setDetailRouteNameMapping({ commit }, data) {
                commit('SET_DETAIL_ROUTE_NAME_MAPPING', data);
            }
        },
        getters: {}
    });

    return store;
});
