define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedProcessProperty/template.html'),
    'fam:kit'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('fam:kit');

    return {
        name: 'AdvancedProcessProperty',
        mixins: [PropertiesPanelMixin],
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamDynamicFormItem: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js')
            ),
            ProcessPropertyForm: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/editor/components/AdvancedProcessProperty/ProcessPropertyForm.js')
            )
        },
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/components/AdvancedProcessProperty/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'processPropertyDefinition',
                    'nodePropertyDefinition',
                    'alert',
                    'create',
                    'edit',
                    'view',
                    'confirm',
                    'cancel',
                    'delete',
                    'basicInfos',
                    'createProperty',
                    'editProperty',
                    'variableLabel',
                    'variableKey',
                    'componentContent',
                    'refVariable',
                    'readonly',
                    'display',
                    'required',
                    'defaultValue',
                    'operation',
                    'pleaseEnter',
                    'variableKeyTooltip',
                    'deleteConfirm'
                ]),
                expanded: true,
                tableData: [],
                targetRow: {},
                editRowIdx: -1,
                visible: false
            };
        },
        computed: {
            panelTitle() {
                return this.nodeInfo ?
                    this.i18nMappingObj.nodePropertyDefinition :
                    this.i18nMappingObj.processPropertyDefinition;
            },
            localProperties() {
                return this.formatProperties(this.nodeInfo?.localVariable || []);
            },
            globalProperties() {
                return this.formatProperties(this.template?.globalVariable || []);
            },
            isLocalProperties() {
                return !/Process$/i.test(this.activeElement.type);
            },
            columns() {
                return [
                    {
                        prop: 'variableKey',
                        title: this.i18nMappingObj.variableKey,
                        minWidth: 120
                    },
                    {
                        prop: 'variableLabel',
                        title: this.i18nMappingObj.variableLabel,
                        minWidth: 120
                    },
                    {
                        prop: 'componentContent.key',
                        title: this.i18nMappingObj.componentContent,
                        minWidth: 100
                    },
                    // {
                    //     prop: 'readOnly',
                    //     title: this.i18nMappingObj.readonly,
                    //     slots: {
                    //         default: 'boolean'
                    //     },
                    //     minWidth: 80
                    // },
                    // {
                    //     prop: 'display',
                    //     title: this.i18nMappingObj.display,
                    //     slots: {
                    //         default: 'boolean'
                    //     },
                    //     minWidth: 80
                    // },
                    // {
                    //     prop: 'required',
                    //     title: this.i18nMappingObj.required,
                    //     slots: {
                    //         default: 'boolean'
                    //     },
                    //     minWidth: 80
                    // },
                    // {
                    //     prop: 'defaultValue',
                    //     title: this.i18nMappingObj.defaultValue,
                    //     minWidth: 120
                    // },
                    !this.isLocalProperties
                        ? null
                        : {
                              prop: 'refVariableId',
                              title: this.i18nMappingObj.refVariable,
                              minWidth: 120
                          },
                    {
                        prop: 'operation',
                        title: this.i18nMappingObj.operation,
                        width: 88,
                        fixed: 'right'
                    }
                ].filter((i) => i);
            }
        },
        watch: {
            activeElement: {
                immediate: true,
                handler() {
                    if (this.isLocalProperties) {
                        this.tableData = this.localProperties;
                    } else {
                        this.tableData = this.globalProperties;
                    }
                }
            }
        },
        methods: {
            createProperty() {
                this.editRowIdx = -1;
                this.targetRow = {
                    componentContent: {
                        schema: {
                            props: {}
                        }
                    }
                };
                this.visible = true;
            },
            onPropertySave(data) {
                if (this.editRowIdx !== -1) {
                    this.tableData.splice(this.editRowIdx, 1, data);
                } else {
                    this.tableData.push(data);
                }
                this.expanded = true;
                this.$nextTick(() => {
                    this.onPropertyCancel();
                    this.saveProcessProperties(this.tableData);
                });
            },
            onPropertyCancel() {
                this.editRowIdx = -1;
                this.targetRow = {
                    componentContent: {
                        schema: {
                            props: {}
                        }
                    }
                };
            },
            formatProperties(properties) {
                return properties.map((property) => {
                    let componentContent = this.getWidget({ componentContent: { key: 'ErdInput' } });
                    try {
                        componentContent = JSON.parse(property.componentContent);
                    } catch (e) {
                        // do noting
                    }
                    return {
                        ...property,
                        componentContent
                    };
                });
            },
            uniqChecker(variableKey) {
                return !this.tableData.some((row) => row !== this.targetRow && row.variableKey === variableKey);
            },
            editRow(row, rowIndex) {
                this.targetRow = row;
                this.editRowIdx = rowIndex;
                this.visible = true;
            },
            deleteRow(row, rowIndex) {
                this.$confirm(this.i18nMappingObj.deleteConfirm, this.i18nMappingObj.alert).then(() => {
                    this.tableData.splice(rowIndex, 1);
                });
                this.updateProcessProperties(this.tableData);
            },
            translateI18n(nameI18nJson) {
                return ErdcKit.translateI18n(nameI18nJson);
            },
            getWidget(row) {
                return (
                    this.$store.state.component.widgets.find((widget) => widget.key === row.componentContent?.key) || {}
                );
            },
            saveProcessProperties(tableData) {
                const properties = tableData.map((row) => {
                    let componentContent = '{}';
                    try {
                        componentContent = JSON.stringify(row.componentContent);
                    } catch (e) {
                        // do noting
                    }
                    return {
                        ...row,
                        componentContent
                    };
                });
                this.updateProcessProperties(properties);
            },
            updateProcessProperties(data) {
                if (this.isLocalProperties) {
                    this.nodeInfo.localVariable = data;
                    this.updateNodeInfo(this.nodeInfo);
                } else {
                    this.template.globalVariable = data;
                    this.$emit('update:template', this.template);
                }
            },
            getReadonlyComponent({ schema }) {
                const componentName = typeof schema.component === 'string' ? schema.component : schema.component?.name;
                const readonlyComponent = this.$store.getters['component/readonlyComponent'](componentName) || componentName;
                const hyphenated = ErdcKit.hyphenate(readonlyComponent);
                if (hyphenated === 'erd-input') {
                    return 'span';
                }
                return hyphenated;
            },
            translateProperty(variableKey) {
                return this.translateI18n(this.globalProperties.find(row => row.variableKey === variableKey)?.variableLabel);
            }
        }
    };
});
