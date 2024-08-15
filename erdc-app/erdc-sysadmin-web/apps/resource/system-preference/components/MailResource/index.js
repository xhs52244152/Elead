define([], function (template) {
    return function (fileId, callback) {
        callback({
            template: `
                <FamDynamicForm
                    ref="dynamicForm"
                    :form="innerFormData"
                    :data="formConfig"
                    :readonly="readonly"
                >
                </FamDynamicForm>
            `,
            props: {
                data: {
                    type: Object | Array,
                    default() {
                        return {};
                    }
                },
                readonly: Boolean
            },
            data() {
                return {};
            },
            computed: {
                formConfig() {
                    return [
                        {
                            field: 'host',
                            component: 'erd-input',
                            label: '主机',
                            required: true,
                            col: 24
                        },
                        {
                            field: 'sender',
                            component: 'erd-input',
                            label: '发送人',
                            required: true,
                            col: 24
                        },
                        {
                            field: 'password',
                            component: 'erd-input',
                            label: '密码',
                            required: true,
                            col: 24
                        },
                        {
                            field: 'protocol',
                            component: 'erd-input',
                            label: '协议',
                            required: true,
                            col: 24
                        },
                        {
                            field: 'ntlmDomain',
                            component: 'erd-input',
                            label: 'ntlm/domain',
                            required: true,
                            col: 24
                        },
                        {
                            field: 'port',
                            component: 'erd-input',
                            label: '端口',
                            required: true,
                            col: 24
                        },
                        {
                            field: 'username',
                            component: 'erd-input',
                            label: '用户名',
                            required: true,
                            col: 24
                        },
                        {
                            field: 'smtpsHost',
                            component: 'erd-input',
                            label: 'SMTP主机',
                            required: true,
                            col: 24
                        },
                        {
                            field: 'exchange',
                            component: 'FamBoolean',
                            label: 'exchange',
                            required: true,
                            props: {
                                type: 'select'
                            },
                            col: 24
                        }
                    ];
                },
                innerFormData: {
                    get() {
                        return JSON.parse(JSON.stringify(this.data || {}));
                    },
                    set(val) {
                        // this.$emit('update:formData', val);
                    }
                }
            },
            watch: {},
            mounted() {},
            methods: {
                submit() {
                    return new Promise((resolve, reject) => {
                        this.$refs['dynamicForm']
                            .submit()
                            .then(({ valid }) => {
                                if (valid) {
                                    let data = {};
                                    let attrRawList = this.$refs['dynamicForm'].serialize();
                                    attrRawList = attrRawList.map((item) => {
                                        if (item.attrName.includes('I18nJson')) {
                                            item.value = item?.value?.value || {};
                                        }
                                        return item;
                                    });
                                    attrRawList.forEach((item) => {
                                        data[item.attrName] = item.value;
                                    });
                                    resolve(data);
                                } else {
                                    reject(new Error('请填入正确的信息'));
                                }
                            })
                            .catch(reject);
                    });
                }
            },
            components: {}
        });
    };
});
