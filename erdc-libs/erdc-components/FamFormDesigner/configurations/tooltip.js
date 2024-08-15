define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.tooltip"
                field="tooltip"
            >
                <erd-input
                    v-if="!readonly"
                    v-model="schema.tooltip"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseInput"
                    clearable
                ></erd-input>
                <erd-tooltip
                    v-else 
                    effect="dark"
                    placement="top"
                >
                    <div slot='content'>{{schema.tooltip || '--'}}</div>
                    <span style="width: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{schema.tooltip || '--'}}</span>
                </erd-tooltip>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    tooltip: this.getI18nByKey('帮助信息'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        }
    };
});
