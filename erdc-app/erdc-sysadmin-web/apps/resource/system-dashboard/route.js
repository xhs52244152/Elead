define(['erdcloud.kit', 'erdcloud.store'], function (ErdcKit, store) {
    return [
        // 仪表盘
        {
            path: 'dashboard',
            component: ErdcKit.asyncComponent(ELMP.resource('system-dashboard/views/DashboardView/index.js'))
        },
        // 仪表盘管理

        // 布局配置
        {
            path: 'dashboardManagement/layout',
            name: 'dashboardLayoutManage',

            component: ErdcKit.asyncComponent(ELMP.resource('system-dashboard/views/LayoutManage/index.js'))
        },
        {
            path: 'dashboardManagement/layout/:id/config',
            name: 'layoutConfig',
            component: ErdcKit.asyncComponent(ELMP.resource('system-dashboard/views/LayoutConfig/index.js')),
            beforeEnter: (to, from, next) => {
                store.dispatch('route/loadAllMenu').then(next).catch(next);
            },
            meta: {
                hidden: true,
                resourceCode: 'dashboardLayoutManage'
            }
        },
        // 卡片配置
        {
            path: 'dashboardManagement/card',
            name: 'dashboardCardManage',

            component: ErdcKit.asyncComponent(ELMP.resource('system-dashboard/views/CardManage/index.js'))
        }
    ];
});
