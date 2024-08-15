define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18n.defaultMode"
            field="defaultMode"
            :tooltip="i18nMappingObj.tooltip"
            :label-width="labelWidth"
        >
            <erd-select 
                v-if="!readonly"
                v-model="defaultMode"
                class="w-100p"
                filterable
            >
                <erd-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.displayName"
                    :value="item.value">
                </erd-option>
            </erd-select>
            <span v-else>
                {{typeText}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    tooltip: this.getI18nByKey('defaultLookupMode')
                }
            };
        },
        computed: {
            defaultMode: {
                get() {
                    const defaultMode = this.options.find((item) => item.value === this.schema.props.defaultMode)
                        ? this.schema.props.defaultMode
                        : this.options[0]?.value || '';
                    return defaultMode;
                },
                set(defaultMode) {
                    const props = this.schema.props || {};
                    this.$set(props, 'defaultMode', defaultMode);
                    this.setSchemaValue('props', props);
                }
            },
            typeText() {
                return this.options.find((item) => item.value === this.props.defaultMode)?.displayName || '';
            },
            options() {
                const options = [
                    {
                        value: 'ORG',
                        displayName: this.i18n.ORG
                    },
                    {
                        value: 'ROLE',
                        displayName: this.i18n.ROLE
                    },
                    {
                        value: 'GROUP',
                        displayName: this.i18n.GROUP
                    },
                    {
                        value: 'FUZZYSEARCH',
                        displayName: this.i18n.FUZZYSEARCH
                    },
                    {
                        value: 'RECENTUSE',
                        displayName: this.i18n.RECENTUSE
                    }
                ];
                return options.filter((item) => (this.schema.props?.queryMode || []).includes(item.value));
            }
        },
        watch: {
            options: {
                deep: true,
                immediate: true,
                handler(options) {
                    const defaultMode = options.find((item) => item.value === this.schema.props.defaultMode)
                        ? this.schema.props.defaultMode
                        : options[0]?.value || '';

                    const props = this.schema.props || {};
                    this.$set(props, 'defaultMode', defaultMode);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
