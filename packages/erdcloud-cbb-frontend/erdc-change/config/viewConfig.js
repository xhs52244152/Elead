define([ELMP.resource('erdc-pdm-app/store/index.js')], function (store) {
    // 问题报告
    const prChangeTableView = {
        ...store.state.tableViewMaping.prChange,
        actionName: 'REF_DESC_MENU',
        operateName: 'CHANGE_ISSUE_LIST_OPERATE',
        rowActionName: 'CHANGE_ISSUE_PER_OPERATE',
        listOperateName: 'CHANGE_ISSUE_OPERATE'
    };
    // 变更请求
    const ecrChangeTableView = {
        ...store.state.tableViewMaping.ecrChange,
        actionName: 'REF_DESC_MENU',
        operateName: 'CHANGE_REQUEST_LIST_OPERATE',
        rowActionName: 'CHANGE_REQUEST_PER_OPERATE',
        listOperateName: 'CHANGE_REQUEST_OPERATE'
    };
    // 变更通告
    const ecnChangeTableView = {
        ...store.state.tableViewMaping.ecnChange,
        actionName: 'REF_DESC_MENU',
        operateName: 'CHANGE_ORDER_LIST_OPERATE',
        rowActionName: 'CHANGE_ORDER_PER_OPERATE',
        listOperateName: 'CHANGE_ORDER_OPERATE'
    };
    // 变更任务
    const ecaChangeTableView = {
        ...store.state.tableViewMaping.ecaChange,
        actionName: 'REF_DESC_MENU',
        operateName: 'CHANGE_ACTIVITY_LIST_OPERATE',
        rowActionName: 'CHANGE_ACTIVITY_PER_OPERATE',
        listOperateName: 'CHANGE_ACTIVITY_OPERATE'
    };

    // 草稿跳转编辑页映射
    const updateMap = {
        'erd.cloud.cbb.change.entity.EtChangeIssue': 'change/prEdit',
        'erd.cloud.cbb.change.entity.EtChangeRequest': 'change/ecrEdit',
        'erd.cloud.cbb.change.entity.EtChangeOrder': 'change/ecnEdit',
        'erd.cloud.cbb.change.entity.EtChangeActivity': 'change/ecaEdit'
    };
    // 跳转详情映射
    const detailMap = {
        'erd.cloud.cbb.change.entity.EtChangeIssue': 'change/prDetail',
        'erd.cloud.cbb.change.entity.EtChangeRequest': 'change/ecrDetail',
        'erd.cloud.cbb.change.entity.EtChangeOrder': 'change/ecnDetail',
        'erd.cloud.cbb.change.entity.EtChangeActivity': 'change/ecaDetail'
    };

    // 取className 映射
    const classNameMap = {
        'erd.cloud.cbb.change.entity.EtChangeIssue': 'prChangeTableView',
        'erd.cloud.cbb.change.entity.EtChangeRequest': 'ecrChangeTableView',
        'erd.cloud.cbb.change.entity.EtChangeOrder': 'ecnChangeTableView',
        'erd.cloud.cbb.change.entity.EtChangeActivity': 'ecaChangeTableView'
    };

    const documentTableView = {
        ...store.state.tableViewMaping.document
    };

    const partTableView = {
        ...store.state.tableViewMaping.part
    };

    const epmDocumentTableView = {
        ...store.state.tableViewMaping.epmDocument
    };

    const pdmProductTableView = {
        ...store.state.tableViewMaping.product
    };

    const otherClassNameMap = {
        documentMaster: 'erd.cloud.cbb.doc.entity.EtDocumentMaster',
        pdmProduct: 'erd.cloud.pdm.core.container.entity.PdmProduct',
        subFolder: 'erd.cloud.foundation.core.folder.entity.SubFolder',
        scalableContainer: 'erd.cloud.foundation.core.container.entity.ScalableContainer',
        reportedAgainst: 'erd.cloud.cbb.change.entity.ReportedAgainst',
        relevantRequestData: 'erd.cloud.cbb.change.entity.RelevantRequestData',
        affectedActivityData: 'erd.cloud.cbb.change.entity.AffectedActivityData',
        changeProcessLink: 'erd.cloud.cbb.change.entity.ChangeProcessLink',
        includeIn: 'erd.cloud.cbb.change.entity.IncludedIn',
        changeRecord: 'erd.cloud.cbb.change.entity.ChangeRecord'
    };

    return {
        prChangeTableView,
        ecrChangeTableView,
        ecnChangeTableView,
        ecaChangeTableView,
        documentTableView,
        partTableView,
        epmDocumentTableView,
        pdmProductTableView,

        updateMap,
        detailMap,
        classNameMap,
        otherClassNameMap
    };
});
