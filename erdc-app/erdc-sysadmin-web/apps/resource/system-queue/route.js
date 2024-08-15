define(['erdcloud.kit'], function (ErdcKit) {
    return [
        {
            // 队列
            path: 'queue',
            name: 'queueManagement',
            component: ErdcKit.asyncComponent(ELMP.resource('system-queue/views/QueueManagement/index.js'))
        }
    ];
});
