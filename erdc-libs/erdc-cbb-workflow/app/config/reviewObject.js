define([ELMP.resource('erdc-cbb-workflow/app/config/processConstant.js')], function (processConstant) {
    // 批量审批流程
    const BATCH_APPROVAL = processConstant('BATCH_APPROVAL');
    // bom发布流程
    const BOM_RELEASE = processConstant('BOM_RELEASE');
    // 问题报告流程
    const CHANGE_ISSUE = processConstant('CHANGE_ISSUE');
    // 变更请求流程
    const CHANGE_REQUEST = processConstant('CHANGE_REQUEST');
    // 变更通告流程
    const CHANGE_ORDER = processConstant('CHANGE_ORDER');
    // 变更任务流程
    const CHANGE_ACTIVITY = processConstant('CHANGE_ACTIVITY');

    return {
        // 批量审批流程启动节点
        [`${BATCH_APPROVAL.PROCESS_ID}-${BATCH_APPROVAL.PROCESS_NODE.START}`]: {
            // url: ELMP.resource('erdc-cbb-workflow/pages/batch-approval-start/index.js'),
            className: 'erd.cloud.pdm.core.container.entity.PdmProduct',
            headers: { 'App-Name': 'plat' }
        },
        // 批量审批流程其他节点
        [`${BATCH_APPROVAL.PROCESS_ID}`]: {
            // url: ELMP.resource('erdc-cbb-workflow/pages/batch-approval/index.js'),
            className: 'erd.cloud.pdm.core.container.entity.PdmProduct'
        },
        // bom发布流程启动节点
        [`${BOM_RELEASE.PROCESS_ID}-${BOM_RELEASE.PROCESS_NODE.START}`]: {
            // url: ELMP.resource('erdc-cbb-workflow/pages/bom-release-start/index.js'),
            className: 'erd.cloud.pdm.core.container.entity.PdmProduct',
            headers: { 'App-Name': 'plat' }
        },
        // bom发布流程其他节点
        [`${BOM_RELEASE.PROCESS_ID}`]: {
            // url: ELMP.resource('erdc-cbb-workflow/pages/bom-release/index.js'),
            className: 'erd.cloud.pdm.core.container.entity.PdmProduct'
        },
        // CBB 变更管理流程其他节点 —— 业务对象
        // 问题报告流程其他节点
        [`${CHANGE_ISSUE.PROCESS_ID}`]: {
            // url: ELMP.resource('erdc-cbb-workflow/pages/change-approval/index.js'),
            className: 'erd.cloud.cbb.change.entity.EtChangeIssue'
        },
        // 变更请求流程其他节点
        [`${CHANGE_REQUEST.PROCESS_ID}`]: {
            // url: ELMP.resource('erdc-cbb-workflow/pages/change-approval/index.js'),
            className: 'erd.cloud.cbb.change.entity.EtChangeRequest'
        },
        // 变更通告流程其他节点
        [`${CHANGE_ORDER.PROCESS_ID}`]: {
            // url: ELMP.resource('erdc-cbb-workflow/pages/change-approval/index.js'),
            className: 'erd.cloud.cbb.change.entity.EtChangeOrder'
        },
        // 变更任务流程其他节点
        [`${CHANGE_ACTIVITY.PROCESS_ID}`]: {
            // url: ELMP.resource('erdc-cbb-workflow/pages/change-approval/index.js'),
            className: 'erd.cloud.cbb.change.entity.EtChangeActivity'
        }
    };
});
