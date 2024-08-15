define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.maxNumber"
                field="props.maxNumber"
                :tooltip="i18nMappingObj.tooltip"
            >
                <erd-input
                    class="number-input"
                    v-if="!readonly"
                    v-model.number="maxNumber"
                    style="width: 100%"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseInput"
                ></erd-input>
                <span v-else>{{schema.props.maxNumber}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    maxNumber: this.getI18nByKey('最大值'),
                    tooltip: this.getI18nByKey('限制输入最大值，不输入为无穷大'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            maxNumber: {
                get() {
                    return this.schema.props.maxNumber;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'maxNumber', val ?? null);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
