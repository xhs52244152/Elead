define(['text!' + ELMP.resource('erdc-cbb-workflow/components/ProcessBasicInfo/index.html'), 'erdc-kit'], function (
    template
) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ProcessBasicInfo',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            form: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            formConfigs: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        }
    };
});
