define(['fam:store', 'fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    store,
    FamKit,
    ConfigurationMixin
) {
    const _ = require('underscore');
    const axios = require('fam:http');

    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.attribute"
                field="field"
                :disabled="disabled"
                :required="false"
                :tooltip="i18nMappingObj.tooltip"
            >
                <template v-if="!readonly">
                    <erd-input 
                        v-if="isInput"
                        v-model="schema.field"
                        clearable
                    ></erd-input>
                    <erd-select
                        v-else
                        v-model="schema.field"
                        v-bind="props"
                        :disabled="disabled"
                        filterable
                        clearable
                        allow-create
                        default-first-option
                        @change="setWidgetAttribute"
                        @visible-change="onVisibleChange"
                    >
                        <erd-option
                            v-for="attr in attributes"
                            :key="attr.id"
                            :value="attr.attrName"
                            :label="attr.displayName"
                            :disabled="isAttributeInUsed(attr.attrName)"
                        ></erd-option>
                    </erd-select>
                </template>
                <span v-else>
                    {{ display }}
                </span>
            </fam-dynamic-form-item>
        `,
        inject: ['typeOid', 'attributeList'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    attribute: this.getI18nByKey('associatedAttribute'),
                    tooltip: this.getI18nByKey('widget-field-tooltip')
                },
                attributes: []
            };
        },
        watch: {
            'schema.component': {
                immediate: true,
                deep: true,
                handler(old) {
                    if (FamKit.isSameComponentName(old, 'slot')) {
                        this.schema.field = null;
                    }
                    this.fetchAttributes();
                }
            }
        },
        computed: {
            disabled() {
                // 当前widget如果是AttributeWidget (从属性面板拖拽出来的)，则禁止修改field
                return this.widget.flag === 'ATTR';
            },
            display() {
                const targetAttr = _.find(this.attributes, { attrName: this.field });
                if (targetAttr) {
                    return targetAttr.displayName;
                }
                return this.field;
            },
            field() {
                return this.schema.field;
            },
            isSlot() {
                return FamKit.isSameComponentName(this.schema?.component, 'slot');
            },
            isInput() {
                const components = ['slot', 'fam-classification-title'];
                return !!components.find((component) => FamKit.isSameComponentName(this.schema?.component, component));
            }
        },
        created() {
            this.fetchAttributes();
        },
        methods: {
            fetchAttributes() {
                axios({
                    url: '/fam/type/layout/find/attribute',
                    method: 'get',
                    data: {
                        typeOid: this.typeOid || '',
                        attrName: '',
                        componentName: '',
                        attrCategory: ''
                    }
                }).then(({ data }) => {
                    this.attributes = data.filter((item) => item.attrCategory === 'RELATION');
                    const attr = this.attributes.find((attr) => attr.attrName === this.field);
                    this.setSchemaValue('fieldAttr', attr);
                    if (attr) {
                        this.setSchemaValue('nameI18nJson', { value: attr?.displayName || '' });
                    }
                });
            },
            setWidgetAttribute(attrName) {
                const attr = this.attributes.find((attr) => attr.attrName === attrName);
                const oid = attr ? `OR:${this.$store.getters.className('attributeDefinition')}:${attr.id}` : null;
                this.setWidgetValue('attrRef', oid);
                if (attrName || attr) {
                    this.setSchemaValue('nameI18nJson', { value: attr?.displayName || attrName });
                }
                this.setSchemaValue('fieldAttr', attr);
            },
            isAttributeInUsed(attrName) {
                return this.designer.isAttributeInUsed(attrName);
            },
            onVisibleChange(visible) {
                if (!visible) {
                    this.$nextTick(() => {
                        const attr = this.attributes.find((attr) => attr.attrName === this.schema.field);
                        this.$emit('field-changed', attr);
                    });
                }
            }
        }
    };
});
