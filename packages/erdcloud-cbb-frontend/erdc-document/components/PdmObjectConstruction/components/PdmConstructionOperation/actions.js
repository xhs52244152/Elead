define([], function () {
    return {
        // 保存
        PDM_PART_STRUCT_SAVA: (vm) => {
            vm.handleSave();
        },
        // 模型保存
        PDM_EPM_DOCUMENT_STRUCT_SAVE: (vm) => {
            vm.handleSave();
        },
        // 文档保存
        DOC_STRUCT_SAVE: (vm) => {
            vm.handleSave();
        },
        // 文档添加至基线
        // DOC_ADD_BASELINE: (vm) => {
        //     vm.handleToBaseline();
        // },
        // 添加至基线
        PDM_PART_STRUCT_ADD_TO_BASE_LINE: (vm) => {
            vm.handleToBaseline();
        },
        // 显示全部
        PDM_PART_STRUCT_DISPLAY_ALL: (vm) => {
            vm.handleShow('PDM_PART_STRUCT_DISPLAY_ALL');
        },
        // 文档
        PDM_PART_STRUCT_DISPLAY_DOCUMENT: (vm) => {
            vm.handleShow('PDM_PART_STRUCT_DISPLAY_DOCUMENT');
        },
        // 替换部件
        PDM_PART_STRUCT_DISPLAY_SUBSTITUTE: (vm) => {
            vm.handleShow('PDM_PART_STRUCT_DISPLAY_SUBSTITUTE');
        },
        // 隐藏
        PDM_PART_STRUCT_NONE: (vm) => {
            vm.handleDisPlayNone();
        },
        // 文档批量下载
        PDM_DOC_LINK_BATCH_DOWNLOAD_FILE: (vm) => {
            vm.handleBatchDownLoad();
        },
        // 图档批量下载
        PDM_EPM_DOCUMENT_BATCH_DOWNLOAD: (vm) => {
            vm.handleBatchDownLoad();
        }
    };
});
