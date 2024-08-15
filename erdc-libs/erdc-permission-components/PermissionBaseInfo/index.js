define([
    'text!' + ELMP.resource('erdc-permission-components/PermissionBaseInfo/index.html'),
    'css!' + ELMP.resource('erdc-permission-components/PermissionBaseInfo/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            ExpansionFoldingBlock: ErdcKit.asyncComponent(
                ELMP.resource('erdc-permission-components/ExpansionFoldingBlock/index.js')
            ),
            TypeTreeSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-permission-components/TypeTreeSelect/index.js')),
            StatusSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-permission-components/StatusSelect/index.js')),
            FamDynamicFormItem: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js')
            ),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            editFormData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            iseditscene: {
                type: Boolean,
                default: true
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            queryScope: {
                type: String,
                default: 'fullTenant'
            },
            isContext: Boolean,
            isBasics: true,
            statusQueryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        watch: {
            editFormData: {
                deep: true,
                immediate: true,
                handler(newVal) {
                    if (newVal.typeSelectObj) {
                        this.setDefaultFormData(newVal);
                    }
                }
            },
            appName: {
                immediate: true,
                handler(appName) {
                    if (appName) {
                        this.formData.appNames = [appName];
                    }
                }
            }
        },
        computed: {
            participantShowType() {
                if (this.iseditscene) {
                    return ['USER', 'GROUP', 'ROLE', 'ORG'];
                } else {
                    return [this.participantSelectType];
                }
            },
            formConfig() {
                return [
                    {
                        field: 'typeSelected',
                        label: this.i18nMappingObj.type,
                        required: true,
                        component: 'typeTreeSelect',
                        slots: {
                            component: 'typeTreeSelect',
                            readonly: 'typeTreeSelect'
                        },
                        col: 12
                    },
                    {
                        field: 'statusId',
                        label: this.i18nMappingObj.state,
                        required: true,
                        component: 'custom-select',
                        props: {
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/listByKey',
                                    method: 'get',
                                    data: {
                                        className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState',
                                        targetClass: this.formData.typeSelected?.name,
                                        ...this.statusQueryParams
                                    }
                                },
                                viewProperty: 'name',
                                valueProperty: 'key',
                                filterable: true,
                                clearNoData: true
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'participant',
                        label: this.i18nMappingObj.participants,
                        required: true,
                        component: 'famParticipaSelect',
                        slots: {
                            component: 'famParticipantSelect',
                            readonly: 'famParticipantSelect'
                        },
                        col: 12,
                        validators: [
                            {
                                validator: (rule, value, callback) => {
                                    const selected = value?.value || [];
                                    const type = Object.prototype.toString.call(selected);
                                    const arrayError = type === '[object Array]' && selected?.length === 0;
                                    const ObjError = type === '[object Object]' && Object.keys(selected)?.length === 0;
                                    if (!this.isLoading && !this.formDisabled && (arrayError || ObjError)) {
                                        callback(new Error('请填写参与者'));
                                    } else {
                                        this.$nextTick(() => {
                                            this.isLoading = false;
                                        });
                                        callback();
                                    }
                                },
                                trigger: 'change'
                            }
                        ]
                    },
                    {
                        field: 'appNames',
                        label: this.i18n.scopeApplication,
                        required: true,
                        readonly: this.isContext,
                        component: 'customSelect',
                        props: {
                            multiple: true,
                            clearable: true,
                            filterable: true,
                            row: {
                                components: 'constant-select',
                                viewProperty: 'displayName',
                                valueProperty: 'identifierNo',
                                referenceList: this.appNameList
                            }
                        },
                        col: 12
                    }
                ];
            },
            formDisabled() {
                return !this.iseditscene;
            },
            innerQueryParams() {
                const queryParams = {
                    ...this.queryParams,
                    data: {
                        ...this.queryParams.data,
                        appName: this.appName
                    }
                };
                return queryParams;
            },
            appName() {
                let appName = this.queryParams?.data?.appName;
                if(!this.isContext) {
                    const app = this.appNameList.find(item => this.formData?.typeSelected?.appName === item.identifierNo);
                    appName = app ? app?.identifierNo || this.formData?.typeSelected?.appName : appName;
                }
                return appName
            },
            appNameList() {
                return this.$store?.state?.app?.appNames || [];
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-permission-components/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    participants: this.getI18nByKey('参与者'),
                    baseInfo: this.getI18nByKey('基本信息'),
                    type: this.getI18nByKey('类型'),
                    state: this.getI18nByKey('状态'),
                    pleaseSelect: this.getI18nByKey('请选择')
                },
                formData: {
                    typeSelected: null,
                    appNames: []
                },
                statusSelectValue: '',
                participantSelectType: '',
                isLoading: true
            };
        },
        methods: {
            setDefaultFormData(formData) {
                const typeSelectObj = formData.typeSelectObj || {};
                const statusSelectObj = formData.statusSelectObj || {};
                const participantObj = formData.participantObj || {};
                this.formData.typeSelected = {
                    displayName: typeSelectObj.displayName,
                    value: typeSelectObj.id,
                    appName: typeSelectObj.appName
                };
                this.formData.statusId = statusSelectObj.name;
                this.participantSelectType = participantObj.principalTarget;
                this.formData.participant = participantObj.principalRef
                    ? {
                          type: participantObj.principalTarget || '',
                          value: participantObj.principalRef ? [participantObj.principalRef] : [],
                          name: participantObj.principal.displayName
                      }
                    : undefined;
            },
            handlerChangeTypeInDialog(data) {
                this.$set(this.formData, 'typeSelected', data);
            },
            validateForm() {
                this.$refs.permissionBaseInfoForm.validate((res) => {
                    if (res) {
                        this.$emit('validateFormSuccess', this.formData);
                    }
                });
            }
        }
    };
});
