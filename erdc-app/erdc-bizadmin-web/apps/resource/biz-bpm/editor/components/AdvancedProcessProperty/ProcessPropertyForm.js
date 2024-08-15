define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedProcessProperty/ProcessPropertyForm.html'),
    ELMP.resource('erdc-components/FamFormDesigner/ConfigurationMixin.js'),
    'fam:kit'
], function (PropertiesPanelMixin, template, ConfigurationMixin) {
    const ErdcKit = require('fam:kit');

    return {
        name: 'ProcessPropertyForm',
        mixins: [PropertiesPanelMixin, ConfigurationMixin],
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        provide() {
            // 模拟 FormDesigner 环境
            // Reference to FamFormDesigner
            return {
                attributeList: [],
                attributeCategories: [],
                componentDefinitions: [],
                isEdit: this.isEdit,
                typeOid: null,
                readonly: this.readonly,
                designer: null,
                widgets: this.supportedWidgets,
                scopedSlots: {}
            };
        },
        props: {
            row: Object,
            globalProperties: {
                type: Array,
                default() {
                    return [];
                }
            },
            uniqChecker: Function,
            visible: Boolean,
            isEdit: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/components/AdvancedProcessProperty/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'create',
                    'edit',
                    'confirm',
                    'cancel',
                    'basicInfos',
                    'createProperty',
                    'editProperty',
                    'createNodeProperty',
                    'editNodeProperty',
                    'variableLabel',
                    'variableKey',
                    'componentContent',
                    'refVariable',
                    'readonly',
                    'display',
                    'required',
                    'defaultValue',
                    'pleaseEnter',
                    'variableKeyTooltip',
                    'variableKeyDuplicateError',
                    'componentProps'
                ]),
                expanded: true,
                formData: this.row,
                configurations: []
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(visible) {
                    this.$emit('update:visible', visible);
                }
            },
            formConfigs() {
                const that = this;
                return [
                    {
                        field: new Date().getTime().toString(36),
                        label: this.i18nMappingObj.basicInfos,
                        component: 'FamClassificationTitle',
                        props: {
                            unfold: true
                        },
                        children: [
                            {
                                field: 'variableKey',
                                label: this.i18nMappingObj.variableKey,
                                component: 'erd-input',
                                required: !that.readonly,
                                readonly: that.readonly,
                                tooltip: this.i18nMappingObj.variableKeyTooltip,

                                props: {
                                    clearable: true,
                                    autofocus: true,
                                    placeholder: this.i18nMappingObj.pleaseEnter
                                },
                                col: 12
                            },
                            {
                                field: 'variableLabel',
                                label: this.i18nMappingObj.variableLabel,
                                component: 'erd-input',
                                required: !that.readonly,
                                readonly: that.readonly,
                                props: {
                                    clearable: true,
                                    placeholder: this.i18nMappingObj.pleaseEnter
                                },
                                col: 12
                            },
                            {
                                field: 'componentContent.key',
                                label: this.i18nMappingObj.componentContent,
                                component: 'custom-select',
                                required: !that.readonly,
                                readonly: that.readonly,
                                props: {
                                    placeholder: this.i18nMappingObj.pleaseEnter,
                                    defaultSelectFirst: true,
                                    row: {
                                        referenceList: that.supportedWidgets.map((widget) => ({
                                            name: widget.name,
                                            value: widget.key || 'ErdInput'
                                        }))
                                    }
                                },
                                col: 12
                            },
                            ErdcKit.isSameComponentName(
                                this.formData.componentContent?.schema?.component,
                                'FamMemberSelect'
                            )
                                ? // ? {
                                  //     field: 'componentContent.schema.defaultValue',
                                  //     label: this.i18nMappingObj.defaultValue,
                                  //     component: this.formData.componentContent?.schema?.component,
                                  //     readonly: that.readonly,
                                  //     props: Object.assign(
                                  //         {
                                  //             echoField: 'componentContent.schema.props.defaultValue',
                                  //         },
                                  //         this.formData.componentContent?.schema?.props || {}
                                  //     ),
                                  //     col: 12,
                                  //     listeners: {
                                  //         change(users) {
                                  //             that.$set(that.formData.componentContent?.schema?.props, 'defaultValue', users);
                                  //         }
                                  //     }
                                  // }
                                  null
                                : {
                                      field: 'componentContent.schema.defaultValue',
                                      label: this.i18nMappingObj.defaultValue,
                                      component: this.formData.componentContent?.schema?.component,
                                      readonly: that.readonly,
                                      props: this.formData.componentContent?.schema?.props || {},
                                      col: 12
                                  },
                            {
                                field: 'required',
                                label: this.i18nMappingObj.required,
                                component: 'FamBoolean',
                                readonly: that.readonly,
                                defaultValue: false,
                                props: {
                                    disabled: that.readonly
                                },
                                col: 12
                            },
                            {
                                field: 'readOnly',
                                label: this.i18nMappingObj.readonly,
                                component: 'FamBoolean',
                                readonly: that.readonly,
                                defaultValue: false,
                                props: {
                                    disabled: that.readonly
                                },
                                col: 12
                            },
                            {
                                field: 'display',
                                label: this.i18nMappingObj.display,
                                component: 'FamBoolean',
                                readonly: that.readonly,
                                defaultValue: true,
                                props: {
                                    disabled: that.readonly
                                },
                                col: 12
                            },
                            /Process$/i.test(that.activeElement?.type)
                                ? null
                                : {
                                      field: 'refVariableId',
                                      label: this.i18nMappingObj.refVariable,
                                      component: 'custom-select',
                                      readonly: that.readonly,
                                      props: {
                                          placeholder: this.i18nMappingObj.pleaseEnter,
                                          row: {
                                              clearable: true,
                                              referenceList: that.globalProperties.map((property) => ({
                                                  name: ErdcKit.translateI18n(property.variableLabel),
                                                  value: property.variableKey
                                              }))
                                          }
                                      },
                                      col: 12
                                  }
                        ].filter((i) => i)
                    }
                ].filter((i) => i);
            },
            supportedWidgets() {
                return this.$store?.state?.bpmProcessProperty?.supportedWidgets
                    .map((widgetKey) => {
                        return this.$store.state.component.widgets.find((widget) => widget.key === widgetKey);
                    })
                    .filter((i) => i);
            },
            currentWidget() {
                const widgetKey = this.formData?.componentContent?.key || 'ErdInput';
                return {
                    ...this.$store.state.component.widgets.find((widget) => widget.key === widgetKey)
                };
            },
            validators() {
                const that = this;
                return {
                    variableKey: [
                        {
                            trigger: ['input', 'blur'],
                            validator(rule, value, callback) {
                                // 字母或者_开头，可以包含字母、数字和一些特殊字符
                                if (!/^[a-zA-Z_][a-zA-Z\d_]*$/.test(value)) {
                                    callback(new Error(that.i18nMappingObj.variableKeyTooltip));
                                } else if (!that.uniqChecker(value)) {
                                    callback(new Error(that.i18nMappingObj.variableKeyDuplicateError));
                                } else {
                                    callback();
                                }
                            }
                        }
                    ]
                };
            },
            unsupportedConfigurations() {
                const unsupportedConfigurationsByWidget =
                    this.$store?.state?.bpmProcessProperty?.unsupportedConfigurations?.[this.currentWidget?.key] || [];
                return [
                    ...(this.$store?.state?.bpmProcessProperty?.unsupportedConfigurations?.common || {}),
                    ...unsupportedConfigurationsByWidget
                ];
            },
            dialogTitle() {
                const isProcess = /Process/.test(this.activeElement.type);
                const key = `${isProcess ? 'Property' : 'NodeProperty'}`;
                return this.i18nMappingObj[this.isEdit ? `edit${key}` : `create${key}`];
            },
            schemaMapper() {
                let formData = this.formData;
                return {
                    display: function (schema) {
                        schema.disabled = formData.required;
                    },
                    readOnly: function (schema) {
                        schema.disabled = formData.required;
                    }
                };
            }
        },
        watch: {
            row(row) {
                this.formData = Object.assign(
                    {
                        componentContent: {
                            schema: {
                                props: {}
                            }
                        }
                    },
                    row
                );
                this.syncComponentProps();
            }
        },
        mounted() {
            this.formData = Object.assign(
                {
                    componentContent: {
                        schema: {
                            props: {}
                        }
                    }
                },
                this.row
            );
            this.syncComponentProps();
        },
        methods: {
            saveProperty() {
                this.$refs.form.submit().then(({ valid, data }) => {
                    if (valid) {
                        this.innerVisible = false;
                        this.$emit('save', data);
                    }
                });
            },
            cancel() {
                this.formData = {
                    componentContent: {
                        schema: {
                            props: {}
                        }
                    }
                };
                this.innerVisible = false;
                this.$emit('cancel');
            },
            onFieldChange({ field }, value) {
                if (field === 'componentContent.key') {
                    this.formData.defaultValue = null;
                    this.syncComponentProps();
                }
                if (field === 'display') {
                    this.onSchemaUpdate('hidden', !value);
                }
                if (field === 'required') {
                    this.onSchemaUpdate('required', value);
                    if (value) {
                        this.formData.display = value;
                        this.onSchemaUpdate('display', value);
                        this.formData.readOnly = !value;
                        this.onSchemaUpdate('readonly', !value);
                    }
                }
                if (field === 'readOnly') {
                    this.onSchemaUpdate('readonly', value);
                }
            },
            syncComponentProps() {
                const props = this.row?.componentContent?.schema?.props || {};
                this.formData.componentContent = ErdcKit.deepClone({
                    ...this.currentWidget,
                    schema: {
                        ...this.currentWidget.schema,
                        props: {
                            ...this.currentWidget.schema.props,
                            ...props
                        }
                    }
                });
                this.$nextTick(() => {
                    const configurations =
                        this.currentWidget?.configurations?.map((conf) =>
                            typeof conf === 'string' ? { name: conf } : conf
                        ) || [];
                    this.configurations = configurations.filter((item) => {
                        return !this.unsupportedConfigurations.includes(typeof item === 'string' ? item : item.name);
                    });
                });
            },
            getConfSpan(conf) {
                const key = typeof conf === 'string' ? conf : conf.name;
                return ['custom-select/options', 'custom-select/data', 'props.ajax.data'].some((item) => {
                    return item === key || item.replace(/\//g, '-') === key;
                })
                    ? 24
                    : 12;
            },
            onWidgetUpdate(key, value) {
                this.$set(this.formData.componentContent, key, value);
            },
            onSchemaUpdate(key, value) {
                this.$set(this.formData.componentContent.schema, key, value);
            }
        }
    };
});
