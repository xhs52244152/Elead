define([
    ELMP.resource('erdc-version-view/index.js')
], function (versionViewInit) {
    const ErdcKit = require('erdc-kit');
    versionViewInit.init();

    return [
        {
            path: 'versionView/list',
            name: 'versionViewList',
            meta: {
                title: '版本视图管理'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-version-view/views/list/index.js'))
        }
    ];
});
