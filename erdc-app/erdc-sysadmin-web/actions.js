define(['erdcloud.router'], function (router) {
    return {
        /**
         * 系统管理-首选项管理-创建配置组
         * @param { Object } vm - 页面实例
         * @param { Object } row - 行数据
         */
        PREFERNCES_CREATE_SUBGROUP: (vm, row) => {
            vm.createGrouup(row);
        },
        /**
         * 系统管理-首选项管理-创建配置项
         * @param { Object } vm - 页面实例
         * @param { Object } row - 行数据
         */
        PREFERNCES_CREATE_ITEM: (vm, row) => {
            vm.createItem(row);
        },
        /**
         * 系统管理-首选项管理-行编辑配置项配置组
         * @param { Object } vm - 页面实例
         * @param { Object } row - 行数据
         */
        PREFERNCES_EDIT: (vm, row) => {
            vm.edit(row);
        },
        /**
         * 系统管理-首选项管理-行删除
         * @param { Object } vm - 页面实例
         * @param { Object } row - 行数据
         */
        PREFERNCES_DELETE: (vm, row) => {
            vm.delete(row);
        },
        /**
         * 系统管理-首选项管理-行编辑配置值
         * @param { Object } vm - 页面实例
         * @param { Object } row - 行数据
         */
        PREFERNCES_EDIT_VALUE: (vm, row) => {
            vm.editValue(row);
        },
        /**
         * 系统管理-首选项管理-行删除-上下文
         * @param { Object } vm - 页面实例
         * @param { Object } row - 行数据
         */
        PREFERNCES_DELETE_CONTEXT: (vm, row) => {
            vm.contextDelete(row);
        },
        /**
         * 系统管理-首选项管理-行编辑配置值-上下文
         * @param { Object } vm - 页面实例
         * @param { Object } row - 行数据
         */
        PREFERNCES_EDIT_VALUE_CONTEXT: (vm, row) => {
            vm.editValue(row);
        },
        MENU_ACTION_FAVORITES_LINK_COLLECT: (vm, row) => {
            vm.onCollect(row);
        },
        MENU_ACTION_FAVORITES_LINK_CANCEL_COLLECTION: (vm, row) => {
            vm.onCancelCollect(row);
        },
        /**
         * 产品-发起流程
         * @param { Object } vm - 页面实例
         * @param { Object } row - 行数据
         */
        BPM_PROCESS_DEF_START_PROCESS: (vm, row) => {
            return router.push({
                path: '/container/bpm-resource/workflowLauncher/LAUNCH_PROCESS_DEMO',
                query: {
                    processDefRef: 'LAUNCH_PROCESS_DEMO',
                    holderRef: row?.oid
                }
            });
        }
    };
});
