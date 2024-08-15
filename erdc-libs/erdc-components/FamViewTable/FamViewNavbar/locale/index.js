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
        'moreViews': { CN: '更多', EN: 'More Views' },
        '视图管理': { CN: '视图管理', EN: 'View Manager'},
        '配置个人视图': { CN: '配置个人视图', EN: 'Configure Personal View'},
        '自动记忆上次查看的视图': { CN: '自动记忆上次查看的视图', EN: 'Automatically remember the last view viewed'}
    }

    return {
        i18n: languageObj
    }
})
