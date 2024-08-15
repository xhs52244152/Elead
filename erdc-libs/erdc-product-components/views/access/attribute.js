define(['fam:kit'], function () {
    const FamKit = require('fam:kit');

    return {
        /*html*/
        template: `
            <AttrPermissionManagement :product-oid="productOid"/>
        `,
        components: {
            AttrPermissionManagement: FamKit.asyncComponent(
                ELMP.resource(`erdc-product-components/PermissionManagement/AttrPermissionManagement/index.js`)
            )
        },
        data: function () {
            return {
                productOid: this.$store.state.space?.context?.oid
            };
        }
    };
});
