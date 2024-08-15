define([], function () {
    const ErdcKit = require('erdc-kit');

    return [
        {
            path: 'list',
            name: 'codesignList',
            meta: {
                title: 'codesign列表'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('codesign-list/index.js'))
        }
    ];
});
