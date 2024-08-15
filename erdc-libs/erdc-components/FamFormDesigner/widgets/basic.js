define([ELMP.resource('erdc-components/FamDynamicForm/DeepFieldVisitorMixin.js')], function (DeepFieldVisitorMixin) {
    return function ({ getConfigurations }) {
        return [
            {
                key: 'ErdInput',
                name: '输入框',
                category: 'basic',
                disabled: false,
                schema: {
                    label: '',
                    labelLangKey: null,
                    component: 'ErdInput',
                    required: false,
                    props: {
                        maxlength: 100,
                        showWordLimit: true
                    },
                    col: 12
                },
                configurations: getConfigurations(
                    [
                        'field',
                        'component',
                        'label',
                        'columnNumber',
                        'input/type',
                        'input/maxlength',
                        'placeholder',
                        'tooltip',
                        'input/rows',
                        'defaultValue',
                        'required',
                        'props.clearable',
                        'disabled',
                        'readonly',
                        'FamLink/path',
                        'hidden',
                        'autofocus',
                        'syncToChild',
                        'listeners'
                    ],
                    function customize(name, config) {
                        // customize 用于动态修改配置项
                        if (name === 'input/rows') {
                            config.hidden = (schema) => {
                                return schema.props.type !== 'textarea';
                            };
                        }
                        if (name === 'FamLink/path') {
                            config.hidden = (schema) => {
                                return !schema?.readonly;
                            };
                        }
                        return config;
                    }
                ),
                mappers: [
                    function ({ widget }) {
                        const defaultMaxlength = 100;
                        if (_.isEmpty(widget.schema.props)) {
                            widget.schema.props = {
                                maxlength: defaultMaxlength,
                                showWordLimit: true
                            };
                        } else {
                            widget.schema.props['maxlength'] =
                                widget.schema.props.maxlength !== undefined
                                    ? widget.schema.props.maxlength
                                    : defaultMaxlength;
                            widget.schema.props['showWordLimit'] =
                                widget.schema.props.showWordLimit !== undefined
                                    ? widget.schema.props.showWordLimit
                                    : true;
                        }
                        return widget;
                    }
                ],
                events: [
                    {
                        name: 'input',
                        label: 'Input',
                        description: 'Input 事件',
                        disabled: false,
                        arguments: [
                            {
                                name: 'value',
                                description: '当前值',
                                type: 'string'
                            }
                        ]
                    },
                    {
                        name: 'blur',
                        label: 'Blur',
                        description: '控件失焦事件',
                        disabled: false,
                        arguments: [
                            {
                                name: 'event',
                                description: '原生事件对象',
                                type: 'Event'
                            }
                        ]
                    },
                    {
                        name: 'focus',
                        label: 'Focus',
                        description: '控件获取焦点事件',
                        disabled: false,
                        arguments: [
                            {
                                name: 'event',
                                description: '原生事件对象',
                                type: 'Event'
                            }
                        ]
                    },
                    {
                        name: 'change',
                        label: 'Change',
                        description: 'Change 事件',
                        arguments: [
                            {
                                name: 'value',
                                label: '当前值',
                                type: 'string'
                            }
                        ]
                    }
                ]
            },
            {
                key: 'CustomSelect',
                name: '选择框',
                category: 'basic',
                disabled: false,
                schema: {
                    label: '',
                    labelLangKey: null,
                    component: 'CustomSelect',
                    required: false,
                    props: {
                        row: {
                            referenceList: [] // 固定下拉框数据源
                        }
                    },
                    col: 12
                },
                configurations: getConfigurations(
                    [
                        'field',
                        'component',
                        'ref',
                        'label',
                        'columnNumber',
                        'tooltip',
                        'defaultValue',
                        'required',
                        'props.clearable',
                        'disabled',
                        'readonly',
                        'FamLink/path',
                        'hidden',
                        'multiple',
                        'syncToChild',
                        'custom-select/options',
                        'listeners'
                    ],
                    function customize(name, config) {
                        if (name === 'FamLink/path') {
                            config.hidden = (schema) => {
                                return !schema?.readonly;
                            };
                        }
                    }
                ),
                events: [
                    {
                        name: 'change',
                        label: 'Change',
                        description: 'Change 事件',
                        arguments: [
                            {
                                name: 'values',
                                label: '当前选中的项',
                                type: 'Array<Object>'
                            },
                            {
                                name: 'selected',
                                label: '当前选中的值',
                                type: 'Object|Array<Object>'
                            }
                        ]
                    }
                ]
            },
            {
                key: 'CustomVirtualEnumSelect',
                name: '选择框-枚举',
                category: 'basic',
                disabled: false,
                schema: {
                    label: '',
                    labelLangKey: null,
                    component: 'CustomVirtualEnumSelect',
                    required: false,
                    props: {
                        clearable: true,
                        filterable: true,
                        row: {
                            enumClass: null,
                            clearable: true,
                            filterable: true
                        }
                    },
                    col: 12
                },
                configurations: getConfigurations(
                    [
                        'field',
                        'component',
                        'ref',
                        'label',
                        'custom-select/enum',
                        'columnNumber',
                        'tooltip',
                        'defaultValue',
                        'required',
                        'props.clearable',
                        'disabled',
                        'readonly',
                        'FamLink/path',
                        'hidden',
                        'multiple',
                        'syncToChild',
                        'listeners'
                    ],
                    function customize(name, config) {
                        if (name === 'FamLink/path') {
                            config.hidden = (schema) => {
                                return !schema?.readonly;
                            };
                        }
                    }
                ),
                events: [
                    {
                        name: 'change',
                        label: 'Change',
                        description: 'Change 事件',
                        arguments: [
                            {
                                name: 'values',
                                label: '当前选中的项',
                                type: 'Array<Object>'
                            },
                            {
                                name: 'selected',
                                label: '当前选中的值',
                                type: 'Object|Array<Object>'
                            }
                        ]
                    }
                ]
            },
            {
                key: 'CustomVirtualSelect',
                name: '选择框-接口',
                category: 'basic',
                disabled: false,
                schema: {
                    label: '',
                    labelLangKey: null,
                    component: 'CustomVirtualSelect',
                    required: false,
                    props: {
                        treeProps: {
                            children: 'children'
                        },
                        treeSelect: false,
                        row: {
                            componentName: 'CustomVirtualSelect',
                            requestConfig: {
                                url: '',
                                method: 'GET',
                                viewProperty: 'displayName',
                                valueProperty: 'oid'
                            },
                            viewProperty: 'displayName',
                            valueProperty: 'oid'
                        }
                    },
                    col: 12
                },
                configurations: getConfigurations(
                    [
                        'field',
                        'component',
                        'ref',
                        'label',
                        'columnNumber',
                        'tooltip',
                        'custom-select/url',
                        'custom-select/method',
                        'custom-select/valueProperty',
                        'custom-select/viewProperty',
                        'props.treeProps.children',
                        'appName',
                        'custom-select/data',
                        'defaultValue',
                        'required',
                        'props.treeSelect',
                        'filterable',
                        'props.clearable',
                        'disabled',
                        'readonly',
                        'FamLink/path',
                        'hidden',
                        'multiple',
                        'syncToChild',
                        'listeners'
                    ],
                    function customize(name, config) {
                        if (name === 'props.treeProps.children') {
                            config.hidden = (schema) => {
                                return !schema.props.treeSelect;
                            };
                        }
                        if (name === 'FamLink/path') {
                            config.hidden = (schema) => {
                                return !schema?.readonly;
                            };
                        }
                    }
                ),
                events: [
                    {
                        name: 'change',
                        label: 'Change',
                        description: 'Change 事件',
                        arguments: [
                            {
                                name: 'values',
                                label: '当前选中的项',
                                type: 'Array<Object>'
                            },
                            {
                                name: 'selected',
                                label: '当前选中的值',
                                type: 'Object|Array<Object>'
                            }
                        ]
                    }
                ],
                mappers: [
                    function ({ widget }) {
                        if (
                            DeepFieldVisitorMixin.methods.getFieldValue(
                                widget.schema.props,

                                'row.requestConfig.valueProperty'
                            ) === undefined
                        ) {
                            DeepFieldVisitorMixin.methods.setFieldValue(
                                widget.schema.props,

                                'row.requestConfig.valueProperty',
                                widget.schema.props?.row?.valueProperty || 'oid'
                            );
                        }
                        if (
                            DeepFieldVisitorMixin.methods.getFieldValue(
                                widget.schema.props,

                                'row.requestConfig.viewProperty'
                            ) === undefined
                        ) {
                            DeepFieldVisitorMixin.methods.setFieldValue(
                                widget.schema.props,

                                'row.requestConfig.viewProperty',
                                widget.schema.props?.row?.viewProperty || 'displayName'
                            );
                        }
                        if (
                            DeepFieldVisitorMixin.methods.getFieldValue(widget.schema.props, 'row.componentName') ===
                            undefined
                        ) {
                            DeepFieldVisitorMixin.methods.setFieldValue(
                                widget.schema.props,

                                'row.componentName',

                                'virtual-select'
                            );
                        }
                    }
                ]
            },
            {
                key: 'ErdTreeSelect',
                name: '树形选择框',
                category: 'basic',
                disabled: false,
                schema: {
                    label: '',
                    labelLangKey: null,
                    component: 'ErdTreeSelect',
                    required: false,
                    props: {
                        ajax: {}
                    },
                    col: 12
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'props.ajax.url',
                    'props.ajax.method',
                    'props.ajax.data',
                    'defaultValue',
                    'required',
                    'props.clearable',
                    'disabled',
                    'readonly',
                    'hidden',
                    'multiple',
                    'syncToChild'
                ])
            },
            {
                key: 'FamI18nbasics',
                name: '国际化',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'FamI18nbasics',
                    props: {}
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'FamI18nbasics/type',
                    'input/maxlength',
                    'tooltip',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'autofocus',
                    'syncToChild'
                ]),
                mappers: [
                    function ({ widget }) {
                        const defaultMaxlength = 100;
                        if (_.isEmpty(widget.schema.props)) {
                            widget.schema.props = {};
                        }
                        widget.schema.props.i18nName = widget.schema.label || widget.schema.field;
                        // 基础类型默认限制100
                        if (widget.schema.props.type === 'basics' || widget.schema.props.type === undefined) {
                            widget.schema.props.max = defaultMaxlength;
                        }
                        if (widget.schema.props.maxlength) {
                            widget.schema.props.max = widget.schema.props.maxlength;
                        }
                        return widget;
                    }
                ]
            },
            {
                key: 'FamDict',
                name: '数据字典',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'FamDict',
                    props: {
                        dataType: 'string'
                    }
                },
                configurations: getConfigurations(
                    [
                        'field',
                        'component',
                        'ref',
                        'label',
                        'columnNumber',
                        'tooltip',
                        'dict/itemName',
                        'dict/dataType',
                        'defaultValue',
                        'required',
                        'props.clearable',
                        'disabled',
                        'readonly',
                        'FamLink/path',
                        'hidden',
                        'syncToChild'
                    ],
                    function customize(name, config) {
                        if (name === 'FamLink/path') {
                            config.hidden = (schema) => {
                                return !schema?.readonly;
                            };
                        }
                    }
                )
            },
            {
                key: 'ErdDatePicker',
                name: '时间选择器',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'ErdExDatePicker',
                    props: {
                        isDateRange: false
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'placeholder',
                    'ErdDatePicker/type',
                    'ErdDatePicker/format',
                    'defaultValue',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild',
                    'timeLowerLimit',
                    'timeUpperLimit'
                ]),
                mappers: [
                    function ({ widget, formData }) {
                        if (_.isEmpty(widget.schema.props)) {
                            widget.schema.props = {};
                        }
                        // 限制类型
                        const limits = ['timeLowerLimit', 'timeUpperLimit'];
                        limits.forEach((item) => {
                            if (widget.schema[item]) {
                                widget.schema.props = {
                                    ...widget.schema.props,
                                    timeLimitType: item,
                                    timeLimit: formData[widget.schema[item]]
                                };
                            }
                        });
                        if (
                            widget.schema?.props?.valueFormat === undefined &&
                            widget.schema?.props?.DATE_DISPLAY_FORMAT
                        ) {
                            DeepFieldVisitorMixin.methods.setFieldValue(
                                widget.schema,
                                'props.valueFormat',
                                widget.schema.props.DATE_DISPLAY_FORMAT
                            );
                        }
                        return widget;
                    }
                ]
            },
            {
                key: 'CustomDateTime',
                name: '日期组件',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'CustomDateTime',
                    props: {
                        isDateRange: false
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'CustomDateTime/type',
                    'defaultValue',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild',
                    'timeLowerLimit',
                    'timeUpperLimit'
                ]),
                mappers: [
                    function ({ widget, formData }) {
                        if (_.isEmpty(widget.schema.props)) {
                            widget.schema.props = {};
                        }
                        // 限制类型
                        const limits = ['timeLowerLimit', 'timeUpperLimit'];
                        limits.forEach((item) => {
                            if (widget.schema[item]) {
                                widget.schema.props = {
                                    timeLimitType: item,
                                    timeLimit: formData[widget.schema[item]]
                                };
                            }
                        });
                        if (
                            widget.schema.props?.row?.dateFormat === undefined &&
                            widget.schema?.props?.DATE_DISPLAY_FORMAT
                        ) {
                            DeepFieldVisitorMixin.methods.setFieldValue(
                                widget.schema,
                                'props.row.dateFormat',
                                widget.schema.props.DATE_DISPLAY_FORMAT
                            );
                        }
                        return widget;
                    }
                ]
            },
            {
                key: 'FamControlLabel',
                name: '标签组件',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'FamControlLabel',
                    tagName: '',
                    props: {
                        isDateRange: false
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'FamControlLabel/defaultValue',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ])
            },
            {
                key: 'FamQuillEditor',
                name: '富文本组件',
                category: 'basic',
                schema: {
                    col: 24,
                    component: 'FamQuillEditor',
                    alias: 'ErdQuillEditor',
                    props: {
                        placeholder: ''
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'defaultValue',
                    'placeholder-i18n',
                    'showSymbol',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ])
            },
            {
                key: 'FamIconSelect',
                name: '选择图标',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'FamIconSelect',
                    icon: 'erd-iconfont erd-icon-search',
                    props: {
                        value: 'erd-iconfont erd-icon-search',
                        visibleBtn: true
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'FamIconSelect/btnName',
                    'FamIconSelect/defaultIcon',
                    'FamIconSelect/controlBtn',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ])
            },
            {
                key: 'FamBoolean',
                name: '布尔组件',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'FamBoolean',
                    props: {}
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'defaultValue',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ])
            },
            {
                key: 'FamRadio',
                name: '单选框',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'FamRadio',
                    props: {
                        type: 'radio',
                        options: [
                            {
                                label: '测试1',
                                name: {
                                    value: {
                                        value: '测试1'
                                    }
                                },
                                value: '1'
                            },
                            {
                                label: '测试2',
                                name: {
                                    value: {
                                        value: '测试2'
                                    }
                                },
                                value: '2'
                            }
                        ]
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'defaultValue',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild',
                    'radioOrCheckbox/button',
                    'radioOrCheckbox/border',
                    'radioOrCheckbox/options'
                ])
            },
            {
                key: 'FamCheckbox',
                name: '复选框',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'FamCheckbox',
                    props: {
                        checkedList: [],
                        type: 'checkbox',
                        options: [
                            {
                                label: '测试1',
                                name: {
                                    value: {
                                        value: '测试1'
                                    }
                                },
                                value: '1'
                            },
                            {
                                label: '测试2',
                                name: {
                                    value: {
                                        value: '测试2'
                                    }
                                },
                                value: '2'
                            }
                        ]
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'defaultValue',
                    'required',
                    'disabled',
                    'readonly',
                    'syncToChild',
                    'radioOrCheckbox/button',
                    'radioOrCheckbox/border',
                    'radioOrCheckbox/options'
                ])
            },
            {
                key: 'ErdSwitch',
                name: 'Switch开关',
                category: 'basic',
                schema: {
                    col: 12,
                    defaultValue: true,
                    component: 'ErdSwitch',
                    props: {}
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'defaultValue',
                    'switch/activeText',
                    'switch/inactiveText',
                    'switch/activeValue',
                    'switch/inactiveValue',
                    'switch/activeColor',
                    'switch/inactiveColor',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ])
            },
            {
                key: 'FamMemberSelect',
                name: '选人组件',
                category: 'basic',
                schema: {
                    col: 12,
                    defaultValue: null,
                    component: 'FamMemberSelect',
                    props: {
                        clearable: true,
                        placeholder: '请选择',
                        searchScop: 'group',
                        isGetDisable: false,
                        readonly: false,
                        hidden: false,
                        required: false
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'placeholder',
                    'FamMemberSelect/searchScop',
                    'FamMemberSelect/display',
                    'FamMemberSelect/isgetdisable',
                    'multiple',
                    'props.clearable',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ]),
                mappers: [
                    function ({ widget, formData }) {
                        if (formData[widget.schema.field] && widget.schema.props.defaultValue === undefined) {
                            if (!_.isEmpty(formData[widget.schema.field + 'DefaultValue'])) {
                                widget.schema.props.defaultValue = formData[widget.schema.field + 'DefaultValue'];
                            } else {
                                widget.schema.props.defaultValue = _.isEmpty(formData[widget.schema.field])
                                    ? formData[widget.schema.field]
                                    : DeepFieldVisitorMixin.methods.getFieldValue(
                                          formData,
                                          (widget.schema.props.echoField || widget.schema.field) + 'DefaultValue'
                                      ) ||
                                      DeepFieldVisitorMixin.methods.getFieldValue(
                                          formData,
                                          widget.schema.props.echoField || widget.schema.field
                                      ) ||
                                      [];
                            }
                        }
                        return widget;
                    }
                ]
            },
            {
                key: 'FamCodeGenerator',
                name: '编码生成器',
                category: 'basic',
                schema: {
                    col: 12,
                    defaultValue: null,
                    component: 'FamCodeGenerator',
                    props: {
                        relationAttr: 'typeReference'
                    }
                },
                configurations: getConfigurations(
                    [
                        'field',
                        'component',
                        'ref',
                        'label',
                        'columnNumber',
                        'tooltip',
                        'FamCodeGenerator/type',
                        'FamCodeGenerator/relationAttr',
                        'placeholder',
                        'required',
                        'disabled',
                        'readonly',
                        'FamLink/path',
                        'hidden',
                        'syncToChild'
                    ],
                    function customize(name, config) {
                        if (name === 'FamCodeGenerator/relationAttr') {
                            config.hidden = (schema) => {
                                return (
                                    schema?.props?.type !== 'codeGenerate' && schema?.props?.type !== 'autoGeneration'
                                );
                            };
                        }
                        if (name === 'FamLink/path') {
                            config.hidden = (schema) => {
                                return !schema?.readonly;
                            };
                        }
                        return config;
                    }
                ),
                mappers: [
                    function ({ widget, formData }) {
                        if (widget.schema?.props?.relationAttr) {
                            widget.schema.props.typeId =
                                formData?.[widget.schema.props.relationAttr] || formData?.typeReference || '';
                        }
                        return widget;
                    }
                ]
            },
            {
                key: 'FamOrganizationSelect',
                name: '部门选择框',
                category: 'basic',
                schema: {
                    col: 12,
                    defaultValue: null,
                    component: 'FamOrganizationSelect',
                    props: {
                        dataType: 'string'
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'tooltip',
                    'dataType',
                    'multiple',
                    'filterable',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ]),
                mappers: [
                    function ({ widget }) {
                        if (widget.schema.dataType) {
                            widget.schema.props.dataType = widget.schema.dataType;
                        }
                        return widget;
                    }
                ]
            },
            {
                key: 'FamUpload',
                name: '上传组件',
                category: 'basic',
                schema: {
                    col: 24,
                    defaultValue: null,
                    component: 'FamUpload',
                    props: {}
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'FamUpload/tips',
                    'FamUpload/className',
                    'FamUpload/nameDownload',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ])
            },
            {
                key: 'ErdInputNumber',
                name: '计数器',
                category: 'basic',
                schema: {
                    col: 12,
                    defaultValue: null,
                    component: 'ErdInputNumber',
                    props: {}
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'label',
                    'columnNumber',
                    // 'ErdInputNumber/max',
                    'ErdInputNumber/maxNumber',
                    'ErdInputNumber/min',
                    'ErdInputNumber/precision',
                    'ErdInputNumber/step',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ]),
                mappers: [
                    function ({ widget }) {
                        if (widget.schema.props.step === undefined) {
                            widget.schema.props.step = 1;
                        }
                        if (widget.schema.props.maxNumber) {
                            const validator = [
                                ...(widget.schema?.validators || []).filter(
                                    (validator) => validator.name !== 'default-max-number-validator'
                                ),
                                {
                                    name: 'default-max-number-validator',
                                    trigger: ['blur', 'change'],
                                    validator: (rule, value, callback) => {
                                        if (Number(value) > +widget.schema.props.maxNumber) {
                                            callback(new Error('最大值' + widget.schema.props.maxNumber));
                                        } else {
                                            callback();
                                        }
                                    }
                                }
                            ];
                            DeepFieldVisitorMixin.methods.setFieldValue(widget.schema, 'validators', validator);
                        }
                        return widget;
                    }
                ]
            },
            {
                key: 'FamUnitNumber',
                name: '带单位的实数组件',
                category: 'basic',
                schema: {
                    col: 12,
                    defaultValue: null,
                    component: 'FamUnitNumber',
                    props: {}
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'FamUnitNumber/unit',
                    'FamUnitNumber/isPrepend',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ]),
                mappers: []
            },
            {
                key: 'FamImage',
                name: '图像组件',
                category: 'basic',
                schema: {
                    col: 24,
                    defaultValue: null,
                    component: 'FamImage',
                    props: {
                        acceptList: ['jpg', 'jpeg', 'bmp', 'png'],
                        limit: 3,
                        limitSize: 10,
                        canPreview: true,
                        tips: '图片支持 png/jpg/jpeg/gif/bmp 格式，单张图片最大支持10M',
                        thumbnailSize: '64px*64px'
                    }
                },
                configurations: getConfigurations([
                    'field',
                    'component',
                    'ref',
                    'label',
                    'columnNumber',
                    'FamImage/accept',
                    'FamImage/limit',
                    'FamImage/limitSize',
                    'FamImage/preview',
                    'FamImage/tips',
                    'FamImage/thumbnail',
                    'required',
                    'disabled',
                    'readonly',
                    'hidden',
                    'syncToChild'
                ])
            },
            {
                key: 'FamParticipantSelect',
                name: '参与者组件',
                category: 'basic',
                schema: {
                    col: 12,
                    defaultValue: null,
                    component: 'FamParticipantSelect',
                    props: {}
                },
                configurations: getConfigurations(
                    [
                        'field',
                        'component',
                        'ref',
                        'label',
                        'FamParticipantSelect/type',
                        'FamParticipantSelect/queryScope',
                        'FamParticipantSelect/queryMode',
                        'FamParticipantSelect/defaultMode',
                        'FamParticipantSelect/teamOrignType',
                        'FamParticipantSelect/roleType',
                        'FamParticipantSelect/multiple',
                        'FamParticipantSelect/isQueryByPath',
                        'FamParticipantSelect/filterSecurityLabel',
                        'required',
                        'disabled',
                        'readonly',
                        'hidden',
                        'syncToChild'
                    ],
                    function customize(name, config) {
                        // customize 用于动态修改配置项
                        if (name === 'FamParticipantSelect/teamOrignType') {
                            config.hidden = (schema) => {
                                return !(
                                    (schema.props.type === 'USER' || schema.props.type === 'ROLE') &&
                                    (schema.props.queryScope === 'team' || schema.props.queryScope === 'teamRole')
                                );
                            };
                        }
                        if (name === 'FamParticipantSelect/isQueryByPath') {
                            config.hidden = (schema) => {
                                return !(
                                    schema.props.type === 'USER' &&
                                    schema.props.queryMode?.includes('ROLE') &&
                                    schema.props.queryScope === 'team'
                                );
                            };
                        }
                        if (name === 'FamParticipantSelect/roleType') {
                            config.hidden = (schema) => {
                                return !(schema.props.type === 'ROLE' && schema.props.queryScope === 'fullTenant');
                            };
                        }
                        if (name === 'FamParticipantSelect/filterSecurityLabel') {
                            config.hidden = (schema) => {
                                return !(schema.props.type === 'USER');
                            };
                        }
                        return config;
                    }
                ),
                mappers: [
                    function ({ widget, formData }) {
                        const defaultValue = formData[widget?.schema?.field + '_defaultValue'];
                        DeepFieldVisitorMixin.methods.setFieldValue(widget.schema, 'defaultValue', defaultValue);
                        return widget;
                    }
                ]
            },
            {
                key: 'FamLink',
                name: '超链接组件',
                category: 'basic',
                schema: {
                    col: 12,
                    component: 'FamLink',
                    props: {}
                },
                configurations: getConfigurations(['field', 'component', 'FamLink/linkName', 'FamLink/path'])
            }
        ];
    };
});
