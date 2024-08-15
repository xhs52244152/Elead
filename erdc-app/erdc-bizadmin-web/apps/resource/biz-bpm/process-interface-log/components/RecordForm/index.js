define(['erdcloud.kit', 'underscore'], function () {
    const ErdcKit = require('erdcloud.kit'),
        _ = require('underscore');

    return {
        /*html*/
        template: `
            <div class="record-form-content">
                <FamDynamicForm
                    ref="dynamicForm"
                    :form.sync="form"
                    :data="fromList"
                    :readonly="readonly"
                    label-position="right"
                ></FamDynamicForm>
            </div>
        `,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            // 是否只读
            readonly: {
                type: Boolean,
                default: false
            },
            // 表单数据
            form: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    '组件提示',
                    '调用时间',
                    '处理时间',
                    '接口状态',
                    '接口参数',
                    '返回数据'
                ])
            };
        },
        computed: {
            // 按钮组合表单数据
            fromList() {
                return [
                    {
                        field: 'invokeTime',
                        component: 'erd-input',
                        label: this.i18nMappingObj['调用时间'],
                        required: false,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['调用时间'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'runtime',
                        component: 'erd-input',
                        label: this.i18nMappingObj['处理时间'],
                        required: false,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['处理时间'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'result',
                        component: 'erd-input',
                        label: this.i18nMappingObj['接口状态'],
                        required: false,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['接口状态'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'params',
                        component: 'erd-input',
                        label: this.i18nMappingObj['接口参数'],
                        required: false,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 500,
                            type: 'textarea',
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['接口参数'])
                                : ' '
                        },
                        col: 24
                    },
                    {
                        field: 'resultData',
                        component: 'erd-input',
                        label: this.i18nMappingObj['返回数据'],
                        required: false,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 500,
                            type: 'textarea',
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['返回数据'])
                                : ' '
                        },
                        col: 24
                    }
                ];
            }
        }
    };
});
