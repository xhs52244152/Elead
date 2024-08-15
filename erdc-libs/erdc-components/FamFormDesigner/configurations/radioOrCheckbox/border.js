define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.border"
                field="props.border"
                :label-width="labelWidth"
            >
                <erd-checkbox
                    v-model="showBorder" 
                    v-bind="props"
                    :border="false"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    border: this.getI18nByKey('带有边框')
                }
            };
        },
        computed: {
            showBorder: {
                get() {
                    return this.schema?.props?.border || false;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'border', val);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
