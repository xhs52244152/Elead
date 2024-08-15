define([], function () {
    'use strict';

    return {
        findAccessTypes: '/fam/type/typeDefinition/findAccessTypes', // 权限过滤后类型列表
        create: '/base/create', // 部件创建
        delete: '/epm/delete', // 部件删除
        batchDelete: '/fam/deleteByIds', //
        update: '/base/update', // 部件更新
        listByKey: 'fam/container/list',
        checkout: '/fam/common/checkout',
        reCheckout: '/fam/common/undo/checkout',
        checkIn: '/fam/common/checkin', // 鍵入
        uploadAttach: '/epm/content/file/upload',
        addAttach: '/epm/content/attachment/add',
        deleteAttach: '/fam/pdmCommon/attachmentDelete',
        attachList: '/epm/content/attachment/list',
        downloadUrl: '/epm/content/file/download',
        toReversion: '/fam/common/to/revision',
        download: '/epm/content/file/download',
        findNotAccessTypes: '/fam/type/typeDefinition/findNotAccessTypes',
        batchRevision: '/epm/common/revision/batch',
        getParent: '/epm/struct/getParent',
        export: '/fam/export',
        getDetail: '/common/attr', // 查询详情
        epmDocumentAdvancedSearch: '/epm/advancedSearch', // 查询部件子结构
        getEpmDocumentChildStructure: '/epm/struct/advanced/queryChildrenList', // 查询部件子结构
        createViewVersion: '/epm/struct/createView',
        getViewOptions: '/fam/view/children',
        searchSupportType: '/fam/application/supportType', // 查询支持的应用程序
        getEpmTempate: '/fam/cad/templateOfDoc', // 查询模型模板
        getCurrentContainerInfo: '/fam/container/getCurrentContainerInfo',
        deleteLinksByIds: '/fam/pdmCommon/deleteLinksByIds',
        getAttr: '/fam/attr'
    };
});
