define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    const FamKit = require('fam:kit');

    return {
        mixins: [ConfigurationMixin],
        components: {},
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.relationAttr"
                field="props.relationAttr"
                :required="true"
            >
                <erd-select
                    v-if="!readonly"
                    v-model="relationAttr"
                    v-bind="props"
                    allow-create
                    filterable
                    :placeholder="i18nMappingObj.pleaseSelect"
                >
                    <erd-option
                        v-for="item in attrList"
                        :label="item.displayName"
                        :value="item.field"
                        :key="item.field"
                    ></erd-option>
                </erd-select>
                <span v-else>
                    {{ translated }}
                </span>
            </fam-dynamic-form-item>
        `,
        inject: ['attributeList', 'designer'],
        data() {
            return {
                // 接收SettingPanel广播的事件
                listenSettingPanelEvent: true,
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    relationAttr: this.getI18nByKey('codingAttr'),
                    pleaseSelect: this.getI18nByKey('请选择')
                },
                attrList: []
            };
        },
        computed: {
            relationAttr: {
                get() {
                    return this.schema?.props?.relationAttr;
                },
                set(relationAttr) {
                    const props = this.schema.props || {};
                    this.$set(props, 'relationAttr', relationAttr);
                    this.setSchemaValue('props', props);
                }
            },
            translated() {
                let langKey = this.relationAttr;
                const i18nMappingObj = {};
                this.attrList.forEach((item) => {
                    i18nMappingObj[item.field] = i18nMappingObj[item.displayName];
                });
                return i18nMappingObj[langKey];
            }
        },
        mounted() {
            this.attrList = FamKit.TreeUtil.flattenTree2Array(this.attributeList || [], {
                childrenField: 'children'
            })
                .map((item) => {
                    return {
                        displayName: item.displayName,
                        field: item.attrName
                    };
                })
                .filter((item) => item.field && item.field !== this.designer?.selected?.attrName);
        }
    };
});
