define(['fam:kit'], function () {
    const FamKit = require('fam:kit');

    return {
        name: 'Folder',
        /*html*/
        template: `
            <FolderList :container-ref="productOid"/>
        `,
        components: {
            FolderList: FamKit.asyncComponent(ELMP.resource(`erdc-product-components/FolderList/index.js`))
        },
        data: function () {
            return {
                productOid: this.$store.state.space?.context?.oid,
                containerRef: this.$store.state.space?.context?.containerRef
            };
        }
    };
});
