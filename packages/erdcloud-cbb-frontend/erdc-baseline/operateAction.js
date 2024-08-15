define([
    ELMP.func('erdc-document/components/DialogSave/index.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js')
], function (DialogSave, commonActions) {
    return {
        // 保存弹窗
        mountDialogSave: (props, successCallback) =>
            commonActions.mountHandleDialog(DialogSave, { props, successCallback, urlConfig: () => void 0 })
    };
});
