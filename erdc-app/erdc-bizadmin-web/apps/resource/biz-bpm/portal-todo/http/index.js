define([
    'fam:http'
], function (axios) {

    return {
        batchApproval(taskIdList) {
            return axios({
                url: '/bpm/task/queryBatchCompleteTaskList',
                method: 'POST',
                data: taskIdList
            })
        },
        batchApprovalWithRoute(taskIds, routeFlag) {
            return axios({
                url: '/bpm/task/tasks/grouped/' + taskIds + '/' + routeFlag,
                method: 'get'
            })
        },
        submitBatchApproval(data) {
            return axios({
                url: '/bpm/task/batchCompleteTask',
                method: 'POST',
                data: data
            })
        }
    }
});
