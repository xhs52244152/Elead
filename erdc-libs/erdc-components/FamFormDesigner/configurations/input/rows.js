define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.rows"
                :tooltip="i18nMappingObj.tooltip"
                field="props.rows"
            >
                <el-input-number
                    v-if="!readonly"
                    v-model="schema.props.rows"
                    style="width: 100%"
                    v-bind="props"
                    :min="0"
                    :max="100000"
                    :placeholder="i18nMappingObj.pleaseInput"
                    @change="onRowsChange"
                ></el-input-number>
                <span v-else>{{ schema.props.rows }}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    rows: this.getI18nByKey('行数'),
                    pleaseInput: this.getI18nByKey('请输入'),
                    tooltip: this.getI18nByKey('限制文本域高度，不填或填入0代表不作限制')
                }
            };
        },
        methods: {
            onRowsChange() {
                const props = this.schema.props || {};
                props.autosize = props.rows === 0;
                this.setSchemaValue('props', props);
            }
        }
    };
});
