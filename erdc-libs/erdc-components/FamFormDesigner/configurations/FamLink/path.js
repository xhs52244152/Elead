define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18n.path"
                :label-width="labelWidth"
                field="props.path"
                :tooltip="i18nMappingObj.tooltip"
            >
                <erd-input
                    v-model="path"
                    :disabled="readonly"
                    style="width: 100%"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseInput"
                ></erd-input>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    tooltip: this.getI18nByKey('pathTips'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            path: {
                get() {
                    return this.schema.props?.path || '';
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'path', val, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
