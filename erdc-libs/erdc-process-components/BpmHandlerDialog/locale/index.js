define([], function () {
    const languageObj = {
        urging: { CN: '催办', EN: 'Urging' },
        delegate: { CN: '委派', EN: 'Delegate' },
        suspend: { CN: '暂停', EN: 'Suspend' },
        cancelSuspend: { CN: '取消暂停', EN: 'Cancel Suspend' },
        terminate: { CN: '终止', EN: 'Terminate' },
        processFlow: { CN: '处理流程', EN: 'Process Flow' },
        urgeSuccess: { CN: '任务催办成功', EN: 'Task urging successfully' },
        delegateSuccess: { CN: '任务委派成功', EN: 'Task delegate successfully' },
        sureToSuspend: { CN: '确定暂停该流程吗？', EN: 'Are you sure to suspend the process' },
        suspendSuccess: { CN: '流程暂停成功', EN: 'Process suspend successfully' },
        suspendFail: { CN: '流程暂停失败', EN: 'Process suspend failed' },
        sureToActivate: { CN: '确定激活该流程吗？', EN: 'Are you sure to activate this process' },
        cancelSuspendSuccess: { CN: '流程激活成功', EN: 'Process activated successfully' },
        cancelSuspendFail: { CN: '流程激活失败', EN: 'Process activated failed' },
        terminateSuccess: { CN: '任务终止成功', EN: 'Task terminated successfully' },
        withdrawSuccess: { CN: '任务撤回成功', EN: 'Task withdrew successfully' },
    }

    return {
        i18n: languageObj
    }
})
