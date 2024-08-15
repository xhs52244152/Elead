define(['text!' + ELMP.resource('system-customizing/components/AddClassForm/index.html')], function (template) {
    return {
        template,
        props: {
            type: {
                type: String,
                default: 'create'
            },
            modelData: {
                type: Object,
                default() {
                    return {};
                }
            },
            service: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-customizing/views/CustomEngineering/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'Confirm',
                    'Cancel',
                    'className',
                    'pleaseClassName',
                    'classNamePrefix',
                    'icon',
                    'inheritedSuperclass',
                    'selectDifferentParent',
                    'selectiveCharacteristic',
                    'versionMainClassName',
                    'versionMainDisplayName',
                    'tenantIsolationMode',
                    'noteInherit',
                    'serviceNamePlaceholder',
                    'displayName',
                    'enterName',
                    'selectiveCharacteristicTip',
                    'ContainedTip',
                    'ScalableContainerableTip'
                ]),
                formData: {
                    className: '',
                    displayName: '',
                    icon: '',
                    parentClassName: '',
                    interfaceList: [],
                    tenantPolicy: 'MANDATORY'
                },
                defaultClassName: '',
                first: true,
                interfaceList: [],
            };
        },
        watch: {
            service: {
                immediate: true,
                handler(service) {
                    if (service) {
                        this.defaultClassName = `erd.cloud.${service}.entity.`;
                    }
                }
            },
            modelData: {
                deep: true,
                immediate: true,
                handler(formData) {
                    if (formData) {
                        this.formData = formData;
                    }
                }
            }
        },
        computed: {
            specialInterfaceObj() {
                return {
                    'erd.cloud.core.container.Contained': this.i18nMappingObj['ContainedTip'],
                    'erd.cloud.core.container.ScalableContainerable': this.i18nMappingObj['ScalableContainerableTip']
                };
            },
            interfaceRow() {
                return {
                    componentName: 'constant-select',
                    viewProperty: 'displayName',
                    valueProperty: 'key',
                    referenceList: this.interfaceList,
                    clearNoData: true
                };
            },
            dataConfig() {
                return [
                    {
                        field: 'className',
                        component: 'erd-input',
                        label: this.i18nMappingObj.className,
                        required: true,
                        readonly: this.type === 'update' ? true : false,
                        validators: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    const trueValue = value.split(this.defaultClassName)[1];
                                    var reg = /[^a-zA-Z0-9_:.]/g;
                                    if (!this.first && value === this.defaultClassName) {
                                        callback(new Error(this.i18nMappingObj.pleaseClassName));
                                    } else if (trueValue.match(reg)) {
                                        callback(new Error(this.i18nMappingObj.classNamePrefix));
                                    } else if (/^\d+$/.test(trueValue)) {
                                        callback(new Error(this.i18n.numeric));
                                    }
                                    {
                                        callback();
                                    }
                                    if (this.first) {
                                        this.first = false;
                                    }
                                },
                                trigger: ['blur', 'change']
                            }
                        ],
                        tooltip: this.i18nMappingObj.classNamePrefix,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.serviceNamePlaceholder,
                            filterable: true
                        },
                        listeners: {
                            input: (data) => {
                                this.formData['className'] =
                                    data.indexOf(this.defaultClassName) === 0 || data === this.defaultClassName
                                        ? data
                                        : this.defaultClassName;
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'displayName',
                        component: 'erd-input',
                        label: this.i18nMappingObj.displayName,
                        required: true,
                        validators: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (!value) {
                                        return callback(
                                            new Error(`${this.i18n['请输入']}${this.i18nMappingObj.displayName}`)
                                        );
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: ['blur', 'change']
                            }
                        ],
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.enterName
                        },
                        listeners: {
                            input: (data) => {
                                this.$set(this.formData, 'mainDisplayName', `${data}主对象`);
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'icon',
                        component: 'FamIconSelect',
                        label: this.i18nMappingObj.icon,
                        disabled: false,
                        hidden: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: true,
                            visibleBtn: true
                        },
                        col: 24
                    },
                    {
                        field: 'parentClassName',
                        component: 'custom-select',
                        label: this.i18nMappingObj.inheritedSuperclass,
                        disabled: false,
                        hidden: false,
                        required: true,
                        readonly: false,
                        validators: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (!value) {
                                        return callback(
                                            new Error(
                                                `${this.i18n['pleaseSelect']}${this.i18nMappingObj.inheritedSuperclass}`
                                            )
                                        );
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: 'change'
                            }
                        ],
                        tooltip: this.i18nMappingObj.selectDifferentParent,
                        props: {
                            clearable: true,
                            defaultProps: {
                                disabled: 'edit'
                            },
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/common/parentList',
                                    method: 'post',
                                    viewProperty: 'displayName',
                                    valueProperty: 'key'
                                }
                            },
                            filterable: true
                        },
                        listeners: {
                            change: (data) => {
                                if (data?.includes('ItemRevision')) {
                                    this.$set(this.formData, 'mainName', `${this.defaultClassName}Master`);
                                }
                                this.fetchInterfaceList(data);
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'interfaceList',
                        component: 'slot',
                        label: this.i18nMappingObj.selectiveCharacteristic,
                        disabled: false,
                        hidden: false,
                        required: true,
                        readonly: false,
                        validators: [
                            {
                                validator: (rule, value, callback) => {
                                    if (_.isEmpty(value)) {
                                        callback(new Error(this.i18nMappingObj.selectiveCharacteristicTip));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            name: 'interface-list'
                        },
                        col: 24
                    },
                    {
                        field: 'mainName',
                        component: 'erd-input',
                        label: this.i18nMappingObj.versionMainClassName,
                        disabled: false,
                        hidden: true,
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: true
                        },
                        col: 24
                    },
                    {
                        field: 'mainDisplayName',
                        component: 'erd-input',
                        label: this.i18nMappingObj.versionMainDisplayName,
                        disabled: false,
                        hidden: true,
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: true
                        },
                        col: 24
                    },
                    {
                        field: 'tenantPolicy',
                        component: 'custom-select',
                        label: this.i18nMappingObj.tenantIsolationMode,
                        disabled: false,
                        hidden: false,
                        required: true,
                        readonly: false,
                        props: {
                            clearable: true,
                            row: {
                                componentName: 'virtual-select',
                                viewProperty: 'value',
                                valueProperty: 'name',
                                requestConfig: {
                                    url: '/platform/enumDataList',
                                    method: 'post',
                                    params: {
                                        realType: 'erd.cloud.core.enums.TenantPolicy'
                                    }
                                }
                            },
                            filterable: true
                        },
                        col: 24
                    }
                ];
            },
            schemaMapper() {
                const formData = this.formData;
                return {
                    mainName: function (schema) {
                        schema.hidden = true;
                        if (formData?.parentClassName?.includes('ItemRevision')) {
                            schema.hidden = false;
                        }
                    },
                    mainDisplayName: function (schema) {
                        schema.hidden = true;
                        if (formData?.parentClassName?.includes('ItemRevision')) {
                            schema.hidden = false;
                        }
                    }
                };
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                if (!this.formData.className) {
                    this.$set(this.formData, 'className', this.defaultClassName);
                }
                this.getInterfaceList();
            },
            submit() {
                const { dynamicForm } = this.$refs;

                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                resolve(this.formData);
                            } else {
                                reject();
                            }
                        })
                        .catch(reject);
                });
            },
            getInterfaceList() {
                this.$famHttp({
                    url: '/fam/common/interfaceList',
                    method: 'POST'
                }).then(({ data = [] }) => {
                    this.interfaceList = data;
                });
            },
            fetchInterfaceList: _.debounce(function (pName) {
                this.$famHttp({
                    url: 'fam/common/findParentClassInterfaceSet',
                    params: {
                        pName
                    }
                }).then(({ data = [] }) => {
                    this.formData.interfaceList = data.filter((key) => {
                        return !!this.interfaceList.find((item) => item.key === key);
                    });
                    this.interfaceList = this.interfaceList.map((item) => {
                        return {
                            ...item,
                            disabled: data.includes(item.key)
                        };
                    });
                });
            }, 100)
        }
    };
});
