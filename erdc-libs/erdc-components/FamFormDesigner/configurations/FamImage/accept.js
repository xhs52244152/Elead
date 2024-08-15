define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    const ErdcKit = require('erdcloud.kit');
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18nMappingObj.supportImageFormats"
            :label-width="labelWidth"
            field="props.acceptList"
        >
            <custom-select
                v-model="acceptList"
                v-bind="props"
                :row="row"
                :disabled="readonly"
                multiple
                clearable
            ></custom-select>
        </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            const acceptList = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'tiff', 'webp'];
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    supportImageFormats: this.getI18nByKey('supportImageFormats')
                },
                row: {
                    componentName: 'constant-select',
                    viewProperty: 'name',
                    valueProperty: 'value',
                    referenceList: acceptList.map((item) => {
                        return {
                            name: item,
                            value: item
                        };
                    })
                }
            };
        },
        computed: {
            acceptList: {
                get() {
                    return this.schema?.props?.acceptList || [];
                },
                set(acceptList) {
                    const props = this.schema.props || {};
                    ErdcKit.setFieldValue(props, 'acceptList', acceptList, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
