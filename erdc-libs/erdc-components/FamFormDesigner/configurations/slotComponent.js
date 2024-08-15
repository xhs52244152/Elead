define([
    ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')
], function(ConfigurationMixin) {
    return {
        name: 'FamWidgetConfigurationSlot',
        mixins: [ConfigurationMixin],
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.slotComponent"
                field="props.slotComponent"
                :tooltip="i18nMappingObj.slotComponentTips"
            >
                <erd-select
                    v-if="!readonly"
                    v-model="schema.props.slotComponent" 
                    v-bind="props"
                    :disabled="readonly"
                    filterable
                    clearable
                >
                  <erd-option
                        v-for="funciton in funcitons"
                        :key="funciton.name"
                        :value="funciton.name"
                        :label="funciton.name"
                    ></erd-option>
                  </erd-select>
                  <span v-else>{{schema.props.slotComponent || '--'}}</span> 
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    'slotComponent': this.getI18nByKey('slotComponent'),
                    'slotComponentTips': this.getI18nByKey('slotComponentTips')
                }
            };
        },
        computed: {
            funcitons() {
                let layoutJson = {};
                try {
                    layoutJson = JSON.parse(this.formConfig?.layoutJson || '{}');
                } catch  (error) {
                    console.error(error)
                }
                return (layoutJson?.functions || []).filter(item => !item.disabled);
            }
        }
    };
});
