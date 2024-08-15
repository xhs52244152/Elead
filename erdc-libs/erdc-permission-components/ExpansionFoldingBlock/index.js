define([
    'text!' + ELMP.resource('erdc-permission-components/ExpansionFoldingBlock/index.html'),
    'css!' + ELMP.resource('erdc-permission-components/ExpansionFoldingBlock/style.css'),
], function (template) {
    return {
        template,
        props: {
            title: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                isExpanded: true
            }
        },
        mounted() {
        },
        methods: {
            changeExpand() {
                this.isExpanded = !this.isExpanded;
            }
        },
        components: {
        }
    };
});
