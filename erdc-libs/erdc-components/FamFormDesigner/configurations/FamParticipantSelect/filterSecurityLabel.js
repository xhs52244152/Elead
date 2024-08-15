define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18n.filterSecurityLabel"
            field="filterSecurityLabel"
            :label-width="labelWidth"
        >
            <erd-checkbox
                v-if="!readonly"
                v-model="filterSecurityLabel"
            >
            </erd-checkbox>
            <span v-else>
                {{filterSecurityLabel ? i18n.yes : i18n.no}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        computed: {
            filterSecurityLabel: {
                get() {
                    return this.schema.props?.filterSecurityLabel || false;
                },
                set(filterSecurityLabel) {
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'filterSecurityLabel', filterSecurityLabel, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
