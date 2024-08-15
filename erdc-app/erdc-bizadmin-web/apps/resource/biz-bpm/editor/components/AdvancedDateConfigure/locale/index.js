define([], function() {
    const languageObj = {
        'dateConfigure': { CN: '到期时间', EN: 'Expiration date' },
        'setDueTime': { CN: '设置到期时间', EN: 'Expiration time' },
        'setFixTime': { CN: '设置流程启动到结束时间', EN: 'Time from start to end of the process' },
        'setNotifier': { CN: '设置流程到期通知人', EN: 'Process expiration notifier' },
        'notifyParticipants': { CN: '通知任务参与者', EN: 'Notify task participants' },
        'notifyInitiator': { CN: '通知流程启动者', EN: 'Notify process initiator' },
        'notifyRoles': { CN: '通知所选角色', EN: 'Notify Selected Roles' },
        'notifyUsers': { CN: '通知所选用户', EN: 'Notify Selected Users' },
        'setNotifyTime': { CN: '设置到期通知时间', EN: 'Expiration notice time' },
        'setNotifyDate': { CN: '选择日期', EN: 'Enter expiration time' },
        'day': { CN: '天', EN: 'Day(s)' },
        'hour': { CN: '时', EN: 'Hour(s)' },
        'before': { CN: '前，', EN: 'before' },
        'after': { CN: '后，', EN: 'after' },
        'dueDate': { CN: '任务到期', EN: 'Due date' },
        'sendReminder': { CN: '发送提醒', EN: 'Send reminder' },
        'beforeDueDate': { CN: '任务到期日期之前', EN: 'Before task due date' },
        'afterDueDate': { CN: '任务到期日期之后', EN: 'After Task Due Date' },
        'notifyTemplate': { CN: '通知所选消息模板', EN: 'Notify the selected message template' },
        'notifySendType': { CN: '发送类型', EN: 'Send type' },
    };

    return {
        i18n: languageObj
    };
});
