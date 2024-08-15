define(['css!' + ELMP.resource('biz-template/style.css')], function () {
    const FamKit = require('fam:kit');

    return {
        /*html*/
        template: `
            <div id="fam_templateManagement" class="h-100p">
                <template-main></template-main>
            </div>
        `,
        components: {
            TemplateMain: FamKit.asyncComponent(ELMP.resource('biz-template/components/TemplateMain/index.js'))
        },
        data() {
            return {};
        },
        computed: {},
        methods: {}
    };
});
