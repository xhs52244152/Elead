define(['erdc-kit'], function (ErdcKit) {
    return [
        // 流程模板
        {
            path: 'processManagement/template',
            name: 'processTemplate',
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/process-template/index.js'))
        },
        // 流程实例
        {
            path: 'processManagement/instance',
            name: 'processInstance',
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/process-instance/index.js'))
        },
        // 历史流程
        {
            path: 'processManagement/history',
            name: 'processHistory',
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/process-history/index.js'))
        },
        // 接口设计
        {
            path: 'processManagement/interface',
            name: 'processInterface',
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/process-interface/index.js'))
        },
        // 调用日志
        {
            path: 'processManagement/interfaceLog',
            name: 'processInterfaceLog',
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/process-interface-log/index.js'))
        },
        // 流程记录
        {
            path: 'processManagement/records',
            name: 'processRecords',
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/process-records/index.js')),
            meta: {
                resourceCode: 'processRecords'
            }
        },
        // 流程待办
        {
            path: 'process/todos',
            name: 'processTodo',
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-todo/index.js'))
        },
        // 我发起的
        {
            path: 'process/myCreate',
            name: 'processMyCreate',
            meta: {
                resourceCode: 'processMyCreate'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-my-create/index.js'))
        },
        // 我已处理
        {
            path: 'process/done',
            name: 'processDone',
            meta: {
                resourceCode: 'processDone'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-done/index.js'))
        },
        // 我参与的
        {
            path: 'process/involved',
            name: 'processInvolved',
            meta: {
                resourceCode: 'processInvolved'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/process-involved/index.js'))
        },
        // 我的草稿
        {
            path: 'process/draft',
            name: 'processDraft',
            meta: {
                resourceCode: 'processDraft'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-draft/index.js'))
        },
        // 代理设定
        {
            path: 'process/proxy',
            name: 'processProxy',
            meta: {
                resourceCode: 'processProxy'
            },
            component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-proxy/index.js'))
        }
    ];
});
