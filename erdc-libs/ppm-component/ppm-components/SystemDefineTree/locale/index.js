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
        请输入: { CN: '请输入', EN: 'Enter' },
        创建: { CN: '创建', EN: 'Create' },
        更多操作: { CN: '更多操作', EN: 'More Actions' },
        全量导入: { CN: '全量导入', EN: 'Import' },
        全量导出: { CN: '全量导出', EN: 'Export' },
        添加基本信息配置: { CN: '添加基本信息配置', EN: 'Add basic information configuration' },
        创建特征定义: { CN: '创建特征定义', EN: 'Create Feature' },
        属性定义: { CN: '属性定义', EN: 'Attribute definitions' },
        特征定义: { CN: '特征定义', EN: 'Feature definitions' },
        特征定义集合: { CN: '特征定义集合', EN: 'Feature definitions collection' }
    };

    return {
        i18n: languageObj
    };
});