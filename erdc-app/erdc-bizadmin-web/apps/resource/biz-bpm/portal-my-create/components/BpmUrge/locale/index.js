define([], function () {
    const languageObj = {
        内容: { CN: '内容', EN: 'content' },
        请输入内容: { CN: '请输入内容', EN: 'Please enter the content' },
        催办人员: { CN: '催办人员', EN: 'solicitor' },
        通知方式: { CN: '通知方式', EN: 'Mode of notification' },
        组件提示: {
            CN: (o, t) => `请${(o === 'i' ? '输入' : '选择') + '' + t}`,
            EN: (o, t) => `Please ${(o === 'i' ? 'input' : 'select') + ' ' + t}`
        },
        message: { CN: '站内信', EN: 'Station message' },
        邮件: { CN: '邮件', EN: 'mail' }
    };

    return {
        i18n: languageObj
    };
});
