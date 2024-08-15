define([ELMP.resource('erdc-components/FamDynamicForm/DeepFieldVisitorMixin.js'), 'fam:kit'], function (
    DeepFieldVisitorMixin
) {
    const FamKit = require('fam:kit');

    return {
        mixins: [DeepFieldVisitorMixin],
        components: {
            FamDynamicFormItem: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js')
            )
        },
        inject: ['designer'],
        props: {
            formData: Object,
            widget: Object,
            schema: Object,
            formConfig: Object,
            props: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: Boolean,
            required: Boolean,
            formReadonly: Boolean,
            scope: Object,
            labelWidth: String,
            preventRequired: Boolean
        },
        computed: {
            label() {
                const wcd = this.wcd || {};
                return (wcd.i18n ? this.translateI18n(wcd.i18n) : this.i18nMappingObj[wcd.name]) || wcd.label;
            }
        },
        watch: {
            readonly: {
                immediate: true,
                handler() {
                    if (this.props.readonly === 'undefined') {
                        this.$set(this.props, 'readonly');
                    }
                }
            }
        },
        methods: {
            setWidgetValue(key, value) {
                this.$emit('update-widget', key, value);
            },
            setSchemaValue(key, value) {
                this.$emit('update-schema', key, value);
            },
            setFormConfig(key, value) {
                this.$emit('update-form-config', key, value);
            },
            translateI18n(i18nJosn) {
                return FamKit.translateI18n(i18nJosn);
            },
            setDeepValue(key, value) {
                return this.setFieldValue(this.schema, key, value);
            },
            getDeepValue(key) {
                return this.getFieldValue(key);
            }
        }
    };
});
