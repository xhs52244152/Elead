define(['fam:kit'], function () {
    const FamKit = require('fam:kit');

    return {
        /*html*/
        template: `
            <FunctionalAuthorityManage :product-oid="productOid"/>
        `,
        components: {
            FunctionalAuthorityManage: FamKit.asyncComponent(
                ELMP.resource(
                    `erdc-product-components/PermissionManagement/FunctionalAuthority/AuthorityManage/index.js`
                )
            )
        },
        data: function () {
            return {
                productOid: this.$store.state.space?.context?.oid
            };
        }
    };
});
