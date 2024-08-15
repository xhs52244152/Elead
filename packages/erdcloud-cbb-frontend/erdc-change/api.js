define([], function () {
    'use strict';
    return {
        findAccessTypes: '/fam/type/typeDefinition/findAccessTypes', // 权限过滤后类型列表
        create: '/base/create', // 部件创建
        delete: '/fam/delete', // 部件删除
        batchDelete: '/fam/deleteByIds', //
        update: '/base/update', // 部件更新
        listByKey: 'fam/container/list',
        checkout: '/fam/common/checkout',
        reCheckout: '/fam/common/undo/checkout',
        checkIn: '/fam/common/checkin', // 鍵入
        uploadAttach: '/fam/content/file/upload',
        addAttach: '/fam/content/attachment/add',
        deleteAttach: '/fam/content/attachment/delete',
        attachList: '/fam/content/attachment/list',
        toReversion: '/fam/common/to/revision',
        download: 'fam/content/file/download',
        findNotAccessTypes: '/fam/type/typeDefinition/findNotAccessTypes',
        batchRevision: '/fam/common/revision/batch',
        revision: '/fam/common/revision',
        getParent: '/fam/struct/getParent',
        export: '/fam/export'
    };
});
