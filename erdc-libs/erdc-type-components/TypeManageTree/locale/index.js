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
        searchKeyword: { CN: '搜索关键字', EN: 'Search Keyword' },
        completeExport: { CN: '全量导出', EN: 'Complete Export' },
        createType: { CN: '创建类型', EN: 'Create Type' },
        editType: { CN: '编辑类型', EN: 'Edit Type' },
        successfullyDelete: { CN: '删除成功', EN: 'Successfully Delete' },
        deleteFailed: { CN: '删除失败', EN: 'Delete Failed' },
        modelConfig: { CN: '模型配置', EN: 'Model configuration' }
    };

    return {
        i18n: languageObj
    };
});
