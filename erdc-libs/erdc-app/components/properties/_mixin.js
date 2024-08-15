define(['fam:kit'], function (FamKit) {
    return {
        components: {
            FamDynamicFormItem: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js')
            )
        },
        props: {
            form: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: Boolean,
            labelWidth: String
        }
    };
});
