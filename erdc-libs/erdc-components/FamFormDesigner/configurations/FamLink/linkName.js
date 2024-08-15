define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="displayName"
                :label-width="labelWidth"
                field="props.linkName"
            >
                <erd-input
                    v-model="linkName"
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
                    displayName: this.getI18nByKey('显示名称'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            linkName: {
                get() {
                    return this.schema.props?.linkName || '';
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'linkName', val, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
