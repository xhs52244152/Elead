define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            path: 'securityLevelConfig',
            name: 'securityLevelConfig',
            component: ErdcKit.asyncComponent(ELMP.resource('system-data-security/views/SecurityLevelConfig/index.js'))
        },
        {
            path: 'auditLog',
            name: 'auditLog',
            component: ErdcKit.asyncComponent(ELMP.resource('system-data-security/views/AuditLog/index.js'))
        },
        {
            path: 'auditPolicyConfig',
            name: 'auditPolicyConfig',
            component: ErdcKit.asyncComponent(ELMP.resource('system-data-security/views/AuditPolicyConfig/index.js'))
        },
    ];
});
