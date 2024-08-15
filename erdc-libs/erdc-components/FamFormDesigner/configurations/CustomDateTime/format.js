define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    const FamKit = require('fam:kit');

    return {
        mixins: [ConfigurationMixin],
        components: {},
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.dateFormat"
                field="props.row.dateFormat"
            >
                <fam-dict
                    v-if="!readonly"
                    v-model="dateFormat"
                    data-type="string"
                    item-name="dateTimePattern"
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
            dateFormat: {
                get() {
                    return this.schema?.props?.row?.dateFormat || this.schema?.props?.DATE_DISPLAY_FORMAT;
                },
                set(dateFormat) {
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'row.dateFormat', dateFormat, this, '.');
                    this.setSchemaValue('props', props);
                }
            },
            translated() {
                let langKey = this.dateFormat;
                return this.i18nMappingObj[langKey];
            }
        }
    };
});
