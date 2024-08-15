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
        '请输入': { CN: '请输入', EN: 'Please enter' },
        '请点击': { CN: '请点击', EN: 'Please click' },
        '确定': { CN: '确 定', EN: 'Confirm' },
        '取消': { CN: '取 消', EN: 'Cencel' },

    }

    return {
        i18n: languageObj
    }
})