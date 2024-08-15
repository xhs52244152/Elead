define([], function () {
    return {
        name: 'BpmTerminateForm',

        /*html*/
        template: `
            <div
                id="terminate-form-content"
                class="terminate-form-content"
            >
                <FamDynamicForm
                    ref="famDynamicForm"
                    :form.sync="form"
                    :data="dataList"
                    :readonly="readonly"
                    label-position="right"
                >
                </FamDynamicForm>
            </div>
        `,
        props: {
            readonly: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmTerminateForm/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['备注', '请输入备注']),
                form: {
                    comment: ''
                }
            };
        },
        computed: {
            // 表单数据
            dataList() {
                return [
                    {
                        field: 'comment',
                        component: 'erd-input',
                        label: this.i18nMappingObj['备注'],
                        required: true,
                        props: {
                            type: 'textarea',
                            rows: 5,
                            clearable: true,
                            maxlength: 500,
                            'show-word-limit': true,
                            i18nName: this.i18nMappingObj['备注'],
                            placeholder: this.i18nMappingObj['请输入备注'],
                            placeholderLangKey: this.i18nMappingObj['请输入备注']
                        },
                        col: 24
                    }
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
            submitApi(data) {
                return this.$famHttp({
                    url: '/bpm/task/stopTask',
                    data,
                    method: 'POST',
                    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                });
            }
        }
    };
});
