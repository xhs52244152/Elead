define([], function () {
    const languageObj = {
        export: {
            CN: '导出',
            EN: 'Export'
        },
        exportTips: {
            CN: '请选择导出模板后点击“确定”导出，导出的文档支持直接导入',
            EN: 'Note Select the template and click OK to export the exported document. You can import the exported document directly.'
        },
        configureTemplate: {
            CN: '请配置模板',
            EN: 'Please configure templates'
        },
        template: {
            CN: '模板',
            EN: 'Template'
        },
        exporting: {
            CN: '系统正在导出，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport&refresh=true" target="erdc-portal-web">工作台-操作记录-我的导出页面</a>查看',
            EN: 'The system is exporting, check on the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport&refresh=true" target="erdc-portal-web">workbench > Operation Record</a> page.'
        },
        note: {
            CN: '注意：',
            EN: 'Note: '
        }
    };

    return { i18n: languageObj };
});
