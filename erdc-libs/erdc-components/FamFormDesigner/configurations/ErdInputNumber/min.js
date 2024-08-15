define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.min"
                field="props.min"
                :tooltip="i18nMappingObj.tooltip"
            >
                <erd-input
                    class="number-input"
                    v-if="!readonly"
                    v-model.number="min"
                    style="width: 100%"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseInput"
                ></erd-input>
                <span v-else>{{schema.props.min}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    min: this.getI18nByKey('最小值'),
                    tooltip: this.getI18nByKey('限制输入最小值，不输入为负无穷大'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            min: {
                get() {
                    return this.schema.props.min;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'min', val === '0' ? val : val ?? undefined);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
