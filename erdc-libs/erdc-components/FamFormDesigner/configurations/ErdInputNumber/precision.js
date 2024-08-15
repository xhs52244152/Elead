define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.precision"
                field="props.precision"
            >
                <erd-input
                    class="number-input"
                    v-if="!readonly"
                    v-model.number="precision"
                    style="width: 100%"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseInput"
                    @input="onInput"
                ></erd-input>
                <span v-else>{{schema.props.precision}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    precision: this.getI18nByKey('数值精度'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            precision: {
                get() {
                    return this.schema.props.precision;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'precision', val ?? null);
                    this.setSchemaValue('props', props);
                }
            }
        },
        methods: {
            onInput(val) {
                val = val.replace(/[^0-9]/g, '');
                val = val ? parseInt(val) : val;
                const props = this.schema.props || {};
                this.$set(props, 'precision', val ?? null);
                this.setSchemaValue('props', props);
            }
        }
    };
});
