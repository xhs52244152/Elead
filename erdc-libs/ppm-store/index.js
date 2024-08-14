define(['erdcloud.kit', 'erdcloud.store'], function (ErdcKit, ErdcStore) {
    const Vue = require('vue');
    const Vuex = require('vuex');

    Vue.use(Vuex);

    const transFormData = (data, commit) => {
        let result = ErdcKit.deserializeAttr(data, {
            valueMap: {
                'lifecycleStatus.status': (e, data) => {
                    return data['lifecycleStatus.status']?.displayName;
                },
                'templateInfo.templateReference': (e, data) => {
                    return data['templateInfo.templateReference'].oid;
                },
                'typeReference': (e, data) => {
                    return data['typeReference']?.oid || '';
                },
                'typeRef': (e, data) => {
                    return data['typeReference']?.oid || '';
                },
                'projectManager': ({ users }) => {
                    return users;
                },
                'organizationRef': (e, data) => {
                    return data['organizationRef']?.oid || '';
                },
                'productLineRef': (e, data) => {
                    return data['productLineRef']?.oid || '';
                },
                'timeInfo.scheduledStartTime': (e, data) => {
                    return data['timeInfo.scheduledStartTime'].displayName;
                },
                'timeInfo.scheduledEndTime': (e, data) => {
                    return data['timeInfo.scheduledEndTime'].displayName;
                },
                'timeInfo.actualStartTime': (e, data) => {
                    return data['timeInfo.actualStartTime'].displayName;
                },
                'timeInfo.actualEndTime': (e, data) => {
                    return data['timeInfo.actualEndTime'].displayName;
                }
            }
        });
        result.containerRefOid = `OR:${result.containerRef.key}:${result.containerRef.id}`;
        // 保存项目状态value值
        result.lifecycleStatusStatus = data['lifecycleStatus.status'].value;

        commit('setProjectInfo', result);
    };

    const store = new Vuex.Store({
        state: {
            classNameMapping: {
                project: 'erd.cloud.ppm.project.entity.Project',
                task: 'erd.cloud.ppm.plan.entity.Task',
                DiscreteTask: 'erd.cloud.ppm.plan.entity.DiscreteTask',
                taskLink: 'erd.cloud.ppm.plan.entity.TaskLink',
                DeliveryLink: 'erd.cloud.ppm.common.entity.DeliveryLink',
                ProjectDocument: 'erd.cloud.ppm.document.entity.ProjectDocument',
                risk: 'erd.cloud.ppm.risk.entity.Risk',
                issue: 'erd.cloud.ppm.issue.entity.Issue',
                require: 'erd.cloud.ppm.require.entity.Requirement',
                businessProductInfo: 'erd.cloud.cbb.pbi.entity.ProductInfo',
                businessHeavyTeam: 'erd.cloud.cbb.pbi.entity.HeavyTeam',
                projectTime: 'erd.cloud.ppm.timesheet.entity.ProjectTimesheet',
                departmentTime: 'erd.cloud.ppm.timesheet.entity.DepartmentTimesheet',
                taskTime: 'erd.cloud.ppm.timesheet.entity.TaskTimesheet',
                DiscreteTime: 'erd.cloud.ppm.timesheet.entity.DiscreteTaskTimesheet',
                ReviewLibrary: 'erd.cloud.cbb.review.entity.ReviewElement',
                ReviewCategory: 'erd.cloud.cbb.review.entity.ReviewCategory',
                ReviewPoint: 'erd.cloud.cbb.review.entity.ReviewPoint',
                ReviewPointToElementLink: 'erd.cloud.cbb.review.entity.ReviewPointToElementLink',
                reviewManagement: 'erd.cloud.ppm.review.entity.ReviewObject',
                DeliveryList: 'erd.cloud.cbb.review.entity.DeliveryList',
                QualityObjective: 'erd.cloud.cbb.review.entity.QualityObjective',
                baseline: 'erd.cloud.cbb.baseline.entity.Baseline',
                milestone: 'erd.cloud.ppm.plan.entity.milestone',
                requireLink: 'erd.cloud.ppm.require.entity.RequirementLink',
                budgetTemplate: 'erd.cloud.ppm.budget.entity.BudgetTemplate', // 预算模板
                budget: 'erd.cloud.ppm.budget.entity.Budget', // 预算
                budgetSubject: 'erd.cloud.ppm.budget.entity.BudgetSubject', // 预算科目
                budgetStage: 'erd.cloud.ppm.budget.entity.BudgetStage', // 预算阶段
                budgetAmount: 'erd.cloud.ppm.budget.entity.BudgetAmount', // 预算金额
                budgetLink: 'erd.cloud.ppm.budget.entity.BudgetLink', // 预算关联科目对象
                document: 'erd.cloud.cbb.doc.entity.EtDocument', // 文档
                documentMaster: 'erd.cloud.cbb.doc.entity.EtDocumentMaster' // 文档Master
            },
            projectInfo: JSON.parse(localStorage.getItem('projectInfo')) || {},
            statesInfo: {},
            planRow: {},
            knowledgeInfo: {}
        },
        mutations: {
            setProjectInfo(state, newVal) {
                localStorage.setItem('projectInfo', JSON.stringify(newVal));
                state.projectInfo = newVal;
            },
            setStatesInfo(state, newVal) {
                state.statesInfo = newVal;
            },
            setplanRowInfo(state, newVal) {
                state.planRow = newVal;
            },
            setKnowledgeInfo(state, newVal) {
                state.knowledgeInfo = newVal;
            }
        },
        actions: {
            fetchProjectInfo({ commit }, playload) {
                const axios = require('erdcloud.http');
                return new Promise((resolve, reject) => {
                    let oid = playload.id;
                    let className = oid.split(':')[1];
                    if (ErdcStore.state?.space?.rawObject) {
                        transFormData(ErdcStore.state.space.rawObject, commit);
                    } else {
                        axios({
                            url: '/ppm/attr',
                            method: 'get',
                            className,
                            data: {
                                oid: playload.id
                            }
                        })
                            .then((resp) => {
                                if (resp.code === '200') {
                                    let data = resp.data?.rawData || {};
                                    transFormData(data, commit);
                                    resolve(resp.data?.rawData || {});
                                } else {
                                    reject();
                                }
                            })
                            .catch(() => {
                                reject();
                            });
                    }
                });
            },
            fetchKnowledgeInfo({ commit }) {
                return new Promise((resolve) => {
                    const axios = require('erdcloud.http');
                    let oid = 'OR:erd.cloud.ppm.knowledge.entity.KnowledgeLibrary:1793486205244080129';
                    let className = oid.split(':')[1];
                    axios({
                        url: '/ppm/attr',
                        method: 'get',
                        className,
                        data: {
                            oid
                        }
                    }).then((res) => {
                        let rowData = res.data.rawData;
                        let result = ErdcKit.deserializeAttr(rowData, {
                            valueMap: {
                                'typeReference': (e) => e.oid,
                                'teamTemplateRef': (e) => e.oid,
                                'containerRef': (e) => e.oid,
                                'cabinetRef': (e) => e.oid,
                                'domainRef': (e) => e.oid,
                                'lifecycleStatus.lifecycleTemplateRef': (e) => e.oid,
                                'teamRef': (e) => e.oid
                            }
                        });
                        result.rowData = rowData;
                        commit('setKnowledgeInfo', result);
                        resolve();
                    });
                });
            }
        },
        getters: {}
    });

    return store;
});
