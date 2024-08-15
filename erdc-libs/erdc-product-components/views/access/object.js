define(['fam:kit'], function () {
    const FamKit = require('fam:kit');

    return {
        /*html*/
        template: `
            <ObjectPermissionManage :product-oid="productOid"></ObjectPermissionManage>
        `,
        components: {
            ObjectPermissionManage: FamKit.asyncComponent(
                ELMP.resource(`erdc-product-components/PermissionManagement/ObjectPermissionManage/index.js`)
            )
        },
        data: function () {
            return {
                productOid: this.$store.state.space?.context?.oid
            };
        }
    };
});
