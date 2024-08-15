define([
    'text!' +
        ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/AuthorityManage/index.html'),
    'css!' +
        ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/AuthorityManage/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            PermissionLayout: FamKit.asyncComponent(
                ELMP.resource('erdc-product-components/PermissionManagement/PermissionLayout/index.js')
            ),
            AuthorityMain: FamKit.asyncComponent(
                ELMP.resource(
                    'erdc-product-components/PermissionManagement/FunctionalAuthority/AuthorityMain/index.js'
                )
            )
        },
        data() {
            return {
                maxHeight: 0
            };
        },
        created() {},
        computed: {},
        mounted() {
            this.maxHeight = document.documentElement.clientHeight - 190;
        },
        methods: {}
    };
});
