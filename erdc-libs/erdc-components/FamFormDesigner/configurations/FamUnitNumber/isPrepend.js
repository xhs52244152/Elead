define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18n.unitPrefix"
            field="props.isPrepend"
            :label-width="labelWidth"
        >
            <erd-radio v-model="isPrepend" :label="true">是</erd-radio>
            <erd-radio v-model="isPrepend" :label="false">否</erd-radio>
        </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        computed: {
            isPrepend: {
                get() {
                    return this.schema?.props?.isPrepend ?? false;
                },
                set(isPrepend) {
                    const props = this.schema.props || {};
                    this.$set(props, 'isPrepend', isPrepend);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
