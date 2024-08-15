/*
    类型基本信息配置
    先引用 kit组件
    BasicInforConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/BasicInforConfig/index.js')), // 类型基本信息配置


    <basic-infor-config
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </basic-infor-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-type-components/BasicInforConfig/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    ELMP.resource('erdc-app/components/properties/ComponentPropertyExtends.js'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-type-components/BasicInforConfig/style.css')
], function (template, fieldTypeMapping, ComponentPropertyExtends, utils) {
    // const famHttp = require('fam:http');
    const ErdcKit = require('erdcloud.kit');
    const store = require('fam:store');

    return {
        template,
        extends: ComponentPropertyExtends,
        components: {},
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
            // oid
            oid: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-type-components/BasicInforConfig/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    basicInformation: this.getI18nByKey('基本信息'),
                    internalName: this.getI18nByKey('内部名称'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    showName: this.getI18nByKey('名称'),
                    peaseSelect: this.getI18nByKey('请选择'),
                    dataType: this.getI18nByKey('数据类型'),
                    realType: this.getI18nByKey('属性类型'),
                    componentType: this.getI18nByKey('组件类型'),
                    objectBelong: this.getI18nByKey('所属类'),
                    belongPlaceholder: this.getI18nByKey('所属类输入框提示'),
                    belongTip: this.getI18nByKey('请输入所属类'),
                    // 'belongClass': this.getI18nByKey('所属类'),
                    // 'belongsBusiness': this.getI18nByKey('所属业务对象'),
                    privateModel: this.getI18nByKey('私有模型'),
                    whetherInherited: this.getI18nByKey('是否可继承'),
                    length: this.getI18nByKey('值长度'),
                    readOnly: this.getI18nByKey('是否只读'),
                    hidden: this.getI18nByKey('是否隐藏'),
                    require: this.getI18nByKey('是否必填'),
                    modifiedit: this.getI18nByKey('是否覆盖'),
                    sort: this.getI18nByKey('排序'),
                    max: this.getI18nByKey('最大值'),
                    min: this.getI18nByKey('最小值'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    giveUpKeep: this.getI18nByKey('是否放弃保存'),
                    createSuccessfully: this.getI18nByKey('新增成功'),
                    updateSuccessfully: this.getI18nByKey('更新成功'),
                    createFailure: this.getI18nByKey('新增失败'),
                    updateFailure: this.getI18nByKey('更新失败'),
                    dataKey: this.getI18nByKey('值选项'),
                    maxNotLessMin: this.getI18nByKey('输入最大值不能小于最小值'),
                    minNotGreaterMax: this.getI18nByKey('输入最小值不能大于最大值'),
                    pleaseEnterOrder: this.getI18nByKey('请输入排序'),
                    pleaseEnterNumbers: this.getI18nByKey('请输入数字'),
                    pleaseEnterNotLess100: this.getI18nByKey('请输入不小于100的正整数'),
                    privateClassNameTooltip: this.getI18nByKey('私有模型提示'),
                    classNameKeyTooltip: this.getI18nByKey('所属类提示'),
                    pleaseEnterInternalName: this.getI18nByKey('请输入内部名称'),
                    internalNameError: this.getI18nByKey('内部名称格式错误'),
                    Yes: this.getI18nByKey('是'),
                    No: this.getI18nByKey('否')
                },
                primaryOid: '',
                constraintOid: '',
                unfold: true,
                baseInfoUnfold: true,
                showInfor: true,
                formData: {
                    name: '', // 内部名称
                    nameI18nJson: {
                        // 显示名称
                        attrName: 'nameI18nJson'
                    },
                    dataTypeRef: '', // 数据类型
                    classNameKey: '', // 所属对象
                    privateClassName: '', // 所属业务对象
                    sortOrder: '', // 排序
                    overridable: true, // 能否覆盖
                    isExtends: true, // 是否可继承

                    componentRef: '', // 组件
                    maxLength: '', // 属性值长度
                    maxValue: '', // 最大值
                    minValue: '', // 最小值
                    isReadonly: false, // 是否只读
                    isHidden: false, // 是否隐藏
                    isRequired: false, // 是否必填
                    dataKey: '', // 值选项
                    realType: '' // 属性类型
                },
                mainTypes: [],
                rules: {
                    internalName: [{ required: true, message: '清输入内部名称', trigger: 'blur' }],
                    name: [{ required: true, message: '清选择显示名称', trigger: 'blur' }],
                    type: [{ required: true, message: '清选择数据类型', trigger: 'change' }],
                    componentType: [{ required: true, message: '清选择组件类型', trigger: 'change' }],
                    attrBelong: [{ required: true, message: '清选择属性所属对象', trigger: 'change' }],
                    businessObject: [{ required: true, message: '清选择所属业务对象', trigger: 'blur' }]
                },

                // 国际化组件部分
                internationalizationVisible: false,
                internationFormData: {},
                attrMap: {
                    name: '显示名称'
                },
                isChanged: false,
                disabled: false,
                componentRefName: '',
                // 需要放在relationList里边的属性
                filterAttr: [
                    'componentRef',
                    'dataKey',
                    'maxLength',
                    'maxValue',
                    'minValue',
                    'isReadonly',
                    'isHidden',
                    'isRequired',
                    'realType'
                ],
                loading: false,
                constraintDefinitionDto: {},
                componentProps: {
                    props: {
                        options: []
                    }
                }
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            properties() {
                const properties = this.getPropertiesByComponentName(this.componentRefName) || [];
                return properties.filter((prop) => {
                    if (typeof prop.isHidden === 'function') {
                        return !prop.isHidden({
                            context: 'BasicInfoConfig',
                            widget: this.componentJson
                        });
                    }
                    return !(prop.isHidden === undefined || prop.isHidden);
                });
            },
            componentJson: {
                get() {
                    let componentJson = this.constraintDefinitionDto?.componentJson;
                    try {
                        componentJson = JSON.parse(componentJson);
                    } catch (error) {
                        componentJson = {};
                    }
                    return Object.assign({}, this.componentProps, componentJson);
                },
                set(componentJson) {
                    this.$set(this.constraintDefinitionDto, 'componentJson', JSON.stringify(componentJson));
                }
            },
            dataKeyFormConfig() {
                if (ErdcKit.isComponentNameIncludes(['custom-virtual-select'], this.componentRefName)) {
                    return {
                        field: 'dataKey',
                        component: 'erd-input',
                        label: this.i18nMappingObj['dataKey'],
                        labelLangKey: 'dataKey',
                        disabled: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    };
                }
                if (ErdcKit.isComponentNameIncludes(['fam-dict'], this.componentRefName)) {
                    return {
                        // 数据字典组件时，值选项显示内容
                        field: 'dataKey',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataKey'],
                        // label: '值选项',
                        labelLangKey: 'dataKey',
                        disabled: false,
                        props: {
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
                        col: 12
                    };
                }
                if (ErdcKit.isComponentNameIncludes(['custom-virtual-enum-select'], this.componentRefName)) {
                    return {
                        // 枚举组件时，值选项显示内容
                        field: 'dataKey',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataKey'],
                        // label: '值选项',
                        labelLangKey: 'dataKey',
                        disabled: false,
                        props: {
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/component/enumDataList',
                                    viewProperty: 'targetClass',
                                    valueProperty: 'targetClass'
                                }
                            }
                        },
                        col: 12
                    };
                }
                return null;
            },
            data() {
                return _.compact([
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        // label: '内部名称',
                        labelLangKey: 'internalName',
                        // disabled: !!this.oid,
                        hidden: false,
                        required: true,
                        readonly: !!this.oid,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (value === '') {
                                        callback(new Error(this.i18nMappingObj['pleaseEnterInternalName']));
                                        // } else if (!value.match(/^erd.cloud./ig)) {
                                        //     callback(new Error('请输入以"erd.cloud."开头的字符串'))
                                    } else if (!/^[a-zA-Z][0-9a-zA-Z_.-]*$/.test(value)) {
                                        // callback(new Error('内部名称格式错误：请输入大小写字母、"_"、."'))
                                        callback(new Error(this.i18nMappingObj['internalNameError']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        // limits: /^erd.cloud./g,
                        // listeners: {
                        change: (value) => {
                            if (!value.match(/^[(erd.cloud.)]/g)) {
                                value = 'erd.cloud.';
                            }
                        },
                        // },
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['showName'],
                        // label: '名称',
                        labelLangKey: 'showName',
                        disabled: false,
                        required: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            // placeholder: '请选择',
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect',
                            type: 'basics',
                            trimValidator: true,
                            i18nName: this.i18nMappingObj['showName']
                        },
                        col: 12
                    },
                    {
                        field: 'realType',
                        component: 'erd-input',
                        label: this.i18nMappingObj['realType'],
                        // label: '属性类型',
                        labelLangKey: 'dataType',
                        disabled: false,
                        required: true,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'componentRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj['componentType'],
                        // label: '组件类型',
                        labelLangKey: 'componentType',
                        disabled: false,
                        required: true,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            // placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/component/listData',
                                    viewProperty: 'displayName',
                                    valueProperty: 'oid'
                                }
                            }
                        },
                        listeners: {
                            callback: (data) => {
                                // this.componentRefName = data?.selected?.name || ''
                                // if(!['fam-dict', 'custom-virtual-enum-select'].includes(this.componentRefName)) {
                                //     this.formData.dataKey = ''
                                // }
                                if (!ErdcKit.isSameComponentName(this.componentRefName, data?.selected?.name)) {
                                    this.componentRefName = data?.selected?.name || '';
                                    this.formData.dataKey = '';
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'classNameKey',
                        component: 'slot',
                        label: this.i18nMappingObj['objectBelong'],
                        tooltip: this.i18nMappingObj['classNameKeyTooltip'],
                        labelLangKey: 'objectBelong',
                        disabled: false,
                        required: true,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (value) {
                                        callback();
                                    } else {
                                        callback(new Error(this.i18nMappingObj.belongTip));
                                    }
                                }
                            }
                        ],
                        hidden: false,
                        props: {
                            name: 'belong'
                        },
                        col: 12
                    },
                    {
                        field: 'privateClassName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['privateModel'],
                        // tooltip: '该属性管理哪些对象，如：部件下有电子部件，如果管理范围指定电子布局，则属性定义管理的范围是电子部件层级',
                        tooltip: this.i18nMappingObj['privateClassNameTooltip'],
                        // label: '私有模型',
                        labelLangKey: 'privateModel',
                        disabled: false,
                        required: false,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter',
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findNotAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeName',
                                    params: {
                                        params: {
                                            isHardType: false
                                        }
                                    }
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'dataTypeRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataType'],
                        // label: '数据类型',
                        labelLangKey: 'dataType',
                        disabled: false,
                        required: false,
                        validators: [],
                        // readonly: this.oid ? true : false,
                        hidden: false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            // placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/listByKey',
                                    viewProperty: 'displayName',
                                    valueProperty: 'oid',
                                    params: {
                                        className: 'erd.cloud.foundation.type.entity.DataTypeDefinition',
                                        showAll: true
                                    }
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'isExtends',
                        component: 'erd-radio',
                        label: this.i18nMappingObj['whetherInherited'],
                        // label: '是否可继承',
                        labelLangKey: 'whetherInherited',
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            // placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12,
                        slots: {
                            component: 'radioComponent'
                        }
                    },
                    {
                        field: 'maxLength',
                        component: 'erd-input',
                        label: this.i18nMappingObj['length'],
                        // label: '值长度',
                        labelLangKey: 'length',
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        validators: [
                            // {type: 'number', message: '请输入数字', trigger: 'change'}
                        ],
                        limits: /[^0-9]/gi,
                        col: 12
                    },
                    {
                        field: 'isHidden',
                        component: 'erd-radio',
                        label: this.i18nMappingObj['hidden'],
                        // label: '是否隐藏',
                        labelLangKey: 'hidden',
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            // placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12,
                        slots: {
                            component: 'radioComponent'
                        }
                    },
                    {
                        field: 'isReadonly',
                        component: 'erd-radio',
                        label: this.i18nMappingObj['readOnly'],
                        // label: '是否只读',
                        labelLangKey: 'readOnly',
                        disabled: false,
                        hidden: this.formData.isHidden,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            // placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12,
                        slots: {
                            component: 'radioComponent'
                        }
                    },
                    {
                        field: 'isRequired',
                        component: 'erd-radio',
                        label: this.i18nMappingObj['require'],
                        // label: '是否必填',
                        labelLangKey: 'require',
                        disabled: false,
                        hidden: this.formData.isHidden || this.formData.isReadonly,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            // placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12,
                        slots: {
                            component: 'radioComponent'
                        }
                    },
                    {
                        field: 'overridable',
                        component: 'erd-radio',
                        label: this.i18nMappingObj['modifiedit'],
                        // label: '能否覆盖',
                        labelLangKey: 'modifiedit',
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            // placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12,
                        slots: {
                            component: 'radioComponent'
                        }
                    },
                    {
                        field: 'sortOrder',
                        component: 'erd-input',
                        label: this.i18nMappingObj['sort'],
                        // label: '排序',
                        labelLangKey: 'sort',
                        disabled: false,
                        required: true,
                        hidden: false,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (value === '') {
                                        // callback(new Error('请输入排序'))
                                        callback(new Error(this.i18nMappingObj['pleaseEnterOrder']));
                                    } else if (isNaN(Number(value))) {
                                        // callback(new Error('请输入数字'))
                                        callback(new Error(this.i18nMappingObj['pleaseEnterNumbers']));
                                    } else if (!Number.isInteger(Number(value)) || value < 100) {
                                        // callback(new Error('请输入不小于100的正整数'))
                                        callback(new Error(this.i18nMappingObj['pleaseEnterNotLess100']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        limits: /[^0-9]/gi,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'maxValue',
                        component: 'erd-input',
                        label: this.i18nMappingObj['max'],
                        // label: '最大值',
                        labelLangKey: 'max',
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (+value < +this.formData.minValue) {
                                        callback(new Error(this.i18nMappingObj['maxNotLessMin']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        listeners: {
                            input: () => {
                                const $dynamicForm = this.$refs.dynamicForm;
                                $dynamicForm.validateField('minValue');
                                $dynamicForm.validateField('maxValue');
                                // this.$nextTick(()=>{
                                // setTimeout(()=>{
                                //     $dynamicForm.validateField('minValue')
                                // }, 50)
                                // })
                            }
                        },
                        limits: /[^0-9]/gi,
                        col: 12
                    },
                    {
                        field: 'minValue',
                        component: 'erd-input',
                        label: this.i18nMappingObj['min'],
                        // label: '最小值',
                        labelLangKey: 'min',
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (+value > +this.formData.maxValue) {
                                        callback(new Error(this.i18nMappingObj['minNotGreaterMax']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        listeners: {
                            input: () => {
                                const $dynamicForm = this.$refs.dynamicForm;
                                $dynamicForm.validateField('maxValue');
                            }
                        },
                        limits: /[^0-9]/gi,
                        col: 12
                    },
                    this.dataKeyFormConfig
                ]);
            }
        },
        created() {
            this.getDetail();
            this.getTypeList();
        },
        methods: {
            getDetail() {
                if (this.oid) {
                    this.disabled = false;
                    const paramsData = {
                        oid: this.oid
                    };
                    this.$famHttp({
                        url: '/fam/type/property/detail',
                        data: paramsData,
                        method: 'get'
                    }).then((resp) => {
                        const formData = resp.data || [];
                        const { constraintDefinitionDto } = formData;
                        this.constraintOid = constraintDefinitionDto?.oid || '';
                        this.primaryOid = formData.oid || '';
                        this.appName = formData?.appName || '';
                        this.constraintDefinitionDto = constraintDefinitionDto;

                        const attrKey = Object.keys(this.formData);
                        let newFormData = {};
                        Object.keys(formData).forEach((item) => {
                            let obj = {};
                            if (attrKey.includes(item)) {
                                obj[item] = formData[item];
                            }
                            newFormData = { ...newFormData, ...obj };
                        });
                        Object.keys(constraintDefinitionDto || {}).forEach((item) => {
                            let obj = {};
                            if (this.filterAttr.includes(item)) {
                                obj[item] = constraintDefinitionDto[item];
                            }
                            newFormData = { ...newFormData, ...obj };
                        });
                        this.formData = this.getFormData(newFormData);
                        this.componentRefName = constraintDefinitionDto?.componentName || '';
                    });
                }
            },
            getTypeList() {
                this.$famHttp({
                    url: '/fam/view/getTypeListByContainerRef',
                    headers: {
                        'App-Name': 'ALL'
                    },
                    params: {
                        containerRef: this.$store?.state?.app?.container?.oid
                    }
                }).then((rep) => {
                    const { data: { childTypeDefList = [] } = {} } = rep;
                    this.mainTypes = childTypeDefList.map((item) => ({ value: item.typeName }));
                });
            },
            querySearch(queryString, cb) {
                if (queryString) {
                    cb(this.mainTypes.filter((item) => new RegExp(queryString, 'i').test(item.value)));
                } else {
                    cb(this.mainTypes);
                }
            },
            handleSelectBelong(item) {
                this.$set(this.formData, 'classNameKey', item.value);
            },
            handleClearBelong() {
                this.$set(this.formData, 'classNameKey', '');
            },
            // 处理回显数据
            getFormData(data) {
                let newData = data.constraintDefinitionDto || {};
                const i18nAttrs = ['nameI18nJson'];
                const i18nMap = {
                    nameI18nJson: '显示名称'
                };
                i18nAttrs.forEach((item) => {
                    let obj = {};
                    if (data[item]) {
                        obj = {
                            attr: item,
                            attrName: i18nMap[item],
                            value: {
                                ...data[item]
                            }
                        };
                        data[item] = obj;
                    }
                });
                return { ...this.formData, ...data, ...newData };
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            showInforFn(flag) {
                this.showInfor = flag;
            },
            // 取消
            onCancel() {
                this.toogleShow();
            },
            saveSubmit() {
                this.submit();
            },
            // 提交
            submit() {
                let url = '/fam/create';
                if (this.oid) {
                    url = '/fam/update';
                }
                const { dynamicForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                // 需要在attr
                                const i18nAttrs = ['nameI18nJson', 'constraintDefinitionVo', 'propertyValue'];
                                const serialized = dynamicForm.serialize();

                                let relationList = [];
                                // let constraintDefinitionVo = dynamicForm.serialize().filter(item => (item.attrName === 'constraintDefinitionVo' && item.value))[0]
                                // const keys = Object.keys(constraintDefinitionVo?.value || {})
                                serialized.forEach((item) => {
                                    if (
                                        this.filterAttr.includes(item.attrName) &&
                                        (typeof item.value === 'boolean' ||
                                            (typeof item.value !== 'boolean' && item.value))
                                    ) {
                                        relationList.push(item);
                                    }
                                });
                                const filter = (item) =>
                                    !_.includes(i18nAttrs, item.attrName) &&
                                    !_.includes(this.filterAttr, item.attrName);
                                let attrRawList = _.filter(serialized, filter);
                                let propertyValues = _.map(serialized, (item) => {
                                    if (['nameI18nJson'].includes(item.attrName)) {
                                        const obj = {
                                            attrName: item.attrName,
                                            value: {
                                                en_gb: item?.value?.value?.en_gb || '',
                                                en_us: item?.value?.value?.en_us || '',
                                                zh_cn: item?.value?.value?.zh_cn || '',
                                                zh_tw: item?.value?.value?.zh_tw || '',
                                                value: item?.value?.value?.value || ''
                                            }
                                        };
                                        utils.trimI18nJson(obj.value);
                                        return obj;
                                    }
                                }).filter((item) => item);
                                attrRawList = [...attrRawList, ...propertyValues].filter((item) => {
                                    if (typeof item.value === 'boolean') {
                                        return true;
                                    }
                                    if ([null, undefined].includes(item.value)) {
                                        return false;
                                    }
                                    return true;
                                });
                                const componentJson = this.componentJson || {};
                                relationList.push({
                                    attrName: 'componentJson',
                                    value: JSON.stringify({
                                        props: {},
                                        ...componentJson
                                    })
                                });
                                const className = store.getters.className('PropertyDefinition');
                                const data = {
                                    attrRawList,
                                    className,
                                    associationField: 'holderRef',
                                    oid: this.primaryOid,
                                    relationList: [
                                        {
                                            attrRawList: relationList,
                                            className: 'erd.cloud.foundation.type.entity.ConstraintDefinition',
                                            oid: this.constraintOid
                                        }
                                    ]
                                };
                                this.$famHttp({
                                    url,
                                    data,
                                    method: 'post'
                                })
                                    .then((resp) => {
                                        resolve(resp);
                                        this.$message({
                                            message: this.oid
                                                ? this.i18nMappingObj['updateSuccessfully']
                                                : this.i18nMappingObj['createSuccessfully'],
                                            type: 'success',
                                            showClose: true
                                        });
                                        this.toogleShow();
                                        this.$emit('onsubmit', resp.data);
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
            }
        }
    };
});
