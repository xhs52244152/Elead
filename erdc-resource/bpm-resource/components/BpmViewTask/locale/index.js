define([], function () {
    const languageObj = {
        '请输入流程编码，流程标题，流程名称': { CN: '请输入流程编码，流程标题，流程名称', EN: 'Please enter process code, process title, process name' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '知会任务无需处理！': { CN: '知会任务无需处理！', EN: 'Notify that the task does not need to be handled!' },
        '询问我的任务不能被委派！': { CN: '询问我的任务不能被委派！', EN: "The task of asking me can't be delegated!" },
        '任务委派成功': { CN: '任务委派成功', EN: "Successful task delegation" },
        '任务委派失败': { CN: '任务委派失败', EN: "Task delegation failure" },
        '委派': { CN: '委派', EN: "delegate" }
    };

    return {
        i18n: languageObj
    };
});
