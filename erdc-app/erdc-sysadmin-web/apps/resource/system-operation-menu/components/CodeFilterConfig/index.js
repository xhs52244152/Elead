define([], function () {
    return function (fileId, callback) {
        callback({
            /* html */
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
                return {
                    componentList: []
                };
            },
            computed: {
                innerFormData: {
                    get() {
                        return this.data || {};
                    },
                    set(data) {
                        this.$set('update:data', data);
                    }
                },
                formConfig() {
                    return [
                        {
                            field: 'dataType',
                            label: '数据类型',
                            component: 'custom-select',
                            props: {
                                row: {
                                    componentName: 'virtual-select',
                                    requestConfig: {
                                        // 请求接口的配置对象
                                        url: 'fam/type/datatype/listData',
                                        viewProperty: 'displayName',
                                        valueProperty: 'oid'
                                    }
                                }
                            },
                            col: 24
                        }
                    ];
                }
            },
            watch: {},
            mounted() {},
            methods: {
                submit() {
                    const { dynamicForm } = this.$refs;
                    return new Promise((resolve, reject) => {
                        dynamicForm
                            .submit()
                            .then(({ valid }) => {
                                if (valid) {
                                    resolve(this.innerFormData);
                                }
                            })
                            .catch(reject);
                    });
                }
            }
        });
    };
});
