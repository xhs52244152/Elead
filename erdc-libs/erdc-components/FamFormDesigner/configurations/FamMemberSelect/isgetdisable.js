define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.isgetdisable"
                field="props.isgetdisable"
            >
                <erd-checkbox 
                    v-model="schema.props.isgetdisable" 
                    v-bind="props"
                    :disabled="readonly"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    isgetdisable: this.getI18nByKey('包含停用人员')
                }
            };
        }
    };
});
