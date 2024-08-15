define([
    'erdcloud.kit',
    'text!' + ELMP.resource('common-page/components/BasicInfo/index.html'),
    'fam:store',
    'css!' + ELMP.resource('common-page/components/BasicInfo/style.css')
], function (ErdcKit, template, store) {
    return {
        template: template,
        props: {
            checkNameTips: {
                type: String,
                default: '请输入名称'
            },
            currentData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            currentType: {
                type: String,
                default: 'create'
            },
            getContainerRef: {
                type: Function,
                default: null
            },
            formType: {
                type: String,
                default: ''
            },
            vm: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 渲染布局表单方法
            renderLayoutForm: Function,
            className: String
        },
        data() {
            return {
                panelUnfold: true,
                formData: {},
                readonly: false,
                containerRef: '',
                isReady: false,
                typeObj: {}
            };
        },
        watch: {
            currentData: {
                handler(val) {
                    if (this.currentType === 'edit' && val) {
                        const formData = ErdcKit.deepClone(val);
                        delete formData.typeReference;
                        Object.assign(this.formData, formData);
                    }
                },
                immediate: true
            }
        },
        async created() {
            let defaultContainerRef = store.state.app.container.oid;
            if (_.isFunction(this.getContainerRef)) {
                this.containerRef = await this.getContainerRef(this.$route);
                this.containerRef = this.containerRef === 'default' ? defaultContainerRef : this.containerRef;
            } else {
                this.containerRef = defaultContainerRef;
            }

            this.isReady = true;
        },
        computed: {
            formConfigs() {
                return [
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: '类型',
                        labelLangKey: 'component',
                        disabled: this.currentType === 'edit',
                        required: false,
                        readonly: this.currentType === 'edit',
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: '请选择类型',
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    data: {
                                        typeName: this.$store.getters.className(this.className),
                                        containerRef: this.containerRef || this.$store?.state?.app?.container?.oid || ''
                                    },
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid'
                                }
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.setTypeValue(data.selected);
                            }
                        },
                        col: 24
                    }
                ];
            }
        },
        methods: {
            submit(check) {
                const { form } = this.$refs;
                return new Promise((resolve, reject) => {
                    let formData = form.serializeEditableAttr();
                    formData = formData.filter((item) => item.value !== '—');
                    if (!check) {
                        if (!this.formData.name) {
                            this.$message({
                                message: this.checkNameTips,
                                type: 'info',
                                showClose: true
                            });
                        } else {
                            resolve(formData);
                        }
                    } else {
                        form.submit().then((valid) => {
                            if (valid) {
                                resolve(formData);
                            } else {
                                reject(false);
                            }
                        });
                    }
                });
            },
            // 清空表单数据
            emptyFormData() {
                this.formData = {};
            },
            setTypeValue(data) {
                if (data && data.typeOid) {
                    this.$set(this.formData, 'typeReference', data.typeOid);
                    this.renderLayoutForm(data.typeName, data.typeOid, data.appName, data.classifyCode);
                    if (this.formType === 'CREATE') {
                        this.typeObj = data;
                        this.$emit('set-layout-extra-params', this.formData.typeReference);
                    }
                }
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        }
    };
});
