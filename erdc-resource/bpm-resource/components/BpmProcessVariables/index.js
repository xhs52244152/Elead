define(['text!' + ELMP.resource('bpm-resource/components/BpmProcessVariables/index.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'BpmProcessVariables',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            processVariables: {
                type: Array,
                default() {
                    return [];
                }
            },
            readonly: Boolean
        },
        data() {
            return {
                formData: {}
            };
        },
        computed: {
            innerProcessVariables() {
                return this.formatVariables(ErdcKit.deepClone(this.processVariables));
            },
            formConfigs() {
                return this.innerProcessVariables.map((processVariable) => {
                    const schema = processVariable?.componentContent?.schema || {};
                    if (schema.component === 'FamMemberSelect') {
                        schema.listeners = schema.listeners || {};
                        schema.listeners.input = (value, data) => {
                            this.formData[processVariable.variableKey] = data;
                        };
                    }
                    return {
                        ...schema,
                        field: processVariable.variableKey,
                        label: processVariable.variableLabel,
                        readonly: processVariable.readOnly,
                        hidden: !processVariable.display,
                        required: processVariable.required
                    };
                });
            }
        },
        watch: {
            innerProcessVariables: {
                immediate: true,
                handler(processVariables = []) {
                    this.formData = processVariables.reduce((prev, processVariable) => {
                        let { componentContent = {}, componentContentJson = {} } = processVariable;
                        if (ErdcKit.isSameComponentName(componentContent?.key, 'FamCheckbox')) {
                            componentContent.schema.props.checkedList =
                                componentContentJson[processVariable.variableKey];
                        }
                        if (ErdcKit.isSameComponentName(componentContent?.key, 'FamParticipantSelect')) {
                            componentContent.schema.props.withSourceObject = true;
                            componentContent.schema.props.isSaveSelected = true;
                        }

                        return {
                            ...prev,
                            ...processVariable.componentContentJson
                        };
                    }, {});
                }
            }
        },
        methods: {
            formatVariables(processVariables = []) {
                return processVariables.map((processVariable) => {
                    let componentContent = processVariable.componentContent;
                    try {
                        componentContent = JSON.parse(componentContent);
                    } catch (e) {
                        // do noting
                    }
                    let componentContentJson = processVariable.componentContentJson;
                    try {
                        componentContentJson = JSON.parse(componentContentJson);
                    } catch (e) {
                        // do noting
                    }
                    processVariable.componentContent = componentContent;
                    processVariable.componentContentJson = componentContentJson;
                    return processVariable;
                });
            },
            onFieldChange({ field }, value) {
                const processVariable = this.innerProcessVariables.find(
                    (processVariable) => processVariable.variableKey === field
                );
                processVariable.componentContentJson = processVariable.componentContentJson || {};
                processVariable.componentContentJson = {
                    ...processVariable.componentContentJson,
                    [field]: value
                };
            },
            validate() {
                return new Promise((resolve) => {
                    this.$refs.form
                        .validate()
                        .then((valid) => {
                            resolve({ valid });
                        })
                        .catch(() => {
                            resolve({ message: '流程变量校验未通过' });
                        });
                });
            },
            getData() {
                return this.formData;
            }
        }
    };
});
