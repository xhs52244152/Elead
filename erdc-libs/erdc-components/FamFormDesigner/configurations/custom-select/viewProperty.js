define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18nMappingObj.viewProperty"
            field="props.row.viewProperty"
            :label-width="labelWidth"
            :required="preventRequired ? false : required"
        >
            <erd-input
                v-if="!readonly"
                v-model="schema.props.row.viewProperty"
                class="w-100p"
                :placeholder="schema.props.row.viewProperty ? i18nMappingObj.pleaseInput : 'displayName'"
                v-bind="props"
            ></erd-input>
            <span v-else>
                {{schema.props.row.viewProperty}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    viewProperty: this.getI18nByKey('展示字段'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        }
    };
});
