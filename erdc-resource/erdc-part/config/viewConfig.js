define([], function () {

    const partViewTableMap = {
        masterClassName: 'erd.cloud.pdm.part.entity.EtPartMaster',
        className: 'erd.cloud.pdm.part.entity.EtPart',
        tableKey: 'partForm',

        rowActionName: 'PDM_PART_LIST_MENU', // 表格行内操作名称。针对单条数据
        toolBarActionName: 'PDM_PART_MENU', // 表格工具栏操作名称。针对多条数据
        toolBarOperationName: 'PART_LIST_PER_OP_MENU'
    };

    const partDescribeTableView = {
        className: 'erd.cloud.pdm.part.entity.EtPartDescribeLink',
        tableKey: 'PartDescribeLinksView',
        actionName: 'PART_DESC_MENU'
    };
    const partCADDocTableView = {
        className: 'erd.cloud.pdm.epm.entity.EpmBuildRule',
        tableKey: 'PartEpmDocument',
        actionName: 'PDM_PART_EPM_DOCUMENT_MENU'
    };

    const partReferenceTableView = {
        className: 'erd.cloud.pdm.part.entity.EtPartReferenceLink',
        tableKey: 'PartReferenceLinksView',
        actionName: 'REF_DESC_MENU'
    };

    //历史记录
    const partHistoryOperate = {
        className: 'erd.cloud.pdm.part.entity.EtPartReferenceLink',
        tableKey: 'PartReferenceLinksView',
        actionName: 'PART_HISTORY_OPERATE'
    };

    return {
        partViewTableMap,
        partDescribeTableView,
        partReferenceTableView,
        partHistoryOperate,
        partCADDocTableView
    };
});
