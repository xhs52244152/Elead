define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    const ErdcKit = require('erdcloud.kit');

    return {
        mixins: [ConfigurationMixin],
        components: {},
        template: `
            <fam-dynamic-form-item
                :label-width="labelWidth"
                :label="i18nMappingObj.type"
                field="props.row.type"
            >
                <erd-select
                    class="w-100p"
                    v-if="!readonly"
                    v-model="type"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseSelect"
                >
                    <el-option
                        v-for="(value, key) in typeList"
                        :key="value"
                        :label="key"
                        :value="value"
                    ></el-option>
                </erd-select>
                <span v-else>
                    {{ translated }}
                </span>
            </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            return {
                typeList: {
                    选择年份: 'year',
                    选择年份和月份: 'month',
                    选择具体的日期: 'date',
                    选择日期区间: 'daterange'
                },
                // 接收SettingPanel广播的事件
                listenSettingPanelEvent: true,
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    type: this.getI18nByKey('类型'),
                    pleaseSelect: this.getI18nByKey('请选择')
                }
            };
        },
        computed: {
            type: {
                get() {
                    return this.schema?.props?.row?.type || 'date';
                },
                set(type) {
                    const format = {
                        year: 'yyyy',
                        month: 'yyyy-MM',
                        date: 'yyyy-MM-dd',
                        daterange: 'yyyy-MM-dd'
                    };
                    const props = this.schema.props || {};
                    ErdcKit.setFieldValue(props, 'row.type', type, this, '.');
                    ErdcKit.setFieldValue(props, 'row.dateFormat', format[type], this, '.');
                    this.setSchemaValue('props', props);
                }
            },
            translated() {
                let langKey = this.type || 'date';
                return this.i18nMappingObj[langKey];
            }
        }
    };
});
