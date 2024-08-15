define([], function () {
    const languageObj = {
        '组件提示': { CN: (o, t) => `请${(o === 'i' ? '输入' : '选择') + '' + t}`, EN: (o, t) => `Please ${(o === 'i' ? 'input' : 'select') + ' ' + t}` },
        '转办': { CN: '转办', EN: 'transfer' },
        '代办': { CN: '代办', EN: 'agent' },
        '委派': { CN: '委派', EN: 'delegate' },
        '处理人': { CN: '处理人', EN: 'handler' },
        '委派原因': { CN: '委派原因', EN: 'Reason for delegation' },
        '备注': { CN: '备注', EN: 'remarks' },
        '请输入备注': { CN: '请输入备注', EN: 'Please enter remarks' },
        '转办提示': { CN: '将任务转给他人处理，责任人是被转办人', EN: 'Transfer the task to another person, and the person responsible is the transferee' },
        '代办提示': { CN: '将任务委托他人处理，责任人是当前用户', EN: 'Delegate tasks to others, The responsible person is the current user' }
    };

    return {
        i18n: languageObj
    };
});
