define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.maxlength"
                field="props.maxlength"
                :tooltip="i18nMappingObj.tooltip"
            >
                <erd-input-number 
                    v-if="!readonly"
                    v-model="maxlength"
                    style="width: 100%"
                    v-bind="props"
                    :min="0"
                    :max="100000"
                    :placeholder="i18nMappingObj.pleaseInput"
                ></erd-input-number>
                <span v-else>{{schema.props.maxlength}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    maxlength: this.getI18nByKey('长度限制'),
                    tooltip: this.getI18nByKey('限制内容输入长度，填入0代表不作限制'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            maxlength: {
                get() {
                    return this.schema.props?.maxlength || 0;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'maxlength', val || null);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
