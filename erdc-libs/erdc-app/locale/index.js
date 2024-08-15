define([], function () {
    const i18n = {
        sessionLose: { CN: '会话失效,是否刷新页面', EN: 'The session is invalid. Check whether to refresh the page' },
        emptyResource: {
            CN: '当前应用下无可访问的页面，请联系管理员处理。<br />正在跳转到<a ref="${appUrl}" target="_self">默认应用</a>（${countDown}）',
            EN: 'No reachable resource. Please contact the administrator for assistance.\nRedirecting to <a ref="${appUrl}" target="_self">the Default Application</a>(${countDown})'
        },
        downloadingAndWatermark: {
            CN: '系统正在下载，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">工作台-操作记录-我的导出页面</a>查看',
            EN: 'The system is downloading, check on the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">workbench > Operation Record</a> page.'
        },
        firstLoginTitle: { CN: '首次登录修改密码', EN: 'First login change password' },
        firstLoginDesc: {
            CN: '欢迎登录系统，为了确保账号数据安全，请先修改密码后再使用<br/><a onclick="updatePass()">立即修改密码>></a>',
            EN: 'Welcome to log in the system, in order to ensure the security of the account data, please change the password before using<br/><a onclick="updatePass()">Change password immediately>></a>'
        },
        forcedLoginTitle: { CN: '重置密码', EN: 'Reset password' },
        forcedLoginDesc: {
            CN: '欢迎登录系统，您的账号已被管理员重置密码，为了确保账号数据安全，请先修改密码后再使用<br/><a onclick="updatePass()">立即修改密码>></a>',
            EN: 'Welcome to log in to the system, your account has been reset by the administrator, in order to ensure the security of the account data, please change the password before using<br/><a onclick="updatePass()">Change password immediately>></a>'
        },
        signOut: { EN: 'Sign Out', CN: '退出登录' },
        confirm: { EN: 'Confirm', CN: '确 认' },
        cancel: { EN: 'Cancel', CN: '取 消' },
        sureConfirm: {
            EN: 'Confirm logout of current account?',
            CN: '确认退出当前账号登录吗？'
        },
        noPermissionAccessContext: {
            EN: 'You may not have permission to access this item. Please try switching tenants or contact your system administrator',
            CN: '您可能无权限访问此上下文。请尝试切换租户，或联系系统管理员处理'
        },
        noCurrentTenant: { CN: '非当前租户数据禁止操作', EN: 'Non-current tenant data cannot be performed' },
        copySuccess: {
            EN: 'Copy Success',
            CN: '复制成功'
        },
        defaultIcon: {
            EN: 'Default Icons',
            CN: '默认图标'
        }
    };
    return {
        i18n: i18n
    };
});
