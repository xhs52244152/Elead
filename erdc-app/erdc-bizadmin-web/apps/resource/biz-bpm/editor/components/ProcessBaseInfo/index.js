define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/ProcessBaseInfo/template.html'),
    ELMP.resource('erdc-components/FamDynamicForm/DeepFieldVisitorMixin.js'),
    'erdcloud.kit'
], function (PropertiesPanelMixin, template, DeepFieldVisitorMixin) {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'ProcessBaseInfo',
        template,
        mixins: [DeepFieldVisitorMixin, PropertiesPanelMixin],
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            TypeSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeSelect/index.js'))
        },
        props: {
            template: {
                type: Object,
                default() {
                    return {};
                }
            },
            templateOid: String,
            activeElement: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: Boolean,
            isEdit: Boolean,
            extraInfos: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            const _this = this;
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['basicInfo', 'keyRuleTips']),
                expanded: true,
                schemaMapper: {
                    codeRuleRef(schema) {
                        _this.setFieldValue(schema, 'props.row.requestConfig.data.tenantId', _this.template?.appName);
                        schema.props.defaultSelectFirst = true;
                        return schema;
                    }
                }
            };
        },
        computed: {
            formId() {
                if (this.readonly) {
                    return 'DETAIL';
                }
                return this.isEdit ? 'UPDATE' : 'CREATE';
            },
            formData: {
                get() {
                    return this.extractBaseInfo(this.template);
                },
                set(formData) {
                    this.$emit('update:template', formData);
                }
            },
            relatedTypeDtos() {
                return this.globalFormData.relatedTypeDtos || [];
            },
            globalFormData() {
                return this.formData.globalFormData?.[0] || {};
            },
            processActInstDefList() {
                return this.formData.processActInstDefList || [];
            },
            typeSelectValue: {
                get() {
                    return {
                        appValue: {
                            identifierNo: this.formData?.appName
                        },
                        typeValue: this.relatedTypeDtos.map((item) => ({
                            oid: item.oid,
                            typeName: item.typeName,
                            selected: !!item.selected,
                            typeOid: item.oid,
                            displayName: item.displayName || item.displayCn || item.displayEn,
                            displayEn: item.displayEn || item.displayName || item.displayCn,
                            displayCn: item.displayCn || item.displayName || item.displayEn
                        }))
                    };
                },
                set(value) {
                    let relatedTypeDtos = null;
                    if (value?.typeValue) {
                        relatedTypeDtos = Array.isArray(value.typeValue) ? value.typeValue : [value.typeValue];
                        relatedTypeDtos = relatedTypeDtos.filter(Boolean).map((item) => ({
                            typeName: item.typeName,
                            displayCn: item.displayCn,
                            displayEn: item.displayName,
                            displayName: item.displayName,
                            selected: !!this.relatedTypeDtos.find((i) => i.oid === item.oid)?.selected,
                            oid: item.typeOid
                        }));
                    }

                    this.updateTemplate('globalFormData', 'globalFormData', [
                        {
                            ...this.globalFormData,
                            relatedTypeDtos
                        }
                    ]);

                    this.$nextTick(() => {
                        this.syncRelatedTypeDtos(relatedTypeDtos);
                    });
                }
            },
            validators() {
                return {
                    engineModelKey: [
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
                        }
                    ]
                };
            }
        },
        methods: {
            onFieldChange({ field }, value) {
                this.updateBaseInfo(field, value);
            },
            updateBaseInfo(field, value) {
                const attrObj = {
                    [field]: value
                };
                const modeling = this.modeling;
                if (field === 'engineModelKey') {
                    modeling.updateProperties(this.activeElement, {
                        id: value,
                        di: { id: `${value}_di` }
                    });
                } else if (field === 'metaInfo') {
                    const documentation = this.bpmnFactory.create('bpmn:Documentation', {
                        text: value
                    });
                    modeling.updateProperties(this.activeElement, {
                        documentation: [documentation]
                    });
                } else {
                    modeling.updateProperties(this.activeElement, attrObj);
                }
            },
            extractBaseInfo(tmpl) {
                const businessObject = this.activeElement.businessObject;
                if (Object.keys(tmpl).length) {
                    tmpl.engineModelKey = businessObject.id;
                    tmpl.name = businessObject.name;
                    this.$set(tmpl, 'metaInfo', (businessObject.documentation || [])[0]?.text || '');
                    return tmpl;
                } else {
                    this.$emit('update:template', {
                        ...this.extraInfos,
                        engineModelKey: businessObject.id,
                        name: businessObject.name,
                        codeRuleRef: undefined,
                        metaInfo: (businessObject.documentation || [])[0]?.text || ''
                    });
                }
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
                                    message: resp.message || '流程基本信息校验未通过'
                                });
                            });
                    });
                }
                return { valid: true };
            },
            syncRelatedTypeDtos(relatedTypeDtos) {
                this.processActInstDefList.forEach((item) => {
                    const localFormData = item.localFormData?.[0];
                    if (localFormData) {
                        localFormData.relatedTypeDtos = relatedTypeDtos;
                    }
                });
                const tmpl = ErdcKit.deepClone(this.template);
                tmpl.processActInstDefList = [...this.processActInstDefList];
                this.$emit('update:template', tmpl);
            }
        }
    };
});
