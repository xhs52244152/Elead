define([], function () {

    const docViewTableMap = {
        className: 'erd.cloud.cbb.doc.entity.EtDocument',
        tableKey: 'DocumentView',
        rowActionName: 'DOC_LIST_PER_OP_MENU', // 表格行内操作名称。针对单条数据
        toolBarActionName: 'DOC_LIST_OPERATE', // 表格工具栏操作名称。针对多条数据
        validatorName: 'DOC_LIST_OPERATE_MENU' // 表格工具栏操作名称。针对多条数据
    };

    // 参考文档
    const docDependencyTableView = {
        className: 'erd.cloud.cbb.doc.entity.EtDocumentDependencyLink',
        tableKey: 'DocumentDependencyLinkView',
        actionName: 'REF_DESC_MENU'
    };

    // 被参考的文档
    const docDependencyOnTableView = {
        className: 'erd.cloud.cbb.doc.entity.EtDocumentDependencyLink',
        tableKey: 'DependencyOnLinksView',
        actionName: ''
    };

    // 部件描述关系
    const docDescribeTableView = {
        className: 'erd.cloud.pdm.part.entity.EtPartDescribeLink',
        tableKey: 'PartDescribeLinksViewByDocument',
        actionName: 'PART_DESC_MENU'
    };

    // 部件参考关系
    const docReferenceTableView = {
        className: 'erd.cloud.pdm.part.entity.EtPartReferenceLink',
        tableKey: 'PartReferenceLinksViewByDocument',
        actionName: 'REF_DESC_MENU'
    };

    //历史记录
    const docHistoryOperate = {
        className: 'erd.cloud.pdm.part.entity.EtPartReferenceLink',
        tableKey: 'PartReferenceLinksView',
        actionName: 'DOC_HISTORY_OPERATE'
    };

    return {
        docViewTableMap,
        docDependencyTableView,
        docDependencyOnTableView,
        docDescribeTableView,
        docReferenceTableView,
        docHistoryOperate
    };
});
