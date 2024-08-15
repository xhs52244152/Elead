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
        '类型': { CN: '类型', EN: 'Create Type' },
        '名称': { CN: '名称', EN: 'Name' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '请输入': { CN: '请输入', EN: 'Please Enter' },
        '开始时间': { CN: '开始时间', EN: 'Start Time' },
        '结束时间': { CN: '结束时间', EN: 'End Time' },
        '工作日': { CN: '工作日', EN: 'Weekday' },
        '节假日': { CN: '节假日', EN: 'Holiday' },
        '操作成功': { CN: '操作成功', EN: 'Operation Successful' },
    }

    return {
        i18n: languageObj
    }
})
