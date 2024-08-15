define(['erdcloud.kit', 'erdcloud.router'], function (ErdcloudKit, ErdcloudRouter) {
    return [
        {
            path: 'docTmpl',
            name: 'docTmpl',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-signature/docTmpl/index.js'))
        },
        {
            path: 'docTmpl/history/:code',
            name: 'signatureDocTmplHistory',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-signature/docTmpl/docTmplHistory/index.js')),
            beforeEnter: function (to, from, next) {
                if (_.isEmpty(from.matched)) {
                    let route = ErdcloudRouter.match(`${to.meta.prefixRoute}/docTmpl`);
                    to.meta.resourceCode = route?.meta.resourceCode;
                } else {
                    to.meta.resourceCode = from?.meta.resourceCode;
                }
                next();
            },
            meta: {
                hidden: true,
                title: '签章模板历史记录'
            }
        },
        {
            path: 'signatureManage',
            name: 'signatureManage',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-signature/signatureManage/index.js')),
            meta: {
                title: '签章管理',
                resourceCode: 'signature:manage'
            }
        },
        {
            path: 'signatureManage/history/:code',
            name: 'signatureManageHistory',
            component: ErdcloudKit.asyncComponent(
                ELMP.resource('biz-signature/signatureManage/signatureHistory/index.js')
            ),
            meta: {
                resourceCode: 'signature:manage',
                keepAlive: false,
                hidden: true
            }
        },
        {
            path: 'watermarkManage',
            name: 'watermarkManage',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-signature/watermarkManage/index.js')),
            meta: {
                title: '水印管理',
                resourceCode: 'signature:watermark'
            }
        },
        {
            path: 'taskCenter',
            name: 'taskCenter',
            component: ErdcloudKit.asyncComponent(ELMP.resource('biz-signature/taskCenter/index.js')),
            meta: {
                title: '任务中心',
                resourceCode: 'signature:taskCenter'
            }
        }
    ];
});
