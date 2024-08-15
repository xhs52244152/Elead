define(['erdcloud.kit', ELMP.resource('platform-storage/store.js')], function (ErdcKit) {
    return [
        // 多站点
        {
            path: 'site',
            name: 'siteManage',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-storage/views/SiteManagement/index.js'))
        },
        // 绑定部门
        {
            path: 'bindDepartment',
            name: 'siteBindDepartment',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-storage/views/BindingWithDepartment/index.js')),
            meta: {
                resourceCode: 'siteManage'
            }
        },
        // 同步记录
        {
            path: 'syncRecord',
            name: 'syncRecord',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-storage/views/SyncRecord/index.js')),
            meta: {
                resourceCode: 'siteManage',
                keepAlive: false,
                hidden: true
            }
        },
        // 站点文件
        {
            path: 'siteFiles',
            name: 'siteFiles',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-storage/views/SiteFiles/index.js')),
            meta: {
                resourceCode: 'siteManage',
                keepAlive: false,
                hidden: true
            }
        },
        {
            path: 'config',
            name: 'appManage',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-storage/views/StorageConfiguration/index.js'))
        },
        // 存储配置
        {
            path: 'config',
            name: 'appManage',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-storage/views/StorageConfiguration/index.js'))
        },
        // 文件类型
        {
            path: 'mime',
            name: 'mimeTypeManage',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-storage/views/MimeTypeManage/index.js'))
        },
        // 文件分类
        {
            path: 'classification',
            name: 'fileClassification',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-storage/views/FileClassification/index.js')),
            meta: {
                resourceCode: 'mimeTypeManage'
            }
        },
        // 同步策略
        {
            path: 'siteTimingTask',
            name: 'siteTimingTask',
            component: ErdcKit.asyncComponent(ELMP.resource('platform-storage/views/TimingTask/index.js')),
            meta: {
                hidden: true,
                resourceCode: 'siteManage',
                keepAlive: false
            }
        }
    ];
});
