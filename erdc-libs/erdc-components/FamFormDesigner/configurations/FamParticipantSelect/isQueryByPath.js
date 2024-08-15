define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18n.isSearchByPath"
            field="queryParams.data.isQueryByPath"
            :label-width="labelWidth"
        >
            <erd-checkbox
                v-if="!readonly"
                v-model="isQueryByPath"
            >
            </erd-checkbox>
            <span v-else>
                {{multipleText}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        computed: {
            isQueryByPath: {
                get() {
                    return this.schema.props?.queryParams?.data?.isQueryByPath || false;
                },
                set(isQueryByPath) {
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'queryParams.data.isQueryByPath', isQueryByPath, this, '.');
                    this.setSchemaValue('props', props);
                }
            },
            multipleText() {
                return this.schema?.props?.multiple ? this.i18n.yes : this.i18n.no;
            }
        }
    };
});
