define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/NodeBaseInfo/template.html'),
    'erdcloud.kit'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'NodeBaseInfo',
        template,
        mixins: [PropertiesPanelMixin],
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        inject: ['lifecycleStatesProvide'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['basicInfo', 'pleaseFillIn', 'duplicateNodeId', 'keyRuleTips']),
                expanded: true,
                componentHiddenControl: {
                    lifecycleStateRef: false
                },
                formData: {}
            };
        },
        computed: {
            formId() {
                return this.nodeInfoOid ? (this.readonly ? 'DETAIL' : 'UPDATE') : 'CREATE';
            },
            nodeInfoOid() {
                return this.nodeInfo?.oid;
            },
            validators() {
                const that = this;
                return {
                    nodeKey: [
                        {
                            trigger: ['input', 'blur'],
                            validator(rule, value, callback) {
                                if (!/^[a-zA-Z$_][0-9a-zA-Z$_-]*$/.test(value)) {
                                    callback(new Error(rule.message));
                                } else {
                                    callback();
                                }
                            },
                            message: this.i18nMappingObj.keyRuleTips
                        },
                        {
                            trigger: ['input', 'blur'],
                            validator(rule, value, callback) {
                                if (that.otherNodes.some((node) => node.nodeKey === value)) {
                                    callback(new Error(rule.message));
                                } else {
                                    callback();
                                }
                            },
                            message: this.i18nMappingObj.duplicateNodeId
                        }
                    ]
                };
            },
            schemaMapper() {
                const activeElement = this.activeElement;
                return {
                    name(schema) {
                        schema.required = /(Task|StartEvent|EndEvent)$/i.test(activeElement.type);
                        return schema;
                    },
                    lifecycleStateRef(schema) {
                        schema.hidden = !/UserTask|ServiceTask/i.test(activeElement.type);
                        return schema;
                    },
                    terminateAll(schema) {
                        schema.hidden = !/EndEvent/i.test(activeElement.type);
                        return schema;
                    },
                    serialnumber(schema) {
                        schema.hidden = !/UserTask|ServiceTask/i.test(activeElement.type);
                        schema.isExtendProperty = true;
                        return schema;
                    },
                    ismail(schema) {
                        schema.hidden = !/UserTask$/i.test(activeElement.type);
                        schema.isExtendProperty = true;
                        return schema;
                    },
                    processPoint(schema) {
                        schema.hidden = !/UserTask/i.test(activeElement.type);
                        return schema;
                    }
                };
            },
            lifecycleStates() {
                return this.lifecycleStatesProvide();
            }
        },
        watch: {
            activeElement: {
                immediate: true,
                handler() {
                    this.formData = this.extractBaseInfo();
                }
            }
        },
        methods: {
            extractBaseInfo() {
                const businessObject = this.activeElement.businessObject;
                if (this.nodeInfo && Object.keys(this.nodeInfo).length) {
                    Object.keys(this.nodeInfo).forEach((key) => {
                        if (key === 'nodeKey') {
                            this.$set(this.nodeInfo, 'nodeKey', this.nodeInfo.nodeKey || businessObject.id);
                            return;
                        }
                        const value = this.getExtensionValue(this.activeElement, key) || businessObject[key];
                        if (value !== undefined) {
                            this.$set(
                                this.nodeInfo,
                                key,
                                this.getExtensionValue(this.activeElement, key) || businessObject[key]
                            );
                        }
                    });
                    if (/EndEvent/.test(businessObject.$type))
                        this.$set(
                            this.nodeInfo,
                            'terminateAll',
                            !!businessObject.terminateEventDefinition?.terminateAll
                        );
                    return this.nodeInfo;
                } else {
                    let terminateAll = !!businessObject.terminateEventDefinition?.terminateAll;
                    if (!terminateAll && businessObject.eventDefinitions) {
                        terminateAll = businessObject.eventDefinitions[0]?.terminateAll;
                    }

                    const data = {
                        nodeKey: businessObject.id,
                        name: businessObject.name,
                        lifecycleStateRef: businessObject.lifecycleStateRef || '',
                        description: (businessObject.documentation || [])[0]?.text || '',
                        serialnumber: this.getExtensionValue(this.activeElement, 'serialnumber'),
                        ismail: this.getExtensionValue(this.activeElement, 'ismail'),
                        terminateAll
                    };
                    this.updateNodeInfo(data);
                    return data;
                }
            },
            onFieldChange({ field, isExtendProperty }, value) {
                this.$nextTick(() => {
                    this.updateBaseInfo(field, value, isExtendProperty);
                });
            },
            updateBaseInfo(field, value, isExtendProperty) {
                const attrObj = {
                    [field]: value
                };
                const modeling = this.modeling;
                if (isExtendProperty) {
                    if (field === 'serialnumber') {
                        value = '' + value;
                    }
                    return this.saveExtensionValues(this.activeElement, field, value);
                }
                if (field === 'nodeKey') {
                    // 节点 Key
                    modeling.updateProperties(this.activeElement, {
                        id: value,
                        di: { id: `${value}_di` }
                    });
                } else if (field === 'description') {
                    // 节点描述
                    const documentation = this.bpmnFactory.create('bpmn:Documentation', {
                        text: value
                    });
                    modeling.updateProperties(this.activeElement, {
                        documentation: [documentation]
                    });
                } else if (field === 'terminateAll') {
                    // 终止全部
                    const terminateAll = this.bpmnFactory.create('bpmn:TerminateEventDefinition', {
                        terminateAll: value
                    });
                    // 终止结束与结束是同一元素，因此删除此字段
                    delete this.activeElement.businessObject.eventDefinitions;
                    this.modeling.updateProperties(this.activeElement, {
                        terminateEventDefinition: terminateAll
                    });
                } else if (field === 'lifecycleStateRef') {
                    // 陈怡说不需要生命周期，先隐藏掉，问题找他
                    this.saveExtensionValues(this.activeElement, 'flowstate', value);
                } else {
                    modeling.updateProperties(this.activeElement, attrObj);
                }
            },
            translateState(stateOid, field = 'displayName') {
                const state = this.lifecycleStates?.find((item) => item.oid === stateOid) || {};
                return state[field] || stateOid;
            },
            async validate() {
                if (this.$refs.form) {
                    return new Promise((resolve) => {
                        this.$refs.form
                            .submit()
                            .then((resp) => {
                                resolve(resp);
                            })
                            .catch((resp) => {
                                resolve({
                                    valid: resp.valid,
                                    message: resp.message || '节点基本信息校验未通过'
                                });
                            });
                    });
                }
                return { valid: true };
            }
        }
    };
});
