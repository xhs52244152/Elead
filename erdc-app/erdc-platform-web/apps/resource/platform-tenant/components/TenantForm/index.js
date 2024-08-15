define([
    'text!' + ELMP.resource('platform-tenant/components/TenantForm/index.html'),
    'css!' + ELMP.resource('platform-tenant/components/TenantForm/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            defaultValue: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            isEditForm: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            tenantOid: {
                type: String,
                default: ''
            }
        },
        components: {
            ApplicationTable: FamKit.asyncComponent(
                ELMP.resource('platform-tenant/components/ApplicationTable/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('platform-tenant/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    searchTips: this.getI18nByKey('搜索提示'),
                    add: this.getI18nByKey('新增'),
                    edit: this.getI18nByKey('编辑'),
                    name: this.getI18nByKey('名称'),
                    number: this.getI18nByKey('编码'),
                    status: this.getI18nByKey('状态'),
                    startTime: this.getI18nByKey('开始时间'),
                    endTime: this.getI18nByKey('结束时间'),
                    isShare: this.getI18nByKey('是否共享'),
                    description: this.getI18nByKey('描述'),
                    operation: this.getI18nByKey('操作'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    enabled: this.getI18nByKey('启用'),
                    disabled: this.getI18nByKey('停用'),
                    forbidden: this.getI18nByKey('禁用'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    applcationMaintance: this.getI18nByKey('应用维护'),
                    createTenant: this.getI18nByKey('创建租户'),
                    editTenant: this.getI18nByKey('编辑租户'),
                    detail: this.getI18nByKey('详情'),
                    createSuccess: this.getI18nByKey('编辑成功'),
                    editSuccess: this.getI18nByKey('创建成功'),
                    createError: this.getI18nByKey('创建失败'),
                    editError: this.getI18nByKey('创建失败'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    maintancedApp: this.getI18nByKey('已维护的应用'),
                    baseInfo: this.getI18nByKey('基本信息'),
                    changePhoto: this.getI18nByKey('点击更换'),
                    numberError: this.getI18nByKey('请输入编码'),
                    numberError1: this.getI18nByKey('编码格式错误')
                },
                unfold: true,
                unfold2: true
            };
        },
        computed: {
            applications() {
                return this.defaultValue?.applications;
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
            isDisabled() {
                return this.defaultValue && !this.defaultValue.isDefault ? false : true;
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
                            placeholder: this.i18nMappingObj.pleaseEnter,
                            max: 100
                        },
                        col: this.isEditForm ? 12 : 24
                    },
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj.number,
                        required: !this.readonly,
                        readonly: true,
                        disabled: this.isEditForm,
                        hidden: !this.isEditForm,
                        props: {
                            clearable: true,
                            maxLength: 100
                        },
                        validators: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (!value || value.trim() === '') {
                                        callback(this.i18nMappingObj['numberError']);
                                    } else if (value.match(/[^a-zA-Z0-9_.]/gi)) {
                                        callback(this.i18nMappingObj['numberError1']);
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: 'blur'
                            }
                        ],
                        col: 12
                    },
                    {
                        field: 'starTime',
                        component: 'erd-date-picker',
                        label: this.i18nMappingObj.startTime,
                        required: !this.readonly,
                        readonly: this.readonly || false,
                        disabled: this.isEditForm && this.isDisabled,
                        validators: [],
                        props: {
                            'clearable': true,
                            'format': 'yyyy-MM-dd',
                            // 'picker-options': {
                            //     disabledDate: (time) => {
                            //         // time的时间需要小于 最晚日期
                            //         const endTime = this.formData.endTime;
                            //         const flag = endTime ? time.getTime() > new Date(endTime).getTime() : false;
                            //         return flag;
                            //     }
                            // },
                            'value-format': 'yyyy-MM-dd'
                        },
                        col: 12
                    },
                    {
                        field: 'endTime',
                        component: 'erd-date-picker',
                        label: this.i18nMappingObj.endTime,
                        required: !this.readonly,
                        readonly: this.readonly || false,
                        disabled: this.isEditForm && this.isDisabled,
                        validators: [],
                        props: {
                            'clearable': true,
                            // 'picker-options': {
                            //     disabledDate: (time) => {
                            //         // 结束时间需要大于最早日期
                            //         const startTime = this.formData.starTime;
                            //         const flag = startTime ? time.getTime() < new Date(startTime).getTime() : false;
                            //         return flag;
                            //     }
                            // },
                            'format': 'yyyy-MM-dd',
                            'value-format': 'yyyy-MM-dd'
                        },
                        col: 12
                    },
                    {
                        field: 'enabled',
                        component: 'erd-radio',
                        label: this.i18nMappingObj.status,
                        labelLangKey: 'status',
                        required: !this.readonly,
                        readonly: this.readonly || false,
                        props: {},
                        col: 12,
                        slots: {
                            component: 'radioComponent',
                            readonly: 'readonlyComponent'
                        }
                    },
                    {
                        field: 'isShare',
                        component: 'erd-radio',
                        label: this.i18nMappingObj.isShare,
                        required: !this.readonly,
                        readonly: this.readonly || false,
                        props: {},
                        col: 12,
                        slots: {
                            component: 'shareRadioComponent',
                            readonly: 'shareReadonlyComponent'
                        }
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
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.description,
                        labelLangKey: 'internalName',
                        required: false,
                        readonly: this.readonly,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj.pleaseEnter,
                            placeholderLangKey: 'pleaseEnter',
                            i18nName: this.i18nMappingObj.description,
                            type: 'textarea',
                            max: 300
                        },
                        col: 24
                    }
                ];
            }
        },
        methods: {
            validate() {
                this.$refs.dynamicForm.validate((res) => {
                    if (res) {
                        const starTime = this.formData.starTime;
                        const endTime = this.formData.endTime;
                        if (new Date(starTime) > new Date(endTime)) {
                            this.$message({ type: 'error', message: '开始时间不可大于结束时间！', showClose: true });
                            return;
                        }
                        const backData = {
                            nameI18nJson: this.formData.nameI18nJson.value,
                            descriptionI18nJson: this.formData.descriptionI18nJson.value,
                            enabled: this.formData.enabled,
                            endTime,
                            isShare: this.formData.isShare,
                            identifierNo: this.formData.identifierNo,
                            starTime,
                            icon: this.formData.icon
                        };
                        this.$emit('handlerValidSuccess', backData);
                    }
                });
            }
        }
    };
});
