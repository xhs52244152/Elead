/*
    类型基本信息配置
    先引用 kit组件
    LifecycleForm: FamKit.asyncComponent(ELMP.resource('biz-lifecycle/components/LifecycleForm/index.js')), // 类型基本信息配置


    <lifecycle-form
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </lifecycle-form>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-lifecycle/components/LifecycleInformation/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('biz-lifecycle/components/LifecycleInformation/style.css')
], function (template, fieldTypeMapping) {
    const store = require('fam:store');

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
            // create、update、check
            type: {
                type: String,
                default: () => {
                    return 'check';
                }
            },
            // 表单数据
            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-lifecycle/components/LifecycleInformation/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseSelet: this.getI18nByKey('请选择'),
                    type: this.getI18nByKey('类型'),
                    basisType: this.getI18nByKey('基础'),
                    seniorType: this.getI18nByKey('高级'),
                    typeTooltip: this.getI18nByKey('类型提示'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    state: this.getI18nByKey('状态'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),
                    name: this.getI18nByKey('名称'),
                    number: this.getI18nByKey('编码'),
                    application: this.getI18nByKey('应用'),
                    objectType: this.getI18nByKey('对象类型'),
                    objectTypeTooltip: this.getI18nByKey('对象类型提示'),
                    whetherReferenced: this.getI18nByKey('是否被引用'),
                    context: this.getI18nByKey('上下文'),
                    description: this.getI18nByKey('描述')
                },
                referenceList: [],
                row: {},
                refreshComponent: true
            };
        },
        watch: {
            'type': function (n, o) {
                if (n) {
                    this.referenceList = [];
                }
                if (this.type === 'create') {
                    this.refreshComponent = false;
                    setTimeout(() => {
                        this.refreshComponent = true;
                    }, 20);
                }
            },
            'formData.appName': {
                deep: true,
                immediate: true,
                handler(n, o) {
                    if (n) {
                        this.getSupportedClass();
                    }
                    // if (this.type === 'create') {
                    //     this.refreshComponent = false;
                    //     setTimeout(() => {
                    //         this.refreshComponent = true;
                    //     }, 20);
                    // }
                }
            }
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
            readonly() {
                return this.type == 'check' || this.type == 'checkHistory';
            },
            data() {
                const type = this.type;
                return [
                    {
                        field: 'basic',
                        component: 'FamRadio',
                        label: this.i18nMappingObj['type'],
                        labelLangKey: 'type',
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj['basisType'],
                                    value: true
                                },
                                {
                                    label: this.i18nMappingObj['seniorType'],
                                    value: false
                                }
                            ]
                        },
                        col: 12
                    },
                    {
                        field: 'basicPlaceholder',
                        component: 'FamDynamicFormPlaceholder',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {},
                        slots: {
                            component: 'typeTooltipComponent',
                            readonly: 'typeTooltipReadonly'
                        },
                        col: 12
                    },
                    {
                        field: 'enabled',
                        component: 'FamRadio',
                        label: this.i18nMappingObj['state'],
                        labelLangKey: 'state',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj['enable'],
                                    value: true
                                },
                                {
                                    label: this.i18nMappingObj['disable'],
                                    value: false
                                }
                            ]
                        },
                        col: 12
                    },
                    {
                        field: 'enabledPlaceholder',
                        component: 'FamDynamicFormPlaceholder',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {},
                        slots: {
                            readonly: 'placeholderComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj['name'],
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            autofocus: true
                        },
                        col: 12
                    },
                    {
                        field: 'namePlaceholder',
                        component: 'FamDynamicFormPlaceholder',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {},
                        slots: {
                            readonly: 'placeholderComponent'
                        },
                        col: 12
                    },
                    {
                        // 创建的时候不带出来
                        field: 'code',
                        component: 'erd-input',
                        label: this.i18nMappingObj['number'],
                        labelLangKey: 'number',
                        disabled: false,
                        hidden: type == 'create',
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {},
                        col: 12
                    },
                    {
                        field: 'codePlaceholder',
                        component: 'FamDynamicFormPlaceholder',
                        disabled: false,
                        hidden: type == 'create',
                        required: false,
                        validators: [],
                        props: {},
                        slots: {
                            readonly: 'placeholderComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'appName',
                        component: 'custom-select',
                        label: this.i18nMappingObj['application'],
                        labelLangKey: 'application',
                        disabled: false,
                        hidden: false,
                        required: true,
                        readonly: type == 'create' ? false : true,
                        validators: [],
                        props: {
                            clearable: false
                        },
                        slots: {
                            component: 'menuApp',
                            readonly: 'appNameReadonlyComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'appNamePlaceholder',
                        component: 'FamDynamicFormPlaceholder',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {},
                        slots: {
                            readonly: 'placeholderComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'supportedClass',
                        component: 'custom-select',
                        label: this.i18nMappingObj['objectType'],
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'typeName', // 显示value的key
                                referenceList: this.referenceList
                            }
                        },
                        slots: {
                            component: 'supportedClassComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'supportedClassPlaceholder',
                        component: 'FamDynamicFormPlaceholder',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {},
                        slots: {
                            component: 'supportedClassPlaceholderComponent',
                            readonly: 'supportedClassPlaceholderReadonly'
                        },
                        col: 12
                    },
                    {
                        field: 'isUsed',
                        component: 'FamRadio',
                        label: this.i18nMappingObj['whetherReferenced'],
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: type == 'create' || type == 'update',
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: false,
                            options: [
                                {
                                    label: this.i18nMappingObj['yes'],
                                    value: 1
                                },
                                {
                                    label: this.i18nMappingObj['no'],
                                    value: 0
                                }
                            ]
                        },
                        col: 12
                    },
                    {
                        field: 'isUsedPlaceholder',
                        component: 'FamDynamicFormPlaceholder',
                        disabled: false,
                        hidden: type == 'create' || type == 'update',
                        required: false,
                        validators: [],
                        props: {},
                        slots: {
                            readonly: 'placeholderComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj['context'],
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: type == 'create' || type == 'update',
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'name', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: [
                                    {
                                        name: this.$store?.state.app?.container?.name,
                                        value: this.$store?.state.app?.container?.oid
                                    }
                                ]
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'containerRefPlaceholder',
                        component: 'FamDynamicFormPlaceholder',
                        disabled: false,
                        hidden: type == 'create' || type == 'update',
                        required: false,
                        validators: [],
                        props: {},
                        slots: {
                            readonly: 'placeholderComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'description',
                        component: 'erd-input',
                        label: this.i18nMappingObj['description'],
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: false,
                        validators: [],
                        props: {
                            'clearable': false,
                            'type': 'textarea',
                            'maxlength': 300,
                            'show-word-limit': true
                        },
                        slots: {
                            readonly: 'descriptionReadonly'
                        },
                        col: 12
                    }
                ];
            },
            lifeData: {
                get() {
                    return this.formData || {};
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            appList() {
                return store?.state?.app?.appNames || [];
            }
        },
        mounted() {},
        methods: {
            getSupportedClass() {
                if (this.referenceList && this.referenceList.length) {
                    return;
                }
                this.$famHttp({
                    url: '/fam/lifecycle/class/list',
                    params: {
                        appName: this.formData?.appName
                    },
                    method: 'GET'
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.referenceList = data;
                        if (this.type === 'create') {
                            this.$set(this.lifeData, 'supportedClass', data[0]?.typeName || '');
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }
    };
});
