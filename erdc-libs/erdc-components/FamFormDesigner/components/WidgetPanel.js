define(['vuedraggable'], function (VueDraggable) {
    const _ = require('underscore');
    const FamKit = require('fam:kit');

    return {
        /*html*/
        template: `
            <erd-scrollbar class="fam-widget-panel">
                <erd-tabs
                    v-model="activeTab"
                >
                    <el-tab-pane
                        :label="i18nMappingObj.component"
                        name="COMPONENT"
                    >
                        <template>
                            <erd-input
                                v-model="widgetKeyword"
                                class="mtb-normal"
                                :placeholder="i18nMappingObj.pleaseInput"
                                autofocus
                                clearable
                                suffix-icon="erd-iconfont erd-icon-search"
                            ></erd-input>
                            <erd-contraction-panel
                                v-for="category in categories"
                                :key="category.key"
                                :title="translateCategory(category)"
                                :unfold.sync="unfoldObj[category.key]"
                            >
                                <vue-draggable
                                    tag="erd-row"
                                    :list="category.widgets"
                                    :group="{ name: 'dragGroup', pull: 'clone', put: false }"
                                    :clone="handleFieldWidgetClone"
                                    ghost-class="ghost"
                                    :component-data="{
                                        props: {
                                            gutter: 8
                                        }
                                    }"
                                    :sort="false"
                                    :disabled="readonly"
                                >
                                    <erd-col
                                        v-for="(widget, index) in category.widgets"
                                        v-show="filterByKeyword(widget, ['key', 'name'], widgetKeyword)"
                                        :key="widget.key + '-' + index"
                                        :span="12"
                                    >
                                        <div class="fam-widget-panel__component-item" :title="widget.name">
                                            <span v-show="!readonly">
                                                <erd-icon class="fam-widget-panel__drag-handler" icon="double-drag"></erd-icon>
                                            </span>
                                            {{ widget.name }}
                                        </div>
                                    </erd-col>
                                </vue-draggable>
                            </erd-contraction-panel>
                        </template>
                    </el-tab-pane>
                    <erd-tab-pane
                        :label="i18nMappingObj.attribute"
                        name="ATTR"
                    >
                        <div class="fam-widget-panel__attr-header">
                            <erd-input
                                v-model="attributeKeyword"
                                :placeholder="i18nMappingObj.pleaseInput"
                                clearable
                                suffix-icon="erd-iconfont erd-icon-search"
                            ></erd-input>
                        </div>
                        <div>
                            <vue-draggable
                                tag="erd-row"
                                :list="attributeCategoryWidgets"
                                :group="{ name: 'dragGroup', pull: 'clone', put: false }"
                                filter=".fam-widget-panel__disabled"
                                :clone="handleFieldWidgetClone"
                                ghost-class="ghost"
                                :sort="false"
                                :component-data="{
                                    props: {
                                        gutter: 8
                                    }
                                }"
                                :disabled="readonly"
                            >
                                <erd-col
                                    v-for="widget in attributeCategoryWidgets"
                                    v-show="filterByKeyword(widget, ['attrName', 'name'], attributeKeyword)"
                                    :key="widget.attrRef"
                                    :class="{ 'fam-widget-panel__disabled': isCategoryWidgetDisabled(widget) }"
                                    :span="12"
                                >
                                    <div class="fam-widget-panel__component-item" :title="widget.name">
                                            <span v-show="!readonly">
                                                <erd-icon class="fam-widget-panel__drag-handler" icon="double-drag"></erd-icon>
                                            </span>
                                        {{ widget.name }}
                                    </div>
                                </erd-col>
                            </vue-draggable>
                        </div>
                    </erd-tab-pane>
                </erd-tabs>
            </erd-scrollbar>
        `,
        components: {
            VueDraggable
        },
        inject: ['attributeList', 'attributeCategories', 'componentDefinitions'],
        props: {
            designer: Object,
            readonly: Boolean,
            widgets: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                // 当前Tab页
                activeTab: 'COMPONENT',
                // 当前展开的组件类型
                unfoldObj: {},
                // 属性搜索
                attributeKeyword: null,
                widgetKeyword: null,

                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    attribute: this.getI18nByKey('属性'),
                    component: this.getI18nByKey('组件'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            categories() {
                const categories = this.$store.state.component.categories;
                _.each(categories, (category) => {
                    category.widgets = _.filter(this.widgets, (widget) => {
                        return widget.category === category.key && !widget.disabled;
                    });
                });

                return categories;
            },
            attributeCategoryWidgets() {
                return _.chain(this.attributeList)
                    .filter(Boolean)
                    .map((attribute) => {
                        // 如果属性没有返回componentName字段，默认用input组件
                        const widget = _.find(this.widgets, (widget) =>
                            this.isSameComponentName(
                                attribute.constraintDefinitionDto?.componentName || 'erd-input',
                                widget.key
                            )
                        );

                        const { componentRef } = attribute.constraintDefinitionDto || { componentRef: null };
                        let componentJson = attribute.constraintDefinitionDto?.componentJson;
                        try {
                            componentJson = JSON.parse(componentJson);
                        } catch (e) {
                            componentJson = {};
                        }

                        let componentDefinition = _.find(this.componentDefinitions, { oid: componentRef });
                        if (!componentDefinition) {
                            componentDefinition = _.find(this.componentDefinitions, (def) =>
                                this.isSameComponentName(def.name, 'erd-input')
                            );
                        }

                        if (widget) {
                            const schema = {
                                ...widget.schema,
                                ...componentJson,
                                props: { ...widget.schema.props, ...componentJson.props }
                            };
                            schema.field = attribute.attrName;
                            schema.component = componentDefinition.name;
                            const { propertyValueMap } = attribute;
                            const isReadonly = attribute.constraintDefinitionDto?.isReadonly;
                            const isRequired = attribute.constraintDefinitionDto?.isRequired;
                            const isHidden = attribute.constraintDefinitionDto?.isHidden;
                            const dataKey = attribute.constraintDefinitionDto?.dataKey;
                            const defaultValue = attribute.constraintDefinitionDto?.defaultValue;
                            const unit = propertyValueMap?.unit?.value;
                            const nameI18nJson = propertyValueMap?.displayName?.languageJson;
                            this.$set(
                                schema,
                                'readonly',
                                typeof isReadonly === 'boolean' ? isReadonly : !!schema.readonly
                            );
                            this.$set(
                                schema,
                                'required',
                                typeof isRequired === 'boolean' ? isRequired : !!schema.required
                            );
                            this.$set(schema, 'hidden', typeof isHidden === 'boolean' ? isHidden : !!schema.hidden);
                            if (defaultValue) {
                                this.$set(schema, 'defaultValue', defaultValue);
                            }
                            if (dataKey && !schema.props.itemName) {
                                const props = schema.props || {};
                                props.itemName = dataKey;
                                schema.props = props;
                            }
                            if (unit) {
                                const props = schema.props || {};
                                props.unit = unit || '';
                                schema.props = props;
                            }

                            if (nameI18nJson) {
                                this.$set(schema, 'nameI18nJson', nameI18nJson);
                            }
                            if (schema.props?.row && Object.hasOwn(schema.props.row, 'enumClass')) {
                                schema.props.row.enumClass = attribute.constraintDefinitionDto.realType;
                            }
                            const attrRef = `OR:${this.$store.getters.className('attributeDefinition')}:${
                                attribute.id
                            }`;
                            return _.extend({}, widget, {
                                componentRef: componentDefinition.oid,
                                attrRef,
                                flag: 'ATTR',
                                name: attribute.displayName,
                                schema
                            });
                        }
                    })
                    .compact()
                    .value();
            }
        },
        mounted() {
            this.categories.forEach((item) => {
                this.$set(this.unfoldObj, item.key, true);
            });
        },
        methods: {
            handleFieldWidgetClone(widget) {
                return this.designer.copyNewFieldWidget(widget);
            },
            filterByKeyword(sourceObj, keys, keyword) {
                return (
                    !keys ||
                    !keyword ||
                    _.some(keys, (key) => {
                        return (sourceObj[key] || '').toUpperCase().includes(keyword.toUpperCase());
                    })
                );
            },
            // 判断一个属性widget是否在禁用状态
            isCategoryWidgetDisabled(widget) {
                return this.designer.isAttributeInUsed(widget.attrName || widget.schema.field);
            },
            translateCategory(category) {
                return FamKit.translateI18n(category.nameI18nJson) || category.name;
            },
            isSameComponentName(componentName1, componentName2) {
                return FamKit.pascalize(componentName1) === FamKit.pascalize(componentName2);
            }
        }
    };
});
