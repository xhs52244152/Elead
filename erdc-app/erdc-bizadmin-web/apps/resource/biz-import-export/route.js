define(['erdcloud.kit'], function (ErdcloudKit) {
    return [
        // 统一导入
        {
            path: 'importAndExport/taskTabPanelImport',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-import-export/ImportAndExportTaskList/index.js')),
            name: 'taskTabPanelImport',
            meta: {
                resourceCode: 'taskTabPanelImport'
            }
        },

        // 统一导出
        {
            path: 'importAndExport/taskTabPanelExport',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-import-export/ImportAndExportTaskList/index.js')),
            name: 'taskTabPanelExport',
            meta: {
                resourceCode: 'taskTabPanelExport'
            }
        },

        // 导入导出模板
        {
            path: 'importAndExport/templateTabPanel',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-import-export/TemplateScenesList/index.js')),
            name: 'templateTabPanel',
            meta: {
                resourceCode: 'templateTabPanel'
            }
        },
        {
            path: 'myImportExport',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-import-export/views/MyTaskRecords/index.js'))
        }
    ];
});
