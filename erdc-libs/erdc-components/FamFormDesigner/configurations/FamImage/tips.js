define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                field="props.tips"
                :label="i18nMappingObj.tips"
                :label-width="labelWidth"
                :tooltip="i18nMappingObj.tipsTooltip"
            >
                <erd-input
                    v-model="tips"
                    v-bind="props"
                    :disabled="readonly"
                    :placeholder="i18nMappingObj.pleaseInput"
                    maxlength="50"
                    clearable
                ></erd-input>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    tips: this.getI18nByKey('tips'),
                    tipsTooltip: this.getI18nByKey('tipsTooltip'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            tips: {
                get() {
                    return this.schema.props?.tips || '';
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'tips', val || '', this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
