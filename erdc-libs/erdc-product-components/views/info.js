define(['fam:kit', 'fam:store'], function () {
    const FamKit = require('fam:kit');

    return {
        /*html*/
        template: `
            <ProductInfo 
                :product-oid="productOid"
                :container-team-ref="containerTeamRef"
                :space-oid="spaceOid"
            ></ProductInfo>
        `,
        components: {
            ProductInfo: FamKit.asyncComponent(ELMP.resource(`erdc-product-components/ProductInfo/index.js`))
        },
        data: function () {
            return {
                routeOid: this.$route.params.oid,
                productOid: this.$store.state.space?.context?.holderRef || null,
                spaceOid: this.$store.state.space?.context?.oid || null,
                containerTeamRef: this.$store.state.space?.context?.containerTeamRef || null
            };
        }
    };
});
