define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    // TODO 参考FamDynamicFormItem渲染真实组件而不是简单的输入框
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.value"
                field="props.inactiveValue"
            >
                <erd-input 
                    v-if="!readonly"
                    v-model="schema.props.inactiveValue" 
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseInput"
                ></erd-input>
                <span v-else>{{schema.props.inactiveValue}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    value: this.getI18nByKey('关闭时的背景色'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        }
    };
});
