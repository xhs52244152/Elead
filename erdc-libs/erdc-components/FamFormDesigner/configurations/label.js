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
                :label="i18nMappingObj.displayName"
                field="nameI18nJson"
            >
                <fam-i18nbasics
                    v-if="!readonly"
                    v-model="nameI18nJson"
                    style="width: 100%;"
                    :i18n-name="i18nMappingObj.displayName"
                    :max="100"
                 >
                </fam-i18nbasics>
                <span v-else>
                    {{translate(schema.nameI18nJson, schema.label)}}
                </span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    displayName: this.getI18nByKey('显示名称')
                },
                nameI18nJson: this.schema.nameI18nJson
                    ? { value: this.schema.nameI18nJson }
                    : { value: { value: this.label } }
            };
        },
        watch: {
            'schema.nameI18nJson'() {
                this.nameI18nJson = { value: this.schema.nameI18nJson };
            },
            nameI18nJson(nameI18nJson) {
                this.setSchemaValue('nameI18nJson', nameI18nJson.value);
                this.setSchemaValue('label', this.translate(nameI18nJson.value));
            }
        },
        methods: {
            translate(nameI18nJson, label) {
                return FamKit.translateI18n(nameI18nJson) || label;
            }
        }
    };
});
