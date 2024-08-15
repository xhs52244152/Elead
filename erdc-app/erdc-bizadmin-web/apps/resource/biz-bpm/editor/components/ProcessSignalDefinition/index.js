define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/ProcessSignalDefinition/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/components/ProcessSignalDefinition/style.css'),
    'erdcloud.kit'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        name: 'ProcessSignalDefinition',
        mixins: [PropertiesPanelMixin],
        template,
        components: {
            EditableTable: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/EditableTable/index.js'))
        },
        props: {
            template: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                expanded: true,
                idRegExp: /^[a-zA-Z_][a-zA-Z0-9-_]*$/,
                tableData: []
            };
        },
        computed: {
            column() {
                return [
                    {
                        prop: 'id',
                        title: this.i18n.signalId,
                        tips: this.i18n.signalIdTips,
                        editRender: {
                            autoselect:true,
                            props: {
                                maxlength: 50
                            }
                        },
                        slots: {
                            edit: 'erd-input'
                        }
                    },
                    {
                        prop: 'name',
                        title: this.i18n.signalName,
                        editRender: {
                            props: {
                                maxlength: 50
                            }
                        },
                        slots: {
                            edit: 'erd-input'
                        }
                    },
                    {
                        prop: 'scope',
                        title: this.i18n.signalScope,
                        tips: this.i18n.signalScopeTips,
                        editRender: {
                            props: {
                                clearable: false,
                                defaultSelectFirst: true,
                                row: {
                                    componentName: 'constant-select', // 固定
                                    viewProperty: 'name', // 显示的label的key
                                    valueProperty: 'value', // 显示value的key
                                    referenceList: [
                                        {
                                            name: this.i18n.global,
                                            value: 'global'
                                        },
                                        {
                                            name: this.i18n.processInstance,
                                            value: 'processInstance'
                                        }
                                    ]
                                }
                            }
                        },
                        slots: {
                            default: 'custom-select-static-text',
                            edit: 'custom-select'
                        }
                    },
                    this.readonly ? null : {

                        prop: 'oper',
                        title: this.i18n.operation,
                        width: '80',
                        fixed: 'right',
                        slots: {
                            default: 'oper-remove'
                        }
                    }
                ].filter(i => i);
            },
            rules() {
                const _this = this;
                return {
                    id: [
                        {
                            required: true,
                            message: this.i18n.pleaseFillIn
                        },
                        {
                            validator(rule, value, callback) {
                                if (!/^[a-zA-Z$_][0-9a-zA-Z$_-]*$/.test(value)) {
                                    callback(false, new Error(rule.message));
                                } else {
                                    callback(true);
                                }
                            },
                            message: this.i18n.signalIdTips
                        },
                        {
                            validator(rule, value, callback) {
                                if (_this.tableData.filter(i => i.id === value).length > 1) {
                                    callback(false, new Error(rule.message));
                                } else {
                                    callback(true);
                                }
                            },
                            message: this.i18n.repeatSignal
                        }
                    ],
                    name: [
                        {
                            required: true,
                            message: this.i18n.pleaseFillIn
                        }
                    ]
                };
            }
        },
        watch: {
            tableData: {
                deep: true,
                handler(tableData) {
                    this.saveSignalDefinitions(tableData);
                }
            },
            template: {
                immediate: true,
                handler() {
                    this.initTableData();
                }
            }
        },
        mounted() {
            this.bpmnModeler.on('selection.changed', this.initTableData);
        },
        beforeDestroy() {
            this.bpmnModeler.off('selection.changed', this.initTableData);
        },
        methods: {
            initTableData() {
                this.tableData = this.extractSignalDefinitions();
            },
            addRow() {
                this.expanded = true;
                this.$nextTick(() => {
                    this.$refs.table.addRow({
                        _id: Date.now().toString(36),
                        id: null,
                        name: null,
                        scope: 'global'
                    });
                });
            },
            extractSignalDefinitions() {
                let definition = this.modeler?.getDefinitions();
                const rootElements = definition?.rootElements || [];
                return rootElements.filter(item => item.$type === 'bpmn:Signal').map(item => ({
                    id: item.id,
                    name: item.name,
                    scope: item.$attrs['activiti:scope'] || item.$attrs['scope']
                }));
            },
            saveSignalDefinitions(tableData) {
                const signalRef = tableData.map((row) => this.moddle.create('bpmn:Signal', row));
                let definition = this.modeler.getDefinitions();
                let rootElements = definition?.rootElements?.filter((item) => item.$type !== 'bpmn:Signal').concat(signalRef);
                if (definition) {
                    definition.set('rootElements', rootElements);
                }
            }
        }
    };
});
