define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18nMappingObj.echoField"
            field="props.echoField"
            :tooltip="i18nMappingObj.tooltip"
        >
            <erd-input
                v-if="!readonly"
                v-model="schema.props.echoField"
                v-bind="props"
                :placeholder="i18nMappingObj.pleaseInput"
                clearable
            ></erd-input>
            <span v-else>
                {{schema.props.echoField}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    echoField: this.getI18nByKey('回显字段'),
                    pleaseInput: this.getI18nByKey('请输入'),
                    tooltip: this.getI18nByKey('回显人员信息时所使用的字段，通常这个字段包含用户的所有信息')
                }
            };
        }
    };
});
