define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.max"
                field="props.max"
                :tooltip="i18nMappingObj.tooltip"
            >
                <erd-input
                    class="number-input"
                    v-if="!readonly"
                    v-model.number="max"
                    style="width: 100%"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseInput"
                ></erd-input>
                <span v-else>{{schema.props.max}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    max: this.getI18nByKey('最大值'),
                    tooltip: this.getI18nByKey('限制输入最小值，不输入为无穷大'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            max: {
                get() {
                    return this.schema.props.max;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'max', val ?? null);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
