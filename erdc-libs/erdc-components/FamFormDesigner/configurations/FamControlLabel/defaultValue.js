define([
    ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')
], function (ConfigurationMixin) {

    const FamKit = require('fam:kit');

    return {
        mixins: [ConfigurationMixin],
        components: {
            ControlLabel: FamKit.asyncComponent(ELMP.resource('erdc-components/FamControlLabel/index.js')), // 标签组件
        },
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.labelDefault"
                field="tagName"
            >
                <control-label v-model="schema.tagName" v-bind="props" :disable="readonly"></control-label>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath : ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    'labelDefault': this.getI18nByKey('默认标签')
                }
            };
        }
    };
});
