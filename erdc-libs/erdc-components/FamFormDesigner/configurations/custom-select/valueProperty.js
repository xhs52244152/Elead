define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18nMappingObj.valueProperty"
            field="props.row.valueProperty"
            :label-width="labelWidth"
            :required="preventRequired ? false : required"
        >
            <erd-input
                v-if="!readonly"
                v-model="schema.props.row.valueProperty"
                class="w-100p"
                :placeholder="schema.props.row.valueProperty ? i18nMappingObj.pleaseInput : 'oid'"
                v-bind="props"
            ></erd-input>
            <span v-else>
                {{schema.props.row.valueProperty}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    valueProperty: this.getI18nByKey('值字段'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        }
    };
});
