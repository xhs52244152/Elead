define([], function () {
    const languageObj = {
        queue: { CN: '队列', EN: 'Queue' },
        queueId: { CN: '队列ID', EN: 'Queue ID' },
        queueName: { CN: '队列名称', EN: 'Queue Name' },
        queueDescription: { CN: '队列描述', EN: 'Queue Description' },
        timingInformation: { CN: '定时信息', EN: 'Timing Information' },
        executeType: { CN: '执行类型', EN: 'Execute Type' },
        status: { CN: '状态', EN: 'Status' },
        instanceCount: { CN: '任务数量', EN: 'Instance Count' },
        errorInstanceCount: { CN: '失败数量', EN: 'Error Instance Count' },
        serviceName: { CN: '服务名称', EN: 'Service Name' },
        operation: { CN: '操作', EN: 'Operation' },
        confirm: { CN: '确定', EN: 'Confirm' },
        cancel: { CN: '取消', EN: 'Cancel' },
        create: { CN: '创建', EN: 'Create' },
        edit: { CN: '编辑', EN: 'Edit' },
        running: { CN: '运行', EN: 'Running' },
        runningSuccessfully: { CN: '运行成功', EN: 'Running Successfully' },
        runningFailed: { CN: '运行失败', EN: 'Running Failed' },
        enable: { CN: '启用', EN: 'Enable' },
        enableSuccessfully: { CN: '启用成功', EN: 'Enable Successfully' },
        enableFailed: { CN: '启用失败', EN: 'Enable Failed' },
        stop: { CN: '停用', EN: 'Stop' },
        stopSuccessfully: { CN: '停用成功', EN: 'Stop Successfully' },
        stopFailed: { CN: '停用失败', EN: 'Stop Failed' },
        taskList: { CN: '任务列表', EN: 'Task List' },
        copy: { CN: '复制', EN: 'Copy' },
        delete: { CN: '删除', EN: 'Delete' },
        confirmDelete: { CN: '确认删除', EN: 'Confirm Delete' },
        deletedSuccessfully: { CN: '删除成功', EN: 'Deleted Successfully' },
        deleteFailed: { CN: '删除失败', EN: 'Delete Failed' },
        pleaseEnter: { CN: '请输入', EN: 'Please Enter' },
        searchTips: { CN: '请输入队列名称、队列描述关键字', EN: 'Please enter queue name and queue description keyword' },
    };

    return {
        i18n : languageObj
    };
});

