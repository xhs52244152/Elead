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
        'tips_enter': { CN: '请输入', EN: 'Please Enter' },
        'tips_select': { CN: '请选择', EN: 'Please Select' },
        'yes': { CN: '是', EN: 'Yes' },
        'no': { CN: '否', EN: 'No' },
        'remove_condition': { CN: '移除条件', EN: 'Remove condition' },
        'clear_value': { CN: '清空值', EN: 'Clear value' },
        'tips_enter_name': { CN: (name) => `请输入${name}` , EN: (name) => `Please Enter ${name}` }
    }

    return {
        i18n: languageObj
    }
})
