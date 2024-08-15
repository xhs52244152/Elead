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
        confirmDelete: { CN: '确认删除当前日历吗？', EN: 'Are you sure to delete the current calendar?' },
        confirmDeleteTips: { CN: '确认删除', EN: 'Confirm Delete' },
        confirm: { CN: '确定', EN: 'Confirm' },
        cancel: { CN: '取消', EN: 'Cancel' },
        successfullyDelete: { CN: '删除成功', EN: 'Successfully Delete' },
        cannotModified: { CN: '上下文日历不能修改', EN: 'Context calendar cannot be modified' },
        legend: { CN: '图例', EN: 'Legend' },
        working: { CN: '正常工作日', EN: 'Normal working days' },
        holiday: { CN: '节假日', EN: 'Holiday' },
        weekday: { CN: '工作日', EN: 'Weekday' },
        tips: {
            CN: '在日历上点击、拖拽鼠标可以选择多个日期，快速设置放假时间。(仅支持同一月份)',
            EN: 'Click and drag the mouse on the calendar to select multiple dates and quickly set vacation time. (Only supports the same month)'
        },
        calendarConfig: { CN: '日历配置', EN: 'Calendar Configuration' },
        newCalendar: { CN: '创建日历', EN: 'New Calendar' },
        default: { CN: '默认', EN: 'Default' },
        systemCalendar: { CN: '系统日历', EN: 'System Calendar' }
    };

    return {
        i18n: languageObj
    };
});
