define([
    'text!' + ELMP.resource('erdc-product-components/FolderListDetail/FolderDetailTemplate.html')
], function (template) {

    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        props: {
            visible: Boolean,
            row: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                formType: 'DETAIL'
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(value) {
                    this.$emit('update:visible', value);
                }
            },
            containerRef() {
                return this.$store.state.app.container.oid;
            }
        }
    };
});
