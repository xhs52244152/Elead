// 结构组件存放全局注册的方法

define(['erdcloud.store'], function (FamStore) {
    'use strict';
    const actions = {
        // 全局添加
        PDM_PART_ALTERNATE_CREATE: (vm) => {
            vm.handleAdd('global');
        },
        // 全局删除
        PDM_PART_ALTERNATE_REMOVE: (vm) => {
            vm.handleDelete('global');
        },
        // 局部添加
        PDM_PART_SUBSTITUTE_CREATE: (vm) => {
            vm.handleAdd('local');
        },
        // 局部删除
        PDM_PART_SUBSTITUTE_REMOVE: (vm) => {
            vm.handleDelete('local');
        }
    };
    FamStore.dispatch('registerActionMethods', actions);
});
