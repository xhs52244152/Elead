/**
 * i18n国际化文件
 * **/
define([], function () {
    /**
     * 国际化key建议统一用中文作为key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
        tips_input_number_or_name: { CN: '请输入编码、名称', EN: 'Please Enter Number or Name' },
        tips_select_data: { CN: '请选择数据', EN: 'Please Select Data' },
        confirm: { CN: '确定', EN: 'Confirm' },
        cancel: { CN: '取消', EN: 'Cancel' },
        field_setting: { CN: '字段设置', EN: 'Field Settings' },
        NullPrompt: {
            CN: '请选择对象',
            EN: 'Please select an object'
        }
    };

    return {
        i18n: languageObj
    };
});
