define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'tenant/tenantManagement',
            name: 'tenantManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-tenant/views/TenantManagement/index.js'))
        }
    ];
});
