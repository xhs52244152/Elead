define([
    'text!' + ELMP.resource('portal-logo/index.html'),
    'erdcloud.store',
    'erdc-kit',
    'css!' + ELMP.resource('portal-logo/index.css')
], function (template, store, ErdcKit) {
    return {
        setup() {
            const { computed } = require('vue');

            const logoUrl = computed(() => {
                const tenantIcon = store.getters['app/currentTenant']?.icon;
                return tenantIcon
                    ? ErdcKit.imgUrlCreator(tenantIcon)
                    : window.ELCONF.logo || ELMP.resource('erdc-assets/images/logo1-min.svg');
            });

            return {
                logoUrl
            };
        },
        template
    };
});
