define([
    'text!' + ELMP.resource('bpm-resource/components/BpmDelegateForm/template.html'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'BpmDelegateForm',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            readonly: Boolean,
            // 是否密级
            isSecret: {
                type: Boolean,
                default: false
            },
            securityLabel: {
                type: String,
                default: undefined
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmDelegateForm/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    '组件提示',
                    '转办',
                    '代办',
                    '委派',
                    '处理人',
                    '委派原因',
                    '备注',
                    '请输入备注',
                    '转办提示',
                    '代办提示'
                ]),
                form: {
                    operationType: 'transfer',
                    assignee: '',
                    comment: ''
                }
            };
        },
        computed: {
            // 表单数据
            dataList() {
                return [
                    {
                        field: 'operationType',
                        component: 'FamRadio',
                        label: this.i18nMappingObj['委派'],
                        disabled: false,
                        required: true,
                        hidden: false,
                        tooltip: this.i18nMappingObj[this.form.operationType === 'transfer' ? '转办提示' : '代办提示'],
                        props: {
                            type: 'radio',
                            options: this.delegateList,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('s', this.i18nMappingObj['委派'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'assignee',
                        component: 'FamParticipantSelect',
                        label: this.i18nMappingObj['处理人'],
                        required: true,
                        props: {
                            showType: ['USER'],
                            queryScope: 'fullTenant',
                            queryMode: ['FUZZYSEARCH'],
                            queryParams: {
                                url: '/bpm/workitem/users',
                                method: 'GET',
                                data: {
                                    optType: 'delegate'
                                }
                            },
                            isFetchValue: true,
                            filterSecurityLabel: this.isSecret,
                            securityLabel: this.securityLabel,
                            multiple: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['处理人'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'comment',
                        component: 'erd-input',
                        label: this.i18nMappingObj['委派原因'],
                        required: true,
                        props: {
                            type: 'textarea',
                            rows: 5,
                            clearable: true,
                            maxlength: 500,
                            'show-word-limit': true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['委派原因'])
                                : ''
                        },
                        col: 24
                    }
                ];
            },
            // 委派列表
            delegateList() {
                return [
                    { label: this.i18nMappingObj['转办'], value: 'transfer' },
                    { label: this.i18nMappingObj['代办'], value: 'delegate' }
                ];
            }
        },
        methods: {
            // 表单校验
            submit() {
                const { famDynamicForm } = this.$refs || {},
                    { submit } = famDynamicForm || {};
                return submit();
            },
            // 提交委派
            submitApi(data) {
                return this.$famHttp({
                    url: '/bpm/task/transferDelegate',
                    method: 'POST',
                    data
                });
            }
        }
    };
});
