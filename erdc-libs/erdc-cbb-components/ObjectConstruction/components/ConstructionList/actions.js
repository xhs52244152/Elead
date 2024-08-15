// 结构组件存放全局注册的方法

define(['erdcloud.store'], function (FamStore) {
    'use strict';
    const actions = {
        // 移除结构
        PDM_PART_STRUCT_REMOVE: (vm) => {
            vm.removeStruct();
        },
        // 插入新的
        PDM_PART_STRUCT_CREATE_USAGE: (vm) => {
            vm.insertNew();
        },
        // 插入现有的
        PDM_PART_STRUCT_SAVES: (vm) => {
            vm.insertExisting();
        },
        // 替换管理
        PDM_PART_STRUCT_SUBSTITUTE_PART: (vm) => {
            vm.handleReplace();
        },
        // 替换部件
        PDM_PART_SUBSTITUTE_PART: (vm) => {
            vm.handleReplacePart();
        },
        // 创建BOM视图
        PDM_PART_BOM_VIEW_CREATE: (vm) => {
            vm.handleShowBomView();
        },
        // 文档移除
        DOC_STRUCT_REMOVE: (vm) => {
            vm.removeStruct();
        },
        // 文档插入新的
        DOC_STRUCT_INSERT_NEW: (vm) => {
            vm.insertNew();
        },
        // 文档插入现有的
        DOC_STRUCT_INSERT_EXISTING: (vm) => {
            vm.insertExisting();
        }
    };
    FamStore.dispatch('registerActionMethods', actions);
});
