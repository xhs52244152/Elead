define([
    'text!' + ELMP.resource('platform-microservice/components/ApplicationForm/index.html'),
    'css!' + ELMP.resource('platform-microservice/components/ApplicationForm/style.css')
], function (template) {
    const FamKit = require('fam:kit');

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
        components: {
            TenantTable: FamKit.asyncComponent(ELMP.resource('platform-tenant/components/TenantTable/index.js')),
            FamDynamicForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
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
                    baseInfo: this.getI18nByKey('基本信息'),
                    relatedTenant: this.getI18nByKey('关联租户'),
                    changePhoto: this.getI18nByKey('点击更换')
                },
                unfold: true,
                unfold2: true,
                tableHeight: 450
            };
        },
        computed: {
            baseParams() {
                return this.defaultValue && this.defaultValue.id ? { appId: this.defaultValue.id } : {};
            },
            formData() {
                const defaultValue = JSON.parse(JSON.stringify(this.defaultValue));
                defaultValue.nameI18nJson = {
                    attrName: 'nameI18nJson',
                    value: {
                        value: defaultValue.displayName
                    }
                };
                defaultValue.descriptionI18nJson = {
                    attrName: 'descriptionI18nJson',
                    value: {
                        value: defaultValue.displayDesc
                    }
                };
                return defaultValue;
            },
            formConfig() {
                return [
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.name,
                        labelLangKey: this.i18nMappingObj.name,
                        required: !this.readonly,
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
                        field: 'version',
                        component: 'erd-input',
                        label: this.i18nMappingObj.version,
                        readonly: true,
                        col: 12
                    },
                    {
                        field: 'icon',
                        component: 'FamAutographUpload',
                        readonlyComponent: 'FamAutographUpload',
                        label: 'LOGO',
                        validators: [],
                        props: {
                            clearable: true,
                            required: !this.readonly,
                            readonly: this.readonly || false,
                            suffixText: this.i18nMappingObj.changePhoto,
                            suffixTextDesc: '尺寸104px X 32px'
                        },
                        col: 12
                    },
                    {
                        field: 'sortOrder',
                        component: 'erd-input-number',
                        label: this.i18nMappingObj.sortName,
                        readonly: false,
                        col: 12,
                        props: {
                            min: 0
                        }
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.description,
                        labelLangKey: 'internalName',
                        required: false,
                        readonly: this.readonly,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj.description,
                            placeholderLangKey: this.i18nMappingObj.pleaseEnter,
                            i18nName: this.i18nMappingObj.description,
                            type: 'textarea'
                        },
                        col: 24
                    }
                ];
            }
        },
        created() {
            this.tableHeight = document.documentElement.clientHeight - 640;
        },
        methods: {
            validateForm() {
                this.$refs.dynamicForm.validate((res) => {
                    if (res) {
                        const params = {
                            descriptionI18nJson: this.formData.descriptionI18nJson.value,
                            nameI18nJson: this.formData.nameI18nJson.value,
                            icon: this.formData.icon,
                            id: this.formData.id,
                            sortOrder: this.formData.sortOrder
                        };
                        this.$emit('formValidSuccess', params);
                    }
                });
            }
        }
    };
});
