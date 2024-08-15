define([
    ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')
], function (ConfigurationMixin) {

    const FamKit = require('fam:kit');

    return {
        mixins: [ConfigurationMixin],
        components: {
            FamDictItemSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDictItemSelect/index.js'))
        },
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.dictItem"
                field="props.itemName"
            >
                <fam-dict-item-select
                    v-if="!readonly"
                    v-model="schema.props.itemName"
                    v-bind="props"
                    :readonly="readonly"
                ></fam-dict-item-select>
                <span v-else>{{ schema.props.rows }}</span>
            </fam-dynamic-form-item>
        `,
        inject: ['attributeList'],
        data() {
            return {
                // 接收SettingPanel广播的事件
                listenSettingPanelEvent: true,
                i18nLocalePath : ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    'dictItem': this.getI18nByKey('数据项')
                }
            };
        },
        mounted() {
            this.$on('fieldChanged', (attrDefinition) => {
                if (attrDefinition) {
                    const props = this.schema?.props || {};
                    props.itemName = attrDefinition?.constraintDefinitionDto?.dataKey;
                    this.setSchemaValue('props', props);
                }
            });
        }
    };
});
