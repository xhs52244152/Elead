define([], function () {
    return {
        props: {
            value: {
                type: String,
                default: ''
            },
            projectRefValue: {
                type: String,
                default: ''
            }
        },
        template: `<span>{{projectRefValue}}</span>`
    };
});
