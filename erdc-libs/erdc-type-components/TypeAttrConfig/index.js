define([
    'text!' + ELMP.resource('erdc-type-components/TypeAttrConfig/template.html'),
    ELMP.resource('erdc-app/components/properties/ComponentPropertyExtends.js'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-type-components/TypeAttrConfig/style.css')
], function (template, ComponentPropertyExtends, fieldTypeMapping, utils) {
    const ErdcKit = require('erdcloud.kit');

    const CustomSelect = function (schema, attribute, componentProps = {}) {
        const row = componentProps.props?.row || {};
        return {
            ...schema,
            component: attribute.componentName,
            ...componentProps,
            props: {
                ...componentProps.props,
                filterable: true,
                clearable: true,
                row: {
                    componentName: attribute.componentName,
                    ...row,
                    enumClass: attribute.dataKey
                }
            }
        };
    };

    // 条件操作置灰的组件列表
    const NO_CONDITIONS_LIST = [
        'FamIconSelect',
        'FamImage',
        'FamViewTable',
        'FamClassificationTitle',
        'FamErdTabs',
        'FamDynamicFormPlaceholder',
        'FamUpload'
    ];

    // 特定组件将【默认值】配置渲染为真实组件
    const DEFAULT_VALUE_SCHEMA_MAP = {
        // 普通下拉框
        CustomSelect: CustomSelect,
        // 枚举下拉框
        CustomVirtualEnumSelect: CustomSelect,
        // 接口下拉框
        CustomVirtualSelect: CustomSelect,
        // 单选框
        FamRadio: CustomSelect,
        // 数据字典
        FamDict: function (schema, attribute) {
            return {
                ...schema,
                component: attribute.componentName,
                props: {
                    nodeKey: 'value',
                    itemName: attribute.dataKey,
                    dataType: 'string',
                    filterable: true,
                    clearable: true
                }
            };
        },
        // 选人组件：由于无法正常回显，暂时不做默认值支持
        // 'FamMemberSelect': CustomSelect,
        // 选择图标
        FamIconSelect: function (schema, attribute) {
            return {
                ...schema,
                component: attribute.componentName,
                props: {
                    visibleBtn: true,
                    btnName: '选择图标',
                    clearable: true
                }
            };
        },
        // 部门选择框
        FamOrganizationSelect: CustomSelect
    };

    return {
        template,
        components: {
            TypeAttrGlobalConfig: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/TypeAttrGlobalConfig/index.js')
            ),
            FamDictItemSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDictItemSelect/index.js'))
        },
        extends: ComponentPropertyExtends,
        mixins: [fieldTypeMapping],
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },

            // 基本信息数据
            typeInfoData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            oid: {
                type: String,
                default: ''
            },
            openType: {
                type: String,
                default: 'detail',
                validator(value) {
                    return _.includes(['create', 'edit', 'detail'], value);
                }
            },
            rowData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            appName: {
                type: String,
                default: ''
            },
            useForm: {
                type: String,
                default: 'type'
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeAttrConfig/locale/index.js'),
                i18nMappingObj: {
                    edit: this.getI18nByKey('编辑'),
                    moreActions: this.getI18nByKey('更多操作'),
                    delete: this.getI18nByKey('删除'),
                    export: this.getI18nByKey('导出数据'),
                    basicInformation: this.getI18nByKey('基本信息'),
                    componentConfigs: this.getI18nByKey('组件配置'),
                    basicConfiguration: this.getI18nByKey('编辑基本信息配置'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    iba: this.getI18nByKey('软属性'),
                    flex: this.getI18nByKey('标准属性'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    type: this.getI18nByKey('类型'),
                    selectGlobal: this.getI18nByKey('选择全局属性'),
                    internalName: this.getI18nByKey('内部名称'),
                    showName: this.getI18nByKey('显示名称'),
                    icon: this.getI18nByKey('图标'),
                    typeEnum: this.getI18nByKey('所属类型'),
                    dataType: this.getI18nByKey('数据类型'),
                    dataField: this.getI18nByKey('数据表字段'),
                    component: this.getI18nByKey('组件'),
                    referenceDataSource: this.getI18nByKey('引用数据源'),
                    dataSourceTip: this.getI18nByKey('引用数据源提示'),
                    componentType: this.getI18nByKey('组件类型'),
                    attrCategory: this.getI18nByKey('属性分类'),
                    objectBelong: this.getI18nByKey('属性所属对象'),
                    belongsBusiness: this.getI18nByKey('所属业务对象'),
                    whetherInherited: this.getI18nByKey('是否可继承'),
                    length: this.getI18nByKey('属性值长度'),
                    readOnly: this.getI18nByKey('是否只读'),
                    hidden: this.getI18nByKey('是否隐藏'),
                    require: this.getI18nByKey('是否必填'),
                    modified: this.getI18nByKey('继承过能否修改'),
                    sort: this.getI18nByKey('排序'),
                    max: this.getI18nByKey('最大值'),
                    maxLengthTypeTip: this.getI18nByKey('maxLengthTypeTip'),
                    maxLengthChangeTip: this.getI18nByKey('maxLengthChangeTip'),
                    min: this.getI18nByKey('最小值'),
                    maxLength: this.getI18nByKey('最大长度'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    updateSuccess: this.getI18nByKey('更新成功'),
                    createSuccess: this.getI18nByKey('创建成功'),
                    discardCreateMsg: this.getI18nByKey('是否放弃属性的创建？'),
                    discardEditMsg: this.getI18nByKey('是否放弃属性的编辑？'),
                    discardCreate: this.getI18nByKey('放弃创建'),
                    discardEdit: this.getI18nByKey('放弃编辑'),
                    internalNameError: this.getI18nByKey('请填写内部名称'),
                    internalNameError1: this.getI18nByKey('internalNameError1'),
                    internalNameError2: this.getI18nByKey('internalNameError2'),
                    enterNumber: this.getI18nByKey('请输入数字'),
                    integer: this.getI18nByKey('请输入不小于0的正整数'),
                    minValue: this.getI18nByKey('最小值不能大于最大值'),
                    maxValue: this.getI18nByKey('最大值不能小于最小值'),
                    default: this.getI18nByKey('默认值'),
                    virtualAttrTip: this.getI18nByKey('virtualAttrTip'),
                    relationAttrTip: this.getI18nByKey('relationAttrTip')
                },
                primaryOid: '',
                constraintOid: '',
                typeOid: null,
                className: null,
                formData: {
                    type: '', // 添加属性时的类型
                    attrName: '', // 内部名称
                    typeReference: '', // 所属类型
                    attrCategory: '', // 属性分类
                    dataTypeRef: '', // 数据类型
                    // tableFields: '', // 数据表字段
                    displayName: {
                        // 显示名称
                        attr: 'nameI18nJson',
                        attrName: '显示名称',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    description: {
                        // 说明
                        attr: 'nameI18nJson',
                        attrName: '说明',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    icon: 'erd-iconfont erd-icon-triangle-left', // 图标
                    componentName: '', // 组件名
                    componentRef: '', // 组件
                    componentJson: '{}', // 组件Json
                    dataKey: '', // 引用数据源
                    isRequired: false, // 是否必填
                    isHidden: false, // 是否隐藏
                    isReadonly: false, // 是否只读
                    minValue: '', // 最小值
                    maxValue: '', // 最大值
                    maxLength: '', // 最大长度
                    viewDisplay: '', // 视图显示
                    batchEditor: '1', // 批量编辑
                    conditionalAction: false, // 条件操作
                    inputField: '1', // 输入字段类型
                    createLink: '', // 创建超链接
                    multipleLines: '', // 多行输入的字符
                    docMappingFields: '', // 图档映射字段
                    defaultValue: '' // 默认值
                },
                parentFormData: {},
                dataTypeList: null,
                dataTypeDto: {},
                dialogVisible: false,
                typeLevel: false,
                TypeData: {},
                unfold: true,
                componentConfigUnfold: true,
                showInfo: true,
                categoryData: '',
                showCompConfigForm: true,
                dynamicFormConfig: [], // 动态组件配置
                dynamicFormData: [], // 动态表单数据
                attrKey: [],
                categoryOptions: [], // 获取属性分类
                useField: [], // 可用数据表字段
                disabled: false,
                defaultList: undefined,
                isChanged: false,
                attrTypeMap: {
                    CLASSIFY: 'isClassify',
                    FLEX: 'isFlex',
                    IBA: 'isIba',
                    VIRTUAL: 'isVirtual'
                },
                globalObj: {},
                loading: false,
                constraintDefinitionDto: {},
                componentProps: {
                    props: {
                        options: []
                    }
                },
                relationAttrData: [],
                linkedComponentList: [],
                componentJson: {}
            };
        },
        computed: {
            properties() {
                const properties = this.getPropertiesByComponentName(this.formData.componentName) || [];
                return properties.filter((prop) => {
                    if (typeof prop.isHidden === 'function') {
                        return !prop.isHidden({
                            type: 'TypeAttrConfig',
                            widget: this.componentJson
                        });
                    }
                    return !prop.isHidden;
                });
            },

            // 处理接口下拉框多次调用接口
            dataKeyConfig() {
                let dataKey = '';
                const oid = this.formData?.dataTypeRef;
                if (oid) {
                    dataKey = {
                        url: '/fam/type/datatype/findLinkedComponentList',
                        data: { oid },
                        viewProperty: 'displayName',
                        valueProperty: 'oid',
                        transformResponse: [
                            (data) => {
                                const resData = JSON.parse(data);
                                this.linkedComponentList = resData?.data || [];

                                // 通过组件oid 获取 组件name
                                if (this.formData.componentRef) {
                                    const componentObj = this.linkedComponentList.find(
                                        (item) => item.oid === this.formData.componentRef
                                    );
                                    this.formData.componentName = componentObj?.name || '';
                                    this.componentJson = this.recombineCompJson(this.formData.componentJson);
                                }
                                return resData;
                            }
                        ]
                    };
                }
                return dataKey;
            },
            isIBA() {
                return this.typeInfoData.isIba;
            },
            isFLEX() {
                return this.typeInfoData.isFlex;
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            isCreate() {
                return this.openType === 'create';
            },
            isEdit() {
                return this.openType === 'edit';
            },
            isDetail() {
                return this.openType === 'detail';
            },
            // 页面显示属性表单
            showFormConfig() {
                if (this.isCreate) {
                    return this.createFormConfig;
                }
                return this.editFormConfig;
            },
            showExtendsCheckbox() {
                if (this.isCreate) {
                    return this.globalObj.isExtendGlobal;
                }
                if (this.isEdit) {
                    return this.rowData.isExtends || this.rowData.globalAttrId;
                }
                return false;
            },

            componentRefConfig() {
                return {
                    field: 'componentRef',
                    component: 'custom-select',
                    label: this.i18nMappingObj['component'],
                    labelLangKey: 'component',
                    disabled: this.isRelationType || this.formData.componentRef_checked,
                    required: false,
                    validators: [],
                    props: {
                        clearable: true,
                        placeholder: this.i18nMappingObj['pleaseSelect'],
                        placeholderLangKey: 'pleaseSelect',
                        row: {
                            componentName: 'virtual-select',
                            clearNoData: true,
                            requestConfig: this.dataKeyConfig
                        }
                    },
                    listeners: {
                        callback: (data) => {
                            this.formData['componentName'] = data?.selected?.name || '';
                            if (!['fam-dict', 'custom-virtual-enum-select'].includes(this.formData['componentName'])) {
                                this.formData.dataKey = '';
                            }
                        }
                    },
                    col: 12,
                    ...this.getCheckboxProps('componentRef', 'componentRefExtends')
                };
            },

            // dataKey组件
            dataKeyComponent() {
                let dataKeyComponent;
                if (
                    ErdcKit.isComponentNameIncludes(['custom-virtual-select'], this.formData['componentName']) ||
                    ErdcKit.isSameComponentName(this.formData['componentName'], 'custom-virtual-enum-select')
                ) {
                    dataKeyComponent = {
                        // 其他组件值选项显示
                        field: 'dataKey',
                        component: 'erd-input',
                        label: this.i18nMappingObj['referenceDataSource'],
                        labelLangKey: 'referenceDataSource',
                        tooltip: this.i18nMappingObj.dataSourceTip,
                        disabled: this.formData.dataKey_checked,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        ...this.getCheckboxProps('dataKey', 'dataKeyExtends'),
                        col: 12
                    };
                } else if (ErdcKit.isSameComponentName(this.formData['componentName'], 'FamDict')) {
                    dataKeyComponent = {
                        // 数据字典组件时，值选项显示内容
                        field: 'dataKey',
                        component: 'custom-select',
                        label: this.i18nMappingObj['referenceDataSource'],
                        labelLangKey: 'referenceDataSource',
                        tooltip: this.i18nMappingObj.dataSourceTip,
                        disabled: false,
                        props: {
                            filterable: true,
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/dictionary/item/list',
                                    viewProperty: 'displayName',
                                    valueProperty: 'identifierNo',
                                    headers: {
                                        'App-Name': 'ALL'
                                    }
                                }
                            }
                        },
                        ...this.getCheckboxProps('dataKey', 'dataKeyExtends'),
                        col: 12
                    };
                }

                return dataKeyComponent;
            },

            // 创建属性表单
            createFormConfig() {
                return [...this.createDefaultConfig, ...this.dynamicFormConfig, ...this.commonFormConfig];
            },
            createDefaultConfig() {
                return [
                    {
                        field: 'type',
                        component: 'erd-radio',
                        label: this.i18nMappingObj['type'],
                        labelLangKey: 'type',
                        required: true,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj['pleaseSelect'],
                            placeholderLangKey: 'pleaseSelect'
                        },
                        col: 24,
                        slots: {
                            component: 'attrCategoryComponent'
                        }
                    },
                    {
                        field: 'attrName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        labelLangKey: 'internalName',
                        disabled: this.isRelationType,
                        required: true,
                        validators: [
                            {
                                validator: (rule, value, callback) => {
                                    let reg = /^[a-zA-Z0-9]+([.\-_]?[a-zA-Z0-9]+)*$/g;
                                    if (value.trim() === '') {
                                        callback(new Error(this.i18nMappingObj['internalNameError']));
                                    } else if (!reg.test(value)) {
                                        if (value.match(/[^a-zA-Z0-9.\-_]/gi)) {
                                            callback(new Error(this.i18nMappingObj['internalNameError2']));
                                        } else {
                                            if (value.match(/[.\-_]$/g)) {
                                                callback(new Error(this.i18nMappingObj['internalNameError1']));
                                            } else {
                                                callback(new Error(this.i18nMappingObj['internalNameError2']));
                                            }
                                        }
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: ['blur', 'change']
                            }
                        ],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            maxlength: 100
                        },
                        col: 24,
                        slots: {
                            component: 'attrNameComponent'
                        }
                    },
                    {
                        field: 'dataTypeRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataType'],
                        labelLangKey: 'dataType',
                        disabled: this.isRelationType || this.globalObj.isExtendGlobal,
                        required: true,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj['pleaseSelect'],
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/datatype/listData',
                                    viewProperty: 'displayName',
                                    valueProperty: 'oid',
                                    transformResponse: [
                                        (data) => {
                                            const resData = JSON.parse(data);
                                            if (!this.dataTypeList) {
                                                this.dataTypeList = resData?.data || [];
                                                const stringObj = this.dataTypeList.find(
                                                    (item) => item.name === 'java.lang.String'
                                                );
                                                this.changeDataTypeRef(stringObj?.oid);
                                            }
                                            return resData;
                                        }
                                    ]
                                }
                            }
                        },
                        listeners: {
                            change: (val) => {
                                this.changeDataTypeRef(val);
                                this.formData.componentRef = '';
                            }
                        },
                        col: 24
                    }
                ];
            },
            commonFormConfig() {
                let dataTypeConfig;
                if (!this.isCreate) {
                    dataTypeConfig = {
                        field: 'dataTypeRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataType'],
                        labelLangKey: 'dataType',
                        required: false,
                        readonly: true,
                        validators: [],
                        col: 12,
                        props: {
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'displayName',
                                valueProperty: 'oid',
                                referenceList: Array.of(this.dataTypeDto),
                                clearNoData: true
                            }
                        }
                    };
                }

                return _.compact([
                    dataTypeConfig,
                    this.componentRefConfig,
                    this.dataKeyComponent,
                    ...this.fixedFormConfig
                ]);
            },
            fixedFormConfig() {
                let defaultValue = {
                    field: 'defaultValue',
                    component: 'erd-input',
                    label: this.i18nMappingObj['default'],
                    disabled: this.formData.defaultValue_checked,
                    props: {
                        placeholder: this.i18nMappingObj['pleaseSelect']
                    },
                    ...this.getCheckboxProps('defaultValue', 'defaultValueExtends'),
                    col: 12
                };
                const mapDefaultValue =
                    DEFAULT_VALUE_SCHEMA_MAP[this.formData.componentName] ||
                    DEFAULT_VALUE_SCHEMA_MAP[ErdcKit.pascalize(this.formData.componentName)];
                if (mapDefaultValue) {
                    defaultValue = mapDefaultValue(defaultValue, this.formData, this.componentJson);

                    // 分类字段增加 默认typeName入参
                    let requestConfig = defaultValue?.props?.row?.requestConfig;
                    if (requestConfig?.url?.includes('classify/tree')) {
                        defaultValue.props.row.requestConfig.data = {
                            ...requestConfig?.data,
                            typeName: this.typeInfoData.typeName
                        };
                        defaultValue.props.row.requestConfig.transformResponse = [
                            (data) => {
                                const jsonData = JSON.parse(data);
                                const flattenList = ErdcKit.TreeUtil.flattenTree2Array(jsonData?.data || []);
                                if (!flattenList.some((item) => item.oid === this.formData.defaultValue)) {
                                    // 下拉列表不存在已选数据时, 清空当前项
                                    this.$set(this.formData, 'defaultValue', '');
                                }

                                // 避免只有一个子项时, 树组件渲染失效
                                if (flattenList.length === 1) {
                                    jsonData.data[0].parentId = null;
                                }
                                return jsonData;
                            }
                        ];
                    }
                }
                let maxLenRequired = false;
                if (!this.isDetail && this.formData.type === 'FLEX') {
                    const currentDataTypeObj = this.dataTypeList?.find(
                        (item) => item.oid === this.formData.dataTypeRef
                    );
                    if (
                        currentDataTypeObj?.name === 'java.lang.String' ||
                        this.dataTypeDto.name === 'java.lang.String'
                    ) {
                        maxLenRequired = true;
                    }
                }
                return [
                    {
                        field: 'isHidden',
                        component: 'erd-radio',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['hidden'],
                        labelLangKey: 'hidden',
                        disabled: this.formData.isHidden_checked,
                        ...this.getCheckboxProps('isHidden', 'hiddenExtends'),
                        col: 12,
                        slots: {
                            component: 'radioComponent'
                        }
                    },
                    {
                        field: 'isReadonly',
                        component: 'erd-radio',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['readOnly'],
                        labelLangKey: 'readOnly',
                        disabled: this.formData.isReadonly_checked,
                        hidden: this.formData.isHidden,
                        ...this.getCheckboxProps('isReadonly', 'readonlyExtends'),
                        col: 12,
                        slots: {
                            component: 'radioComponent'
                        }
                    },
                    {
                        field: 'isRequired',
                        component: 'erd-radio',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['require'],
                        labelLangKey: 'require',
                        disabled: this.formData.isRequired_checked,
                        hidden: this.formData.isHidden || this.formData.isReadonly,
                        ...this.getCheckboxProps('isRequired', 'requiredExtends'),
                        col: 12,
                        slots: {
                            component: 'radioComponent'
                        }
                    },
                    {
                        field: 'maxValue',
                        component: 'erd-input',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['max'],
                        tooltip: this.i18nMappingObj['maxLengthChangeTip'],
                        labelLangKey: 'max',
                        disabled: this.formData.maxValue_checked,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            maxlength: 20
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (!this.formData['maxValue']) {
                                        callback();
                                    } else if (Number(value) < Number(this.formData['minValue'])) {
                                        callback(new Error(this.i18nMappingObj['maxValue']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        listeners: {
                            input: () => {
                                const $editForm = this.$refs.editForm;
                                $editForm.validateField('minValue');
                            }
                        },
                        limits: /[^0-9]/gi,
                        ...this.getCheckboxProps('maxValue', 'maxValueExtends'),
                        col: 12
                    },
                    {
                        field: 'minValue',
                        component: 'erd-input',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['min'],
                        labelLangKey: 'min',
                        disabled: this.formData.minValue_checked,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            maxlength: 20
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (!this.formData['maxValue']) {
                                        callback();
                                    } else if (Number(value) > Number(this.formData['maxValue'])) {
                                        callback(new Error(this.i18nMappingObj['minValue']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        listeners: {
                            input: () => {
                                const $editForm = this.$refs.editForm;
                                $editForm.validateField('maxValue');
                            }
                        },
                        limits: /[^0-9]/gi,
                        ...this.getCheckboxProps('minValue', 'minValueExtends'),
                        col: 12
                    },
                    {
                        field: 'maxLength',
                        component: 'erd-input',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['maxLength'],
                        labelLangKey: 'maxLength',
                        disabled: this.formData.maxLength_checked,
                        tooltip: this.i18nMappingObj['maxLengthTypeTip'],
                        required: maxLenRequired,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (!maxLenRequired && !value.trim()) {
                                        callback();
                                    } else {
                                        if (isNaN(Number(value))) {
                                            callback(new Error(this.i18nMappingObj['enterNumber']));
                                        } else if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
                                            callback(new Error(this.i18nMappingObj['integer']));
                                        } else {
                                            callback();
                                        }
                                    }
                                }
                            }
                        ],
                        limits: /[^0-9]/gi,
                        ...this.getCheckboxProps('maxLength', 'maxLengthExtends'),
                        col: 12
                    },
                    defaultValue
                ];
            },

            // 编辑属性表单
            editFormConfig() {
                let resConfig = [...this.editDefaultConfig, ...this.dynamicFormConfig, ...this.commonFormConfig];
                this.attrKey = Object.keys(this.formData);
                return resConfig;
            },
            editDefaultConfig() {
                return [
                    {
                        field: 'attrCategory',
                        component: 'custom-select',
                        label: this.i18nMappingObj['attrCategory'],
                        labelLangKey: 'attrCategory',
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj['pleaseSelect'],
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/component/enumDataList',
                                    viewProperty: 'value',
                                    valueProperty: 'name',
                                    method: 'post',
                                    data: this.categoryData,
                                    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'attrName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        labelLangKey: 'internalName',
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            maxlength: 100
                        },
                        col: 12
                    },
                    {
                        field: 'typeReference',
                        component: 'erd-input',
                        label: this.i18nMappingObj['typeEnum'],
                        labelLangKey: 'typeEnum',
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseSelect'],
                            placeholderLangKey: 'pleaseSelect',
                            maxlength: 100
                        },
                        col: 12
                    }
                ];
            },
            initComponentName() {
                return this.constraintDefinitionDto?.componentName;
            },
            isSelectGlobal() {
                return ['VIRTUAL', 'RELATION'].includes(this.formData.type);
            },
            globalTitle() {
                switch (this.formData.type) {
                    case 'VIRTUAL':
                        return this.i18nMappingObj.virtualAttrTip;
                    case 'RELATION':
                        return this.i18nMappingObj.relationAttrTip;
                    default:
                        return '';
                }
            },
            isRelationType() {
                return this.formData.type === 'RELATION';
            },
            typeReferenceName() {
                return this.typeInfoData.typeName?.split('.').pop() || '';
            }
        },
        watch: {
            'formData.type'(val) {
                if (this.isCreate) {
                    if (val && !this.globalObj.isExtendGlobal) {
                        this.useField = [];
                    }
                    this.changeDataTypeRef(this.dataTypeList?.find((item) => item.name === 'java.lang.String')?.oid);
                    if (val === 'RELATION') {
                        this.formData.attrName = this.typeReferenceName;
                        this.setComponentRef();
                    } else {
                        this.formData.attrName = '';
                        this.formData.componentRef = '';
                    }
                }
            },
            'formData.attrName'(val) {
                if (this.isCreate) {
                    if (this.globalObj.isExtendGlobal) {
                        if (val !== this.globalObj.globalAttrName) {
                            this.globalObj.isExtendGlobal = false;
                            this.setDynamicFormConfig();
                        }
                    }
                }
            },
            'formData.dataTypeRef'(val) {
                if (this.isCreate) {
                    if (_.isEmpty(this.formData.type)) {
                        this.$message({
                            message: '请先选择类型',
                            type: 'warning',
                            showClose: true
                        });
                        return;
                    }
                    if (this.globalObj.isExtendGlobal) {
                        if (val !== this.globalObj.globalDataTypeRef) {
                            this.globalObj.isExtendGlobal = false;
                            this.setDynamicFormConfig();
                        }
                    }
                    if (val) {
                        this.dataTypeChange();
                    }
                }
            },
            'formData.componentRef'() {
                if (!ErdcKit.isSameComponentName(this.initComponentName, this.formData.componentName)) {
                    for (const config of this.dynamicFormConfig) {
                        if (config.field === 'isSearchCondition' && !this.globalObj.isExtendGlobal) {
                            if (NO_CONDITIONS_LIST.includes(this.formData.componentName)) {
                                config.disabled = true;
                                this.$set(this.formData, config.field, 'NULL');
                            } else {
                                config.disabled = false;
                            }
                            break;
                        }
                    }
                    this.constraintDefinitionDto = {
                        componentName: this.formData.componentName,
                        componentJson: {}
                    };
                    const widget = this.getWidgetByKey(this.formData.componentName) || {};
                    this.componentJson = {
                        props: widget.schema?.props || {
                            row: {}
                        }
                    };
                }
            },
            formData: {
                deep: true,
                handler(newV) {
                    if (newV) {
                        if (this.defaultList === undefined) {
                            this.defaultList = newV;
                            this._unwatchDefaultList = this.$watch('defaultList', {
                                deep: true,
                                handler: () => {
                                    this.isChanged = true;
                                    this.disabled = false;
                                }
                            });
                        }
                    }
                }
            },
            showExtendsCheckbox(val) {
                ['commonFormConfig', 'dynamicFormConfig'].forEach((item) => {
                    for (const subItem of this[item]) {
                        if (subItem.hideCheckBox) {
                            continue;
                        }
                        subItem.checkbox = val;
                    }
                });
            },
            componentJson: {
                deep: true,
                handler(componentJson) {
                    this.$set(
                        this.constraintDefinitionDto,
                        'componentJson',
                        JSON.stringify(this.recombineCompJson(componentJson))
                    );
                }
            }
        },
        mounted() {
            this.init();
            if (this.isIBA) {
                this.formData.type = 'IBA';
            } else if (this.isFLEX) {
                this.formData.type = 'FLEX';
            }
        },
        beforeDestroy() {
            this._unwatchDefaultList && this._unwatchDefaultList();
        },
        methods: {
            typeChange() {
                this.dynamicFormConfig = [];
            },
            init() {
                this.getTypeDefById();
                this.attrKey = Object.keys(this.formData);
                const data = new FormData();
                data.append('realType', 'erd.cloud.core.enums.AttributeCategory');
                this.categoryData = data;
            },

            // 打开选择全局属性弹窗
            selectGlobal() {
                this.dialogVisible = true;
                this.$store.state.app.typeAttrGlobal = true;
            },

            recombineCompJson(componentJson) {
                try {
                    componentJson = JSON.parse(componentJson);
                } catch (error) {
                    componentJson = {};
                }
                const widget = this.getWidgetByKey(this.formData.componentName) || {};
                const widgetProps = ErdcKit.deepClone(widget.schema?.props || {});
                const componentJsonProps = componentJson.props || {};
                return {
                    ...componentJson,
                    props: {
                        ...widgetProps,
                        ...componentJsonProps
                    }
                };
            },
            attrRelevanceCompJson(componentJson, formData) {
                const componentJsonProps = componentJson.props || {};
                return {
                    ...componentJson,
                    props: {
                        ...componentJsonProps,
                        ...formData
                    }
                };
            },
            // 获取表单
            async getTypeDefById() {
                this.disabled = true;
                if (!this.isCreate) {
                    const { attrName, typeDisplayName } = this.rowData;

                    // 获取当前属性的信息
                    this.getAttribute(attrName, this.oid).then((resp) => {
                        let { constraintDefinitionDto, dataTypeDto, attrCategory, dataTypeRef, propertyMap } =
                            resp.data;
                        let obj = {};
                        this.TypeData = resp.data;

                        this.typeLevel = false;
                        this.formData['type'] = attrCategory;
                        this.formData['attrName'] = attrName;
                        this.formData['typeReference'] = typeDisplayName;
                        this.formData['attrCategory'] = attrCategory;
                        this.formData['dataTypeRef'] = dataTypeRef;
                        this.dataTypeDto = dataTypeDto;
                        this.formData['constraintDefinitionDto'] = constraintDefinitionDto;
                        if (constraintDefinitionDto) {
                            this.constraintDefinitionDto = constraintDefinitionDto;

                            Object.keys(constraintDefinitionDto).forEach((key) => {
                                let valData = constraintDefinitionDto[key];
                                if (this.attrKey.includes(key)) {
                                    this.formData[key] = valData;
                                    if (key === 'maxLength') {
                                        this.formData[key] = String(valData);
                                    }
                                    if (/maxValue|minValue/.test(key)) {
                                        this.formData[key] = _.isEmpty(valData) ? valData : Number(valData);
                                    }
                                }
                                if (key.includes('Extends')) {
                                    let newKey = key.replace('Extends', '_checked');
                                    if (/hidden|readonly|required/.test(key)) {
                                        newKey = `is${newKey.replace(newKey[0], newKey[0].toUpperCase())}`;
                                    }
                                    this.$set(this.formData, newKey, valData);
                                }
                            });
                        }

                        let dynamicFormConfig = [];
                        Object.values(propertyMap).forEach((val) => {
                            let componentAttr = val.constraintDefinitionDto || {};
                            let renderValue = val.propertyValue || {};
                            let compName = componentAttr?.componentName || '';
                            let componentConf = this.fnComponentHandle(compName, true);
                            let enumData = new FormData();
                            enumData.append('realType', componentAttr?.dataKey);
                            if (val.name === 'description' || val.name === 'displayName') {
                                obj = {
                                    field: val.name,
                                    component: 'FamI18nbasics',
                                    label: val.displayName,
                                    labelLangKey: val.displayName,
                                    disabled: false,
                                    hidden: Boolean(componentAttr.isHidden),
                                    readonly: Boolean(componentAttr.isReadonly),
                                    required: this.isDetail ? false : Boolean(componentAttr.isRequired),
                                    props: {
                                        clearable: true,
                                        placeholder: this.i18nMappingObj['pleaseEnter'],
                                        placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                                        type: val.name === 'description' ? 'textarea' : 'basics',
                                        trimValidator: val.name === 'displayName',
                                        i18nName: val.displayName,
                                        max: 300
                                    },
                                    ...this.getCheckboxProps(val.name, `${val.name}Extends`, val.isExtends),
                                    col: val.name === 'description' ? 24 : 12
                                };
                                this.formData[val.name] = this.getNameI18nJson(val, renderValue);
                            } else if (val.name === 'isSearchCondition') {
                                let props = {};
                                try {
                                    props = JSON.parse(componentAttr.componentJson).props;
                                } catch {
                                    props = {};
                                }
                                obj = {
                                    field: val.name,
                                    component: componentConf.showComponent,
                                    label: val.displayName,
                                    labelLangKey: val.displayName,
                                    disabled: this.isRelationType,
                                    hidden: Boolean(componentAttr.isHidden),
                                    readonly: Boolean(componentAttr.isReadonly),
                                    required: Boolean(componentAttr.isRequired),
                                    validators: [],
                                    ...this.getCheckboxProps(val.name, `${val.name}Extends`, val.isExtends),
                                    checkboxDisabled: this.isRelationType,
                                    props,
                                    col: 12
                                };

                                if (!_.isEmpty(renderValue.value)) {
                                    this.$set(this.formData, val.name, renderValue.value || 'NULL');
                                    this.formData[val.name] = renderValue.value || 'NULL';
                                } else {
                                    this.$set(this.formData, val.name, 'NULL');
                                }
                            } else {
                                obj = {
                                    field: val.name,
                                    component: componentConf.showComponent,
                                    label: val.displayName,
                                    labelLangKey: val.displayName,
                                    disabled: false,
                                    hidden: Boolean(componentAttr.isHidden),
                                    readonly: Boolean(componentAttr.isReadonly),
                                    required: compName.includes('input') ? Boolean(componentAttr.isRequired) : false,
                                    validators: [],
                                    props: {
                                        clearable: true,
                                        placeholder: this.i18nMappingObj['pleaseEnter'],
                                        placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                                        itemName: componentAttr?.dataKey,
                                        row: {
                                            componentName: compName,
                                            requestConfig: {
                                                // 特殊处理下拉框
                                                ...componentConf.componentConfigs,
                                                data: enumData,
                                                viewProperty: 'value',
                                                valueProperty: 'name'
                                            },
                                            maxlength: +componentAttr.maxLength || 100,
                                            clearNoData: true // value未匹配到option中数据时，清除数据项
                                        }
                                    },
                                    ...this.getCheckboxProps(val.name, `${val.name}Extends`, val.isExtends),
                                    col: 12
                                };
                                this.$set(this.formData, val.name, renderValue.i18nValue || renderValue.value || '');

                                // 特殊处理FamDict
                                if (compName === 'FamDict') {
                                    obj['props'] = {
                                        ...obj.props,
                                        type: 'basic',
                                        disabled: val.name + '_checked'
                                    };
                                    renderValue['displayName'] = renderValue.value;
                                    this.formData[val.name] = renderValue;
                                }

                                // 特殊处理视图显示
                                if (val.name === 'isAvailableView' && this.isRelationType) {
                                    obj['disabled'] = true;
                                    this.formData[val.name] = 'NOT_DISPLAY';
                                }
                                if (val.name === 'unitReference') {
                                    obj['props']['row'] = {
                                        componentName: 'virtual-select',
                                        viewProperty: 'displayName',
                                        valueProperty: 'oid',
                                        requestConfig: {
                                            url: 'fam/listByKey',
                                            params: {
                                                className: 'erd.cloud.foundation.units.entity.QuantityOfMeasure'
                                            }
                                        }
                                    };
                                }
                            }

                            this.$set(this.formData, val.name + '_checked', renderValue.isExtends);
                            if (renderValue.isExtends === true) {
                                obj['disabled'] = renderValue.isExtends;
                            }

                            if (val.name === 'tooltip') {
                                this.formData[val.name] = this.getNameI18nJson(val, renderValue);
                            }
                            if (val.name === 'relation_link_type') {
                                obj['componentName'] = 'custom-select';
                                obj['component'] = 'custom-select';
                                obj['readonly'] = true;
                                obj['required'] = true;
                                obj['props'] = {
                                    clearable: true,
                                    filterable: true,
                                    placeholder: this.i18nMappingObj['pleaseEnter'],
                                    treeSelect: true,
                                    treeProps: {
                                        disabled: 'disabled',
                                        children: 'children'
                                    },
                                    row: {
                                        componentName: 'virtual-select',
                                        requestConfig: {
                                            // 特殊处理下拉框
                                            url: '/fam/type/typeDefinition/allRelation',
                                            data: {
                                                defType: this.oid
                                            },
                                            viewProperty: 'displayName',
                                            valueProperty: 'oid',
                                            transformResponse: [
                                                (data) => {
                                                    const jsonData = JSON.parse(data);
                                                    const recursiveFn = (data = []) => {
                                                        data.forEach((item) => {
                                                            item.disabled = item.hasLinkAttr;
                                                            if (item.children?.length) {
                                                                recursiveFn(item.children);
                                                            }
                                                        });
                                                    };

                                                    // 树组件下拉框 置灰逻辑
                                                    recursiveFn(jsonData.data);
                                                    return jsonData;
                                                }
                                            ]
                                        }
                                    }
                                };
                            }
                            dynamicFormConfig.push(obj);
                        });
                        this.dynamicFormConfig = dynamicFormConfig;
                    });

                    // 编辑状态 获取父类型属性的信息
                    if (this.isEdit) {
                        if (this.rowData.isExtends) {
                            this.getAttribute(attrName, this.typeInfoData.parentRef).then((resp) => {
                                const propertyMap = resp?.data?.propertyMap || [];
                                this.$set(this, 'parentFormData', this.getPropertyMapVal(propertyMap));
                                Object.assign(this.parentFormData, resp?.data?.constraintDefinitionDto);
                            });
                        } else {
                            if (this.rowData.globalAttrId) {
                                const globalResp = await this.getGlobalAttribute(this.rowData.globalAttrId);
                                this.setGlobalObj(globalResp?.data);
                            }
                        }
                    }
                } else {
                    this.typeLevel = false;
                    const data = new FormData();
                    data.append('realType', 'erd.cloud.core.enums.AttributeCategory');
                    this.$famHttp({
                        url: '/fam/type/component/enumDataList',
                        data,
                        method: 'post',
                        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                    }).then((res) => {
                        const isClassifyDefinition =
                            this.typeInfoData.idKey === 'erd.cloud.foundation.type.entity.ClassifyDefinition';
                        _.each(res.data, (item) => {
                            let attrShowKey = this.attrTypeMap[item.name];
                            if (attrShowKey) item['isHidden'] = !this.typeInfoData[attrShowKey];
                            if (item.name === 'HARD') item['isHidden'] = true;
                            if (!isClassifyDefinition && item.name === 'CLASSIFY') item['isHidden'] = true;
                            if (isClassifyDefinition && item.name === 'RELATION') item['isHidden'] = true;
                        });
                        // 过滤数据
                        let data = res?.data.filter((item) => !item.isHidden) || [];
                        this.categoryOptions = data;
                        this.formData.type = data?.[0]?.name;
                    });
                }
            },
            getPropertyMapVal(propertyMap) {
                const propertyMapObj = {};
                Object.values(propertyMap).forEach((val) => {
                    const { propertyValue: renderValue, constraintDefinitionDto: { compName } = {}, name } = val;
                    if (['description', 'displayName', 'tooltip'].includes(name)) {
                        propertyMapObj[name] = this.getNameI18nJson({ name }, renderValue);
                    } else {
                        propertyMapObj[name] = renderValue.i18nValue || renderValue.value || '';

                        // 特殊处理FamDict
                        if (compName === 'FamDict') {
                            renderValue['displayName'] = renderValue.value;
                            propertyMapObj[name] = renderValue;
                        }
                    }
                });
                return propertyMapObj;
            },
            getAttribute(attrName, typeDefId) {
                return this.$famHttp({
                    url: '/fam/type/attribute/getById',
                    data: {
                        attrName: attrName,
                        typeDefId
                    },
                    method: 'GET'
                });
            },
            getGlobalAttribute(globalAttrId) {
                return this.$famHttp({
                    url: '/fam/type/attribute/getGlobalAttribute',
                    data: {
                        attrId: globalAttrId
                    }
                });
            },
            dataTypeChange() {
                let dynamicFormConfig = [];
                if (this.globalObj.isExtendGlobal) {
                    let dynamicFormData = [];
                    let { propertyMap } = this.globalObj.data;
                    let supportList = [
                        'componentRef',
                        'dataKey',
                        'isHidden',
                        'isReadonly',
                        'isRequired',
                        'maxValue',
                        'minValue',
                        'maxLength',
                        'defaultValue',
                        'componentName'
                    ];
                    _.each(supportList, (item) => {
                        const value = this.globalObj.data[item] ?? '';
                        this.$set(this.formData, item, value);
                        this.$set(this.formData, item + '_checked', true);
                    });
                    Object.values(propertyMap).forEach((val) => {
                        dynamicFormData.push(val);
                        let componentAttr = val.constraintDefinitionDto || {};
                        let renderValue = val.propertyValue;

                        // 组件配置
                        let compName = componentAttr.componentName || '';
                        let componentConf = this.fnComponentHandle(compName, true);
                        let enumData = new FormData();
                        enumData.append('realType', componentAttr?.dataKey);
                        let obj = {
                            field: val.name,
                            label: val.displayName,
                            labelLangKey: val.displayName,
                            disabled: true,
                            hidden: Boolean(componentAttr.isHidden),
                            readonly: Boolean(componentAttr.isReadonly),
                            required: Boolean(componentAttr.isRequired),
                            props: {
                                clearable: true,
                                placeholder: this.i18nMappingObj['enter'],
                                placeholderLangKey: this.i18nMappingObj['enter']
                            },
                            ...this.getCheckboxProps(val.name, `${val.name}Extends`),
                            col: 12
                        };
                        if (val.name === 'displayName') {
                            obj = {
                                ...obj,
                                disabled: false,
                                component: 'FamI18nbasics',
                                props: {
                                    ...obj.props,
                                    type: 'basics',
                                    trimValidator: true,
                                    i18nName: val.displayName
                                },
                                checkbox: false,
                                hideCheckBox: true
                            };
                            this.formData[val.name] = this.getNameI18nJson(val, renderValue);
                        } else if (val.name == 'description') {
                            obj = {
                                ...obj,
                                component: 'FamI18nbasics',
                                props: {
                                    ...obj.props,
                                    type: 'textarea',
                                    i18nName: val.displayName
                                },
                                col: 24
                            };
                            this.formData[val.name] = this.getNameI18nJson(val, renderValue);
                        } else if (val.name == 'icon') {
                            obj = {
                                ...obj,
                                field: 'icon',
                                component: 'FamIconSelect',
                                label: this.i18nMappingObj['icon'],
                                labelLangKey: this.i18nMappingObj['icon'],
                                type: 'icon',
                                validators: [],
                                props: {
                                    ...obj.props,
                                    clearable: false,
                                    visibleBtn: !renderValue.isExtends,
                                    btnName: this.i18nMappingObj['selectIcon']
                                }
                            };
                            this.formData[val.name] = renderValue.value || 'erd-iconfont erd-icon-triangle-left';
                        } else {
                            obj = {
                                ...obj,
                                field: val.name,
                                component: componentConf.showComponent,
                                required: compName.includes('input') ? Boolean(componentAttr.isRequired) : false,
                                validators: [],
                                props: {
                                    ...obj.props,
                                    itemName: componentAttr?.dataKey,
                                    row: {
                                        componentName: compName,
                                        requestConfig: {
                                            // 特殊处理下拉框
                                            ...componentConf.componentConfigs,
                                            data: enumData,
                                            viewProperty: 'value',
                                            valueProperty: 'name'
                                        },
                                        clearNoData: true
                                    }
                                }
                            };

                            if (renderValue.i18nValue || _.isBoolean(renderValue.value)) {
                                this.$set(this.formData, val.name, renderValue.i18nValue);
                            } else {
                                this.$set(this.formData, val.name, renderValue.i18nValue || '');
                            }

                            // 特殊处理FamDict
                            if (compName === 'FamDict') {
                                obj['props'] = {
                                    ...obj.props,
                                    type: 'basic',
                                    disabled: val.name + '_checked'
                                };
                                renderValue['displayName'] = renderValue.value;
                                this.formData[val.name] = renderValue;
                            }

                            // 特殊处理Boolean类型
                            if (compName === 'FamBoolean') {
                                obj['props'] = {
                                    type: 'basic',
                                    disabled: val.name + '_checked'
                                };
                                this.formData[val.name] = renderValue.value;
                            }

                            // 特殊处理图标
                            if (compName === 'FamIconSelect') {
                                obj['props'] = {
                                    visibleBtn: !renderValue.isExtends,
                                    btnName: this.i18nMappingObj['selectIcon']
                                };
                                this.$set(
                                    this.formData,
                                    val.name,
                                    renderValue.value || 'erd-iconfont erd-icon-triangle-left'
                                );
                            }
                            if (val.name === 'sort_order') {
                                obj['validators'] = [
                                    {
                                        trigger: ['blur', 'change'],
                                        validator: (rule, value, callback) => {
                                            if (isNaN(Number(value))) {
                                                callback(new Error(this.i18nMappingObj['enterNumber']));
                                            } else if (!Number.isInteger(Number(value)) || value < 0) {
                                                callback(new Error(this.i18nMappingObj['integer']));
                                            } else {
                                                callback();
                                            }
                                        }
                                    }
                                ];
                            }
                        }
                        if (componentAttr.componentName == 'FamI18nbasics') {
                            this.formData[val.name] = this.getNameI18nJson(val, renderValue);
                        }
                        if (val.name === 'unitReference') {
                            obj['props']['row'] = {
                                componentName: 'virtual-select',
                                viewProperty: 'displayName',
                                valueProperty: 'oid',
                                requestConfig: {
                                    url: 'fam/listByKey',
                                    params: {
                                        className: 'erd.cloud.foundation.units.entity.QuantityOfMeasure'
                                    }
                                }
                            };
                        }

                        // 是否勾选可继承
                        if (val.name == 'displayName') {
                            this.formData[val.name + '_checked'] = false;
                        } else {
                            this.$set(this.formData, val.name + '_checked', renderValue.isExtends);
                            if (renderValue.isExtends === true) {
                                if (val.name !== 'isSearchCondition') {
                                    obj['disabled'] = renderValue.isExtends;
                                }
                            }
                        }
                        if (val.name === 'tooltip') {
                            this.formData[val.name] = this.getNameI18nJson(val, renderValue);
                        }
                        if (val.name === 'isSearchCondition') {
                            this.$set(this.formData, val.name, renderValue.value || 'NULL');
                        }
                        this.$set(this.formData, val.name + '_checked', true);
                        dynamicFormConfig.push(obj);
                    });
                    this.dynamicFormConfig = dynamicFormConfig;
                    this.dynamicFormData = dynamicFormData;
                } else {
                    const data = new FormData();
                    data.append('attrCategory', this.formData.type);
                    data.append('datatypeId', this.formData.dataTypeRef.split(':')[2]);
                    data.append('typeDefId', this.oid.split(':')[2]);

                    this.$famHttp({
                        url: '/fam/type/attribute/listAttrPropertyDefinition',
                        data,
                        method: 'POST',
                        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                    }).then(({ data }) => {
                        this.dynamicFormData = data;

                        _.each(data, (val) => {
                            let componentAttr = val.constraintDefinitionDto || {};
                            let renderValue = val.propertyValue || {};
                            let compName = componentAttr.componentName;
                            let componentConf = this.fnComponentHandle(compName, true);
                            let enumData = new FormData();
                            enumData.append('realType', componentAttr?.dataKey);
                            let obj = {
                                field: val.name,
                                label: val.displayName,
                                labelLangKey: val.displayName,
                                disabled: false,
                                hidden: Boolean(componentAttr.isHidden),
                                readonly: Boolean(componentAttr.isReadonly),
                                required: Boolean(componentAttr.isRequired),
                                props: {
                                    clearable: true,
                                    placeholder: this.i18nMappingObj['pleaseEnter'],
                                    placeholderLangKey: this.i18nMappingObj['pleaseEnter']
                                },
                                col: 12
                            };
                            if (val.name === 'description' || val.name === 'displayName') {
                                obj = {
                                    ...obj,
                                    component: 'FamI18nbasics',

                                    props: {
                                        ...obj.props,
                                        type: val.name === 'description' ? 'textarea' : 'basics',
                                        trimValidator: val.name === 'displayName',
                                        i18nName: val.displayName
                                    },
                                    col: val.name == 'description' ? 24 : 12
                                };
                                this.formData[val.name] = {
                                    attr: 'nameI18nJson',
                                    attrName: val.name,
                                    value: {}
                                };
                            } else if (val.name === 'isSearchCondition') {
                                let props = {};
                                try {
                                    props = JSON.parse(componentAttr.componentJson).props;
                                } catch {
                                    props = {};
                                }
                                obj = {
                                    ...obj,
                                    component: componentConf.showComponent,
                                    disabled: this.isRelationType,
                                    required: Boolean(componentAttr.isRequired),
                                    validators: [],
                                    props: {
                                        ...props,
                                        ...obj.props,
                                        type: 'basic',
                                        disabled: val.name + '_checked'
                                    }
                                };

                                this.$set(this.formData, val.name, 'NULL');
                            } else {
                                obj = {
                                    ...obj,
                                    component: componentConf.showComponent,

                                    hidden: this.isCreate ? componentAttr.isReadonly : componentAttr.isHidden,

                                    validators: [],
                                    props: {
                                        ...obj.props,
                                        componentName: compName,

                                        itemName: componentAttr?.dataKey,
                                        row: {
                                            componentName: compName,
                                            requestConfig: {
                                                // 特殊处理下拉框
                                                ...componentConf.componentConfigs,
                                                data: enumData,
                                                viewProperty: 'value',
                                                valueProperty: 'name'
                                            },
                                            maxlength: +componentAttr.maxLength || 100,
                                            clearNoData: true // value未匹配到option中数据时，清除数据项
                                        }
                                    }
                                };
                                this.$set(this.formData, val.name, renderValue.i18nValue || renderValue.value || '');

                                // 特殊处理FamDict
                                if (compName === 'FamDict') {
                                    obj['props'] = {
                                        ...obj.props,
                                        type: 'basic',
                                        disabled: val.name + '_checked'
                                    };
                                    renderValue['displayName'] = renderValue.value;
                                    this.formData[val.name] = renderValue;
                                }

                                this.$set(this.formData, val.name, '');
                                if (componentAttr.componentName === 'FamBoolean') {
                                    obj.component = 'FamBoolean';
                                    obj['props'] = {
                                        type: 'basic',
                                        disabled: val.name + '_checked'
                                    };
                                    this.formData[val.name] = false;
                                }
                                if (val.name === 'sort_order') {
                                    obj['validators'] = [
                                        {
                                            trigger: ['blur', 'change'],
                                            validator: (rule, value, callback) => {
                                                if (isNaN(Number(value))) {
                                                    callback(new Error(this.i18nMappingObj['enterNumber']));
                                                } else if (!Number.isInteger(Number(value)) || value < 0) {
                                                    callback(new Error(this.i18nMappingObj['integer']));
                                                } else {
                                                    callback();
                                                }
                                            }
                                        }
                                    ];
                                }
                                if (val.name === 'unitReference') {
                                    obj['props']['row'] = {
                                        componentName: 'virtual-select',
                                        viewProperty: 'displayName',
                                        valueProperty: 'oid',
                                        requestConfig: {
                                            url: 'fam/listByKey',
                                            params: {
                                                className: 'erd.cloud.foundation.units.entity.QuantityOfMeasure'
                                            }
                                        }
                                    };
                                }

                                // 特殊处理视图显示
                                if (this.isRelationType) {
                                    if (val.name === 'isAvailableView') {
                                        obj['disabled'] = true;
                                        this.formData[val.name] = 'NOT_DISPLAY';
                                    }
                                }
                            }
                            if (val.name === 'tooltip') {
                                this.formData[val.name] = this.getNameI18nJson(val, renderValue);
                            }
                            if (val.name === 'relation_link_type') {
                                obj['componentName'] = 'custom-select';
                                obj['component'] = 'custom-select';
                                obj['required'] = true;
                                obj['props'] = {
                                    filterable: true,

                                    treeSelect: true,
                                    treeProps: {
                                        disabled: 'disabled',
                                        children: 'children'
                                    },
                                    row: {
                                        componentName: 'virtual-select',
                                        requestConfig: {
                                            // 特殊处理下拉框
                                            url: '/fam/type/typeDefinition/allRelation',
                                            data: {
                                                defType: this.oid
                                            },
                                            viewProperty: 'displayName',
                                            valueProperty: 'oid',
                                            transformResponse: [
                                                (data) => {
                                                    const jsonData = JSON.parse(data);
                                                    const recursiveFn = (data = []) => {
                                                        data.forEach((item) => {
                                                            item.disabled = item.hasLinkAttr;
                                                            if (item.children?.length) {
                                                                recursiveFn(item.children);
                                                            }
                                                        });
                                                    };

                                                    // 树组件下拉框 置灰逻辑
                                                    recursiveFn(jsonData.data);
                                                    return jsonData;
                                                }
                                            ]
                                        }
                                    }
                                };

                                // 通过link类型修改内部名称
                                obj['listeners'] = {
                                    callback: ({ selected }) => {
                                        if (this.isRelationType) {
                                            const linkTypeName = selected?.typeName?.split('.').pop() || '';
                                            this.formData.attrName = `${this.typeReferenceName}_${linkTypeName}`;
                                        }
                                    }
                                };
                            }
                            dynamicFormConfig.push(obj);
                        });
                        this.dynamicFormConfig = dynamicFormConfig;
                    });
                }
            },

            setDynamicFormConfig() {
                this.dynamicFormConfig = this.dynamicFormConfig.map((item) => {
                    item.checkbox = false;
                    return item;
                });
            },

            // 获取通用继承复选框配置
            getCheckboxProps(field, checkboxModel, isExtends) {
                this.$set(this.formData, checkboxModel, '');
                this.$set(this.formData, `${field}_checked`, this.formData[`${field}_checked`] ?? false);
                if (this.showExtendsCheckbox) {
                    return {
                        checkbox: isExtends ?? true,
                        checkboxModel: this.formData[checkboxModel],
                        checkboxListeners: {
                            checkboxChange: (event) => {
                                this.checkChange(event, field);
                            }
                        }
                    };
                } else {
                    return {};
                }
            },
            getNameI18nJson(val, renderValue) {
                return {
                    attr: 'nameI18nJson',
                    attrName: val.name,
                    value: renderValue.languageJson || {}
                };
            },

            // 触发继承标识
            checkChange(isChecked, name) {
                let extendsSourceInfo = {};
                if (this.isCreate) {
                    extendsSourceInfo = this.globalObj.data;
                } else {
                    if (this.rowData.isExtends) {
                        extendsSourceInfo = this.parentFormData;
                    } else {
                        extendsSourceInfo = this.globalObj.data;
                    }
                }
                for (const item of this.dynamicFormConfig) {
                    if (item.field === name) {
                        item.disabled = isChecked;
                        break;
                    }
                }
                if (isChecked) {
                    this.$set(this.formData, name, extendsSourceInfo[name]);
                    if (name === 'componentJson') {
                        this.showCompConfigForm = false;
                        this.componentJson = this.recombineCompJson(extendsSourceInfo.componentJson);
                        this.$nextTick(() => {
                            this.showCompConfigForm = true;
                        });
                    }
                }
                this.$set(this.formData, `${name}_checked`, isChecked);
            },
            onCancel() {
                this.toggleShow();
                return;
            },

            // 全局属性的确定按钮触发事件
            onSubmit(data = {}) {
                const dataTypeRefOid = data.dataTypeDto?.oid;
                this.setGlobalObj(data);
                this.formData.attrName = data.attrName;
                if (this.formData.dataTypeRef === dataTypeRefOid) {
                    this.dataTypeChange();
                }
                this.changeDataTypeRef(dataTypeRefOid);
            },
            setGlobalObj(data = {}) {
                const dataTypeRefOid = data.dataTypeDto?.oid;
                const globalPropertyObj = this.getPropertyMapVal(data.propertyMap || []);
                this.globalObj = {
                    data: {
                        ...data,
                        ...globalPropertyObj,
                        ...data.constraintDefinitionDto,
                        id: data.id
                    },
                    isExtendGlobal: true,
                    globalAttrName: data.attrName,
                    globalDataTypeRef: dataTypeRefOid
                };
            },
            changeDataTypeRef(dataTypeRef) {
                if (dataTypeRef) {
                    this.formData.dataTypeRef = dataTypeRef;
                    this.dataTypeChange();
                }
            },
            toggleShow() {
                let visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            showInfoFn(flag) {
                this.showInfo = flag;
            },
            saveSubmit() {
                this.submit();
            },
            submitEditForm() {
                let result = this.$refs.editForm.formData;
                let {
                    attrName,
                    type,
                    attrCategory,
                    dataTypeRef,
                    maxLength,
                    maxValue,
                    minValue,
                    isReadonly,
                    isHidden,
                    isRequired,
                    dataKey,
                    componentRef,
                    componentJson,
                    defaultValue
                } = result;
                let url = '';
                const { editForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    editForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                let obj = {
                                    attrName,
                                    typeReference: this.oid,
                                    dataTypeRef,
                                    maxLength,
                                    maxValue,
                                    minValue,
                                    isReadonly,
                                    isHidden,
                                    isRequired,
                                    dataKey,
                                    defaultValue,
                                    componentRef,
                                    componentJson
                                };
                                Object.keys(obj).forEach((item) => {
                                    if (Object.prototype.hasOwnProperty.call(result, `${item}_checked`)) {
                                        if (item.startsWith('is')) {
                                            let itemName = item.slice(2);
                                            itemName = itemName?.replace(itemName[0], itemName[0].toLowerCase());
                                            obj[`${itemName}Extends`] = result[`${item}_checked`];
                                        } else {
                                            obj[`${item}Extends`] = result[`${item}_checked`];
                                        }
                                    }
                                });
                                let typePropertyValueVoList = [];
                                if (this.isEdit) {
                                    url = '/fam/type/attribute/update';
                                    let propertyMap = this.TypeData.propertyMap || {};
                                    let property = {};

                                    Object.values(propertyMap).forEach((item) => {
                                        let propertyValue = item.propertyValue;
                                        let nameData = this.formData[item.name];
                                        let componentAttr = item.constraintDefinitionDto || {};

                                        // 组件配置
                                        let compName = componentAttr.componentName;
                                        if (this.attrKey.includes(item.name)) {
                                            let value =
                                                nameData instanceof Object
                                                    ? nameData.value
                                                        ? nameData.value.value
                                                        : undefined
                                                    : nameData;
                                            if (compName === 'FamDict') {
                                                value = nameData.value || nameData;
                                            }
                                            property = {
                                                name: item.name,
                                                value,
                                                typePropertyDef: propertyValue.propertyRef,
                                                languageJson:
                                                    nameData instanceof Object && compName !== 'FamDict'
                                                        ? nameData.value
                                                        : undefined,
                                                isExtends: result[item.name + '_checked']
                                            };
                                        }
                                        typePropertyValueVoList.push(property);
                                    });

                                    typePropertyValueVoList.map((item) => {
                                        if (item.name === 'displayName') {
                                            utils.trimI18nJson(item.languageJson);
                                        }
                                        return item;
                                    });

                                    // 类型编辑
                                    obj.oid = this.rowData.oid;
                                    obj.attrCategory = attrCategory;
                                    obj.typePropertyValueVoList = typePropertyValueVoList;
                                } else {
                                    let formData = result;
                                    let property = {};
                                    Object.values(this.dynamicFormData).forEach((item) => {
                                        let componentAttr = item.constraintDefinitionDto || {};

                                        // 组件配置
                                        let compName = componentAttr.componentName;
                                        let value =
                                            formData[item.name] instanceof Object
                                                ? formData[item.name].value
                                                    ? formData[item.name].value.value
                                                    : undefined
                                                : formData[item.name];
                                        if (compName === 'FamDict') {
                                            value = formData[item.name].value || formData[item.name];
                                        }
                                        property = {
                                            name: item.name,
                                            typePropertyDef: item.oid,
                                            value,
                                            isExtends: result[item.name + '_checked'],
                                            languageJson:
                                                formData[item.name] instanceof Object && compName !== 'FamDict'
                                                    ? formData[item.name].value
                                                    : undefined
                                        };

                                        typePropertyValueVoList.push(property);
                                    });

                                    typePropertyValueVoList.map((item) => {
                                        if (item.name === 'displayName') {
                                            utils.trimI18nJson(item.languageJson);
                                        }
                                        return item;
                                    });

                                    // 新增属性
                                    obj.attrCategory = type;
                                    obj.typePropertyValueVoList = typePropertyValueVoList;
                                    if (this.globalObj.isExtendGlobal && this.globalObj.data?.id) {
                                        obj.globalAttrId = this.globalObj.data.id;
                                    }
                                    url = '/fam/type/attribute/add';
                                }
                                const mapDefaultValue =
                                    DEFAULT_VALUE_SCHEMA_MAP[this.formData.componentName] ||
                                    DEFAULT_VALUE_SCHEMA_MAP[ErdcKit.pascalize(this.formData.componentName)];
                                if (mapDefaultValue) {
                                    const defaultValue = mapDefaultValue(
                                        { props: {} },
                                        this.formData,
                                        this.componentJson
                                    );
                                    obj.componentJson = JSON.stringify(defaultValue);
                                } else {
                                    let formAttrMap = {
                                        maxLength,
                                        maxValue,
                                        minValue
                                    };
                                    typePropertyValueVoList.forEach((item) => {
                                        // 有空格的不能作为v-bind绑定值
                                        if (item.name.includes(' ')) return
                                        formAttrMap[item.name] = item.value;
                                    });
                                    obj.componentJson = JSON.stringify(
                                        this.attrRelevanceCompJson(this.componentJson, formAttrMap)
                                    );
                                }
                                this.$famHttp({
                                    url,
                                    data: obj,
                                    method: 'post'
                                })
                                    .then((res) => {
                                        if (res.code === '200') {
                                            resolve(res);
                                            this.innerVisible = false;
                                            this.$message({
                                                message: this.isEdit
                                                    ? this.i18nMappingObj.updateSuccess
                                                    : this.i18nMappingObj.createSuccess,
                                                type: 'success',
                                                showClose: true
                                            });
                                            this.$emit('onsubmit', this.typeOid);
                                        } else {
                                            reject(res);
                                        }
                                    })
                                    .catch((err) => {
                                        reject(err);
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject();
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            },
            setComponentRef() {
                const famViewTableObj = this.linkedComponentList.find((item) => item.name === 'FamViewTable');
                this.formData.componentRef = famViewTableObj?.oid || '';
            }
        }
    };
});
