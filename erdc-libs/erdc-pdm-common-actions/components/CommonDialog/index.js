define(['text!' + ELMP.resource('erdc-pdm-common-actions/components/CommonDialog/index.html')], function (template) {
    return {
        name: 'commonDialog',
        template,
        props: {
            width: {
                type: String,
                default: '1200px'
            },
            title: String,
            loading: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            confirm() {
                this.$emit('confirm');
            },
            close() {
                this.$destroy();
                if (this.$el.parentNode) {
                    this.$el.parentNode.removeChild(this.$el);
                }
            }
        }
    };
});
