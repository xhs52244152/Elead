define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18n.dataSource"
            field="teamOrignType"
            :label-width="labelWidth"
        >
            <fam-dict
                v-model="teamOrignType"
                class="w-100p"
                item-name="teamOrignType"
                dataType="string">
            </fam-dict>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        computed: {
            teamOrignType: {
                get() {
                    return this.schema.props?.queryParams?.data?.teamOrignType || '';
                },
                set(teamOrignType) {
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'queryParams.data.teamOrignType', teamOrignType, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
