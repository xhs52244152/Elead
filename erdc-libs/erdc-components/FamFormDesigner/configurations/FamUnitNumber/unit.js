define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18n.unitMeasurement"
            field="props.unitReference"
        >
            <custom-select
                v-if="!readonly"
                v-model="schema.props.unitReference"
                v-bind="props"
                :row="row"
                :disabled="true"
                clearable
            ></custom-select>
            <span v-else>
                {{schema.props.unitReference}}
            </span>
        </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    placeholder: this.getI18nByKey('自定义上传地址'),
                    pleaseInput: this.getI18nByKey('请输入')
                },
                row: {
                    componentName: 'virtual-select', // 固定
                    viewProperty: 'displayName', // 显示的label的key
                    valueProperty: 'oid', // 显示value的key
                    requestConfig: {
                        url: 'fam/listByKey',
                        params: {
                            className: 'erd.cloud.foundation.units.entity.QuantityOfMeasure'
                        }
                    }
                }
            };
        },
        watch: {
            field: {
                immediate: true,
                handler(field) {
                    const attribute =
                        this.attributeList.find((item) => {
                            return item.attrName === field;
                        }) || {};
                    const { propertyValueMap } = attribute;
                    const unitReference = propertyValueMap?.unitReference?.value || '';
                    const props = this.schema.props || {};
                    this.$set(props, 'unitReference', unitReference);
                    this.setSchemaValue('props', props);
                }
            }
        },
        computed: {
            field() {
                return this.schema.field;
            }
        }
    };
});
