define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.previewOrNot"
                :label-width="labelWidth"
                field="props.canPreview"
            >
                <FamBoolean
                    v-model="canPreview"
                    :disabled="readonly"
                    type="basic"
                >
                </FamBoolean>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    previewOrNot: this.getI18nByKey('previewOrNot')
                }
            };
        },
        computed: {
            canPreview: {
                get() {
                    return this.schema.props?.canPreview ?? true;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'canPreview', val ?? true, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
