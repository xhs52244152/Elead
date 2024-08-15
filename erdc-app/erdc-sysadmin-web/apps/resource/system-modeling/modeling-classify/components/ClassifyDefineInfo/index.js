define([
    'text!' + ELMP.resource('system-modeling/modeling-classify/components/ClassifyDefineInfo/index.html')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            readonly: Boolean,
            oid: String,
            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            parentFormData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            typeData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            type: {
                type: String,
                default: 'create'
            },
            isApplication: Boolean,
            isShare: Boolean
        },
        components: {
            ClassifyDefineInfoForm: FamKit.asyncComponent(
                ELMP.resource('system-modeling/modeling-classify/components/ClassifyDefineInfoForm/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-modeling/modeling-classify/locale/index.js'),
                unfold: true
            };
        },
        watch: {},
        computed: {},
        mounted() {},
        methods: {
            onEdit() {
                this.$emit('onclick', { oid: this.oid }, 'update');
            }
        }
    };
});
