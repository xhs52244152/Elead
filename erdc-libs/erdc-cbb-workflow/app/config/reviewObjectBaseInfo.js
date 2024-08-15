define([
    ELMP.resource('erdc-cbb-workflow/app/config/processConstant.js')
], function (processConstant) {
    const ErdcKit = require('erdc-kit');
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
        // 批量审批流程启动页面启动节点
        [`${BATCH_APPROVAL.PROCESS_PAGE.LAUNCHER}-${BATCH_APPROVAL.PROCESS_ID}-${BATCH_APPROVAL.PROCESS_NODE.START}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/base-info/BatchApprovalBaseInfoStart/index.js')
            )
        },
        // 批量审批流程审批页面启动节点
        [`${BATCH_APPROVAL.PROCESS_PAGE.ACTIVATOR}-${BATCH_APPROVAL.PROCESS_ID}-${BATCH_APPROVAL.PROCESS_NODE.START}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: null
        },
        // 批量审批流程其他节点
        [`${BATCH_APPROVAL.PROCESS_ID}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/base-info/BatchApprovalBaseInfo/index.js')
            )
        },
        // bom发布流程启动页面启动节点
        [`${BOM_RELEASE.PROCESS_PAGE.LAUNCHER}-${BOM_RELEASE.PROCESS_ID}-${BOM_RELEASE.PROCESS_NODE.START}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/base-info/BomReleaseBaseInfoStart/index.js')
            )
        },
        // bom发布流程审批页面启动节点
        [`${BOM_RELEASE.PROCESS_PAGE.ACTIVATOR}-${BOM_RELEASE.PROCESS_ID}-${BOM_RELEASE.PROCESS_NODE.START}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: null
        },
        // bom发布流程其他节点
        [`${BOM_RELEASE.PROCESS_ID}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/base-info/BomReleaseBaseInfo/index.js')
            )
        },
        // CBB 变更管理流程其他节点 —— 基本信息
        // 问题报告
        [`${CHANGE_ISSUE.PROCESS_ID}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/base-info/ChangeApprovalBaseInfo/index.js')
            )
        },
        // 变更请求
        [`${CHANGE_REQUEST.PROCESS_ID}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/base-info/ChangeApprovalBaseInfo/index.js')
            )
        },
        // 变更通告
        [`${CHANGE_ORDER.PROCESS_ID}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/base-info/ChangeApprovalBaseInfo/index.js')
            )
        },
        // 变更任务
        [`${CHANGE_ACTIVITY.PROCESS_ID}`]: {
            // 需要传入一个已经注册的组件名字或者一个组件对象选项
            bpmProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/base-info/ChangeApprovalBaseInfo/index.js')
            )
        }
    };
});
