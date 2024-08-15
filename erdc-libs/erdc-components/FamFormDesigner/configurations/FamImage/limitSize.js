define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.supportImageSize"
                :label-width="labelWidth"
                field="props.limitSize"
                :tooltip="i18nMappingObj.imageSizeTips"
            >
                <erd-input-number 
                    v-model="limitSize"
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
                    supportImageSize: this.getI18nByKey('supportImageSize'),
                    imageSizeTips: this.getI18nByKey('imageSizeTips'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            limitSize: {
                get() {
                    return this.schema.props?.limitSize || 10;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'limitSize', val || 10, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
