define([], function () {
    const ErdcKit = require('erdc-kit');

    return [
        {
            path: 'list',
            name: 'libraryList',
            meta: {
                noAuth: true,
                title: '资源库',
                hideSubMenus: true,
                autoRedirect: false // 不需要自动跳转到第一个子菜单，置为false
            },
            component: ErdcKit.asyncComponent(ELMP.resource('library-list/index.js'))
        }
    ];
});
