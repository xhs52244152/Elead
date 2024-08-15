
/*
    类型基本信息配置
    先引用 kit组件
    ManageTeamForm: FamKit.asyncComponent(ELMP.resource('biz-template/team-template/components/ManageTeamForm/index.js')), // 类型基本信息配置


    <lifecycle-form
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </lifecycle-form>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-template/team-template/components/BaseInfo/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('biz-template/team-template/components/BaseInfo/style.css'),
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
                    return false
                }
            },
            // create、update、check
            type: {
                type: String,
                default: () => {
                    return 'check'
                }
            },
            // 表单数据
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-template/team-template/locale/index.js'),
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible
                },
                set(val) {
                    this.$emit("update:visible", val)
                    // this.visible = val
                }
            },
            readonly() {
                return this.type === 'check' || this.type === 'checkHistory'
            },
            data() {
                const type = this.type
                return [
                    {
                        field: 'displayName',
                        component: 'erd-input',
                        label: this.i18n.name, // 名称
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                        },
                        col: 24
                    },
                    {
                        // 创建的时候不带出来
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18n.code, // 编码
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: type === 'create',
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                        },
                        col: 24
                    },
                    {
                        field: 'appName',
                        component: 'custom-select',
                        label: this.i18n.application, // 所属应用
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                        },
                        slots: {
                            component: 'menuApp',
                            readonly: 'readonlyComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'enabled',
                        component: 'FamRadio',
                        label: this.i18n.status, // 状态
                        labelLangKey: '状态',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            options: [
                                {
                                    label: this.i18n.enable, // 启用
                                    value: true
                                }, {
                                    label: this.i18n.disable, // 停用
                                    value: false
                                }
                            ]
                        },
                        col: 24
                    },
                    {
                        field: 'isUsed',
                        component: 'FamRadio',
                        label: this.i18n.isReferenced, // 是否被引用
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: type === 'create' || type === 'update',
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: false,
                            options: [
                                {
                                    label: this.i18n.true,
                                    value: 1
                                }, {
                                    label: this.i18n.false,
                                    value: 0
                                }
                            ]
                        },
                        col: 24
                    },
                    {
                        field: 'displayDesc',
                        component: 'erd-input',
                        label: this.i18n.description, // 描述
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: false,
                        validators: [],
                        props: {
                            clearable: false,
                            type: 'textarea',
                            maxlength: 300,
                            'show-word-limit': true
                        },
                        col: 24
                    },
                ]
            },
            lifeData: {
                get() {
                    return this.formData || {}
                },
                set(val) {
                    this.$emit('update:formData', val)
                }
            },
            appList() {
                return store?.state?.app?.appNames || []
            }
        },
        mounted() {
        },
        methods: {
        },
        components: {
        }
    };
});
