require(['/erdc-libs/erdc-app/index.js'], function (startApp) {
    startApp({
        appName: 'erdc-codesign-web',
        appVersion: '__VERSION__',
        // devMenus: [
        //     {
        //         meta: {},
        //         name: 'codesignList',
        //         identifierNo: 'codesignList',
        //         href: '/container/codesign-list/list'
        //     },
        //     {
        //         meta: {},
        //         name: 'codesignLogin',
        //         identifierNo: 'codesignLogin',
        //         href: '/container/codesign-login/login'
        //     }
        // ],
        // devResources: [
        //     {
        //         name: 'codesign库',
        //         code: 'codesign-list',
        //         parentCode: 'erdc-codesign-web'
        //     },
        //     {
        //         name: 'codesign库',
        //         code: 'codesign-login',
        //         parentCode: 'erdc-codesign-web'
        //     }
        // ],
        beforeCreate() {
            require(['erdcloud.router'], function (router) {
                router.beforeEach((to, from, next) => {
                    // 判断要进入的路由，强制跳转到工具端提供的登录页面
                    if (to.name == 'login') {
                        // 强制进到
                        location.href = '/erdc-app/erdc-codesign-web/apps/resource/codesign-login/plugin/index.html';
                    } else {
                        // 如果不需要登录，直接进入
                        next();
                    }
                });
            });
        },
        mounted: function () {
            document.querySelector('#global-loading').style.display = 'none';
        }
    });
});
