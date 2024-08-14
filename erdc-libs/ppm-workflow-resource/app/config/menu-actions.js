define([ELMP.resource('ppm-utils/index.js'), ELMP.resource('ppm-utils/locale/index.js')], function (utils, globalI18n) {
    const i18nMappingObj = utils.languageTransfer(globalI18n.i18n);
    const getI18n = (val) => {
        return i18nMappingObj[val] || '';
    };
    let actions = {
        // 项目文档发布流程-增加
        APPROVAL_DOCUMENT_ADD: (vm) => {
            vm.selectDocumentVisible = true;
        },
        // 项目文档发布流程-移除
        APPROVAL_DOCUMENT_DELETE: (vm) => {
            let selectData = vm.$refs.documentObject.$refs?.famAdvancedTable.selectData;
            if (!selectData.length) return vm.$message.info(getI18n('pleaseSelectData'));
            vm.$confirm(getI18n('isRemove'), getI18n('removeTips'), {
                distinguishCancelAndClose: true,
                confirmButtonText: getI18n('confirm'),
                cancelButtonText: getI18n('cancel'),
                type: 'warning'
            }).then(() => {
                vm.$message.success(getI18n('removeSuccess'));
                vm.tableData = vm.tableData.filter(
                    (item) => selectData.findIndex((res) => res.oid === item.oid) === -1
                );
                vm.refresh();
            });
        }
    };
    return actions;
});
