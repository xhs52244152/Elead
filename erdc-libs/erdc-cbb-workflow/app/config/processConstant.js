define([], function () {

    // 流程模板标识
    const PROCESS_ID = {
        // 批量审批
        BATCH_APPROVAL: 'general_review_pro',
        // bom发布
        BOM_RELEASE: 'bom_release_pro',
        // 问题报告
        CHANGE_ISSUE: 'cbb_change_issue',
        // 变更请求
        CHANGE_REQUEST: 'cbb_change_request',
        // 变更通告
        CHANGE_ORDER: 'cbb_change_order',
        // 变更任务
        CHANGE_ACTIVITY: 'cbb_change_activity'
    };

    // 流程节点
    const PROCESS_NODE = {
        // 批量审批节点
        BATCH_APPROVAL: {
            // 启动节点
            START: 'start'
        },
        // bom发布节点
        BOM_RELEASE: {
            // 启动节点
            START: 'start'
        }
    }

    // 流程页面
    const PROCESS_PAGE = {
        // 发起页面
        LAUNCHER: 'launcher',
        // 审批页面
        ACTIVATOR: 'activator'
    }

    return (id) => {
        return {
            PROCESS_ID: PROCESS_ID?.[id] || '',
            PROCESS_NODE: PROCESS_NODE?.[id] || {},
            PROCESS_PAGE
        }
    }
});