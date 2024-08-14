define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-task/components/EditBasicInfo/index.html'),
    ELMP.resource('ppm-store/index.js')
], function (ErdcKit, template, store) {
    let commonBaseInfo = {
        name: 'common_base_info',
        template: template,
        props: {
            currentData: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                panelUnfold: true,
                formData: {},
                readonly: false,
                templateArr: [],
                editableAttr: ['identifierNo'],
                i18nLocalePath: ELMP.resource('project-task/locale/index.js'),
                i18nMappingObj: {
                    basicInfo: this.getI18nByKey('basicInfo'),
                    code: this.getI18nByKey('code'),
                    type: this.getI18nByKey('type'),
                    pleaseSelectType: this.getI18nByKey('pleaseSelectType'),
                    name: this.getI18nByKey('name')
                },
                typeReferenceOpts: []
            };
        },
        watch: {
            currentData: {
                handler(newVal) {
                    this.formData = newVal;
                },
                immediate: true
            }
        },
        computed: {
            className() {
                return store.state.classNameMapping.task;
            },
            containerRef() {
                return `OR:${store.state.projectInfo.containerRef.key}:${store.state.projectInfo.containerRef.id}`;
            },
            formConfigs() {
                return [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj.code,
                        disabled: false,
                        required: false,
                        validators: [],
                        hidden: false,
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
                        disabled: true,
                        required: true,
                        validators: [],
                        readonly: true,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj.pleaseSelectType,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid',
                                    params: {
                                        typeName: this.className,
                                        containerRef: this.containerRef,
                                        accessControl: false
                                    },
                                    transformResponse: [
                                        (data) => {
                                            const res = JSON.parse(data).data || [];
                                            this.typeReferenceOpts = res;
                                            return JSON.parse(data);
                                        }
                                    ]
                                }
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.formData.typeReference = data.selected.value;
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
                            maxlength: 64
                        },
                        col: 24
                    }
                ];
            }
        },
        created() {},
        methods: {
            submit() {
                const { form } = this.$refs;
                return new Promise((resolve, reject) => {
                    this.$refs.form.submit().then((valid) => {
                        if (valid) {
                            let formData = form.serializeEditableAttr();
                            resolve(formData);
                        } else {
                            reject(false);
                        }
                    });
                });
            },
            getType(typeId) {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/type/typeDefinition/findAccessTypes',
                        params: {
                            typeName: this.className,
                            containerRef: this.containerRef,
                            accessControl: false
                        },
                        appName: 'PPM'
                    }).then((res) => {
                        if (res.code === '200') {
                            let arr = res.data;
                            const currentTypeName = arr.filter((item) => item.typeOid === typeId)[0]?.typeName || '';
                            resolve(currentTypeName);
                        }
                    });
                });
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        }
    };
    return commonBaseInfo;
});
