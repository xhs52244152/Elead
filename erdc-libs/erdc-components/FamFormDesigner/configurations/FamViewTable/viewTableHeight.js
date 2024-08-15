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
                :label="i18n.viewHeight"
                field="props.viewTableHeight"
                :tooltip="i18n.viewHeightTooltip"
            >
                <template v-if="!readonly">
                    <erd-input v-model.number="viewTableHeight"></erd-input>
                </template>
                <span v-else>
                    {{ viewTableHeight }}
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
            viewTableHeight: {
                get() {
                    return this.schema?.props?.viewTableHeight;
                },
                set(viewTableHeight) {
                    const innerViewTableHeight = _.isNumber(viewTableHeight)
                        ? viewTableHeight
                        : viewTableHeight?.replace(/[^0-9]/g, '');
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'viewTableHeight', innerViewTableHeight, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        },
        methods: {}
    };
});
