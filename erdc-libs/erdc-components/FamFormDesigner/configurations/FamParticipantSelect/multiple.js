define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18nMappingObj.multiple"
            field="multiple"
            :label-width="labelWidth"
        >
            <erd-checkbox
                v-if="!readonly"
                v-model="schema.props.multiple"
            >
            </erd-checkbox>
            <span v-else>
                {{multipleText}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    multiple: this.getI18nByKey('是否多选')
                }
            };
        },
        computed: {
            multipleText() {
                return this.schema?.props?.multiple ? this.i18n.yes : this.i18n.no
            }
        }
    };
});
