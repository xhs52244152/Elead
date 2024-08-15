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
        moreActions: { CN: '更多操作', EN: 'More Actions' },
        pleaseInput: { CN: '请输入', EN: 'Please Input' },
        字段设置: { CN: '字段设置', EN: 'Field Settings' },
        fieldConfig: { CN: '字段设置', EN: 'Field Settings' },
        advancedSearchTip: { CN: '高级搜索基于切换到高级搜索前的视图进行搜索', EN: 'Advanced search searches based on the view before switching to Advanced Search ' },
    };

    return {
        i18n: languageObj
    };
});
