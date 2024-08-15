define([], function () {
    const ErdcKit = require('erdc-kit');

    return [
        {
            path: 'lightweight/list',
            name: 'LightweightList',
            component: ErdcKit.asyncComponent(ELMP.resource('erdc-lightweight/views/list/index.js')),
            meta: {
                title: '轻量化转图管理'
            }
        }
    ];
});
