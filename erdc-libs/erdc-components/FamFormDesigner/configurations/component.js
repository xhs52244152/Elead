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
                :label="i18nMappingObj.component"
                field="component"
                required
            >
                <erd-select
                    v-if="!readonly"
                    v-model="schema.component"
                    v-bind="props"
                    :disabled="disabled"
                    filterable
                    @change="setWidgetComponent"
                >
                    <erd-option 
                        v-for="component in components"
                        :key="component.id"
                        :value="component.name"
                        :label="component.displayName"
                    ></erd-option>
                </erd-select>
                <span v-else>
                    {{ display }}
                </span>
            </fam-dynamic-form-item>
        `,
        inject: ['typeOid', 'widgets', 'attributeList', 'componentDefinitions'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    component: this.getI18nByKey('显示组件')
                },
                components: []
            };
        },
        computed: {
            display() {
                const component = _.find(this.components, (component) => {
                    return FamKit.isSameComponentName(component.name, this.schema.component);
                });
                if (component) {
                    return component.displayName;
                }
                return '';
            },
            field() {
                return this.schema.field;
            },
            disabled() {
                // 当前widget如果是ComponentWidget (从属性面板拖拽出来的)，则禁止修改component
                return this.widget.flag === 'COMPONENT';
            }
        },
        mounted() {
            this.fetchComponentsByField();
        },
        methods: {
            fetchComponentsByField() {
                const attrName = this.widget.schema.field;
                const attrDefinition = this.attributeList.find((attr) => attr.attrName === attrName);
                // 只有选中了内部名称，才限制可选组件
                if (!attrDefinition) {
                    this.components = _.map(this.widgets, (widget) => {
                        const name = FamKit.pascalize(widget?.schema?.component || widget.key);
                        return {
                            name,
                            displayName: widget.name,
                            oid: widget.componentRef
                        };
                    });
                } else {
                    const dataType = attrDefinition.dataTypeDto;
                    this.schema.component = this.schema.component || null;
                    axios({
                        url: '/fam/type/datatype/findLinkedComponentList',
                        method: 'get',
                        data: {
                            oid: dataType.oid
                        }
                    }).then(({ data }) => {
                        this.components = data;
                    });
                }
            },
            setWidgetComponent(componentName) {
                let newWidget = null;
                _.each(this.widgets, (widget) => {
                    if (widget && FamKit.isSameComponentName(widget.schema.component, componentName)) {
                        newWidget = this.designer.copyNewFieldWidget(widget);
                    }
                });
                if (newWidget) {
                    const component = this.components.find((component) =>
                        FamKit.isSameComponentName(component.name, componentName)
                    );
                    const oid = `OR:${this.$store.getters.className('componentDefinition')}:${component.id}`;
                    newWidget.attrRef = this.widget.attrRef;
                    newWidget.flag = this.widget.flag;
                    newWidget.componentRef = oid;
                    _.each(newWidget, (val, key) => {
                        this.setWidgetValue(key, val);
                    });
                    this.widget.schema = {
                        ...this.schema,
                        ...this.widget.schema,
                        ...{
                            label: this.schema.label || this.widget.schema.label,
                            nameI18nJson: this.schema.nameI18nJson || this.widget.schema.nameI18nJson
                        }
                    };
                    this.designer.setSelected(this.widget);
                }
            }
        }
    };
});
