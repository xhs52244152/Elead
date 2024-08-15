define([], function () {
    const ErdcKit = require('erdc-kit');

    return [
        {
            path: 'list',
            name: 'productList',
            meta: {
                title: '产品'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('product-list/index.js'))
        }
    ];
});
