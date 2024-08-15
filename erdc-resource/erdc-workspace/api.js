define([], function () {
    'use strict';

    return {
        findAccessTypes: '/fam/type/typeDefinition/findAccessTypes', // 权限过滤后类型列表
        listByKey: '/fam/listByKey',
        listAllTree: '/fam/listAllTree',
        containerList: 'fam/container/list',
        treeConfigType: '/fam/dictionary/tree/EpmWorkspace_ConfigType',
        createWorkspace: '/fam/create',
        deleteByIds: '/fam/deleteByIds',
        objectBatchCheckin: '/fam/workspace/object/batch/checkin',
        objectBatchCheckout: '/fam/workspace/object/batch/checkout',
        objectBatchUndoCheckout: '/fam/workspace/object/batch/undoCheckout',
        objectDelete: '/fam/workspace/object/delete',
        objectUpdate: '/fam/workspace/object/update',
        workspaceAddToData: '/fam/search/by/oid',
        workspaceObjectAdd: '/fam/workspace/object/add',
        menubarAdd: '/fam/member/add',
        beforeValidator: '/fam/menu/before/validator'
    };
});
