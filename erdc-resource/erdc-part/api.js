define([], function () {
    return {
        findAccessTypes: '/fam/type/typeDefinition/findAccessTypes', // 权限过滤后类型列表
        create: '/base/create', // 部件创建
        delete: '/part/delete', // 部件删除
        batchDelete: '/fam/deleteByIds', //
        update: '/base/update', // 部件更新
        listByKey: 'fam/container/list',
        checkout: '/part/common/checkout',
        reCheckout: '/fam/common/undo/checkout',
        checkIn: '/fam/common/checkin', // 鍵入
        uploadAttach: '/part/content/file/upload',
        addAttach: '/part/content/attachment/add',
        deleteAttach: '/fam/pdmCommon/attachmentDelete',
        attachList: '/part/content/attachment/list',
        downloadUrl: '/part/content/file/download',
        toReversion: '/fam/common/to/revision',
        download: '/part/content/file/download',
        findNotAccessTypes: '/fam/type/typeDefinition/findNotAccessTypes',
        batchRevision: '/part/common/revision/batch',
        getParent: '/part/struct/getParent',
        export: '/fam/export',
        getDetail: '/fam/attr', // 查询详情
        partAdvancedSearch: '/part/advancedSearch', // 查询部件子结构
        getPartChildStructure: '/part/struct/advanced/queryChildrenList', // 查询部件子结构
        createViewVersion: '/part/struct/createView',
        getViewOptions: '/fam/view/children'
    };
});
