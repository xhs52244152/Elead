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
        '任务详情': { CN: '任务详情', EN: 'The task details' },
        '刷新': { CN: '刷新', EN: 'Refresh' },
        '任务ID': { CN: '任务ID', EN: 'Task ID' },
        '状态': { CN: '状态', EN: 'Status' },
        '运行次数': { CN: '运行次数', EN: 'Run number' },
        'T地址': { CN: 'TaskTracker 地址', EN: 'TaskTracker address' },
        '预计执行时间': { CN: '预计执行时间', EN: 'Expect the execution time' },
        '开始时间': { CN: '开始时间', EN: 'The start time' },
        '结束时间': { CN: '结束时间', EN: 'The end time' },
        '任务参数': { CN: '任务参数', EN: 'Task Parameter' },
        '结果': { CN: '结果', EN: 'Result' },
        '获取详情失败': { CN: '获取详情失败', EN: 'Failed details' },

    }

    return {
        i18n: languageObj
    }
})