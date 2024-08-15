define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18nMappingObj.placeholder"
            field="props.action"
        >
            <erd-input
                v-if="!readonly"
                v-model="schema.props.action"
                v-bind="props"
                :placeholder="i18nMappingObj.pleaseInput"
                clearable
            ></erd-input>
            <span v-else>
                {{schema.props.action}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    placeholder: this.getI18nByKey('自定义上传地址'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        }
    };
});
