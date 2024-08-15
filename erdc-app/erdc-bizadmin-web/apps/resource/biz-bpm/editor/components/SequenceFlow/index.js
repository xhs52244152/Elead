define([
    'text!' + ELMP.resource('biz-bpm/editor/components/SequenceFlow/template.html'),
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js')
], function (template, PropertiesPanelMixin) {
    const ErdcKit = require('erdc-kit');
    return {
        template: template,
        mixins: [PropertiesPanelMixin],
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/components/SequenceFlow/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'flowCondition',
                    'type',
                    'conditional',
                    'normal',
                    'default',
                    'conditionType'
                ]),
                expanded: true,
                bpmnElementSourceRef: '',
                bpmnElementSource: '',
                flowConditionForm: {},
                conditionTooltip: '${route_flag==route_id}'
            };
        },
        computed: {
            formConfigs() {
                return [
                    {
                        label: this.i18nMappingObj.type,
                        field: 'type',
                        component: 'custom-select',
                        props: {
                            defaultValue: this.flowConditionForm.type,
                            clearable: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.selectData
                            }
                        },
                        col: 24
                    },
                    {
                        label: this.i18nMappingObj.conditional,
                        field: 'body',
                        hidden: false,
                        component: 'erd-input',
                        slots: {
                            label: 'body-label'
                        },
                        col: 24
                    }
                ];
            },
            schemaMapper() {
                let _this = this;
                return {
                    body: function (schema) {
                        schema.hidden = _this.flowConditionForm.type !== 'condition';
                    }
                };
            },
            selectData() {
                return [
                    {
                        label: this.i18nMappingObj.normal,
                        value: 'normal'
                    },
                    {
                        label: this.i18nMappingObj.default,
                        value: 'default'
                    },
                    {
                        label: this.i18nMappingObj.conditionType,
                        value: 'condition'
                    }
                ];
            }
        },
        watch: {
            activeElement() {
                this.resetFlowCondition();
            }
        },
        mounted() {
            this.resetFlowCondition();
        },
        methods: {
            onFieldChange({ field }, value) {
                if (field === 'type') {
                    this.updateFlowType(value);
                    this.resetFlowCondition();
                } else {
                    this.updateFlowCondition(value);
                }
            },
            updateFlowType(value) {
                // 正常条件类
                if (value === 'condition') {
                    if (
                        this.bpmnElementSourceRef.default &&
                        this.bpmnElementSourceRef.default.id === this.activeElement.id
                    ) {
                        this.modeling.updateProperties(this.bpmnElementSource, {
                            default: null
                        });
                    }
                    this.flowConditionRef = this.moddle.create('bpmn:FormalExpression');
                    this.modeling.updateProperties(this.activeElement, {
                        conditionExpression: this.flowConditionRef
                    });
                    return;
                }
                // 默认路径
                if (value === 'default') {
                    this.modeling.updateProperties(this.bpmnElementSource, {
                        default: this.activeElement
                    });
                    this.modeling.updateProperties(this.activeElement, {
                        conditionExpression: null
                    });
                    return;
                }
                // 正常路径，如果来源节点的默认路径是当前连线时，清除父元素的默认路径配置
                if (
                    this.bpmnElementSourceRef.default &&
                    this.bpmnElementSourceRef.default.id === this.activeElement.id
                ) {
                    this.modeling.updateProperties(this.bpmnElementSource, {
                        default: null
                    });
                }
                this.modeling.updateProperties(this.activeElement, {
                    conditionExpression: null
                });
            },
            updateFlowCondition(value) {
                let body = value;
                let { conditionType, scriptType, resource, language } = this.flowConditionForm;
                let condition;
                if (conditionType === 'expression') {
                    condition = this.moddle.create('bpmn:FormalExpression', { body });
                } else {
                    if (scriptType === 'inlineScript') {
                        condition = this.moddle.create('bpmn:FormalExpression', { body, language });
                        this.$set(this.flowConditionForm, 'resource', '');
                    } else {
                        this.$set(this.flowConditionForm, 'body', '');
                        condition = this.moddle.create('bpmn:FormalExpression', { resource, language });
                    }
                }
                this.modeling.updateProperties(this.activeElement, { conditionExpression: condition });
            },
            resetFlowCondition() {
                this.bpmnElementSource = this.activeElement.source;
                this.bpmnElementSourceRef = this.activeElement.businessObject.sourceRef;
                if (
                    this.bpmnElementSourceRef &&
                    this.bpmnElementSourceRef.default &&
                    this.bpmnElementSourceRef.default.id === this.activeElement.id
                ) {
                    // 默认
                    this.flowConditionForm = { type: 'default' };
                } else if (!this.activeElement.businessObject.conditionExpression) {
                    // 普通
                    this.flowConditionForm = { type: 'normal' };
                } else {
                    // 带条件
                    const conditionExpression = this.activeElement.businessObject.conditionExpression;
                    this.flowConditionForm = { ...conditionExpression, type: 'condition' };
                    // resource 可直接标识 是否是外部资源脚本
                    if (this.flowConditionForm.resource) {
                        this.$set(this.flowConditionForm, 'conditionType', 'script');
                        this.$set(this.flowConditionForm, 'scriptType', 'externalScript');
                        return;
                    }
                    if (conditionExpression.language) {
                        this.$set(this.flowConditionForm, 'conditionType', 'script');
                        this.$set(this.flowConditionForm, 'scriptType', 'inlineScript');
                        return;
                    }
                    this.$set(this.flowConditionForm, 'conditionType', 'expression');
                }
            },
            handleConditionExpCopy() {
                ErdcKit.copyTxt(this.conditionTooltip)
                    .then(() => {
                        this.$message.success(this.i18nMappingObj.copySuccess);
                    })
                    .catch((err) => {
                        console.error(err);
                        this.$set(this.flowConditionForm, 'body', this.conditionTooltip);
                    });
            }
        }
    };
});
