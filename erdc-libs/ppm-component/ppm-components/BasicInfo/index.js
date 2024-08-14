define([
    'erdcloud.kit',
    'text!' + ELMP.resource('ppm-component/ppm-components/BasicInfo/index.html'),
    'fam:store',
    ELMP.resource('ppm-https/common-http.js')
], function (ErdcKit, template, store, commonHttp) {
    let commonBaseInfo = {
        name: 'common_base_info',
        template: template,
        props: {
            checkNameTips: {
                type: String,
                default: ''
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
            // 通用表单渲染布局表单方法
            renderLayoutForm: Function,
            // 自定义表单配置
            customFormConfig: Function,
            // 类型的typeName传参
            typeName: String,
            // 自定义渲染布局表单方法
            customRenderLayoutForm: Function,
            // 获取类型是否需要传subTypeEnum参数
            isSubTypeEnum: {
                type: Boolean,
                default: true
            },
            formSlots: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            formSlotsProps: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 在created里调用
            basicCreated: Function
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/BasicInfo/locale/index.js'),
                i18nMappingObj: {
                    code: this.getI18nByKey('code'),
                    type: this.getI18nByKey('type'),
                    pleaseSelectType: this.getI18nByKey('pleaseSelectType'),
                    name: this.getI18nByKey('name'),
                    pleaseEnterName: this.getI18nByKey('pleaseEnterName'),
                    basicInfo: this.getI18nByKey('basicInfo')
                },
                panelUnfold: true,
                formData: {},
                readonly: false,
                containerRef: '',
                isReady: false,
                editableAttr: ['identifierNo', 'typeReference'],
                vm: null
            };
        },
        watch: {
            currentData: {
                handler(val) {
                    if (this.currentType === 'edit' && val) this.formData = ErdcKit.deepClone(val);
                },
                immediate: true
            }
        },
        async created() {
            this.vm = this;
            let defaultContainerRef = store.state.app.container.oid;
            if (_.isFunction(this.getContainerRef)) {
                this.containerRef = await this.getContainerRef(this.$route);
                this.containerRef = this.containerRef === 'default' ? defaultContainerRef : this.containerRef;
            } else {
                this.containerRef = defaultContainerRef;
            }
            if (_.isFunction(this.basicCreated)) this.basicCreated(this);
            this.isReady = true;
        },
        computed: {
            className() {
                return this.typeName || this.$route.meta?.className || '';
            },
            formConfigs() {
                let params = {
                    typeName: this.className,
                    containerRef: this.containerRef,
                    subTypeEnum: this.isSubTypeEnum ? 'LEAF_NODE' : '',
                    accessControl: false
                };
                let formConfigs = [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj.code,
                        disabled: false,
                        required: false,
                        validators: [],
                        // 只读
                        readonly: true,
                        props: {},
                        col: 12
                    },
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: this.i18nMappingObj.type,
                        labelLangKey: 'component',
                        disabled: this.currentType === 'edit',
                        required: true,
                        readonly: this.currentType === 'edit',
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj.pleaseSelectType,
                            placeholderLangKey: 'pleaseSelect',
                            defaultSelectFirst: true,
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid',
                                    params: params
                                }
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.setTypeValue(data.selected);
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj.name,
                        disabled: false,
                        required: true,
                        validators: [],
                        // 只读
                        readonly: false,
                        props: {
                            maxlength: 64,
                            placeholder: this.i18nMappingObj.pleaseEnterName
                        },
                        col: 24
                    }
                ];
                return _.isFunction(this.customFormConfig) ? this.customFormConfig(this, formConfigs) : formConfigs;
            },
            checkNameTipsInfo() {
                return this.checkNameTips || this.i18nMappingObj.pleaseEnterName;
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
                                message: this.checkNameTipsInfo,
                                type: 'info',
                                showClose: true
                            });
                            return;
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
            async setTypeValue(data) {
                // 存在data数据为null的情况导致接口报错
                if (!data) return;
                if (_.isFunction(this.customRenderLayoutForm)) {
                    return this.customRenderLayoutForm(data, this.renderLayoutForm);
                }
                let { typeOid, typeName } = data || {};
                let identifierNo = await commonHttp.getCode(typeOid);
                this.$set(this.formData, 'identifierNo', identifierNo);
                this.$set(this.formData, 'typeReference', typeOid);
                _.isFunction(this.renderLayoutForm) && this.renderLayoutForm(typeName, typeOid);
                // 首次加载不调用renderLayoutForm
                // if (typeOid && this.formData.typeReference !== typeOid) {
                //     this.$set(this.formData, 'typeReference', typeOid);
                //     this.renderLayoutForm(typeName, typeOid);
                // }
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        }
    };
    return commonBaseInfo;
});
