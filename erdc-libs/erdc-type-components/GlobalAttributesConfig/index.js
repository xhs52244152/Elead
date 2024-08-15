/*
    类型属性配置
    先引用 kit组件
    GlobalAttributesConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/GlobalAttributesConfig/index.js')), // 编辑子类型

    <global-attributes-config
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :title="title"
    :oid="oid"
    :openType="openType"
    @onsubmit="onSubmit"></global-attributes-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-type-components/GlobalAttributesConfig/template.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit'
], function (template, fieldTypeMapping, utils) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // 基本信息数据
            typeInfoData: {
                type: Object,
                default: () => {
                    return {};
                }
            },

            // oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // openType
            openType: {
                type: String,
                default: () => {
                    return '';
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
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/GlobalAttributesConfig/locale/index.js'),
                i18nMappingObj: {
                    edit: this.getI18nByKey('编辑'),
                    moreActions: this.getI18nByKey('更多操作'),
                    delete: this.getI18nByKey('删除'),
                    export: this.getI18nByKey('导出数据'),
                    basicInformation: this.getI18nByKey('基本信息'),
                    basicConfiguration: this.getI18nByKey('编辑基本信息配置'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),

                    iba: this.getI18nByKey('软属性'),
                    flex: this.getI18nByKey('标准属性'),

                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    type: this.getI18nByKey('类型'),

                    internalName: this.getI18nByKey('内部名称'),
                    showName: this.getI18nByKey('显示名称'),
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
                    min: this.getI18nByKey('最小值'),
                    maxLength: this.getI18nByKey('最大长度'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    update: this.getI18nByKey('更新成功'),
                    create: this.getI18nByKey('创建成功'),
                    discardCreate: this.getI18nByKey('放弃创建'),
                    discardEdit: this.getI18nByKey('放弃编辑'),

                    internalNameError: this.getI18nByKey('请填写内部名称'),
                    internalNameError1: this.getI18nByKey('内部名称格式错误：如果有“.”，请将其放到中间'),
                    internalNameError2: this.getI18nByKey('内部名称格式错误：请输入字母、数字或“.”'),

                    enterNumber: this.getI18nByKey('请输入数字'),
                    integer: this.getI18nByKey('请输入不小于0的正整数'),
                    minValue: this.getI18nByKey('最小值不能大于最大值'),
                    maxValue: this.getI18nByKey('最大值不能小于最小值'),
                    lessThan1000: this.getI18nByKey('输入值不能大于10000')
                },
                primaryOid: '',
                constraintOid: '',
                className: null,
                formData: {
                    catalogRef: '', // 当前选中的节点
                    attrName: '', // 内部名称
                    typeReference: 'OR:erd.cloud.foundation.type.entity.TypeDefinition:0', // 所属类型
                    contextRef: 'OR:erd.cloud.foundation.type.entity.TypeDefinition:0', // 上下文
                    attrCategory: 'VIRTUAL', // 属性分类
                    dataTypeRef: '', // 数据类型
                    dataTypeRefOid: '', // 数据类型Oid
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
                    componentName: 'custom-select', // 组件名
                    componentRef: '', // 组件
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
                    docMappingFields: '' // 图档映射字段
                },
                typeLevel: false,
                TypeData: {},
                unfold: true,
                showInfo: true,
                categoryData: '',
                dynamicFormConfig: [], // 动态组件配置
                dynamicFormData: [], // 动态表单数据
                attrKey: [],
                categoryOptions: [], // 获取属性分类
                useField: [], // 可用数据表字段
                disabled: false,
                defaultList: undefined,
                isChanged: false,
                loading: false
            };
        },
        watch: {
            'formData.dataTypeRef'(n) {
                this.formData['catalogRef'] = this.oid;
                if (this.isCreate && !_.isEmpty(n)) {
                    this.dataTypeChange(n);
                }
            },
            formData: {
                handler(newV) {
                    if (newV) {
                        if (this.defaultList === undefined || this.defaultList === null) {
                            this.defaultList = newV;
                            this._unwatchDefaultList = this.$watch('defaultList', {
                                deep: true,
                                handler: function () {
                                    this.isChanged = true;
                                    this.disabled = false;
                                }
                            });
                        }
                    }
                },
                deep: true
            }
        },
        components: {},
        computed: {
            // 处理接口下拉框多次调用接口
            dataKeyConfig: function () {
                let dataKey = '';
                if (this.formData?.dataTypeRefOid || this.formData?.dataTypeRef) {
                    dataKey = {
                        url: '/fam/type/datatype/findLinkedComponentList',
                        data: { oid: this.formData?.dataTypeRefOid || this.formData?.dataTypeRef },
                        viewProperty: 'displayName',
                        valueProperty: 'oid'
                    };
                }
                return dataKey;
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            // 页面显示属性表单
            showFormConfig() {
                return this.isCreate ? this.createFormConfig : this.editFormConfig;
            },
            // dataKey对应的组件
            dataKeyComponent() {
                // 解决使用hidden来控制显示隐藏时导致的dateKey重复报错
                let dataKeyComponent = [];
                if (
                    ErdcKit.isComponentNameIncludes(['custom-virtual-select'], this.formData['componentName']) ||
                    ErdcKit.pascalize(this.formData['componentName']) === 'CustomVirtualEnumSelect'
                ) {
                    dataKeyComponent = [
                        {
                            // 其他组件值选项显示
                            field: 'dataKey',
                            component: 'erd-input',
                            label: this.i18nMappingObj['referenceDataSource'],
                            labelLangKey: 'referenceDataSource',
                            tooltip: this.i18nMappingObj.dataSourceTip,
                            disabled: false,
                            hidden: false,
                            props: {
                                clearable: false,
                                placeholder: this.i18nMappingObj['pleaseEnter'],
                                placeholderLangKey: 'pleaseEnter'
                            },
                            col: 12
                        }
                    ];
                } else if (ErdcKit.pascalize(this.formData['componentName']) === 'FamDict') {
                    dataKeyComponent = [
                        {
                            // 数据字典组件时，值选项显示内容
                            field: 'dataKey',
                            component: 'FamDictItemSelect',
                            label: this.i18nMappingObj['referenceDataSource'],
                            labelLangKey: 'referenceDataSource',
                            tooltip: this.i18nMappingObj.dataSourceTip,
                            disabled: false,
                            hidden: false,
                            props: {
                                filterable: true
                                // row: {
                                //     componentName: 'virtual-select',
                                //     clearNoData: true,
                                //     requestConfig: {
                                //         url: '/fam/dictionary/item/list',
                                //         viewProperty: 'displayName',
                                //         valueProperty: 'number',
                                //         data: {
                                //             appName: this.appName
                                //         }
                                //     }
                                // }
                            },
                            col: 12
                        }
                    ];
                }
                return dataKeyComponent;
            },
            // 创建属性表单
            createFormConfig() {
                let defaultFormConfig = [
                    {
                        field: 'attrName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [
                            {
                                validator: (rule, value, callback) => {
                                    const { internalNameError, internalNameError1, internalNameError2 } =
                                        this.i18nMappingObj;
                                    if (!value) {
                                        return callback(new Error(internalNameError));
                                    }
                                    if (value.search(/^[A-Za-z0-9.]+$/) > -1) {
                                        if (value.match(/\./g)?.length) {
                                            // 超过2个"."  或者 "."不在中间时 报错提示
                                            if (
                                                value.match(/\./g)?.length > 1 ||
                                                value.search(/\./) === value.length - 1
                                            ) {
                                                return callback(new Error(internalNameError1));
                                            }
                                            callback();
                                        } else {
                                            callback();
                                        }
                                    } else {
                                        callback(new Error(internalNameError2));
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
                        col: 24
                    },
                    {
                        field: 'dataTypeRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataType'],
                        labelLangKey: 'dataType',
                        disabled: false,
                        required: true,
                        validators: [],
                        hidden: false,
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
                                    valueProperty: 'oid'
                                }
                            }
                        },
                        listeners: {
                            change: () => {
                                this.formData.componentRef = '';
                            }
                        },
                        col: 24
                    }
                ];
                let supportFormConfig = [];
                if (this.dynamicFormConfig.length > 0) {
                    supportFormConfig = [
                        {
                            field: 'componentRef',
                            component: 'custom-select',
                            label: this.i18nMappingObj['component'],
                            labelLangKey: 'component',
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
                            // 数据变化时触发回调
                            listeners: {
                                callback: (data) => {
                                    this.formData['dataKey'] = '';
                                    this.formData['componentName'] = data.selected.name;
                                }
                            },
                            col: 12
                        },
                        ...this.dataKeyComponent,
                        ...this.commonComponent
                    ];
                }
                return [...defaultFormConfig, ...this.dynamicFormConfig, ...supportFormConfig];
            },
            // 编辑属性表单
            editFormConfig() {
                let defaultFormConfig = [
                    {
                        field: 'attrName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        labelLangKey: 'internalName',
                        disabled: true,
                        hidden: false,
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'typeReference',
                        component: 'erd-input',
                        label: this.i18nMappingObj['typeEnum'],
                        labelLangKey: 'typeEnum',
                        disabled: true,
                        hidden: true,
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseSelect'],
                            placeholderLangKey: 'pleaseSelect'
                        },
                        col: 12
                    },
                    {
                        field: 'attrCategory',
                        component: 'custom-select',
                        label: this.i18nMappingObj['attrCategory'],
                        labelLangKey: 'attrCategory',
                        disabled: false,
                        hidden: true,
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
                    }
                ];
                // 组件配置
                let supportFormConfig = [
                    {
                        field: 'dataTypeRef',
                        component: 'erd-input',
                        label: this.i18nMappingObj['dataType'],
                        labelLangKey: 'dataType',
                        disabled: false,
                        hidden: false,
                        required: false,
                        readonly: true,
                        validators: [],
                        col: 12
                    },
                    {
                        field: 'componentRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj['component'],
                        labelLangKey: 'component',
                        disabled: false,
                        required: false,
                        validators: [],
                        hidden: false,
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
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.formData['componentName'] = data?.selected?.name || '';
                                if (
                                    !['fam-dict', 'custom-virtual-enum-select'].includes(this.formData['componentName'])
                                ) {
                                    this.formData.dataKey = '';
                                }
                            }
                        },
                        col: 12
                    },
                    ...this.dataKeyComponent,
                    ...this.commonComponent
                ];
                let resConfig = [...defaultFormConfig, ...this.dynamicFormConfig, ...supportFormConfig];
                this.attrKey = Object.keys(this.formData);

                return resConfig;
            },
            // 创建编辑公共属性
            commonComponent() {
                return [
                    {
                        field: 'isHidden',
                        component: 'erd-radio',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['hidden'],
                        labelLangKey: 'hidden',
                        disabled: false,
                        hidden: false,
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
                        disabled: false,
                        hidden: this.formData.isHidden,
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
                        disabled: false,
                        hidden: this.formData.isHidden || this.formData.isReadonly,
                        col: 12,
                        slots: {
                            component: 'radioComponent'
                        }
                    },
                    {
                        field: 'maxValue',
                        component: 'erd-input',
                        label: this.i18nMappingObj['max'],
                        labelLangKey: 'max',
                        disabled: false,
                        hidden: false,
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
                                    let validatorArr = [
                                        {
                                            validator: isNaN(Number(value)),
                                            tips: this.i18nMappingObj['enterNumber']
                                        },
                                        {
                                            validator: !Number.isInteger(Number(value)) || Number(value) < 0,
                                            tips: this.i18nMappingObj['integer']
                                        },
                                        {
                                            validator:
                                                !Number.isInteger(Number(value)) ||
                                                Number(value) < this.formData['minValue'],
                                            tips: this.i18nMappingObj['maxValue']
                                        }
                                    ];

                                    const obj = validatorArr.find((item) => item.validator);
                                    !_.isEmpty(obj) && obj.tips ? callback(new Error(obj.tips)) : callback();
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
                        col: 12
                    },
                    {
                        field: 'minValue',
                        component: 'erd-input',
                        label: this.i18nMappingObj['min'],
                        labelLangKey: 'min',
                        disabled: false,
                        hidden: false,
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
                                    let validatorArr = [
                                        {
                                            validator: isNaN(Number(value)),
                                            tips: this.i18nMappingObj['enterNumber']
                                        },
                                        {
                                            validator: !Number.isInteger(Number(value)) || Number(value) < 0,
                                            tips: this.i18nMappingObj['integer']
                                        },
                                        {
                                            validator:
                                                !Number.isInteger(Number(value)) ||
                                                Number(value) > this.formData['maxValue'],
                                            tips: this.i18nMappingObj['minValue']
                                        }
                                    ];

                                    const obj = validatorArr.find((item) => item.validator);
                                    !_.isEmpty(obj) && obj.tips ? callback(new Error(obj.tips)) : callback();
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
                        col: 12
                    },
                    {
                        field: 'maxLength',
                        component: 'erd-input',
                        label: this.i18nMappingObj['maxLength'],
                        labelLangKey: 'maxLength',
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    let validatorArr = [
                                        {
                                            validator: isNaN(Number(value)),
                                            tips: this.i18nMappingObj['enterNumber']
                                        },
                                        {
                                            validator: !Number.isInteger(Number(value)) || value < 0,
                                            tips: this.i18nMappingObj['integer']
                                        },
                                        {
                                            validator: Number(value) > 10000,
                                            tips: this.i18nMappingObj['lessThan1000']
                                        }
                                    ];

                                    const obj = validatorArr.find((item) => item.validator);
                                    !_.isEmpty(obj) && obj.tips ? callback(new Error(obj.tips)) : callback();
                                }
                            }
                        ],
                        limits: /[^0-9]/gi,
                        col: 12
                    }
                ];
            },
            isCreate() {
                return this.openType === 'create';
            }
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            this._unwatchDefaultList && this._unwatchDefaultList();
        },
        methods: {
            init() {
                this.getTypeDefById();
                this.attrKey = Object.keys(this.formData);
                const data = new FormData();
                data.append('realType', 'erd.cloud.core.enums.AttributeCategory');
                this.categoryData = data;
            },
            // 编辑时获取表单
            getTypeDefById() {
                this.disabled = true;
                if (!this.isCreate) {
                    let { oid, attrName } = this.rowData;
                    this.$famHttp({
                        url: '/fam/type/attribute/getGlobalAttribute',
                        data: {
                            attrId: oid
                        },
                        post: 'get'
                    })
                        .then((resp) => {
                            let {
                                typeReference,
                                constraintDefinitionDto,
                                dataTypeDto,
                                attrCategory,
                                dataTypeRef,
                                propertyMap
                            } = resp.data;

                            this.TypeData = resp.data;

                            this.typeLevel = false;

                            this.formData = {
                                ...this.formData,
                                attrName,
                                typeReference,
                                attrCategory,
                                dataTypeRef: dataTypeDto.displayName,
                                dataTypeRefOid: dataTypeRef
                            };
                            if (constraintDefinitionDto) {
                                Object.keys(constraintDefinitionDto).forEach((val) => {
                                    if (this.attrKey.includes(val)) {
                                        let valData = constraintDefinitionDto[val];
                                        this.formData[val] = valData;
                                        if (val === 'maxLength') {
                                            this.formData[val] = String(valData);
                                        }
                                        if (val === 'maxValue' || val === 'minValue') {
                                            this.formData[val] = _.isEmpty(valData) ? valData : Number(valData);
                                        }
                                    }
                                });
                            }
                            Object.values(propertyMap).forEach((val) => {
                                let componentAttr = val.constraintDefinitionDto;
                                let renderValue = val.propertyValue || {};
                                let compName = componentAttr.componentName;
                                let componentConf = this.fnComponentHandle(compName, true);
                                let enumData = new FormData();
                                enumData.append('realType', componentAttr?.dataKey);
                                let props;
                                try {
                                    props = JSON.parse(componentAttr.componentJson).props;
                                } catch {
                                    props = {};
                                }

                                let obj = this.commonConfig(val, componentConf, componentAttr);
                                if (compName === 'FamI18nbasics') {
                                    obj = this.setFamI18nObj(obj, val);
                                } else if (val.name === 'isSearchCondition') {
                                    obj = {
                                        ...obj,
                                        component: componentConf.showComponent,
                                        required: false,
                                        props
                                    };
                                    if (!_.isEmpty(renderValue.value)) {
                                        this.$set(this.formData, val.name, renderValue.i18nValue || renderValue.value);
                                        this.formData[val.name] = renderValue.i18nValue || renderValue.value;
                                    } else {
                                        this.$set(this.formData, val.name, false);
                                    }
                                } else {
                                    obj = {
                                        ...obj,
                                        required: compName.includes('input')
                                            ? componentAttr.isRequired || false
                                            : false,
                                        props: {
                                            componentName: compName,
                                            clearable: true,
                                            placeholder: this.i18nMappingObj['pleaseEnter'],
                                            placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                                            itemName: componentAttr?.dataKey,
                                            row: {
                                                componentName: compName,
                                                requestConfig: {
                                                    // 特殊处理下拉框
                                                    ...componentConf.componentConfigs,
                                                    data: enumData
                                                },
                                                dataKey: componentAttr?.dataKey,
                                                maxlength: +componentAttr.maxLength || 100,
                                                clearNoData: true // value未匹配到option中数据时，清除数据项
                                            }
                                        }
                                    };
                                    this.$set(
                                        this.formData,
                                        val.name,
                                        renderValue.i18nValue || renderValue.value || ''
                                    );
                                    // 特殊处理FamDict
                                    if (compName === 'FamDict') {
                                        obj['props'] = {
                                            ...obj.props,
                                            type: 'basic',
                                            row: {
                                                params: {
                                                    status: 1
                                                }
                                            },
                                            disabled: val.name + '_checked'
                                        };
                                        renderValue['displayName'] = renderValue.value;
                                        this.formData[val.name] = renderValue?.value || null;
                                    }
                                }
                                this.dynamicFormConfig.push(obj);
                            });
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }
            },
            setFamI18nObj(obj, val) {
                const {
                    constraintDefinitionDto: componentAttr = {},
                    propertyValue: renderValue = {},
                    name,
                    displayName
                } = val;
                this.formData[name] = {
                    attr: 'nameI18nJson',
                    attrName: name,
                    value: renderValue.languageJson || {}
                };
                let i18nObj = {
                    ...obj,
                    component: componentAttr.componentName,
                    required: this.openType === 'detail' ? false : Boolean(componentAttr.isRequired),
                    validators: [],
                    props: {
                        clearable: true,
                        placeholder: this.i18nMappingObj['pleaseEnter'],
                        placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                        type: 'basics',
                        i18nName: displayName,
                        max: +componentAttr.maxLength || 300
                    },
                    col: 12
                };
                if (name === 'displayName') {
                    i18nObj.validator = [
                        {
                            type: 'FamI18nbasicsRequired'
                        }
                    ];
                }
                if (name === 'description') {
                    i18nObj.col = 24;
                    i18nObj.props.type = 'textarea';
                }
                return i18nObj;
            },
            // 创建时获取表单
            dataTypeChange(value) {
                const _this = this;
                this.dynamicFormConfig = [];
                const data = new FormData();
                data.append('datatypeId', value.split(':')[2]);

                this.$famHttp({
                    url: '/fam/type/attribute/listAttrPropertyDefinition',
                    data,
                    method: 'POST',
                    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                }).then(({ data }) => {
                    this.dynamicFormData = data;
                    _.each(data, (val) => {
                        let componentAttr = val.constraintDefinitionDto || {};
                        let renderValue = val.propertyValue; // 组件配置
                        let compName = componentAttr.componentName;
                        let componentConf = this.fnComponentHandle(compName, true);
                        let enumData = new FormData();
                        enumData.append('realType', componentAttr?.dataKey);
                        let props;
                        try {
                            props = JSON.parse(componentAttr.componentJson).props;
                        } catch {
                            props = {};
                        }

                        let obj = this.commonConfig(val, componentConf, componentAttr);
                        if (val.name === 'description' || val.name === 'displayName') {
                            obj = {
                                ...obj,
                                component: 'FamI18nbasics',
                                validators: val.name === 'displayName' ? [{ type: 'FamI18nbasicsRequired' }] : [],
                                props: {
                                    clearable: true,
                                    placeholder: this.i18nMappingObj['pleaseEnter'],
                                    placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                                    type: val.name === 'description' ? 'textarea' : 'basics',
                                    i18nName: val.displayName,
                                    max: +componentAttr.maxLength || 300
                                },
                                col: 24
                            };
                            this.formData[val.name] = {
                                attr: 'nameI18nJson',
                                attrName: val.name,
                                value: {}
                            };
                        } else if (val.name === 'isSearchCondition') {
                            obj = {
                                ...obj,
                                component: componentConf.showComponent,
                                required: false,
                                props: {
                                    type: 'basic',
                                    disabled: val.name + '_checked',
                                    ...props
                                }
                            };
                            this.$set(this.formData, val.name, false);
                        } else {
                            obj = {
                                ...obj,
                                hidden: this.isCreate ? componentAttr.isReadonly : componentAttr.isHidden,
                                props: {
                                    clearable: true,
                                    placeholder: this.i18nMappingObj['pleaseEnter'],
                                    placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                                    itemName: componentAttr?.dataKey,
                                    row: {
                                        componentName: compName, // 接口查询（组件名带virtual，如果特殊组件名要处理的，到混入文件里面处理，比如custom-virtual-role-select是角色下拉框，有固定配置）
                                        requestConfig: {
                                            // 特殊处理下拉框
                                            ...componentConf.componentConfigs,
                                            data: enumData
                                        },
                                        dataKey: componentAttr?.dataKey,
                                        clearNoData: true // value未匹配到option中数据时，清除数据项
                                    },
                                    maxlength: +componentAttr.maxLength || 100
                                }
                            };
                            this.$set(this.formData, val.name, '');
                            // 特殊处理FamDict
                            if (compName === 'FamDict') {
                                obj['props'] = {
                                    ...obj.props,
                                    type: 'basic',
                                    row: {
                                        params: {
                                            status: 1
                                        }
                                    },
                                    disabled: val.name + '_checked'
                                };
                                if (renderValue) {
                                    renderValue['displayName'] = renderValue?.value || '';
                                }
                                this.formData[val.name] = renderValue?.value || null;
                            }
                            if (compName === 'FamBoolean') {
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
                                        validator: function (rule, value, callback) {
                                            if (isNaN(Number(value))) {
                                                callback(new Error(_this.i18nMappingObj['enterNumber']));
                                            } else if (!Number.isInteger(Number(value)) || value < 0) {
                                                callback(new Error(_this.i18nMappingObj['integer']));
                                            } else {
                                                callback();
                                            }
                                        }
                                    }
                                ];
                            }
                        }
                        this.dynamicFormConfig.push(obj);
                    });
                });
            },
            commonConfig(val, componentConf, componentAttr) {
                return {
                    field: val.name,
                    component: componentConf.showComponent,
                    label: val.displayName,
                    labelLangKey: val.displayName,
                    disabled: false,
                    hidden: componentAttr.isHidden || false,
                    readonly: componentAttr.isReadonly || false,
                    required: componentAttr.isRequired || false,
                    validators: [],
                    col: 12
                };
            },
            onCancel() {
                this.toggleShow();
            },
            toggleShow() {
                var visible = !this.innerVisible;
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
                const { editForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    editForm
                        .submit()
                        .then(({ valid }) => {
                            let url = '/fam/create';
                            let obj = {};
                            if (valid) {
                                let attrRawKey = [
                                    'attrName',
                                    'dataTypeRef',
                                    'typeReference',
                                    'attrCategory',
                                    'catalogRef'
                                ];
                                let relationKey = [
                                    'contextRef',
                                    'componentRef',
                                    'isReadonly',
                                    'isHidden',
                                    'isRequired',
                                    'realType',
                                    'maxValue',
                                    'minValue',
                                    'maxLength',
                                    'dataKey'
                                ];

                                let property = {};
                                let attrRawList = [];
                                let relationList = [
                                    {
                                        attrRawList: [],
                                        className: 'erd.cloud.foundation.type.entity.ConstraintDefinition'
                                    }
                                ];
                                let propertyValues = [];
                                // 组件返回字段
                                relationKey.forEach((item) => {
                                    let relationObj = {
                                        attrName: item,
                                        value: result[item]
                                    };
                                    relationList[0].attrRawList.push(relationObj);
                                });
                                if (this.openType === 'edit') {
                                    url = '/fam/update';

                                    let propertyMap = this.TypeData.propertyMap || {};
                                    // 固定字段
                                    attrRawKey.forEach((item) => {
                                        let attrObj = {
                                            attrName: item,
                                            value: result[item]
                                        };
                                        if (item === 'dataTypeRef') {
                                            attrObj = {
                                                attrName: item,
                                                value: result['dataTypeRefOid']
                                            };
                                        }
                                        attrRawList.push(attrObj);
                                    });

                                    Object.values(propertyMap).forEach((item) => {
                                        let propertyValue = item.propertyValue;
                                        let nameData = this.formData[item.name];
                                        let componentAttr = item.constraintDefinitionDto || {};
                                        // 组件配置
                                        let compName = componentAttr.componentName;
                                        if (this.attrKey.includes(item.name)) {
                                            // 去除显示名称的前后空格
                                            if (item.name === 'displayName') {
                                                utils.trimI18nJson(nameData.value);
                                            }
                                            let value =
                                                nameData instanceof Object
                                                    ? nameData.value
                                                        ? nameData.value.value
                                                        : undefined
                                                    : nameData;

                                            if (compName === 'FamDict') {
                                                value = nameData?.value || nameData || '';
                                            }
                                            property = {
                                                name: item.name,
                                                value,
                                                typePropertyDef: propertyValue.propertyRef,
                                                languageJson:
                                                    nameData instanceof Object && compName !== 'FamDict'
                                                        ? nameData.value
                                                        : undefined
                                            };
                                        }
                                        propertyValues.push(property);
                                    });
                                    // 类型编辑
                                    obj['oid'] = this.rowData.oid;
                                } else {
                                    // 固定字段
                                    attrRawKey.forEach((item) => {
                                        let attrObj = {
                                            attrName: item,
                                            value: result[item]
                                        };
                                        attrRawList.push(attrObj);
                                    });

                                    // 动态表单
                                    Object.values(this.dynamicFormData).forEach((item) => {
                                        let componentAttr = item.constraintDefinitionDto || {};
                                        // 组件配置
                                        let compName = componentAttr.componentName;
                                        // 去除显示名称的前后空格
                                        if (item.name === 'displayName') {
                                            utils.trimI18nJson(result[item.name].value);
                                        }
                                        let value =
                                            result[item.name] instanceof Object
                                                ? result[item.name].value
                                                    ? result[item.name].value.value
                                                    : undefined
                                                : result[item.name];
                                        if (compName === 'FamDict') {
                                            value = _.isObject(result?.[item.name])
                                                ? result?.[item.name]?.value || ''
                                                : result?.[item.name] || '';
                                        }
                                        property = {
                                            name: item.name,
                                            typePropertyDef: item.oid,
                                            value,
                                            languageJson:
                                                result[item.name] instanceof Object && compName !== 'FamDict'
                                                    ? result[item.name].value
                                                    : undefined
                                        };

                                        propertyValues.push(property);
                                    });
                                }
                                // 新增属性
                                obj = {
                                    ...obj,
                                    className: 'erd.cloud.foundation.type.entity.AttributeDefinition',
                                    associationField: 'holderRef',
                                    attrRawList, // 固定表单数据
                                    relationList, // 组件返回数据
                                    propertyValues // 动态表单数据
                                };
                                this.$famHttp({
                                    url,
                                    data: obj,
                                    method: 'post'
                                })
                                    .then((res) => {
                                        resolve(res);
                                        if (res.code === '200') {
                                            this.innerVisible = false;
                                            this.$message({
                                                message: this.i18nMappingObj[this.isCreate ? 'create' : 'update'],
                                                type: 'success',
                                                showClose: true
                                            });
                                            this.$emit('onsubmit', this.oid);
                                        }
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject();
                            }
                        })
                        .catch((error) => {
                            reject(error);
                            this.loading = false;
                        });
                });
            },
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            }
        }
    };
});
