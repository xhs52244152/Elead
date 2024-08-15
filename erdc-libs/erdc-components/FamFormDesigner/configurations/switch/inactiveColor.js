define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    // TODO 参考FamDynamicFormItem渲染真实组件而不是简单的输入框
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.color"
                field="props.inactiveColor"
            >
            <el-color-picker
            v-if="!readonly"
            v-model="schema.props.inactiveColor">
            </el-color-picker>
                <span v-else>{{schema.props.inactiveColor}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    color: this.getI18nByKey('关闭时的背景色'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        }
    };
});
