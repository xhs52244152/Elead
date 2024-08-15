define([
    'text!' + ELMP.resource('supplier-components/SupplierAddContact/index.html'),
    ELMP.resource('erdc-app/api/common.js'),
    'erdc-kit',
    'underscore'
], function (template, commonApi) {
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        name: 'SupplierAddContact',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            // 是否只读
            readonly: {
                type: Boolean,
                default: false
            },
            // 编辑对象oid
            oid: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('supplier-components/SupplierAddContact//locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['组件提示', '姓名', '邮箱', '电话', '部门', '地址']),
                form: {}
            };
        },
        computed: {
            // 按钮组合表单数据
            fromList() {
                return [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj['姓名'],
                        required: !this.readonly,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['姓名'])
                                : ''
                        },
                        col: 12
                    },
                    {
                        field: 'email',
                        component: 'erd-input',
                        label: this.i18nMappingObj['邮箱'],
                        required: !this.readonly,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    try {
                                        if (_.isString(value) && value.trim()) {
                                            value = JSON.parse(value);
                                            if (typeof value === 'object' && value) {
                                                return callback();
                                            } else {
                                                return callback(new Error(''));
                                            }
                                        }
                                        return callback();
                                    } catch {
                                        return callback(new Error(''));
                                    }
                                }
                            }
                        ],
                        props: {
                            maxlength: 64,
                            clearable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['邮箱'])
                                : ''
                        },
                        col: 12
                    },
                    {
                        field: 'telephone',
                        component: 'erd-input',
                        label: this.i18nMappingObj['电话'],
                        required: !this.readonly,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    try {
                                        if (_.isString(value) && value.trim()) {
                                            value = JSON.parse(value);
                                            if (typeof value === 'object' && value) {
                                                return callback();
                                            } else {
                                                return callback(new Error(''));
                                            }
                                        }
                                        return callback();
                                    } catch {
                                        return callback(new Error(''));
                                    }
                                }
                            }
                        ],
                        props: {
                            maxlength: 64,
                            clearable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['电话'])
                                : ''
                        },
                        col: 12
                    },
                    {
                        field: 'department',
                        component: 'fam-organization-select',
                        label: this.i18nMappingObj['部门'],
                        props: {
                            clearable: true,
                            filterable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('s', this.i18nMappingObj['部门'])
                                : '',
                            row: {
                                isDefault: true
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'address',
                        component: 'erd-input',
                        label: this.i18nMappingObj['地址'],
                        props: {
                            maxlength: 256,
                            clearable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['地址'])
                                : ''
                        },
                        col: 24
                    }
                ];
            }
        },
        watch: {
            oid: {
                handler: function (oid) {
                    oid && this.getLinkManDetails(oid);
                },
                immediate: true
            }
        },
        methods: {
            // 获取联系人详情
            getLinkManDetails(oid) {
                commonApi.fetchObjectAttr(oid).then((resp) => {
                    // eslint-disable-next-line no-unused-vars
                    let { success, data = {} } = resp || {};
                    if (success) {
                        /* empty */
                    }
                });
            },
            // 表单校验
            formVerification() {
                const { dynamicForm } = this.$refs,
                    { submit, serializeEditableAttr } = dynamicForm;
                return { submit, serializeEditableAttr };
            }
        }
    };
});
