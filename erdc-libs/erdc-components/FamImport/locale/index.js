define([], function () {
    const languageObj = {
        import: {
            CN: '导入',
            EN: 'Import'
        },
        downloadTips: {
            CN: '请下载模板后更新数据再导入',
            EN: 'Download the template, update the data, and import the template.'
        },
        uploadFile: {
            CN: '上传文件',
            EN: 'Upload file'
        },
        downloadTemplate: {
            CN: '下载模板',
            EN: 'Download template'
        },
        noTemplate: {
            CN: '未找到模板，请先联系业务管理员配置模板',
            EN: 'If no template is found, contact the service administrator to configure the template.'
        },
        isDeleteAttachments: {
            CN: '是否删除附件',
            EN: 'Whether to delete attachments.'
        },
        isDelete: {
            CN: '是否删除',
            EN: 'Whether it is deleted.'
        },
        uploadFileFirst: {
            CN: '请先上传文件',
            EN: 'Please upload the file first.'
        },
        systemImport: {
            CN: '系统正在导入，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelImport&refresh=true" target="erdc-portal-web">工作台-操作记录-我的导入页面</a>查看',
            EN: 'The system is importing, please go to the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelImport&refresh=true" target="erdc-portal-web">workbench - Operation record - My import</a> interface to check.'
        },
        note: {
            CN: '注意：',
            EN: 'Note: '
        }
    };

    return { i18n: languageObj };
});
