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
        '日历基本信息': { CN: '日历基本信息', EN: 'Calendar Basic Information' },
        '工作周期设置': { CN: '工作周期设置', EN: 'Work cycle settings' },
        '常规工作周期设置': { CN: '常规工作周期设置', EN: 'General work cycle settings' },
        '例外工作时间': { CN: '例外工作时间', EN: 'Exceptional working hours' },
        '日历类型': { CN: '日历类型', EN: 'Calendar type' },
        '名称': { CN: '名称', EN: 'Name' },
        '是否默认': { CN: '是否默认', EN: 'Default or not' },
        '状态': { CN: '状态', EN: 'Status' },
        '常规工作周': { CN: '常规工作周', EN: 'Regular work week' },
        '例外周期': { CN: '例外周期', EN: 'Exceptional period' },
        '重复频率': { CN: '重复频率', EN: 'Repetition frequency' },
        '重复次数': { CN: '重复次数', EN: 'Repetitions' },
        '帮助': { CN: '帮助', EN: 'Help' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '请输入': { CN: '请输入', EN: 'Please Enter' },
        '请选择': { CN: '请选择', EN: 'Please Select' },
        '启用': { CN: '启用', EN: 'Enabled' },
        '禁用': { CN: '禁用', EN: 'Disabled' },
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },
        '上下文日历不能修改': { CN: '上下文日历不能修改', EN: 'Context calendar cannot be modified' },
        week: { CN: '周', EN: 'Week' },
        month: { CN: '月', EN: 'Month' },
        first: { CN: '第一个', EN: 'First' },
        second: { CN: '第二个', EN: 'Second' },
        third: { CN: '第三个', EN: 'Third' },
        fourth: { CN: '第四个', EN: 'Fourth' },
        fifth: { CN: '第五个', EN: 'Fifth' },
        lastOne: { CN: '最后一个', EN: 'Last one' },
        sunday: { CN: '周日', EN: 'Sunday' },
        monday: { CN: '周一', EN: 'Monday' },
        tuesday: { CN: '周二', EN: 'Tuesday' },
        wednesday: { CN: '周三', EN: 'Wednesday' },
        thursday: { CN: '周四', EN: 'Thursday' },
        friday: { CN: '周五', EN: 'Friday' },
        saturday: { CN: '周六', EN: 'Saturday' },
        repeat: { CN: '重复', EN: 'Repeat' },
        noLimit: { CN: '不限', EN: 'No limit' },
        contextCalendar: { CN: '上下文日历', EN: 'Context Calendar' },
        systemCalendar: { CN: '系统日历', EN: 'System Calendar' },
        to: { CN: '至', EN: 'To' },
        every: { CN: '每', EN: 'Every' },
    }

    return {
        i18n: languageObj
    }
})
