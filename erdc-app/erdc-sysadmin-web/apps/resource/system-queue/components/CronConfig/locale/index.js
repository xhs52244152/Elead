/**
 * i18n国际化文件
 * **/
define([], function () {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '表达式字段': { CN: '表达式字段', EN: 'The expression field' },
        '秒': { CN: '秒', EN: 'Second' },
        '分钟': { CN: '分钟', EN: 'Minute' },
        '小时': { CN: '小时', EN: 'Hour' },
        '日': { CN: '日', EN: 'Day' },
        '月': { CN: '月', EN: 'Month' },
        '星期': { CN: '星期', EN: 'Week' },
        '年': { CN: '年', EN: 'Year' },
        '允许的通配符': { CN: '允许的通配符', EN: 'Allow the wildcard [,-*/]' },
        '周期从': { CN: '周期从', EN: 'Cycle from' },
        '从': { CN: '从', EN: 'From' },
        '开始': { CN: '开始', EN: 'start' },
        '每': { CN: '每', EN: 'every' },
        '执行一次': { CN: '执行一次', EN: 'once' },
        '指定': { CN: '指定', EN: 'Specify' },
        '不指定': { CN: '不指定', EN: 'Not Specified' },
        'CRON表达式': { CN: 'CRON表达式', EN: 'CRON expression' },

    }

    return {
        i18n: languageObj
    }
})