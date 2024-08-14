define([
    'text!' + ELMP.resource('project-handle-task/views/list/index.html'),
    'css!' + ELMP.resource('project-handle-task/views/list/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {
            type: {
                type: String,
                default: 'normal'
            }
        },
        components: {
            HandleTaskList: ErdcKit.asyncComponent(
                ELMP.resource('project-handle-task/components/HandleTaskList/index.js')
            )
        }
    };
});
