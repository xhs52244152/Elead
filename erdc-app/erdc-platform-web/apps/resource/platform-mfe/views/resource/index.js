define([
    'text!' + ELMP.resource('platform-mfe/views/resource/index.html'),
    'css!' + ELMP.resource('platform-mfe/index.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template: template,
        components: {
            connectResource: FamKit.asyncComponent(ELMP.resource('platform-mfe/components/connectResource/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            }
        }
    };
});
