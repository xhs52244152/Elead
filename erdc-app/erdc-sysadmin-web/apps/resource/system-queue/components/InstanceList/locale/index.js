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
        '触发时间': { CN: '触发时间', EN: 'Triggering time' },
        '开始日期': { CN: '开始日期', EN: 'Start date' },
        '结束日期': { CN: '结束日期', EN: 'End date' },
        '详情': { CN: '详情', EN: 'Details' },
        '日志': { CN: '日志', EN: 'LOG' },
        '更多': { CN: '更多', EN: 'More' },
        '重试': { CN: '重试', EN: 'Retry' },
        '停止': { CN: '停止', EN: 'stop' },
        '队列ID': { CN: '队列ID', EN: 'Task ID' },
        '任务列表': { CN: '任务列表', EN: 'The task list' },
        '队列名称': { CN: '队列名称', EN: 'Quest Name' },
        '队列任务ID': { CN: '队列任务ID', EN: 'Queue task ID' },
        '状态': { CN: '状态', EN: 'Status' },
        '结束时间': { CN: '结束时间', EN: 'End Time' },
        '节点信息': { CN: '节点信息', EN: 'Node information' },
        '重试成功': { CN: '重试成功', EN: 'Retry is successful' },
        '停止成功': { CN: '停止成功', EN: 'Stop success' },
        '停止失败': { CN: '停止失败', EN: 'Pause and Lose' },
        '操作': { CN: '操作', EN: 'Operation' },

    }

    return {
        i18n: languageObj
    }
})