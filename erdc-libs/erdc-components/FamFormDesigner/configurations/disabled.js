define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.disabled"
                field="disabled"
            >
                <erd-checkbox 
                    v-model="schema.disabled" 
                    v-bind="props"
                    :disabled="readonly"
                    @change="onChange"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    disabled: this.getI18nByKey('是否禁用')
                }
            };
        },
        methods: {
            onChange() {
                // 同步到props.disabled
                const props = this.widget.schema.props;
                this.$set(props, 'disabled', this.schema.disabled);
                this.setSchemaValue('props', props);
            }
        }
    };
});
