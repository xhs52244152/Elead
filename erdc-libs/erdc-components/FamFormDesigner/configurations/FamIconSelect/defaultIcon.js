define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    // TODO 参考FamDynamicFormItem渲染真实组件而不是简单的输入框
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.defaultValue"
                field="icon"
                type="icon"
            >
                <FamIconSelect
                    v-if="!readonly"
                    v-model="schema.icon" 
                    v-bind="props"
                    :visibleBtn="true"
                    btnName="选择图标"
                ></FamIconSelect>
                <span v-else>{{schema.icon}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    icon: this.getI18nByKey('默认图标'),
                    defaultValue: this.getI18nByKey('默认值')
                }
            };
        }
    };
});
