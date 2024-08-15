define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.supportImageCount"
                :label-width="labelWidth"
                field="props.limit"
                :tooltip="i18nMappingObj.tooltip"
            >
                <erd-input-number 
                    v-model="limit"
                    :disabled="readonly"
                    style="width: 100%"
                    v-bind="props"
                    :min="1"
                    :max="10"
                    step-strictly
                    :placeholder="i18nMappingObj.pleaseInput"
                ></erd-input-number>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    supportImageCount: this.getI18nByKey('supportImageCount'),
                    tooltip: this.getI18nByKey('imageLimtTips'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            limit: {
                get() {
                    return this.schema.props?.limit || 1;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'limit', val || 1, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
