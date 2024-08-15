define(['text!' + ELMP.resource('erdc-pdm-components/BasicInfo/index.html')], function (template) {
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        name: 'CommonBaseInfo',
        template,
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        },
        props: {
            // 容器上下文
            containerRef: String,
            // 是否只读
            readonly: Boolean,
            // 回显数据
            currentData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 类型 创建，编辑，查看
            currentType: {
                type: String,
                default: 'create'
            },
            // 渲染布局表单方法
            renderLayoutForm: Function,
            // 设置formData方法
            setFormData: Function,
            // 自定义事件
            onFieldChange: Function,
            // 类名
            className: String,
            // 表单配置
            formConfigs: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                panelUnfold: true,
                formData: {}
            };
        },
        watch: {
            currentData: {
                handler(val) {
                    if (val && this.currentType === 'edit') {
                        this.formData = ErdcKit.deepClone(val);
                    }
                },
                immediate: true
            }
        },
        computed: {
            innerClassName() {
                return this.className || this.$route.meta?.className || '';
            },
            defaultConfigs() {
                return [
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: '类型',
                        disabled: this.readonly || this.currentType === 'edit',
                        required: this.currentType === 'create',
                        readonly: this.readonly || this.currentType === 'edit',
                        props: {
                            clearable: true,
                            placeholder: '请选择类型',
                            defaultSelectFirst: true,
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid',
                                    params: {
                                        typeName: this.innerClassName,
                                        containerRef: this.containerRef
                                    }
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
            },
            innerFormConfigs() {
                return this.formConfigs.length ? this.formConfigs : this.defaultConfigs;
            }
        },
        methods: {
            innerOnFieldChange() {
                _.isFunction(this.onFieldChange) && this.onFieldChange(this.$props, ...arguments);
            },
            submit(required) {
                const { baseInfoRef = {} } = this.$refs || {};
                return new Promise((resolve, reject) => {
                    let formData = baseInfoRef.serializeEditableAttr() || {};
                    formData = formData.filter((item) => item.value !== '—');
                    if (required) {
                        baseInfoRef.submit().then((valid) => {
                            valid ? resolve(formData) : reject();
                        });
                    } else {
                        if (!this.formData.name) {
                            this.$message.info('请输入名称');
                            reject();
                        } else {
                            resolve(formData);
                        }
                    }
                });
            },
            // 清空表单数据
            emptyFormData() {
                this.formData = {};
            },
            setTypeValue(data) {
                if (data?.typeOid) {
                    this.$set(this.formData, 'typeReference', data?.typeOid || '');
                    this.renderLayoutForm(data?.typeName || '', data?.typeOid || '');
                }
            }
        }
    };
});
