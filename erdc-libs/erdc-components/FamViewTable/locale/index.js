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
        '另存为视图': {CN: '另存为视图', EN: 'Save as View'},
        '是否放弃编辑': { CN: '您是否确定放弃已更改内容？', EN: 'Are you sure you want to discard the changed content?'},

         // 视图表格表单国际化
         '显示名称': { CN: '显示名称', EN: 'Display Name' },
         '主类型': { CN: '主类型', EN: 'Main Type'},
         '类型': { CN: '类型', EN: 'Type'},

         '可选列表': { CN: '可选列表', EN: 'Optional List'},
         '已选列表': { CN: '已选列表', EN: 'Selected List'},

         // 视图列表国际化
         '视图名称': { CN: '视图名称', EN: 'View Name'},
         '负责人': { CN: '负责人', EN: 'Person Liable'},
         '默认视图': { CN: '默认视图', EN: 'Default View'},
         '启动视图': { CN: '启动视图', EN: 'Enable View'},
         '视图类型': { CN: '视图类型', EN: 'View Type'},
         '描述': { CN: '描述', EN: 'Description'},

         '系统视图': { CN: '系统视图', EN: 'System View'},
         '个人视图': { CN: '个人视图', EN: 'Personal View'},
         '冻结列数': { CN: '冻结列数', EN: 'FrozenColumns'},
         '冻结提示': { CN: '冻结规则为从左到右的列数', EN: 'The freezing rule is the number of columns from left to right'},
         '高级筛选': { CN: '高级筛选', EN: 'Advanced filtering'},
         '分类搜索': { CN: '分类搜索', EN: 'Classify Search'},
    }

    return {
        i18n: languageObj
    }
})
