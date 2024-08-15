define([
    'text!' + ELMP.resource('biz-bpm/editor/PropertiesPanel/template.html'),
    ELMP.resource('biz-bpm/editor/PropertiesPanel/registers.js'),
    'css!' + ELMP.resource('biz-bpm/editor/PropertiesPanel/style.css'),
    'fam:kit'
], function (template, registers) {
    const ErdcKit = require('fam:kit');

    return {
        template,
        components: {
            BasicInfo: ErdcKit.asyncComponent(ELMP.resource(`biz-bpm/editor/BasicInfo/index.js`)),
            PanelTitle: ErdcKit.asyncComponent(ELMP.resource(`biz-bpm/editor/PanelTitle/index.js`))
        },
        provide() {
            return {
                lifecycleStatesProvide: this.lifecycleStatesProvide
            };
        },
        props: {
            template: {
                type: Object,
                default() {
                    return {};
                }
            },
            templateOid: String,
            readonly: Boolean,
            activeElement: {
                type: Object,
                default() {
                    return {};
                }
            },
            bpmnModeler: Object,
            categoryRef: String,
            appName: String
        },
        data() {
            return {
                registers,
                activeName: '',
                height: '500px',
                lifecycleStates: []
            };
        },
        computed: {
            isEdit() {
                return Boolean(this.templateOid) || Boolean(this.innerTemplate.oid);
            },
            tabs() {
                return this.registers.find((register) => register.rule.test(this.activeElement.type))?.tabs || [];
            },
            innerTemplate: {
                get() {
                    return this.template;
                },
                set(template) {
                    this.$emit('update:template', template);
                }
            },
            extraInfos() {
                return Object.assign({}, this.innerTemplate, { categoryRef: this.categoryRef, appName: this.appName });
            }
        },
        watch: {
            tabs: {
                immediate: true,
                handler() {
                    this.activeName = this.tabs.some((tab) => tab.name === this.activeName)
                        ? this.activeName
                        : this.tabs[0]?.name;
                }
            },
            categoryRef: {
                immediate: true,
                handler(categoryRef) {
                    this.fetchLifecycleStates(categoryRef);
                }
            }
        },
        beforeDestroy() {
            this.lifecycleStates = null;
        },
        methods: {
            isComponent(component) {
                if (component.name === 'SequenceFlow' && this.activeElement.source?.type.indexOf('StartEvent') !== -1)
                    return false;
                const eventDefinitions = this.activeElement?.businessObject?.eventDefinitions || [];
                return !component.onlyRule || component.onlyRule.test(eventDefinitions?.[0]?.$type);
            },
            resetPanelHeight() {
                this.$nextTick(() => {
                    this.height =
                        window.innerHeight -
                        ErdcKit.offset(this.$el.querySelector('.el-tabs__content')).top -
                        36 +
                        'px';
                });
            },
            translateLabel(label) {
                return ErdcKit.translateI18n(label);
            },
            fetchLifecycleStates() {
                this.$famHttp
                    .get('/fam/lifecycle/state/all', {
                        data: {
                            className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState'
                        }
                    })
                    .then(({ data }) => {
                        this.lifecycleStates = data;
                    });
            },
            lifecycleStatesProvide() {
                return this.lifecycleStates;
            },
            async validate() {
                const validate = {
                    valid: true,
                    message: []
                };
                if (this.$refs.processBaseInfo && this.$refs.processBaseInfo[0]) {
                    const result = await this.$refs.processBaseInfo[0].validate();
                    validate.valid = result.valid;
                    validate.message.push(result.message);
                }
                if (this.$refs.nodeBaseInfo && this.$refs.nodeBaseInfo[0]) {
                    const result = await this.$refs.nodeBaseInfo[0].validate();
                    validate.valid = result.valid;
                    validate.message.push(result.message);
                }
                return validate;
            }
        }
    };
});
