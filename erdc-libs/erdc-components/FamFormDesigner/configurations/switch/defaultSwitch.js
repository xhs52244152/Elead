define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.defaultValue"
                field="defaultValue"
            >
                <el-switch
                    v-if="!readonly" 
                    v-model="schema.defaultValue"
                    :active-text="schema.props.activeText"
                    :inactive-text="schema.props.inactiveText"
                    :active-value="schema.props.activeValue"
                    :inactive-value="schema.props.inactiveValue"
                    :active-color="schema.props.activeColor"
                    :inactive-color="schema.props.inactiveColor">
                </el-switch>
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
