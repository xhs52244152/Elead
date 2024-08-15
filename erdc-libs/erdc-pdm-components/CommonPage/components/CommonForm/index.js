define([
    'text!' + ELMP.resource('erdc-pdm-components/CommonPage/components/CommonForm/index.html'),
    'css!' + ELMP.resource('erdc-pdm-components/CommonPage/components/CommonForm/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'CommonForm',
        template,
        components: {
            FormPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/FormPageTitle/index.js')),
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        props: {
            // 是否显示页头
            isShowTitle: {
                type: Boolean,
                default: true
            },
            // 是否显示布局
            isShowLayout: {
                type: Boolean,
                default: true
            },
            // 是否显示按钮
            isShowButton: {
                type: Boolean,
                default: true
            },
            // 页头数据
            bindPageTitle: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 表单数据
            bindCommonForm: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 按钮数据
            buttonList: {
                type: Array,
                default: () => {
                    return [];
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
        computed: {
            innerFormData: {
                get() {
                    return this.formData;
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            commonFormRef() {
                return (
                    this.$refs?.commonFormRef || {
                        submit: () => {
                            return Promise.reject();
                        },
                        serializeEditableAttr: this.submit
                    }
                );
            }
        },
        methods: {
            submit() {
                let { submit } = this.commonFormRef || {};
                return submit();
            },
            serializeEditableAttr() {
                let { serializeEditableAttr } = this.commonFormRef || {};
                return serializeEditableAttr();
            }
        }
    };
});
