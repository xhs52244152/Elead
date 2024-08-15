define([], function () {
    'use strict';

    const epmDocumentViewTableMap = {
        masterClassName: 'erd.cloud.pdm.epm.entity.EpmDocumentMaster',
        className: 'erd.cloud.pdm.epm.entity.EpmDocument',
        tableKey: 'epmDocumentView',

        detailActionName: 'PDM_EPM_DOCUMENT_DETAIL_OPERATE', // 模型详情内部操作按钮
        rowActionName: 'PDM_EPM_DOCUMENT_LIST_OPERATE', // 表格行内操作名称。针对单条数据
        toolBarActionName: 'PDM_EPM_DOCUMENT_CREATE', // 表格工具栏操作名称。针对多条数据
        toolBarOperationName: 'PDM_EPM_DOCUMENT_OPERATE'
    };
    const epmReferenceTableView = {
        //参考
        className: 'erd.cloud.pdm.epm.entity.EpmReferenceLink',
        tableKey: 'EpmReferenceLinkView',
        actionName: 'EPM_REF_MENU'
    };
    const epmReferencePartyTableView = {
        //参考方
        className: 'erd.cloud.pdm.epm.entity.EpmReferenceLink',
        tableKey: 'ReferenceOnLinkView',
        actionName: ''
    };
    const epmBuildRuleTableView = {
        //部件
        className: 'erd.cloud.pdm.epm.entity.EpmBuildRule',
        tableKey: 'EpmBuildRuleView',
        actionName: ''
    };
    const epmDocumentDescribeTableView = {
        //描述文档
        className: 'erd.cloud.pdm.epm.entity.EpmDescribeLink',
        tableKey: 'EpmDescribeLink',
        actionName: ''
    };

    //历史记录
    const EPMHistoryOperate = {
        className: 'erd.cloud.pdm.epm.entity.EpmDocument',
        tableKey: 'EpmReferenceLinksView',
        actionName: 'EPM_HISTORY_OPERATE'
    };

    return {
        epmDocumentViewTableMap,
        epmDocumentDescribeTableView,
        epmBuildRuleTableView,
        epmReferenceTableView,
        epmReferencePartyTableView,
        EPMHistoryOperate
    };
});
