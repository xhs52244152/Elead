define([
    ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js'),
    ELMP.resource('erdc-components/FamI18nbasics/index.js')
], function (ConfigurationMixin, FamI18nbasics) {
    const FamKit = require('fam:kit');

    return {
        mixins: [ConfigurationMixin],
        components: {
            FamI18nbasics
        },
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.placeholder"
                field="props.placeholder"
            >
                <fam-i18nbasics
                    v-if="!readonly"
                    v-model="schema.props.placeholder"
                    class="w-100p"
                    :i18n-name="i18nMappingObj.placeholder"
                    :max="100"
                    clearable
                    @input="handleInput"
                 >
                </fam-i18nbasics>
                <span v-else>
                    {{translatedText || '--'}}
                </span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    placeholder: this.getI18nByKey('提示信息')
                }
            };
        },
        computed: {
            translatedText() {
                if (typeof this.schema.props.placeholder === 'string') {
                    return this.getI18nByKey(this.schema.props.placeholder);
                }
                if (typeof this.schema.props.placeholder === 'object') {
                    return FamKit.translateI18n(typeof this.schema.props.placeholder?.value);
                }
                return '';
            }
        },
        methods: {
            handleInput() {
                this.setSchemaValue('props', { ...this.schema.props });
                this.setSchemaValue('props.placeholder', this.schema.props.placeholder);
            }
        }
    };
});
