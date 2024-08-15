define([
    'text!' + ELMP.resource('biz-bpm/editor/components/SignalCaptureEvent/template.html'),
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js')
], function (template, PropertiesPanelMixin) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: template,
        mixins: [PropertiesPanelMixin],
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/components/SignalCaptureEvent/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'signalEvent',
                    'signalReference'
                ]),
                expanded: true,
                signalForm: {
                    signalRef: ''
                }
            }
        },
        watch:{
            activeElement() {
                this.getCurrentData();
            }
        },
        computed: {
            formConfigs() {
                return [
                    {
                        label: this.i18nMappingObj.signalReference,
                        field: 'signalRef',
                        component: 'custom-select',
                        required: true,
                        props: {
                            defaultValue: this.signalForm.signalRef,
                            clearable: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'name', // 显示的label的key
                                valueProperty: 'id', // 显示value的key
                                referenceList: this.getOptions()
                            }
                        },
                        col: 24
                    }
                ]
            }
        },
        mounted() {
            this.getCurrentData();
        },
        methods: {
            onFieldChange({ field }, value) {
                this.saveSendConfigs(field, value);
            },
            saveSendConfigs(field, value) {
                const SignalEventDefinition = this.bpmnFactory.create(
                    'bpmn:SignalEventDefinition',
                    { signalRef: value }
                );
                const businessObject = this.activeElement.businessObject;
                let eventDefinitions = businessObject.get('eventDefinitions') || [];
                eventDefinitions = eventDefinitions.filter(item => item.$type !== 'bpmn:SignalEventDefinition').concat([SignalEventDefinition]);
                this.modeling.updateProperties(this.activeElement, {
                    eventDefinitions: eventDefinitions,
                    signalRef: value
                });
            },
            getCurrentData() {
                this.signalForm =  {
                    signalRef: ''
                };
                const businessObject = this.activeElement.businessObject;
                let eventDefinitions = businessObject.get('eventDefinitions') || [];
                this.signalForm.signalRef = eventDefinitions[0]?.signalRef || '';
                return this.signalForm;
            },
            getOptions() {
                let definition = this.modeler.getDefinitions();
                let result = definition?.rootElements.filter(item => item.$type === 'bpmn:Signal').map(item => ({
                    name: item.name,
                    id: item.id
                }));
                return result;
            }
        }
    }
})
