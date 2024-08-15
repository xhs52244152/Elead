define([
    ELMP.resource('erdc-cbb-workflow/pages/batch-approval/index.js'),
], function (BatchApproval) {

    return {
        name: 'BomRelease',
        mixins: [BatchApproval],
        computed: {
            hideOper() {
                const processStep = this.processStep,
                    taskDefKey = this.$route?.query?.taskDefKey,
                    activityId = this.activityId;
                return (
                    processStep === 'activator' &&
                    (taskDefKey !== 'bom_submit' || (taskDefKey === 'bom_submit' && activityId !== 'bom_submit'))
                );
            }
        },
        activated() {
            // tab切换后，尝试更新对象版本
            this.updateReviewObject(this.tableData).then((newData) => {
                this.tableData = newData;
            });
        }
    };
});
