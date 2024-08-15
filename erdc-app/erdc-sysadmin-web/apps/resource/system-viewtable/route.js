define(['erdcloud.kit'], function (ErdcKit) {
    return [
        // 视图表格
        {
            path: 'viewtable',
            component: ErdcKit.asyncComponent(ELMP.resource('system-viewtable/views/ViewTableManagement/index.js')),
            name: 'viewManagement'
        }
    ];
});
