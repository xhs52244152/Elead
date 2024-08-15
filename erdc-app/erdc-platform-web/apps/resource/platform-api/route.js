define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: '',
            name: 'apiManagement',
            component: {
                render(h) {
                    return h('router-view');
                }
            },
            children: [
                {
                    path: 'interface',
                    name: 'interface',
                    component: ErdcKit.asyncComponent(ELMP.resource('platform-api/views/ApiManagement/index.js'))
                },
                {
                    path: 'allowList',
                    name: 'allowList',
                    component: ErdcKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js'))
                },
                {
                    path: 'denyList',
                    name: 'denyList',
                    component: ErdcKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js'))
                },
                {
                    path: 'changeRecord',
                    name: 'changeRecords',
                    component: ErdcKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js'))
                }
            ]
        },
        {
            path: 'interfaceDoc',
            name: 'interfaceDoc',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-api/views/InterfaceDoc/index.js')),
            meta: {
                resourceCode: 'interfaceManagement',
                title(route, resource) {
                    return route.query.title || resource?.name || route.path;
                },
                keepAlive: false
            }
        },
        {
            path: 'dubboDoc',
            name: 'dubboDoc',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-api/views/DubboDoc/index.js')),
            meta: {
                resourceCode: 'interfaceManagement',
                title(route, resource) {
                    return route.query.title || resource?.name || route.path;
                },
                keepAlive: false
            }
        },
        {
            path: 'compareRest',
            name: 'compareRest',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-api/components/CompareDoc/rest/index.js')),
            meta: {
                resourceCode: 'interfaceManagement',
                hidden: true,
                title: 'Rest对比报告'
            }
        },
        {
            path: 'compareDubbo',
            name: 'compareDubbo',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-api/components/CompareDoc/dubbo/index.js')),
            meta: {
                resourceCode: 'interfaceManagement',
                hidden: true,
                title: 'dubbo对比报告'
            }
        }
    ];
});
