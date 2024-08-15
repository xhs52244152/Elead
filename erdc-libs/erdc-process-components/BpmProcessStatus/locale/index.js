define([], function () {
    const languageObj = {
        'running': { CN: '进行中', EN: 'Running' },
        'completed': { CN: '结束', EN: 'Completed' },
        'suspended': { CN: '挂起', EN: 'Suspended' },
        'exception': { CN: '异常', EN: 'Exception' }
    };

    return {
        i18n: languageObj
    };
});
