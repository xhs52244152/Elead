define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    const FamKit = require('fam:kit');

    return {
        mixins: [ConfigurationMixin],
        components: {
            FamDictItemSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDictItemSelect/index.js'))
        },
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.dataType"
                field="props.dataType"
                :label-width="labelWidth"
            >
                <erd-select
                    class="w-100p"
                    v-if="!readonly"
                    v-model="type"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseSelect"
                >
                    <erd-option
                        :label="i18nMappingObj.String"
                        value="string"
                    ></erd-option>
                    <erd-option
                        :label="i18nMappingObj.Object"
                        value="object"
                    ></erd-option>
                </erd-select>
                <span v-else>
                    {{ translated }}
                </span>
            </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            return {
                // 接收SettingPanel广播的事件
                listenSettingPanelEvent: true,
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    dataType: this.getI18nByKey('数据类型'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    String: this.getI18nByKey('字符串'),
                    Array: this.getI18nByKey('数组'),
                    Object: this.getI18nByKey('对象')
                }
            };
        },
        computed: {
            type: {
                get() {
                    return this.schema?.props?.dataType || 'object';
                },
                set(type) {
                    const props = this.schema.props || {};
                    this.$set(props, 'dataType', type);
                    this.setSchemaValue('props', props);
                }
            },
            translated() {
                let langKey = this.type || 'object';
                langKey = langKey === 'object' ? 'Object' : langKey || 'String';
                return this.i18nMappingObj[langKey];
            }
        }
    };
});
