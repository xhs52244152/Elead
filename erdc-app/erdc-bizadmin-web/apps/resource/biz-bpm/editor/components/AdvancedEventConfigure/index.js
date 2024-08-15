define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedEventConfigure/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/components/AdvancedEventConfigure/style.css'),
    'erdcloud.kit',
    'underscore'
], function(PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'AdvancedEventConfigure',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        mixins: [PropertiesPanelMixin],
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                expanded: true,
                activeName: 'START',
                dialogVisible: false,
                isEditRow: null,
                formData: {
                    handleType: 'INTERFACE',
                    interfaceType: '',
                    eventHierarchy: [],
                    metaInfo: ''
                },
                interfaceTypeList: [
                    {
                        label: 'REST',
                        value: 'REST'
                    },
                    {
                        label: 'DUBBO',
                        value: 'DUBBO'
                    },
                    {
                        label: 'MQ',
                        value: 'MQ'
                    }
                ],
                interfaceDataList: [],
                handleTypeDisabled: false
            }
        },
        computed: {
            eventTypeList() {
                if (/Process$/i.test(this.activeElement.type)) {
                    return [
                        {
                            name: this.i18n.terminate, // 终止
                            value: 'TERMINATE'
                        },
                        {
                            name: this.i18n.delegate, // 代办
                            value: 'DELEGATE'
                        },
                        {
                            name: this.i18n.transfer, // 转办
                            value: 'TRANSFER'
                        },
                        {
                            name: this.i18n.suspend, // 挂起
                            value: 'SUSPEND'
                        },
                        {
                            name: this.i18n.activate, // 激活
                            value: 'ACTIVATE'
                        },
                        {
                            name: this.i18n.minusSign, // 减签
                            value: 'MINUSSIGN'
                        },
                        {
                            name: this.i18n.informed, // 知会
                            value: 'INFORMED'
                        },
                        {
                            name: this.i18n.inquiry, // 询问
                            value: 'INQUIRY'
                        }
                    ];
                } else if (/UserTask$/i.test(this.activeElement.type)) {
                    return [
                        {
                            name: this.i18n.start, // 开始
                            value: 'START'
                        },
                        {
                            name: this.i18n.complete, // 完成
                            value: 'COMPLETE'
                        }
                    ];
                } else if (/EndEvent$/i.test(this.activeElement.type)) {
                    return [
                        {
                            name: this.i18n.end, // 结束
                            value: 'END'
                        }
                    ];
                }else if (/StartEvent$/i.test(this.activeElement.type) ||
                    /ServiceTask$/i.test(this.activeElement.type) ||
                    /SendTask$/i.test(this.activeElement.type) ||
                    /IntermediateCatchEvent$/i.test(this.activeElement.type) ||
                    /BoundaryEvent/i.test(this.activeElement.type)
                ) {
                    return [
                        {
                            name: this.i18n.start, // 开始
                            value: 'START'
                        }
                    ];
                }else {
                    return [];
                }
            },
            handleTypeList() {
                return [
                    {
                        label: this.i18n.interface, // 接口
                        value: 'INTERFACE'
                    },
                    {
                        label: this.i18n.expression, // 表达式
                        value: 'EXPRESSION'
                    },
                    {
                        label: 'groovy',
                        value: 'GROOVY'
                    }
                ];
            },
            handleTypeLabelMap() {
                return this.handleTypeList.reduce((prev, item) => {
                    prev[item.value] = item.label;
                    return prev;
                }, {});
            },
            tableData: {
                get() {
                    return this.formatEchoData(this.activeName);
                }
            },
            columns() {
                return [
                    {
                        prop: 'handleType',
                        title: this.i18n.handleType
                    },
                    {
                        prop: 'eventHierarchy',
                        title: this.i18n.triggerTiming
                    },
                    {
                        prop: 'description',
                        title: this.i18n.description
                    },
                    this.readonly ? null : {
                        prop: 'operation',
                        title: this.i18n.operation,
                        width: '88',
                        fixed: 'right'
                    }
                ].filter(i => i);
            },
            formConfig() {
                const _this = this;
                return [
                    {
                        field: 'handleType',
                        component: 'fam-radio',
                        label: this.i18n.implementation,
                        required: true,
                        disabled: this.handleTypeDisabled,
                        props: {
                            clearable: false,
                            options: this.handleTypeList
                        },
                        listeners: {
                            input: () => {
                                _this.handleTypeChange();
                            }
                        },
                        col: 24
                    },
                    /UserTask$/i.test(this.activeElement.type) ? {
                        field: 'eventHierarchy',
                        component: 'fam-checkbox',
                        label: this.i18n.triggerTiming,
                        hidden: _this.interfaceTypeHidden,
                        required: true,
                        props: {
                            checkedList: this.formData.eventHierarchy,
                            options: [
                                {
                                    label: this.activeName === 'START' ?
                                        this.i18n.taskStart :
                                        this.i18n.taskCompletion,
                                    value: 'TASK'
                                },
                                {
                                    label: this.activeName === 'START' ?
                                        this.i18n.nodeStart :
                                        this.i18n.nodeCompletion,
                                    value: 'NODE'
                                }
                            ]
                        },
                        col: 24
                    } : null,
                    {
                        field: 'interfaceType',
                        component: 'custom-select',
                        label: this.i18n.interfaceType,
                        hidden: _this.interfaceTypeHidden,
                        props: {
                            clearable: false,
                            multiple: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.interfaceTypeList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        listeners: {
                            change: (value) => {
                                _this.interfaceTypeChange(value);
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'metaInfo',
                        component: 'erd-input',
                        label: this.i18n.parameters,
                        hidden: _this.metaInfoHidden,
                        props: {
                            type: 'textarea',
                            rows: 3,
                            clearable: true,
                            maxlength: 1000,
                            'show-word-limit': true,
                            i18nName: this.i18n.parameters
                        },
                        col: 24
                    }
                ].filter(i => i);
            },
            interfaceTypeHidden() {
                return this.formData.handleType !== 'INTERFACE';
            },
            metaInfoHidden() {
                return !this.formData.handleType || this.formData.handleType === 'INTERFACE';
            },
            interfaceColumns() {
                return [
                    {
                        prop: 'checkbox',
                        type: 'checkbox',
                        width: 40,
                        align: 'center'
                    },
                    {
                        prop: 'seq',
                        type: 'seq',
                        width: 48,
                        align: 'center',
                        title: this.i18n.serialNumber
                    },
                    {
                        prop: 'interfaceName',
                        title: this.i18n.interfaceName
                    },
                    {
                        prop: 'interfaceType',
                        title: this.i18n.interfaceType
                    }
                ];
            }
        },
        watch: {
            eventTypeList: {
                immediate: true,
                handler(val) {
                    this.activeName = val[0].value || 'START';
                }
            }
        },
        methods: {
            formatEchoData(activeName) {
                const data = this.isGlobalConfiguration ? this.template.processEventConfig : this.nodeInfo?.processEventConfig;

                return _.filter(data, processEvent => {
                    processEvent.interfaceName = processEvent.interfaceName ||
                        this.template?.processInterfaceMap?.[processEvent.interfaceMasterRef]?.name;
                    processEvent.eventHierarchy = _.isArray(processEvent.eventHierarchy) ? processEvent.eventHierarchy :
                        _.filter((processEvent.eventHierarchy || '').split(','), i => i);
                    return processEvent.eventType === activeName;
                });
            },
            echoEventHierarchy(row, column) {
                if (!row.eventHierarchy?.length) {
                    return '-';
                }
                let name = '';
                _.each(row.eventHierarchy, item => {
                    if (name) {
                        name += '、';
                    }
                    if (item === 'TASK') {
                        name += this.activeName === 'START' ?
                            this.i18n.taskStart :
                            this.i18n.taskCompletion;
                    } else if (item === 'NODE') {
                        name += this.activeName === 'START' ?
                            this.i18n.nodeStart :
                            this.i18n.nodeCompletion;
                    }
                });
                return name;
            },
            echoDescription(row, column) {
                switch (row.handleType) {
                    case 'INTERFACE':
                        return `${this.i18n.interfaceName}：${row.interfaceName || '-'}`;
                    case 'EXPRESSION':
                        return row.metaInfo || '-';
                    case 'GROOVY':
                        return row.metaInfo || '-';
                    default:
                        return '-';
                }
            },
            handleTypeChange() {
                this.formData.interfaceType = '';
                this.formData.metaInfo = '';
                this.formData.eventHierarchy = [];
                this.interfaceDataList = [];
            },
            interfaceTypeChange(interfaceType) {
                if (!interfaceType) return;
                this.$famHttp({
                    url: '/bpm/search',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        className: this.$store.getters.className('businessInterface'),
                        conditionDtoList: [
                            {
                                attrName: `${this.$store.getters.className('businessInterface')}#interfaceType`,
                                oper: 'EQ',
                                value1: interfaceType
                            },
                            {
                                attrName: 'appName',
                                oper: 'EQ',
                                value1: this.template.appName
                            }
                        ]
                    })
                }).then(resp => {
                    let interfacesData = resp?.data?.records || [];
                    _.each(interfacesData, item => {
                        item.formatAttrRawList = this.formatAttrRawList(item.attrRawList);
                    })
                    this.interfaceDataList = interfacesData;
                });
            },
            addRow() {
                this.isEditRow = null;
                this.handleTypeDisabled = false;
                this.dialogVisible = true;
            },
            editRow(row, rowIndex) {
                this.isEditRow = rowIndex;
                this.formData = {
                    handleType: row.handleType || '',
                    interfaceType: row.interfaceType || '',
                    eventHierarchy: row.eventHierarchy || [],
                    metaInfo: row.metaInfo || '',
                };
                if (row.interfaceType) {
                    this.interfaceTypeChange(row.interfaceType);
                }
                this.handleTypeDisabled = true;
                this.dialogVisible = true;
            },
            deleteRow(row, rowIndex) {
                this.$confirm(this.i18n.deleteConfirm, this.i18n.alert).then(() => {
                    const tableData = ErdcKit.deepClone(this.tableData);
                    tableData.splice(rowIndex, 1);
                    let data = this.isGlobalConfiguration ? this.template.processEventConfig : this.nodeInfo.processEventConfig;
                    data = _.chain(data)
                        .filter(processEvent => processEvent.eventType !== this.activeName)
                        .union(tableData)
                        .value();
                    this.updateTemplate('processEventConfig', 'processEventConfig', data);
                });
            },
            confirmFormLayout() {
                const validator = _.isNumber(this.isEditRow) ? this.editConfirm() : this.addConfirm();
                if (!validator.valid) {
                    return this.$message.error(validator.message);
                }
                const tableData = validator.tableData;
                let data = this.isGlobalConfiguration ? this.template.processEventConfig : this.nodeInfo.processEventConfig;
                data = _.chain(data)
                    .filter(processEvent => processEvent.eventType !== this.activeName)
                    .union(tableData)
                    .value();
                this.updateTemplate('processEventConfig', 'processEventConfig', data);
                this.dialogVisible = false;
            },
            addConfirm() {
                let tableData = ErdcKit.deepClone(this.tableData);
                if (this.formData.handleType === 'INTERFACE') {
                    if (/UserTask$/i.test(this.activeElement.type) && !this.formData.eventHierarchy?.length) {
                        return { valid: false, message: this.i18n.triggerTimingTips };
                    }
                    const selectData = _.chain(this.$refs.multipleTable.$table.getCheckboxRecords())
                        .map(data => ({
                            eventType: this.activeName,
                            handleType: this.formData.handleType,
                            interfaceMasterRef: data.masterRef,
                            interfaceName: data.formatAttrRawList.name,
                            eventHierarchy: this.formData.eventHierarchy
                        }))
                        .value();
                    if (!selectData.length) {
                        return { valid: false, message: this.i18n.interfaceTips };
                    }
                    tableData = _.union(tableData, selectData);
                } else {
                    tableData.push({
                        eventType: this.activeName,
                        handleType: this.formData.handleType,
                        metaInfo: this.formData.metaInfo
                    });
                }
                return { valid: true, tableData };
            },
            editConfirm() {
                let tableData = ErdcKit.deepClone(this.tableData);
                tableData[this.isEditRow] = _.extend(tableData[this.isEditRow], this.formData);
                return { valid: true, tableData };
            },
            closeDialog() {
                this.formData = {
                    handleType: 'INTERFACE',
                    interfaceType: '',
                    eventHierarchy: [],
                    metaInfo: ''
                };
                this.interfaceDataList = [];
            }
        }
    };
});
