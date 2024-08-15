define([ELMP.func('batch-approval-start/index.js')], function (BatchApprovalStart) {
    return {
        name: 'BatchApproval',
        mixins: [BatchApprovalStart],
        data() {
            return {
                hideCollect: true
            };
        },
        computed: {
            hideOper() {
                const processStep = this.processStep,
                    taskDefKey = this.$route?.query?.taskDefKey,
                    activityId = this.activityId;
                return (
                    processStep === 'activator' &&
                    (taskDefKey !== 'submit' || (taskDefKey === 'submit' && activityId !== 'submit'))
                );
            }
        },
        activated() {
            // tab切换后，尝试更新对象版本
            this.updateReviewObject(this.tableData).then((newData) => {
                this.tableData = newData;
            });
        },
        methods: {
            // 审批页面单独的baseForm数据
            activatorSubmit({ resolve, data }) {
                resolve(data);
            }
        }
    };
});
