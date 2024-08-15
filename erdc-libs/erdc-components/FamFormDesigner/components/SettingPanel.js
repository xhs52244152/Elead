define([
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    ELMP.resource('erdc-components/FamFormDesigner/ConfigurationMixin.js'),
    ELMP.resource('erdc-components/FamFormDesigner/CustomizeConfigurationMixin.js'),
    'underscore'
], function (fieldTypeMapping, ConfigurationMixin, CustomizeConfigurationMixin) {
    const _ = require('underscore');
    const FamKit = require('fam:kit');
    const TreeUtil = FamKit.TreeUtil;

    function broadcast(eventName, params) {
        if (this.$children?.length === 0) {
            return;
        }
        this.$children.forEach((child) => {
            if (child.listenSettingPanelEvent) {
                child.$emit && child.$emit.apply(child, [eventName].concat(params));
            } else {
                broadcast.apply(child, [eventName].concat([params]));
            }
        });
    }

    return {
        mixins: [fieldTypeMapping, ConfigurationMixin, CustomizeConfigurationMixin],

        /*html*/
        template: `
            <erd-scrollbar class="fam-setting-panel">                
                <div class="fam-setting-panel__header">
                    <div class="fam-setting-panel__header-title">
                        {{isFormInfo ? i18nMappingObj.layoutInfos : i18nMappingObj.componentInfos}}
                    </div>
                </div>
                <div v-if="!isFormInfo"
                     class="fam-setting-panel__content"
                 >
                    <erd-form
                        class="fam-dynamic-form"
                        :model.sync="form"
                        :label-width="scope.labelWidth"
                        :label-position="scope.labelPosition"
                    >
                        <erd-row
                            type="flex"
                            justify-content="space-around"
                            :gutter="8"
                        >
                            <erd-col
                                v-for="(conf, index) in configurations"
                                v-if="isConfigurationShows(conf, form)"
                                :key="conf.name || conf"
                                :span="24"
                            >
                                <component
                                    :is="getConfigurationComponent(conf)"
                                    :props="conf.props"
                                    :schema="form"
                                    :form-data.sync="form"
                                    :scope="scope"
                                    :widget="selected"
                                    :form-config="formConfig"
                                    :readonly="readonly"
                                    @update-widget="onWidgetUpdate"
                                    @update-schema="onSchemaUpdate"
                                    @update-form-config="onFormConfigUpdate"
                                    @field-changed="onFieldChanged"
                                ></component>
                            </erd-col>
                        </erd-row>
                    </erd-form>
                </div>
                <div v-if="isFormInfo">
                    <FamFormSetting
                        ref="formInfo"
                        :form-config.sync="formConfig"
                        :readonly="readonly"
                        label-width="106px"
                        :hide-error-message="!isFormInfo"
                        :is-edit="isEdit"
                    ></FamFormSetting>
                </div>
            </erd-scrollbar>
        `,
        components: {
            FamDynamicForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamFormSetting: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamFormDesigner/components/FormSetting.js')
            ),
            'custom-select': FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/CustomSelect/index.js')
            )
        },
        props: {
            designer: Object,
            formConfig: Object,
            readonly: Boolean,
            typeOid: String,
            isEdit: Boolean
        },
        data() {
            return {
                debugPanel: false,
                layoutTypes: [],
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    componentInfos: this.getI18nByKey('组件信息'),
                    layoutInfos: this.getI18nByKey('布局信息'),
                    name: this.getI18nByKey('名称'),
                    displayName: this.getI18nByKey('显示名称'),
                    grid: this.getI18nByKey('栅格'),
                    required: this.getI18nByKey('是否必填'),
                    defaultValue: this.getI18nByKey('默认值'),
                    disabled: this.getI18nByKey('是否禁用'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    fieldValidationTips: this.getI18nByKey('未关联属性')
                }
            };
        },
        computed: {
            isFormInfo() {
                return !this.designer.selected;
            },
            selected() {
                return this.designer.selected || {};
            },
            configurations() {
                return _.map(this.selected.configurations, (i) => (_.isString(i) ? { name: i } : i));
            },
            form: {
                get() {
                    return this.selected.schema || {};
                },
                set(schema) {
                    this.selected.schema = schema;
                }
            },
            scope() {
                const that = this;
                return {
                    labelPosition: 'right',
                    labelWidth: '110px',
                    validateFields: {},
                    validateMsg: {},
                    emitFieldEvent: () => {
                        // do nothing
                    },
                    readonlyComponent(componentName) {
                        if (typeof componentName === 'string') {
                            return that.$store.getters['component/readonlyComponent'](componentName);
                        }
                        return componentName;
                    }
                };
            }
        },
        methods: {
            onWidgetUpdate(key, value) {
                this.designer.setWidgetValue(key, value);
            },
            onSchemaUpdate(key, value) {
                this.designer.setSchemaValue(key, value);
            },
            onFormConfigUpdate(key, value) {
                this.desingner.setFormConfig(key, value);
            },
            validateWidgetsField() {
                const widgetList = TreeUtil.flattenTree2Array(this.designer.widgetList, {
                    childrenField: 'widgetList'
                });

                return new Promise((resolve, reject) => {
                    const validateField = (widget) => {
                        const components = ['slot', 'fam-classification-title'];
                        const isValidComponent = components.find((component) =>
                            FamKit.isSameComponentName(widget?.schema?.component, component)
                        );
                        return {
                            // 校验field必填：只有配置了 configurations的字段才校验
                            valid:
                                !widget.configurations ||
                                (!widget.configurations.includes('field') &&
                                    !widget.configurations.some((item) => item.name === 'field')) ||
                                !!widget.schema.field ||
                                isValidComponent,
                            message: `[${widget.schema.label}]: ${this.i18nMappingObj.fieldValidationTips}`
                        };
                    };
                    const validates = _.chain(widgetList)
                        .map((widget) => {
                            return validateField(widget);
                        })
                        .filter((item) => !item.valid)
                        .value();

                    if (validates.length) {
                        const message = _.map(validates, 'message').join('<br />');
                        this.$message({
                            type: 'warning',
                            dangerouslyUseHTMLString: true,
                            message: message
                        });
                        reject(new Error(message));
                    } else {
                        resolve(true);
                    }
                });
            },
            validate() {
                return new Promise((resolve, reject) => {
                    Promise.all([
                        this.$refs.formInfo ? this.$refs.formInfo.validate().catch((error) => {
                            this.designer.setSelected(null);
                            reject(
                                new Error(
                                    Object.values(error)
                                        .reduce((prev, item) => [...prev, ...item], [])
                                        .map((item) => item.message)
                                        .join('<br />')
                                )
                            );
                        }) : Promise.resolve(true),
                        this.validateWidgetsField()
                    ])
                        .then(([valid1, valid2]) => {
                            const result = valid1 && valid2;
                            if (result) {
                                resolve(result);
                            } else {
                                reject();
                            }
                        })
                        .catch((error) => {
                            if (error instanceof Error) {
                                reject(error);
                            } else {
                                reject();
                            }
                        });
                });
            },
            onFieldChanged(attr) {
                this.broadcast('fieldChanged', attr);
            },
            broadcast(eventName, params) {
                broadcast.call(this, eventName, params);
            }
        }
    };
});
