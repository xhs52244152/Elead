define([
    'text!' + ELMP.resource('biz-template/components/TemplateMain/index.html'),
    ELMP.resource('biz-template/components/TemplateLeftMenu/index.js'),
    'css!' + ELMP.resource('biz-template/components/TemplateMain/style.css')
], function (template, TemplateLeftMenu) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {},
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            TemplateLeftMenu,
            TemplateList: ErdcKit.asyncComponent(ELMP.resource('biz-template/components/TemplateList/index.js'))
        },
        data() {
            return {
                leftStyle: {
                    width: '200px',
                    minWidth: 200,
                    maxWidth: '50%'
                }
            };
        },
        computed: {},
        watch: {},
        methods: {}
    };
});
