define([], function() {
    const i18n = {
        'timedEvent': { CN: '定时事件', EN: 'timed event' },
        'timedEventTips': { CN: '定时器事件请选择其中一个计时方式按格式填写。', EN: 'Please select one timing method for the timer event and fill in the format accordingly' },
        'cycleTime': { CN: '时间周期', EN: 'Cycle time' },
        'dateTime': { CN: '日期时间', EN: 'Date Time' },
        'duration': { CN: '持续时间', EN: 'Duration' },
        'R3/PT10H': { CN: '例如 R3/PT10H', EN: 'For example, R3/PT10H' },
        'ISO-8601': { CN: '采用ISO-8601日期时间', EN: 'Adopting ISO-8601 Date Time' },
        'PT5M': { CN: '例如 PT5M', EN: 'For example, PT5M' },
        'requiredTips': { CN: '定时器事件请选择其中一个计时方式按格式填写', EN: 'Please select one timing method for the timer event and fill in the format accordingly' },
        'cycleTimeTips': { CN: 'R数字/PT数字S/M/H，例如R2/PT1M表示执行两次，每次间隔1分钟', EN: 'R number/PT number S/M/H, for example, R2/PT1M means to execute twice, with a 1-minute interval between each execution' },
        'dateTimeTips': { CN: 'ISO 时间，YYYY-MM-DDThh:mm:ss, 例如2016-06-01T14:41:36', EN: 'ISO time, YYYY-MM-DDThh: mm: ss, for example, 2016-06-01T14:41:36' },
        'durationTips': { CN: 'PT数字S/M/H，例如PT5M表示5分钟后执行', EN: 'PT digital S/M/H, for example PT5M means execute after 5 minutes' },
    };

    return {
        i18n
    };
});
