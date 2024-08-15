define([
    'text!' + ELMP.resource('platform-microservice/components/ServiceForm/index.html'),
    'css!' + ELMP.resource('platform-microservice/components/ServiceForm/style.css')
], function (template) {
    return {
        template,
        props: {
            readonly: {
                type: Boolean,
                default: false
            },
            defaultValue: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {},
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('platform-microservice/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    name: this.getI18nByKey('名称'),
                    number: this.getI18nByKey('编码'),
                    version: this.getI18nByKey('版本号'),
                    description: this.getI18nByKey('描述'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    sign: this.getI18nByKey('标识'),
                    belongToApp: this.getI18nByKey('所属应用'),
                    contextPath: this.getI18nByKey('上下文路径')
                }
            };
        },
        computed: {
            formData() {
                const defaultValue = JSON.parse(JSON.stringify(this.defaultValue));
                defaultValue.nameI18nJson = {
                    attrName: 'nameI18nJson',
                    value: defaultValue?.nameI18nJson || ''
                };
                return defaultValue;
            },
            formConfig() {
                const formConfig = [
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.name,
                        labelLangKey: this.i18nMappingObj.name,
                        required: this.readonly ? false : true,
                        readonly: this.readonly || false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.pleaseEnter
                        },
                        col: 12
                    },
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj.number,
                        readonly: true,
                        props: {
                            clearable: true
                        },
                        col: 12
                    },
                    {
                        field: 'shortName',
                        component: 'erd-input',
                        label: this.i18nMappingObj.sign,
                        readonly: true,
                        col: 12
                    },
                    {
                        field: 'appName',
                        component: 'erd-input',
                        label: this.i18nMappingObj.belongToApp,
                        readonly: true,
                        col: 12
                    },
                    {
                        field: 'contextPath',
                        component: 'erd-input',
                        label: this.i18nMappingObj.contextPath,
                        disabled: false,
                        readonly: this.readonly || false,
                        col: 12
                    }
                ];
                return formConfig;
            }
        },
        mounted() {},
        methods: {
            validateForm() {
                this.$refs.dynamicForm.validate((res) => {
                    if (res) {
                        const params = {
                            nameI18nJson: this.formData.nameI18nJson.value,
                            contextPath: this.formData.contextPath,
                            id: this.formData.id
                        };
                        this.$emit('formValidSuccess', params);
                    }
                });
            }
        }
    };
});
