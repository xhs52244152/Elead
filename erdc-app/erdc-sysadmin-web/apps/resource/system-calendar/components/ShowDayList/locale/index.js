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
        name: { CN: '名称', EN: 'Name' },
        type: { CN: '类型', EN: 'Type' },
        startDate: { CN: '开始日期', EN: 'Start date' },
        endDate: { CN: '结束日期', EN: 'End date' },
        add: { CN: '添加节假日', EN: 'Add holidays' },
        delete: { CN: '删除选中节假日', EN: 'Delete selected holidays' },
        '该年度还没有设置节假日': { CN: '该年度还没有设置节假日', EN: 'There are no holidays set for this year yet' },
        pleaseEnter: { CN: '请输入', EN: 'Please Enter' },
        confirmDelete: { CN: '确认删除选中的节假日？', EN: 'Are you sure to delete the selected holiday?' },
        confirmDeleteTips: { CN: '确认删除', EN: 'Confirm Delete' },
        confirm: { CN: '确定', EN: 'Confirm' },
        cancel: { CN: '取消', EN: 'Cancel' },
        successfullyDelete: { CN: '删除成功', EN: 'Successfully Delete' },
        cannotModified: { CN: '上下文日历不能修改', EN: 'Context calendar cannot be modified' },
        holiday: { CN: '节假日', EN: 'Holiday' },
        weekday: { CN: '工作日', EN: 'Weekday' },
        yearSettings: { CN: '本年度节假日设置', EN: 'Holiday settings for this year' },
    };

    return {
        i18n: languageObj
    };
});
