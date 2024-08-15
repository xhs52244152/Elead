define(['fam:kit'], function (FamKit) {
    return {
        name: 'ProductListView',

        /*html*/
        template: `
            <div style="height: calc(100% - 48px);">
                <FamSecondaryMenu
                    :outerResources="[{ displayName: '产品列表', href: '/product/list' }]"
                ></FamSecondaryMenu>
                <product-list
                    @enter-space="onEnterSpace"
                ></product-list>
            </div>
        `,
        components: {
            'product-list': FamKit.asyncComponent(ELMP.resource('erdc-product-components/ProductList/index.js')),
            'FamSecondaryMenu': FamKit.asyncComponent(ELMP.resource('erdc-components/FamSecondaryMenu/index.js'))
        },
        data() {
            return {};
        },
        methods: {
            onEnterSpace(product) {
                const { typeReference, oid } = product;
                this.$router.push({
                    name: 'productDemoSpace',
                    params: {
                        pid: oid
                    },
                    query: {
                        typeOid: typeReference
                    }
                });
            }
        }
    };
});
