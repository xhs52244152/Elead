define([], function () {
    const languageObj = {
        belongProject: {
            CN: '所属项目',
            EN: 'belongProject'
        },
        projectModule: {
            CN: '项目模板',
            EN: 'projectModule'
        },
        foldersNotAllowed: {
            CN: '所选数据存在文件夹，无法发起流程',
            EN: 'The selected data exists in a folder, and the process cannot be initiated'
        },
        foldersHasNotWorkerStatus: {
            CN: '所选数据存在非正在工作状态的文档，无法发起流程',
            EN: 'The selected data has a document that is not in working status. The process cannot be initiated'
        },
        foldersNotCheckData: {
            CN: '未勾选数据，请选择',
            EN: 'Data is not checked, please select'
        }
    };

    return { i18n: languageObj };
});
