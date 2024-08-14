define(['text!' + ELMP.resource('project-task/views/list/index.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            taskList: ErdcKit.asyncComponent(ELMP.resource('project-task/components/TaskList/index.js'))
        }
    };
});
