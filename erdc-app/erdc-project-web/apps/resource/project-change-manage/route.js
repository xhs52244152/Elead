define(['erdcloud.kit'], function (ErdcloudKit) {
    return [
        {
            path: '',
            name: 'projectChangeManage',
            meta: {
                title: '变更管理'
            },
            component: ErdcloudKit.asyncComponent(ELMP.resource('project-change-manage/index.js'))
        }
    ];
});
