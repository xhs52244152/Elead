define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                label="时间上限"
            >
                <erd-select v-model="schema.timeUpperLimit" :disabled="readonly">
                    <erd-option
                        v-for="item in attributeList"
                        :key="item.id"
                        :label="item.displayName"
                        :value="item.attrName"
                    >
                    </erd-option>
                </erd-select>
            </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            return {};
        },
        mounted() {}
    };
});
