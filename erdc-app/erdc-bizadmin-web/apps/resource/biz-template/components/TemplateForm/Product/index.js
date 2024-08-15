define([
    'text!' + ELMP.resource('biz-template/components/TemplateForm/Product/index.html'),
    'css!' + ELMP.resource('biz-template/components/TemplateForm/Product/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {},
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        data() {
            return {};
        },
        computed: {},
        mounted() {},
        methods: {}
    };
});
