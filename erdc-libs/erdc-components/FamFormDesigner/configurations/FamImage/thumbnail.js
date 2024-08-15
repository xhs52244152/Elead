define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                field="props.thumbnailSize"
                :label="i18nMappingObj.thumbnailSize"
                :label-width="labelWidth"
                :tooltip="i18nMappingObj.thumbnailSizeTips"
            >
                <erd-input
                    v-model="thumbnailSize"
                    v-bind="props"
                    :disabled="readonly"
                    :placeholder="i18nMappingObj.pleaseInput"
                    clearable
                ></erd-input>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    thumbnailSize: this.getI18nByKey('thumbnailSize'),
                    thumbnailSizeTips: this.getI18nByKey('thumbnailSizeTips'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            thumbnailSize: {
                get() {
                    return this.schema.props?.thumbnailSize || '';
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'thumbnailSize', val || '', this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
