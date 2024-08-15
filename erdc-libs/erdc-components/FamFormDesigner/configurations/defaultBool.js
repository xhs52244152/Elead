define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.defaultValue"
                field="defaultValue"
            >
                <FamBoolean
                    v-if="!readonly"
                    type="select"
                    v-model="schema.defaultValue">
                </FamBoolean>
                <span v-else>{{schema.defaultValue}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    defaultValue: this.getI18nByKey('默认值')
                }
            };
        }
    };
});
