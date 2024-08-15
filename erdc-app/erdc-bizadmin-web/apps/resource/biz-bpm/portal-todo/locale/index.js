define([], function () {
    const languageObj = {
        layout: { CN: '布局', EN: 'Layout' },
        tableView: { CN: '表格布局', EN: 'Table layout' },
        detailView: { CN: '详情布局', EN: 'Detail layout' },
        application: { CN: '应用', EN: 'Application' },
        all: { CN: '全部', EN: 'All' },
        batchProcessing: { CN: '批量处理', EN: 'Batch Processing' },
        batchProcessRuleTips: {
            CN: '对处于同一流程定义的同一节点的任务进行批量处理',
            EN: 'Bulk approval of tasks that are at the same node in the same process definition'
        },
        delegate: { CN: '委派', EN: 'Delegate' },
        delegateNote: { CN: '将任务委托他人处理', EN: 'The task is delegated to others' },
        handle: { CN: '处理', EN: 'Handle' },
        flowchart: { CN: '流程图', EN: 'Flow chart' },
        informTaskProcessingTips: { CN: '知会任务无需处理', EN: 'There is no need to process an informed task' },
        queryTaskProcessingTips: { CN: '询问任务无法批量处理', EN: 'Unable to process inquire type tasks by batch' },
        taskExpiredAt: { CN: '{0}天后到期', EN: 'The task expires after {0} day(s).' },
        remove: { CN: '移除', EN: 'Remove' },
        batchApprovalWarning: { CN: '批量处理失败', EN: 'Batch processing failed.' },
        processCode: { CN: '流程编码', EN: 'Process Code' },
        processDefinitionName: { CN: '流程标题', EN: 'Process Title' },
        processInstanceName: { CN: '流程名称', EN: 'Process Name' },
        taskName: { CN: '处理节点', EN: 'Task Name' },
        assignee: { CN: '处理人', EN: 'Assigned to' },
        launchTime: { CN: '发起时间', EN: 'Started at' },
        approvalResult: { CN: '处理结果', EN: 'Approval Results' },
        '请勾选要批量委派的数据！': { CN: '请勾选要批量委派的数据！', EN: 'Please check the data you want to batch delegate!' },
        '知会任务无需处理！': { CN: '知会任务无需处理！', EN: 'Notify that the task does not need to be handled!' },
        '询问任务无法批量处理！': { CN: '询问任务无法批量处理！', EN: 'Query tasks cannot be processed in batches!' },
        '询问我的任务不能被委派！': { CN: '询问我的任务不能被委派！', EN: "The task of asking me can't be delegated!" },
        '确定': { CN: '确定', EN: "Confirm" },
        '取消': { CN: '取消', EN: "Cancel" },
        '任务委派成功': { CN: '任务委派成功', EN: "Successful task delegation" },
        '任务委派失败': { CN: '任务委派失败', EN: "Task delegation failure" },
        '流程图解': { CN: '流程图解', EN: 'Flow diagram' },
        '请输入流程编码，流程名称': { CN: '请输入流程编码，流程名称', EN: 'Please enter process code, process name' },
        '批量处理成功': { CN: '批量处理成功', EN: 'Batch processing success' },
        '批量处理失败': { CN: '批量处理失败', EN: 'Batch processing failure' }
    };

    return {
        i18n: languageObj
    };
});
