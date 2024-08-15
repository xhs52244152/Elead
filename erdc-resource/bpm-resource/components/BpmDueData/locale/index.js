define([], function () {
    const languageObj = {
        '到期日期': { CN: daysBetween => daysBetween > 0 ? `${daysBetween}天后到期` : daysBetween < 0 ? `超期${Math.abs(daysBetween)}天` : '今天到期', EN: daysBetween => daysBetween > 0 ? `Expire in ${daysBetween} days` : daysBetween < 0 ? `It is ${Math.abs(daysBetween)} days overdue` : 'Due today' }
    };

    return {
        i18n: languageObj
    };
});
