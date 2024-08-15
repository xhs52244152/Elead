define([
    ELMP.resource('erdc-cbb-workflow/app/store/index.js'),
    ELMP.resource('erdc-cbb-workflow/app/config/reviewObjectBaseInfo.js'),
    ELMP.resource('erdc-cbb-workflow/app/config/reviewObject.js')
], function (workflowStore, basicInfoConfigs, resourceConfig) {
    const ErdcStore = require('erdcloud.store');

    // 流程基本信息、store、className等配置的注册，由流程审批表单加载触发
    // 如果改节点没有注册审批表单，也需要实现空的审批表单，用于触发初始化
    return function registerWorkflow () {
        // pdm工作流store
        ErdcStore.registerModule('cbbWorkflowStore', workflowStore);

        // pdm流程基本信息注册
        let asynchronousQueueList = [];
        _.each(basicInfoConfigs, (cValue, cKey) => {
            _.each(cValue, (value, key) => {
                asynchronousQueueList.push({ key: cKey, panelSection: key, resource: value });
            });
        });
        _.map(asynchronousQueueList, (item) => {
            ErdcStore.dispatch('bpmProcessPanel/registerProcessPanel', item);
        });

        // pdm流程表单其它配置项（className等）
        Object.keys(resourceConfig).map((key) => {
            ErdcStore.dispatch('bpmPartial/registerResource', {
                key,
                resource: resourceConfig[key]
            });
        });

        return Promise.resolve();
    };
});
