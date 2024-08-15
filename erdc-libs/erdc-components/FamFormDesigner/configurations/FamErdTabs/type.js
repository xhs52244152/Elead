define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18n.type"
                field="type"
            >
                <erd-select v-model="type" clearable>
                    <erd-option
                        key="default"
                        value=""
                        :label="i18n.default"
                    >
                    </erd-option>
                    <erd-option
                        key="card"
                        value="card"
                        :label="i18n.card"
                    >
                    </erd-option>
                    <erd-option
                        key="border-card"
                        value="border-card"
                        :label="i18n.borderCard"
                    >
                    </erd-option>
                </erd-select>
            </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            return {
                // 接收SettingPanel广播的事件
                listenSettingPanelEvent: true,
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        computed: {
            type: {
                get() {
                    return this.schema?.props?.type === undefined ? 'border-card' : this.schema.props.type;
                },
                set(type) {
                    const { props = {} } = this.schema;
                    this.$set(props, 'type', type);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
