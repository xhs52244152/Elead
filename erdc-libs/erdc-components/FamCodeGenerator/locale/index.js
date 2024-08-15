define([], function () {
    // 配置国际化key-value
    const languageObj = {
        systemDefault: { CN: '系统默认', EN: 'The system default' },
        generatedCode: { CN: '生成编码', EN: 'Generated code' },
        confirm: { CN: '确定', EN: 'Confirm' },
        cancel: { CN: '取消', EN: 'Cancel' },
        selectType: { CN: '请先选择类型', EN: 'Please select type.' },
        encodingrules: { CN: '请先关联编码规则', EN: 'Please first encoding rules.' }
    };

    return {
        i18n: languageObj
    };
});
