define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.autofocus"
                field="props.autofocus"
            >
                <erd-checkbox 
                    v-model="schema.props.autofocus"
                    v-bind="props"
                    :disabled="readonly"
                    true-label="autofocus"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    autofocus: this.getI18nByKey('自动获得焦点')
                }
            };
        }
    };
});
