define([ELMP.func('batch-approval-start/index.js')], function (BatchApprovalStart) {
    return {
        name: 'BomReleaseStart',
        mixins: [BatchApprovalStart]
    };
});
