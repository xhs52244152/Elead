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
        'add_conditions': { CN: '添加条件', EN: 'Add Conditions'},
        'add_conditions_group': { CN: '添加条件组', EN: 'Add Conditions Group' },
        'tips_no_value': { CN: '已添加的条件未填写完整', EN: 'The added conditions are not complete'},
        'select_too_long': { CN: '选择条件字符超长', EN: 'Select condition characters that are too long'},
        'clear': { CN: '清空', EN: 'Clear' },
        'search': { CN: '搜索', EN: 'Search' },
        'expand': { CN: '展开', EN: 'Expand' },
        'folded': { CN: '收起', EN: 'Folded' },
        'history_filters': { CN: '历史筛选', EN: 'History Filters' },
        'history_filters_manage': { CN: '管理历史筛选', EN: 'History Filter Management' },
        'history_filters_select': { CN: '选择历史筛选', EN: 'Select History Filters' },
        'and': { CN: '且', EN: 'And' },
        'or': { CN: '或', EN: 'Or' },
        'save': { CN: '保存', EN: 'Save' },
        'yes': { CN: '是', EN: 'Yes' },
        'no': { CN: '否', EN: 'No' },
        'equalAnyTips': { CN: '值1,值2,...(用英文逗号隔开)', EN: 'Value 1, value 2,... (Separated by commas)' },
    }

    return {
        i18n: languageObj
    }
})
