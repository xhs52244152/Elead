define(['vue', 'vuex'], function () {
    const Vue = require('vue');
    const Vuex = require('vuex');

    Vue.use(Vuex);

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
                require: 'erd.cloud.ppm.require.entity.Requirement'
            },
        },
        mutations: {
        },
        actions: {
        },
        getters: {}
    });

    return store;
});
