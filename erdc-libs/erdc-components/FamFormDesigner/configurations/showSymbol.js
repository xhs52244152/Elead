define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.symbol"
            >
                <erd-checkbox
                    v-model="value"
                    v-bind="props"
                    :disabled="readonly"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                // listenSettingPanelEvent: true,
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    symbol: this.getI18nByKey('是否显示工艺符号')
                }
            };
        },
        computed: {
            value: {
                get() {
                    return this.schema.props.options?.modules?.symbol ?? false
                },
                set(value) {
                    this.setSchemaValue('props', {options: {modules: {symbol: value}}} );
                }
            }
        }
    };
});
