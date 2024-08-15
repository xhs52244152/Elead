define([], function () {
    const languageObj = {
        '到期日期': { CN: daysBetween => daysBetween > 0 ? `${daysBetween}天后到期` : daysBetween < 0 ? `超期${Math.abs(daysBetween)}天` : daysBetween === 0 ? '今天到期' : '', EN: daysBetween => daysBetween > 0 ? `Expire in ${daysBetween} days` : daysBetween < 0 ? `It is ${Math.abs(daysBetween)} days overdue` : daysBetween === 0 ? 'Due today' : '' },
        '进行中': { CN: '进行中', EN: 'In progress' },
        '结束': { CN: '结束', EN: 'End' },
        '挂起': { CN: '挂起', EN: 'Suspend' },
        '异常': { CN: '异常', EN: 'Anomaly' }
    };

    return {
        i18n: languageObj
    };
});
