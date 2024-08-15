define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
             <fam-dynamic-form-item
                :label="i18nMappingObj.searchScope"
                field="searchScop"
                :labelWidth="labelWidth"
            >
                <erd-select
                    v-if="!readonly"
                    v-model="schema.props.searchScop"
                    class="w-100p"
                    v-bind="props"
                    filterable
                >
                    <erd-option 
                        value="all"
                        :label="i18nMappingObj.all"
                    ></erd-option>
                    <erd-option
                        value="group"
                        :label="i18nMappingObj.group"
                    ></erd-option>
                    <erd-option
                        value="container"
                        :label="i18nMappingObj.container"
                    ></erd-option>
                </erd-select>
                <span v-else>
                    {{ i18nMappingObj[schema.props.searchScop] }}
                </span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    searchScope: this.getI18nByKey('搜索范围'),
                    all: this.getI18nByKey('全局'),
                    group: this.getI18nByKey('当前租户'),
                    container: this.getI18nByKey('container')
                }
            };
        },
        mounted() {
            // 默认选中全局
            this.setDeepValue('props.searchScop', this.schema?.props?.searchScop || 'all');
        }
    };
});
