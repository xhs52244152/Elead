define([], function () {
    'use strict';

    const workspaceViewTableMap = {
        className: 'erd.cloud.pdm.workspace.entity.EpmWorkspace',
        tableKey: 'WorkspaceView',

        rowActionName: 'PDM_WORKSPACE_OPERATE_MENU', // 表格行内操作名称。针对单条数据
        toolBarActionName: 'PDM_WORKSPACE_MENU', // 表格工具栏操作名称。针对多条数据
        toolBarOperationName: 'PDM_WORKSPACE_BUSINESS_MENU'
    };

    const workspaceRelationObjViewTableMap = {
        className: 'erd.cloud.pdm.workspace.entity.WorkspaceMember',
        toolBarActionName: 'PDM_WORKSPACE_BUSINESS_MENU' // 表格工具栏操作名称。针对多条数据
    };
    return {
        workspaceViewTableMap,
        workspaceRelationObjViewTableMap
    };
});
