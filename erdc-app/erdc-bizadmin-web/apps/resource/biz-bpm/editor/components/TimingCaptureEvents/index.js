define([
    'text!' + ELMP.resource('biz-bpm/editor/components/TimingCaptureEvents/template.html'),
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'underscore',
    'erdcloud.kit'
], function (template, PropertiesPanelMixin) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');
    return {
        name: 'TimingEvent',
        template: template,
        mixins: [PropertiesPanelMixin],
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/components/TimingCaptureEvents/locale/index.js'),
                expanded: true,
                timeForm: {
                    timeCycle: '',
                    timeDate: '',
                    timeDuration: ''
                }
            }
        },
        watch:{
            activeElement() {
                this.getTimeForm();
            }
        },
        computed: {
            formConfigs() {
                const _this = this;
                return [
                    {
                        label: this.i18n.cycleTime,
                        field: 'timeCycle',
                        component: 'erd-input',
                        disabled: false,
                        // tooltip: this.i18n['R3/PT10H'],
                        props: {
                            placeholder: this.i18n.cycleTimeTips
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator(rule, value, callback) {
                                    if (!_this.hideErrorMessage) {
                                        callback(new Error(_this.i18n.requiredTips));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        col: 24
                    },
                    {
                        label: this.i18n.dateTime,
                        field: 'timeDate',
                        component: 'erd-input',
                        disabled: false,
                        // tooltip: this.i18n['ISO-8601'],
                        props: {
                            placeholder: this.i18n.dateTimeTips
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator(rule, value, callback) {
                                    if (!_this.hideErrorMessage) {
                                        callback(new Error(_this.i18n.requiredTips));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        col: 24
                    },
                    {
                        label: this.i18n.duration,
                        field: 'timeDuration',
                        component: 'erd-input',
                        disabled: false,
                        // tooltip: this.i18n['PT5M'],
                        props: {
                            placeholder: this.i18n.durationTips
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator(rule, value, callback) {
                                    if (!_this.hideErrorMessage) {
                                        callback(new Error(_this.i18n.requiredTips));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        col: 24
                    }
                ]
            },
            schemaMapper() {
                let _this = this;
                return {
                    timeCycle: function (schema) {
                        let result = _this.hasData('timeCycle');
                        schema.required = !result;
                        schema.disabled = result;
                    },
                    timeDate: function (schema) {
                        let result = _this.hasData('timeDate');
                        schema.required = !result;
                        schema.disabled = result;
                    },
                    timeDuration: function (schema) {
                        let result = _this.hasData('timeDuration');
                        schema.required = !result;
                        schema.disabled = result;
                    }
                };
            },
            hideErrorMessage() {
                const { timeCycle, timeDate, timeDuration } = this.timeForm;
                return !_.isEmpty(timeCycle) || !_.isEmpty(timeDate) || !_.isEmpty(timeDuration);
            }
        },
        mounted() {
            this.getTimeForm();
        },
        methods: {
            onFieldChange({ field }, value) {
                this.saveSendConfigs(field, value);
            },
            getTimeForm() {
                this.timeForm = {
                    timeCycle: '',
                    timeDate: '',
                    timeDuration: ''
                };
                const timerData = _.find(this.activeElement?.businessObject?.eventDefinitions,
                        item => /TimerEventDefinition/.test(item.$type));
                if (timerData?.values) {
                    _.each(timerData.values, (value, key) => {
                        if(key !== '$type') {
                            this.timeForm[key] = timerData.values[key] || '';
                        }
                    });
                } else {
                    _.each(timerData, (value, key) => {
                        if(key !== '$type') {
                            this.timeForm[key] = timerData[key]?.body || '';
                        }
                    });
                }
            },
            saveSendConfigs(field, value) {
                const data = this.moddle.create(
                    'activiti:' + field.substr(0, 1).toUpperCase() + field.slice(1),
                    {
                        [field]: value
                    }
                );
                const obj = this.moddle.create(
                    'bpmn:TimerEventDefinition',
                    {
                        values: data
                    }
                );

                this.modeling.updateProperties(this.activeElement, {
                    eventDefinitions: [obj]
                });
            },
            hasData(currentKey) {
                let keys = Object.keys(this.timeForm);
                let result = false;
                _.each(keys, key => {
                    if(key !== currentKey && this.timeForm[key]) {
                        result = true
                    }
                });
                return result;
            }
        }
    }
})
