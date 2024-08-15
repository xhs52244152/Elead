define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],
        components: {},
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.dateFormat"
                field="props.valueFormat"
            >
                <fam-dict
                    v-if="!readonly"
                    v-model="valueFormat"
                    dataType="string"
                    itemName="dateTimePattern"
                    clearable
                ></fam-dict>
                <span v-else>
                    {{ translated }}
                </span>
            </fam-dynamic-form-item>
        `,
        inject: ['attributeList', 'designer'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    dateFormat: this.getI18nByKey('日期绑定值格式'),
                    pleaseSelect: this.getI18nByKey('请选择')
                }
            };
        },
        computed: {
            valueFormat: {
                get() {
                    return this.schema?.props?.valueFormat || this.schema?.props?.DATE_DISPLAY_FORMAT;
                },
                set(valueFormat) {
                    const props = this.schema.props || {};
                    this.$set(props, 'valueFormat', valueFormat);
                    this.setSchemaValue('props', props);
                }
            },
            translated() {
                let langKey = this.valueFormat;
                return this.i18nMappingObj[langKey];
            }
        }
    };
});
