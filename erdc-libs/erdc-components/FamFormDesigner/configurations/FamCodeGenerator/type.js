define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    const FamKit = require('fam:kit');

    return {
        mixins: [ConfigurationMixin],
        components: {
        },
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.type"
                field="props.type"
            >
                <erd-select
                    v-if="!readonly"
                    v-model="type"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseSelect"
                >
                    <erd-option
                        :label="i18nMappingObj.system"
                        value="system"
                    ></erd-option>
                    <erd-option
                        :label="i18nMappingObj.custom"
                        value="custom"
                    ></erd-option>
                    <erd-option
                        :label="i18nMappingObj.autoGeneration"
                        value="autoGeneration"
                    ></erd-option>
                    <erd-option
                        :label="i18nMappingObj.codeGenerate"
                        value="codeGenerate"
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
                    type: this.getI18nByKey('类型'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    system: this.getI18nByKey('system'),
                    custom: this.getI18nByKey('custom'),
                    codeGenerate: this.getI18nByKey('codeGenerate'),
                    autoGeneration: this.getI18nByKey('autoGeneration'),
                }
            };
        },
        computed: {
            type: {
                get() {
                    return this.schema?.props?.type || 'system';
                },
                set(type) {
                    const props = this.schema.props || {};
                    this.$set(props, 'type', type);
                    this.setSchemaValue('props', props);
                }
            },
            translated() {
                let langKey = this.type || 'system';
                langKey = langKey === 'system' ? 'system' : langKey === 'custom' ? 'custom' : langKey || 'system';
                return this.i18nMappingObj[langKey];
            }
        }
    };
});
