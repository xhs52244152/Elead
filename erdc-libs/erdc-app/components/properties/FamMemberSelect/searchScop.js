define([ELMP.resource('erdc-app/components/properties/_mixin.js')], function (ConfigurationMixin) {
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
                    v-model="form.searchScop"
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
                </erd-select>
                <span v-else>
                    {{ i18nMappingObj[form.searchScop] }}
                </span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-app/components/locale/index.js'),
                i18nMappingObj: {
                    searchScope: this.getI18nByKey('搜索范围'),
                    all: this.getI18nByKey('全局'),
                    group: this.getI18nByKey('当前租户')
                }
            };
        },
        mounted() {
            // 默认选中全局
            this.form.searchScop = this.form.searchScop || 'all';
        }
    };
});
