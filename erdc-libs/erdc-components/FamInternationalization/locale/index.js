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
        '请输入': { CN: '请输入', EN: 'Please input' },
        '请点击': { CN: '请点击', EN: 'Please click' },
        '确定': { CN: '确 定', EN: 'Confirm' },
        '取消': { CN: '取 消', EN: 'Cencel' },
        '属性': { CN: '属性', EN: 'Attribute' },
        '主文本': { CN: '主文本', EN: 'Main Text' },
        '提示信息': { CN: '当找不到语言环境下的翻译时，使用此文本', EN: "When translation can't find the language environment, use the text" },
        '基本信息': { CN: '基本信息', EN: "Basic information" },
        '语言': { CN: '语言', EN: "Language" },
        '国际化': { CN: '国际化', EN: "Internationalization" },
        '填写多语言信息，可在不同语言环境下，正确显示信息': { CN: '填写多语言信息，可在不同语言环境下，正确显示信息', EN: "Enter multi-language information to correctly display information in different language environments" }

    }

    return {
        i18n: languageObj
    }
})