define(['fam:kit'], function (FamKit) {
    const FamComponentConfigurationForm = {
        template: `
            <FamDynamicForm
                ref="form"
                :form.sync="innerForm"
                :form-disabled="formDisabled"
                :data="[]"
                :readonly="readonly"
                label-width="25%"
            >
                <template v-slot="scope">
                    <erd-row 
                        type="flex"
                        :gutter="8"
                        justify-content="space-around"
                    >
                        <erd-col
                            v-for="property in properties"
                            :key="property.name"
                            :span="property.col || 12"
                        >
                            <component
                                :is="property.name"
                                :data.sync="innerData"
                                :formData.sync="widget.schema"
                                :formConfig="{}"
                                :widget="widget"
                                :schema="widget.schema"
                                :props="widget.schema.props"
                                :readonly="readonly"
                                :scope="{}"
                                @update-widget="setWidgetValue"
                                @update-schema="setSchemaValue"
                                label-width="25%"
                                preventRequired
                            ></component>
                        </erd-col>
                    </erd-row>
                </template>
            </FamDynamicForm>
        `,
        props: {
            data: {
                type: Object,
                default() {
                    return {};
                }
            },
            form: {
                type: Object,
                default() {
                    return {};
                }
            },
            properties: {
                type: Array,
                default() {
                    return [];
                }
            },
            formDisabled: {
                type: Boolean,
                default: false
            },
            readonly: Boolean
        },
        provide() {
            return {
                designer: this.designer,
                attributeList: this.attributeList
            };
        },
        data() {
            return {
                designer: null,
                attributeList: null
            };
        },
        computed: {
            innerForm: {
                get() {
                    return this.form || this.innerform;
                },
                set(form) {
                    this.$emit('input', form);
                    this.$emit('update:form', form);
                }
            },
            widget() {
                return {
                    schema: this.innerForm
                };
            },
            innerData: {
                get() {
                    return this.data || {};
                },
                set(formData) {
                    this.$emit('input', formData);
                    this.$emit('update:data', formData);
                }
            }
        },
        methods: {
            setWidgetValue(key, value) {
                // this.$set(this.widget, key, value);
                this.innerForm = this.widget.schema;
            },
            setSchemaValue(key, value) {
                // this.$set(this.widget.schema, key, value);
                // this.$set(this.widget, 'schema', this.widget.schema);
                this.innerForm = this.widget.schema;
            }
        }
    };

    return {
        components: {
            FamComponentConfigurationForm
        },
        computed: {
            propertiesMapping() {
                return this.$store.state.component?.propertiesMapping || {};
            }
        },
        methods: {
            /**
             * 根据组件名称获取对应的配置项
             * @param {string} componentName
             * @returns {Array}
             */
            getPropertiesByComponentName(componentName) {
                return this.propertiesMapping[FamKit.pascalize(componentName)] || [];
            },
            getWidgetByKey(componentName) {
                return this.$store.getters['component/getWidgetByKey'](componentName);
            }
        }
    };
});
