define([], function (template) {
    return function (fileId, callback) {
        callback({
            template: `
                <FamDynamicForm
                    ref="dynamicForm"
                    :form="innerFormData"
                    :data="formConfig"
                    :editable-attr="['isEmail', 'appUrl']"
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
                            field: 'isEmail',
                            component: 'erd-switch',
                            label: '是否发送邮件',
                            required: false,
                            props: {
                                'active-text': 'Y',
                                'inactive-text': 'N'
                            },
                            col: 24
                        },
                        {
                            field: 'appUrl',
                            component: 'erd-input',
                            label: '消息通知',
                            required: false,
                            col: 24
                        }
                    ];
                },
                innerFormData: {
                    get() {
                        let data = this.data;
                        if (!_.isEmpty(data)) {
                            data.isEmail = Boolean(data.isEmail);
                        }
                        return JSON.parse(
                            JSON.stringify(
                                !_.isEmpty(data)
                                    ? data
                                    : {
                                          isEmail: false,
                                          appUrl: ''
                                      }
                            )
                        );
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
                                    let attrRawList = this.$refs['dynamicForm'].serializeEditableAttr();
                                    attrRawList = attrRawList.map((item) => {
                                        if (item.attrName.includes('I18nJson')) {
                                            item.value = item?.value?.value || {};
                                        }
                                        if (item.attrName === 'isEmail') {
                                            item.value = item.value + '';
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
