define([
    'text!' + ELMP.resource('erdc-components/FamSwitchApp/index.html'),
    'erdc-idle',
    'erdcloud.kit',
    ELMP.resource('erdc-components/FamSwitchApp/body.js'),
    'css!' + ELMP.resource('erdc-components/FamSwitchApp/index.css')
], function (template, { registerIdleTask }, erdcloudKit, FamSwitchBody) {
    return {
        name: 'FamSwitchApp',
        template: template,
        components: {
            FamSwitchBody: FamSwitchBody
        },
        data() {
            return {
                visible: false,
                icon: ELMP.resource('/erdc-assets/images/application.svg')
            };
        },
        computed: {},
        watch: {},
        mounted() {
            registerIdleTask(() => {
                this.initData();
            });
        },
        methods: {
            initData: function () {
                this.$refs.body.initData();
            }
        }
    };
});
