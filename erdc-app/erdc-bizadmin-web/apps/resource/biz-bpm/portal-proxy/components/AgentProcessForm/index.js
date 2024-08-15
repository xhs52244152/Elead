define(['text!' + ELMP.resource('biz-bpm/portal-proxy/components/AgentProcessForm/index.html')], (template) => {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'AgentProcessForm',
        template,
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            AgentProcessConfiguration: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-proxy/components/AgentProcessConfiguration/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            type: {
                type: String,
                default: 'create'
            },
            formData: {
                type: Object,
                default: () => {
                    return null;
                }
            },
            oid: String,
            defaultSelect: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            defaultUserValue: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                className: this.$store.getters.className('workProxy'),
                isShowAgentProcess: false,
                agentProcessSchema: {},
                // 自定义选人范围url
                queryParams: {
                    url: '/bpm/workitem/users',
                    method: 'GET',
                    data: {
                        optType: 'proxy'
                    }
                }
            };
        },
        computed: {
            formId() {
                return this.type === 'create' ? 'CREATE' : this.type === 'update' ? 'UPDATE' : 'DETAIL';
            },
            innerFormData: {
                get() {
                    return this.formData || {};
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            isAllProxy() {
                let isAllProxy =
                    typeof this.formData?.proxyType === 'object'
                        ? this.formData?.proxyType?.value
                        : this.formData?.proxyType;
                return isAllProxy === 'ALL_AGENT';
            },
            schemaMapper() {
                const isAllProxy = this.isAllProxy;
                return {
                    proxyCategory: function (schema, { widget, updateSchema }) {
                        schema.hidden = isAllProxy;
                    }
                };
            },
            containerRef() {
                return this.$store.state.app.container.oid;
            }
        },
        methods: {
            onChange(scope, value) {
                !value && scope.data[scope.formConfig.field] && (scope.data[scope.formConfig.field] = '');
            },
            submit() {
                const { editForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    editForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                let attrRawList = editForm.serializeEditableAttr() || [];
                                const selectData =
                                    this.$refs?.agentProcessConfiguration?.getSetResult()?.selectData || [];
                                // 初始数据源
                                const defaultSelectArr = this.defaultSelect.map((item) => item.masterRef);
                                // 最终数据源
                                const selectDataOids = selectData.map((item) => item.masterRef);
                                // 删除的数据源
                                const delSelectData = defaultSelectArr.filter((item) => !selectDataOids.includes(item));

                                let relationList = [];

                                if (this.isAllProxy) {
                                    resolve({ attrRawList, relationList });
                                    return;
                                }
                                selectData.forEach((item) => {
                                    let obj = {};
                                    if (!defaultSelectArr.includes(item.masterRef)) {
                                        obj = {
                                            action: 'CREATE',
                                            className: this.$store.getters.className('workProxyLink'),
                                            attrRawList: [
                                                {
                                                    attrName: 'roleBObjectRef',
                                                    value: item.masterRef
                                                }
                                            ]
                                        };
                                        relationList.push(obj);
                                    }
                                });
                                this.defaultSelect.forEach((item) => {
                                    if (delSelectData.includes(item.masterRef)) {
                                        relationList.push({
                                            action: 'DELETE',
                                            className: this.$store.getters.className('workProxyLink'),
                                            attrRawList: [
                                                {
                                                    attrName: 'roleBObjectRef',
                                                    value: item.masterRef
                                                }
                                            ],
                                            oid: item.oid
                                        });
                                    }
                                });

                                resolve({ attrRawList, relationList });
                            } else {
                                reject(new Error('请填入正确的部门信息'));
                            }
                        })
                        .catch(reject);
                });
            }
        }
    };
});
