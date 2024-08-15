define([], function () {
    const languageObj = {
        '组件提示': { CN: (o, t) => `请${(o === 'i' ? '输入' : '选择') + '' + t}`, EN: (o, t) => `Please ${(o === 'i' ? 'input' : 'select') + ' ' + t}` },
        '移除': { CN: '移除', EN: 'remove' },
        '处理意见': { CN: '处理意见', EN: 'Handling suggestion' },
        '已阅，同意': { CN: '已阅，同意', EN: 'Read it and agree' },
        '已阅，不同意': { CN: '已阅，不同意', EN: 'Have read, disagree' },
        '流程编码': { CN: '流程编码', EN: 'Process coding' },
        '流程名称': { CN: '流程名称', EN: 'Process name' },
        '流程模板': { CN: '流程模板', EN: 'Process template' },
        '节点名称': { CN: '节点名称', EN: 'Node name' },
        '发起人': { CN: '发起人', EN: 'initiator' },
        '发起时间': { CN: '发起时间', EN: 'Initiation time' },
        '处理结果': { CN: '处理结果', EN: 'Processing result' },
        '操作': { CN: '操作', EN: 'operation' },
        pleaseFillInsSuggestion: { CN: '请填写处理意见', EN: 'Please fill in the handling suggestion' },
        pleaseCheckApproval: { CN: '请勾选批量审批的任务', EN: 'Please check the task of batch approval' },
        pleaseSelectRoute: { CN: '请选择处理结果', EN: 'If the route is empty, select the route and submit the flow' },
        '请选择路由': { CN: '请选择路由', EN: 'Please select a route' },
        '请勾选要移除的数据': { CN: '请勾选要移除的数据', EN: 'Please check the data you want to remove' },
    };

    return {
        i18n: languageObj
    };
});
