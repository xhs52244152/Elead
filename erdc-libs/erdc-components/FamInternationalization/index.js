/*
国际化组件
先引用 kit组件
Internationalization: FamKit.asyncComponent(ELMP.resource('erdc-components/FamInternationalization/index.js')),

<internationalization 
:visible.sync="visible" 
:type="'textarea'"
:form-data="internationFormData" 
@onsubmit="onSubmit">
</internationalization>

visible：是否显示组件
type：组件类型，分为： basics（默认）, textarea
回显数据: 同一传入回显格式
formData: {
    {
        "attrName": "attr",
        "value": {
            "value": "主文本",
            "zh_cn": "zh_cn",
            "en_us": "en_us",
            "zh_tw": "zh_tw",
            "en_gb": "en_gb"
        }
    }
}
name : "属性名称"
onsubmit: 确定回调函数

返回参数

 */

define([
    'text!' + ELMP.resource('erdc-components/FamInternationalization/index.html'),
    ELMP.resource('erdc-components/FamDynamicForm/DeepFieldVisitorMixin.js'),
    'css!' + ELMP.resource('erdc-components/FamInternationalization/style.css')
], function (template, DeepFieldVisitorMixin) {
    return {
        template,
        mixins: [DeepFieldVisitorMixin],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 类型
            type: {
                type: String,
                default: () => {
                    return 'basics';
                }
            },

            // 表单回显数据
            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            },

            // 显示属性名称
            name: {
                type: String,
                default: () => {
                    return '';
                }
            },
            required: {
                type: [Boolean],
                default: () => {
                    return false;
                }
            },
            popperClass: String,
            closeOnClickModal: {
                type: [Boolean],
                default: () => {
                    return false;
                }
            },
            appendToBody: {
                type: [Boolean],
                default: () => {
                    return true;
                }
            },
            max: {
                type: Number | String,
                default: () => {
                    return 300;
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamInternationalization/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    pleaseInput: this.getI18nByKey('请输入'),
                    pleaseClick: this.getI18nByKey('请点击'),
                    confirm: this.getI18nByKey('确定'),
                    cencel: this.getI18nByKey('取消'),
                    attribute: this.getI18nByKey('属性'),
                    mainText: this.getI18nByKey('主文本'),
                    tips: this.getI18nByKey('提示信息'),
                    basicInfor: this.getI18nByKey('基本信息'),
                    language: this.getI18nByKey('语言'),
                    Internationalization: this.getI18nByKey('国际化'),
                    multiLanguage: this.getI18nByKey('填写多语言信息，可在不同语言环境下，正确显示信息')
                },
                innerData: {
                    attrName: '',
                    value: {
                        value: '',
                        zh_cn: '',
                        en_us: '',
                        zh_tw: '',
                        en_gb: ''
                    }
                }
            };
        },
        watch: {
            formData: {
                handler: function () {
                    const value = {
                        value: this.formData?.value?.value || ''
                    };
                    _.each(this.lanAttr, (item) => {
                        value[item.language] =
                            this.formData?.value?.[item.language] || this.formData?.[item.language] || '';
                    });
                    this.innerData = {
                        attrName: this.formData?.attrName || '',
                        value
                    };
                },
                immediate: true,
                deep: true
            }
        },
        computed: {
            formLayout() {
                return [
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: this.i18nMappingObj['basicInfor'],
                        props: {
                            unfold: true
                        },
                        children: [
                            {
                                field: 'attrName',
                                component: 'slot',
                                label: this.i18nMappingObj['attribute'],
                                props: {
                                    name: 'attr-name-component'
                                },
                                col: this.type === 'textarea' ? 24 : 12
                            },
                            {
                                field: 'value.value',
                                component: 'erd-input',
                                label: this.i18nMappingObj['mainText'],
                                required: this.type !== 'textarea' && this.required,
                                tooltip: this.i18nMappingObj['tips'],
                                props: {
                                    type: this.type === 'textarea' ? 'textarea' : 'text',
                                    'show-word-limit': this.type === 'textarea',
                                    placeholder: this.i18nMappingObj['pleaseInput'],
                                    maxlength: this.max
                                },
                                col: this.type === 'textarea' ? 24 : 12
                            }
                        ]
                    },
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: this.i18nMappingObj['language'],
                        props: {
                            unfold: true
                        },
                        children: this.formAttr
                    }
                ];
            },
            lanAttr() {
                return this.$store.state.i18n.languages || [];
            },
            formAttr() {
                let formAttr = [];
                this.lanAttr?.forEach((item) => {
                    let obj = {
                        field: `value.${item.language}`,
                        component: 'erd-input',
                        label: item.displayName,
                        labelLangKey: item.displayName,
                        props: {
                            placeholder: this.i18nMappingObj['pleaseInput'],
                            placeholderLangKey: 'pleaseEnter',
                            type: this.type,
                            'show-word-limit': this.type === 'textarea',
                            maxlength: this.max
                        },
                        listeners: {
                            change: (value) => {
                                this.onLocaleItemChange(item.language, value);
                            }
                        },
                        col: this.type === 'textarea' ? 24 : 12
                    };
                    formAttr.push(obj);
                });
                return formAttr;
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            currentLang() {
                return this.$store.state.i18n?.lang;
            },
            attrShowName() {
                return this.name || this.formData?.attrName || '';
            }
        },
        methods: {
            // 弹窗显示隐藏
            toogleShow: function () {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            // 确定按钮
            saveSubmit: function () {
                this.$refs.innerData.validate((valid) => {
                    if (valid) {
                        const defaultValue =
                            this.innerData?.value[this.currentLang] || this.innerData?.value?.value || '';

                        if (this.innerData && this.innerData.value) {
                            // 强制同步主文本和当前语言
                            if (!this.innerData.value.value && this.innerData.value[this.currentLang]) {
                                this.innerData.value.value = this.innerData.value[this.currentLang];
                            }
                        }

                        const exposeData = {
                            attrName: this.innerData.attrName,
                            value: {
                                ...this.innerData.value
                            }
                        };

                        this.$emit('onsubmit', exposeData, defaultValue);
                        this.toogleShow();
                    }
                });
            },
            onLocaleItemChange() {
                if (this.innerData && this.innerData.value) {
                    // 强制同步主文本和当前语言
                    if (!this.innerData.value.value && this.innerData.value[this.currentLang]) {
                        this.innerData.value.value = this.innerData.value[this.currentLang];
                    }
                }
            },
            handleFieldInput({ field }, value) {
                if (this.type !== 'textarea') {
                    this.setFieldValue(this.innerData, field, value?.trim());
                }
            }
        }
    };
});
