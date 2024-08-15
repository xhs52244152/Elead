define([], function () {
    const languageObj = {
            'processingNode': { CN: '处理节点', EN: 'Processing node' },
            'participant': { CN: '参与者', EN: 'Participant' },
            'user': { CN: '处理人', EN: 'User' },
            'result': { CN: '处理结果', EN: 'Results' },
            'elapsed': { CN: '处理时长', EN: 'Elapsed' },
            'time': { CN: '处理时间', EN: 'Time' },
            'opinion': { CN: '处理意见', EN: 'Opinions' },
            'lessThanOneHour': { CN: '小于一小时', EN: 'Less than one hour' },
            'hour': { CN: '小时', EN: 'Hour' },
            'day': { CN: '天', EN: 'Day' }
        }

    return {
        i18n: languageObj
    }
})
