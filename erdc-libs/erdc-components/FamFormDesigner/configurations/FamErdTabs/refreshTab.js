define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18n.refreshTab"
                field="refreshTab"
            >
                <erd-checkbox 
                    v-model="schema.refreshTab" 
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
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        }
    };
});
