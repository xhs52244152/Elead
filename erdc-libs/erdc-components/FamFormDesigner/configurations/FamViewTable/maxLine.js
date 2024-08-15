define(['fam:store', 'fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    store,
    FamKit,
    ConfigurationMixin
) {
    const _ = require('underscore');

    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18n.maxLine"
                field="props.maxLine"
                :tooltip="i18n.maxLineTooltip"
            >
                <template v-if="!readonly">
                    <erd-input v-model.number="maxLine"></erd-input>
                </template>
                <span v-else>
                    {{ maxLine }}
                </span>
            </fam-dynamic-form-item>
        `,
        inject: ['typeOid', 'attributeList'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        watch: {},
        computed: {
            maxLine: {
                get() {
                    return this.schema?.props?.viewTableConfig?.tableConfig?.tableBaseConfig?.maxLine;
                },
                set(maxLine) {
                    const innerMaxLine = _.isNumber(maxLine)
                        ? maxLine
                        : maxLine?.replace(/[^0-9]/g, '');
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'viewTableConfig.tableConfig.tableBaseConfig.maxLine', innerMaxLine, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        },
        methods: {}
    };
});
