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
        '搜索关键字': { CN: '搜索关键字', EN: 'Search keyword' },
        '组件管理': { CN: '组件管理', EN: 'Component management' },
        '更多操作': { CN: '更多操作', EN: 'More Actions' },
        '全量导入': { CN: '全量导入', EN: 'Complete Import' },
        '全量导出': { CN: '全量导出', EN: 'Complete Export' },
        '数据类型': { CN: '数据类型', EN: 'Data type' },
        '数据类型管理': { CN: '数据类型管理', EN: 'Data type management' },
    }

    return {
        i18n: languageObj
    }
})
