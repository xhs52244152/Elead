define([ELMP.resource('erdc-cbb-workflow/base-info/BatchApprovalBaseInfoStart/index.js')], function (
    BatchApprovalBaseInfoStart
) {
    return {
        name: 'BomReleaseBaseInfoStart',
        mixins: [BatchApprovalBaseInfoStart],
        computed: {
            title() {
                return `${new Date().getTime().toString() + '_' + this.i18n['BOM发布']}`;
            }
        }
    };
});
