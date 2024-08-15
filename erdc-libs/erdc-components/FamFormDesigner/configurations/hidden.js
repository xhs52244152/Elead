define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.hidden"
                field="hidden"
            >
                <erd-checkbox 
                    v-model="schema.hidden" 
                    v-bind="props"
                    :disabled="readonly"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            return {
                // 接收SettingPanel广播的事件
                listenSettingPanelEvent: true,
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    hidden: this.getI18nByKey('是否隐藏')
                }
            };
        },
        mounted() {
            this.$on('fieldChanged', (attrDefinition) => {
                if (attrDefinition) {
                    this.schema.hidden = attrDefinition?.constraintDefinitionDto?.isHidden;
                }
            });
        }
    };
});
