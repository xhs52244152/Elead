define(['erdcloud.kit'], function () {
    const ErdcKit = require('erdcloud.kit');

    return {
        /*html*/
        template: `
            <div>
                <FamDynamicForm
                    ref="form"
                    :form.sync="form"
                    :data="basicData"
                    :readonly="readonly"
                    label-width="110px"
                    :hide-error-message="hideErrorMessage"
                >
                    <template #FamListeners="scope">
                        <FamWidgetConfigurationListeners
                            :formConfig="form"
                            :formData="form"
                            label-width="110px"
                            :widget="formWidget"
                            :schema="form"
                            v-bind="scope"
                        >
                            <fam-dynamic-form-item
                                style="margin-bottom: 12px;"
                                :label="i18nMappingObj.formConfigurations"
                                :label-width="labelWidth"
                                :formData="form"
                                field="formConfigurations"
                                :tooltip="i18nMappingObj.formConfigurationsTips"
                                :col="24"
                            >
                                <template #component="scope">
                                    <erd-button 
                                        type="text"
                                        @click="handleFormConfigClick(scope)"
                                    >{{i18nMappingObj.config}}</erd-button>
                                </template>
                                
                            </fam-dynamic-form-item>
                        </FamWidgetConfigurationListeners>
                    </template>
                </FamDynamicForm>
                <erd-ex-dialog
                    :visible.sync="dialog.visible"
                    :title="i18nMappingObj.formConfigurations"
                    size="large"
                >
                    <FunctionAndVariables
                        v-if="dialog.visible"
                        ref="functionAndVariables"
                        :customize-configuration="customizeConfiguration"
                        :readonly="readonly"
                        @update-event="handleEventChange"
                    ></FunctionAndVariables>
                    <template #footer>
                        <erd-button
                            type="primary"
                            @click="handleFunctionAndVariablesSave"
                        >{{i18nMappingObj.confirm}}</erd-button>
                        <erd-button @click="dialog.visible = false">{{i18nMappingObj.cancel}}</erd-button>
                    </template>
                </erd-ex-dialog>
            </div>
        `,
        components: {
            FunctionAndVariables: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamFormDesigner/components/FunctionAndVariables.js')
            ),
            FamWidgetConfigurationListeners: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamFormDesigner/configurations/listeners.js')
            )
        },
        props: {
            formConfig: Object,
            readonly: Boolean,
            hideErrorMessage: Boolean,
            labelWidth: String,
            isEdit: Boolean
        },
        data() {
            const commonArgs = [
                {
                    name: 'field',
                    description: '触发事件的字段',
                    type: 'string'
                },
                {
                    name: 'value',
                    description: '字段值',
                    type: 'any'
                },
                {
                    name: '$event',
                    description: '事件对象',
                    type: 'Object'
                }
            ];

            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    internalName: this.getI18nByKey('内部名称'),
                    name: this.getI18nByKey('名称'),
                    layoutType: this.getI18nByKey('布局类型'),
                    nameRule: this.getI18nByKey("仅支持英文字母、数字与'_'、'.'"),
                    nameErrorMessage: this.getI18nByKey('内部名称格式不正确'),
                    nameI18nJsonErrorMessage: this.getI18nByKey('请填入显示名称'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    description: this.getI18nByKey('描述'),
                    formConfigurations: this.getI18nByKey('formConfigurations'),
                    formConfigurationsTips: this.getI18nByKey('formConfigurationsTips'),
                    config: this.getI18nByKey('config'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel')
                },
                dialog: {
                    visible: false
                },
                customizeConfiguration: {},
                formEvents: [
                    {
                        name: 'fieldFocus',
                        label: 'fieldFocus',
                        description: '表单组件获取焦点事件',
                        disabled: false,
                        arguments: commonArgs
                    },
                    {
                        name: 'fieldInput',
                        label: 'fieldInput',
                        description: '表单组件内容输事件',
                        disabled: false,
                        arguments: commonArgs
                    },
                    {
                        name: 'fieldChange',
                        label: 'fieldChange',
                        description: '表单字段值变化事件',
                        disabled: false,
                        arguments: commonArgs
                    },
                    {
                        name: 'formChange',
                        label: 'formChange',
                        description: '表单任意值发生变化触发的事件',
                        disabled: false,
                        arguments: commonArgs
                    },
                    {
                        name: 'validate',
                        label: 'validate',
                        description: '表单触发任意校验业务时触发的事件',
                        disabled: false,
                        arguments: [
                            {
                                name: 'field',
                                description: '触发事件的字段',
                                type: 'string'
                            },
                            {
                                name: 'valid',
                                description: '校验是否通过',
                                type: 'boolean'
                            },
                            {
                                name: 'message',
                                description: '错误信息',
                                type: 'message'
                            }
                        ]
                    }
                ]
            };
        },
        computed: {
            form: {
                get() {
                    return this.formConfig;
                },
                set(form) {
                    this.$emit('update:formConfig', form);
                }
            },
            basicData() {
                return [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj.internalName,
                        required: true,
                        tooltip: this.i18nMappingObj.nameRule,
                        validators: [
                            {
                                message: this.i18nMappingObj.nameErrorMessage,
                                validator: this.nameFormatValidator,
                                trigger: ['blur', 'change']
                            }
                        ],
                        disabled: this.isEdit,
                        props: {
                            clearable: true,
                            maxlength: 100
                        },
                        col: 24
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.name,
                        validators: [
                            {
                                message: this.i18nMappingObj.nameI18nJsonErrorMessage,
                                validator: this.nameI18nJsonFormatValidator,
                                trigger: ['blur', 'change']
                            }
                        ],
                        required: true,
                        props: {
                            i18nName: this.i18nMappingObj.name,
                            maxlength: 300
                        },
                        col: 24
                    },
                    {
                        field: 'type',
                        component: 'CustomSelect',
                        label: this.i18nMappingObj.layoutType,
                        required: true,
                        props: {
                            placeholder: this.i18nMappingObj.pleaseSelect,
                            clearable: false,
                            row: {
                                componentName: 'custom-virtual-enum-select',
                                enumClass: this.$store.getters.className('layoutTypeEnum')
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'listeners',
                        slots: {
                            component: 'FamListeners',
                            readonly: 'FamListeners'
                        },
                        col: 24
                    }
                ];
            },
            formWidget() {
                return {
                    events: this.formEvents
                };
            }
        },
        methods: {
            validate(...args) {
                return this.$refs.form.validate(...args);
            },
            nameFormatValidator(rule, value, callback) {
                if (/[^a-zA-Z0-9._]+/.test(value)) {
                    callback(new Error(rule.message));
                } else {
                    callback();
                }
            },
            nameI18nJsonFormatValidator(rule, value, callback) {
                const currentLang = this.$store.state.i18n?.lang || 'zh_cn';
                if (
                    !value ||
                    _.isEmpty(value) ||
                    _.isEmpty(value.value) ||
                    (_.isEmpty(value.value.value?.trim()) && _.isEmpty(value.value[currentLang]?.trim()))
                ) {
                    callback(new Error(rule.message));
                } else {
                    callback();
                }
            },
            handleFormConfigClick() {
                this.customizeConfiguration = JSON.parse(this.form.layoutJson || '{}');

                this.dialog.visible = true;
            },
            handleFunctionAndVariablesSave() {
                this.$refs.functionAndVariables?.submit((customizeConfiguration) => {
                    this.$set(
                        this.form,
                        'layoutJson',
                        JSON.stringify({
                            ...this.customizeConfiguration,
                            ...customizeConfiguration
                        })
                    );
                    this.dialog.visible = false;
                });
            },
            handleEventChange() {
                // do nothing
            }
        }
    };
});
