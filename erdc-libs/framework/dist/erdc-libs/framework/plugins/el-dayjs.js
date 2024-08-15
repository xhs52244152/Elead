define(['dayjs', 'dayjs-advancedFormat', 'dayjs-weekOfYear', 'dayjs-isBetween', 'erdcloud.i18n'], function (
    dayjs,
    advancedFormat,
    weekOfYear,
    isBetween
) {
    dayjs.extend(advancedFormat);
    dayjs.extend(weekOfYear);
    dayjs.extend(isBetween);
    window.dayjs = dayjs;
    return dayjs;
});
