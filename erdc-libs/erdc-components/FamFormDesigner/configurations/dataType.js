define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.dataType"
                field="dataType"
            >
                <erd-ex-select
                    v-if="!readonly"
                    v-model="schema.dataType"
                    :options="options">
                </erd-ex-select>
                <span v-else>{{dataTypeName}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    dataType: this.getI18nByKey('选中数据类型'),
                    string: this.getI18nByKey('字符串'),
                    object: this.getI18nByKey('对象')
                }
            };
        },
        computed: {
            dataTypeName() {
                return this.options.find((item) => this.schema.dataType === item.value)?.label || '';
            },
            options() {
                return [
                    {
                        value: 'string',
                        label: this.i18nMappingObj.string
                    },
                    {
                        value: 'object',
                        label: this.i18nMappingObj.object
                    }
                ];
            }
        }
    };
});
