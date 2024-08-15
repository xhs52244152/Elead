define([
    'text!' + ELMP.resource('erdc-product-components/PermissionManagement/AttrPermissionManagement/index.html'),
    'css!' + ELMP.resource('erdc-product-components/PermissionManagement/AttrPermissionManagement/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            AttrPermissionSetting: FamKit.asyncComponent(
                ELMP.resource('erdc-type-components/AttrPermissionSetting/index.js')
            ),
            PermissionLayout: FamKit.asyncComponent(
                ELMP.resource('erdc-product-components/PermissionManagement/PermissionLayout/index.js')
            )
        },
        data() {
            return {
                maxHeight: 0
            };
        },
        mounted() {
            this.maxHeight = document.documentElement.clientHeight - 190;
        }
    };
});
