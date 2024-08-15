define([], function () {
    // 平台相关模块的初始化注册
    const ErdcStore = require('erdcloud.store');

    // 注册操作记录-转视图任务
    ErdcStore.dispatch('pushOperRecordsTabs', {
        label: '转视图任务',
        name: 'ViewConvertTaskList',
        componentPath: 'erdc-pdm-components/ViewConvertTaskList/index.js'
    });
});
