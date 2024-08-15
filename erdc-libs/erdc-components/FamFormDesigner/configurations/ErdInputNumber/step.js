define([
    'fam:kit',
    ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js'),
    'css!' + ELMP.resource('erdc-components/FamFormDesigner/style.css')
], function (FamKit, ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.step"
                field="props.step"
                :tooltip="i18nMappingObj.tooltip"
            >
                <erd-input-number
                    class="number-input"
                    v-if="!readonly"
                    v-model="step"
                    style="width: 100%"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseInput"
                    :min="0"
                ></erd-input-number>
                <span v-else>{{schema.props.step}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    step: this.getI18nByKey('计数器步长'),
                    tooltip: this.getI18nByKey('增加或减小时，每次增加或减小的幅度'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            step: {
                get() {
                    return this.schema.props.step;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'step', val ?? null);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
