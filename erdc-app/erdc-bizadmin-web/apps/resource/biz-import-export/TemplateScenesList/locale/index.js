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
        模板业务编码: { CN: '模板业务编码', EN: 'Template Business Code' },
        模板分类名称: { CN: '模板分类名称', EN: 'Template classification name' },
        noCurrentTenant: { CN: '非当前租户数据禁止操作', EN: 'Non-current tenant data cannot be performed' },
        createImportExportTemplateCategories: {
            CN: '创建导入导出模板类别',
            EN: 'Create import export template categories'
        },
        createImportExportTemplate: {
            CN: '创建导入导出模板',
            EN: 'Create import export template'
        },
        exporting: {
            CN: '系统正在导出，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport&refresh=true" target="erdc-portal-web">工作台-操作记录-我的导出页面</a>查看',
            EN: 'The system is exporting, check on the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport&refresh=true" target="erdc-portal-web">workbench > Operation Record</a> page.'
        },
    };

    return {
        i18n: languageObj
    };
});
