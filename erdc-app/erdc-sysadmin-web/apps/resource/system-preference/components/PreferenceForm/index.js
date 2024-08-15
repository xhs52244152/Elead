define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-preference/components/PreferenceForm/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    ELMP.resource('erdc-app/components/properties/ComponentPropertyExtends.js')
], function (ErdcKit, template, fieldTypeMapping, ComponentPropertyExtends) {
    const store = require('fam:store');
    return {
        template,
        extends: ComponentPropertyExtends,
        props: {
            // oid
            oid: {
                type: String,
                default: ''
            },
            // appName
            appName: {
                type: String,
                default: ''
            },
            // 创建/编辑  create|update
            type: {
                type: String,
                default: 'create'
            },
            // 配置项|配置组  GROUP|ITEM
            configType: {
                type: String,
                default: 'GROUP'
            },
            // 表单数据
            formData: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: Boolean,
            isActivate: Boolean
        },
        mixins: [fieldTypeMapping],
        components: {},
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-preference/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    pleaseEnter: this.getI18nByKey('pleaseEnter'),
                    pleaseEnterNumber: this.getI18nByKey('pleaseEnterNumber'),
                    pleaseEnterNumberValidator: this.getI18nByKey('pleaseEnterNumberValidator'),
                    pleaseEnterDescription: this.getI18nByKey('pleaseEnterDescription'),
                    pleaseSelect: this.getI18nByKey('pleaseSelect'),
                    pleaseSelectAppName: this.getI18nByKey('pleaseSelectAppName'),
                    pleaseSelectStatus: this.getI18nByKey('pleaseSelectStatus'),
                    dataKey: this.getI18nByKey('dataKey'),
                    componentType: this.getI18nByKey('componentType'),
                    fileAttachmentControl: this.getI18nByKey('fileAttachmentControl'),
                    description: this.getI18nByKey('description'),
                    locked: this.getI18nByKey('locked'),
                    realType: this.getI18nByKey('realType'),
                    name: this.getI18nByKey('name'),
                    number: this.getI18nByKey('number'),
                    appName: this.getI18nByKey('appName'),
                    status: this.getI18nByKey('status'),
                    draft: this.getI18nByKey('draft'),
                    enable: this.getI18nByKey('enable'),
                    disable: this.getI18nByKey('disable'),
                    pleaseUploadAttachments: this.getI18nByKey('pleaseUploadAttachments')
                },
                componentList: [],
                peferencesList: [],
                requestHeader: {},
                deleteFileId: [],
                innerFormData: {},
                isRealTypeChange: false,
                componentConfigUnfold: true,
                constraintDefinitionDto: {},
                componentJson: {}
            };
        },
        watch: {
            'formData': {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (nv) {
                        _.keys(nv).forEach((key) => {
                            this.$set(this.innerFormData, key, nv[key]);
                        });
                    }
                }
            },
            'innerFormData.realType': {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.findComponent(nv);
                    }
                }
            },
            'componentRefName'(newVal, oldVal) {
                const widget = this.getWidgetByKey(newVal) || {};
                if (!this.formData?.componentJson) {
                    this.componentJson = {};
                    this.componentJson = {
                        props: widget.schema?.props || {
                            row: {}
                        }
                    };
                } else if (oldVal && oldVal !== newVal) {
                    this.componentJson = {};
                    this.$set(this.formData, 'componentJson', '');
                    this.componentJson = {
                        props: widget.schema?.props || {
                            row: {}
                        }
                    };
                }
            },
            'formData.componentJson': {
                deep: true,
                immediate: true,
                handler(componentJson) {
                    let newComponentJson = componentJson;
                    try {
                        newComponentJson = JSON.parse(componentJson);
                    } catch (error) {
                        newComponentJson = {};
                    }
                    this.componentJson = Object.assign({}, this.componentProps, newComponentJson);
                }
            }
        },
        computed: {
            // innerFormData: {
            //     get() {
            //         const jsonData = JSON.parse(JSON.stringify(this.formData));
            //         return jsonData;
            //     },
            //     set(val) {

            //     }
            // },
            properties() {
                const componentJson = this.formData.componentRef
                    ? this.componentList.find((item) => {
                          return item.oid === this.formData.componentRef;
                      })
                    : {};
                const properties = this.getPropertiesByComponentName(componentJson?.name || '') || [];
                return properties.filter((prop) => {
                    if (typeof prop.isHidden === 'function') {
                        return !prop.isHidden({
                            type: 'TypeAttrConfig',
                            widget: this.componentJson
                        });
                    }
                    return !prop.isHidden;
                });
            },
            appList: function () {
                return store.state.app.appNames || [];
            },
            componentRefName: {
                get() {
                    let componentRefName = '';
                    this.componentList.forEach((item) => {
                        if (item.oid === this.formData.componentRef) {
                            componentRefName = item.name;
                        }
                    });
                    return componentRefName;
                },
                set() {}
            },
            // 值选项
            dataKeyFormConfig() {
                if (ErdcKit.isComponentNameIncludes(['custom-virtual-select'], this.componentRefName)) {
                    return {
                        field: 'dataKey',
                        component: 'erd-input',
                        label: this.i18nMappingObj['dataKey'],
                        labelLangKey: 'dataKey',
                        disabled: false,
                        required: true,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    };
                }
                if (ErdcKit.isComponentNameIncludes(['fam-dict'], this.componentRefName)) {
                    return {
                        // 数据字典组件时，值选项显示内容
                        field: 'dataKey',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataKey'],
                        labelLangKey: 'dataKey',
                        disabled: false,
                        required: true,
                        props: {
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/dictionary/item/list',
                                    viewProperty: 'displayName',
                                    valueProperty: 'identifierNo',
                                    data: {
                                        appName: this.appName
                                    }
                                }
                            }
                        },
                        col: 12
                    };
                }
                if (ErdcKit.isComponentNameIncludes(['custom-virtual-enum-select'], this.componentRefName)) {
                    return {
                        // 枚举组件时，值选项显示内容
                        field: 'dataKey',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataKey'],
                        labelLangKey: 'dataKey',
                        disabled: false,
                        required: true,
                        props: {
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/component/enumDataList',
                                    viewProperty: 'targetClass',
                                    valueProperty: 'targetClass'
                                }
                            }
                        },
                        col: 12
                    };
                }
                return null;
            },
            // 组件类型
            itemComponent() {
                let itemComponent = [];
                if (this.innerFormData.realType && this.innerFormData.realType !== 'object') {
                    itemComponent = _.compact([
                        {
                            field: 'componentRef',
                            component: 'custom-select',
                            label: this.i18nMappingObj['componentType'],
                            disabled: false,
                            required: true,
                            readonly: this.isActivate,
                            validators: [],
                            hidden: false,
                            props: {
                                clearable: false,
                                // placeholder: '请选择',
                                row: {
                                    componentName: 'constant-select',
                                    clearNoData: true,
                                    viewProperty: 'displayName', // 显示的label的key
                                    valueProperty: 'oid', // 显示value的key
                                    referenceList: this.componentList
                                }
                            },
                            listeners: {
                                callback: (data) => {
                                    if (!ErdcKit.isSameComponentName(this.componentRefName, data?.selected?.name)) {
                                        this.componentRefName = data?.selected?.name || '';
                                        this.formData.dataKey = '';
                                    }
                                }
                            },
                            col: 12
                        },
                        this.dataKeyFormConfig
                    ]);
                } else if (this.innerFormData.realType && this.innerFormData.realType === 'object') {
                    itemComponent = [
                        {
                            field: 'configFileIds',
                            component: 'fam-upload',
                            label: this.i18nMappingObj['fileAttachmentControl'],
                            disabled: false,
                            readonly: this.isActivate,
                            required: true,
                            validators: [
                                {
                                    trigger: ['blur'],
                                    validator: (rule, value, callback) => {
                                        if (_.isEmpty(value)) {
                                            // callback(new Error('请选择定时类型'))
                                            callback(new Error(this.i18nMappingObj['pleaseUploadAttachments']));
                                        } else {
                                            callback();
                                        }
                                    }
                                }
                            ],
                            hidden: false,
                            props: {
                                'accept': '.js',
                                'fileListType': 'none',
                                'btnConfig': {
                                    disabled: false
                                },
                                'multiple': true,
                                'before-remove': (file, fileList) => {
                                    return this.$confirm('是否删除附件', '是否删除', {
                                        confirmButtonText: this.i18nMappingObj['confirm'],
                                        cancelButtonText: this.i18nMappingObj['cancel'],
                                        type: 'warning'
                                    }).then(() => {
                                        this.$emit('delete-file', file, fileList);
                                    });
                                }
                            },
                            col: 12
                        }
                    ];
                }
                return itemComponent;
            },
            formConfig() {
                const descriptionI18nJsonForm = [
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['description'],
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnterDescription'],
                            type: 'textarea'
                        },
                        col: 24
                    }
                ];
                let itemForm = [
                    {
                        field: 'locked',
                        component: 'fam-boolean',
                        label: this.i18nMappingObj['locked'],
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            type: 'basic'
                        },
                        col: 12
                    },
                    {
                        field: 'realType',
                        component: 'custom-select',
                        label: this.i18nMappingObj['realType'],
                        disabled: false,
                        hidden: false,
                        required: true,
                        readonly: this.isActivate,
                        validators: [],
                        props: {
                            clearable: false,
                            row: {
                                componentName: 'constant-select',
                                clearNoData: true,
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'name', // 显示value的key
                                referenceList: this.peferencesList
                            }
                        },
                        listeners: {
                            callback: async () => {
                                this.isRealTypeChange = true;
                            }
                        },
                        col: 12
                    }
                ];
                let formData = [
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['name'],
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnterName'],
                            max: 100
                        },
                        col: 12
                    },
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj['number'],
                        disabled: this.type === 'update',
                        readonly: this.type === 'update',
                        hidden: false,
                        required: true,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (!value) {
                                        callback(new Error(this.i18nMappingObj['pleaseEnterNumber']));
                                    } else if (value.match(/[^a-zA-Z0-9_.\- ]/gi)) {
                                        callback(new Error(this.i18nMappingObj['pleaseEnterNumberValidator']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnterNumber']
                        },
                        col: 12
                    },
                    {
                        field: 'appName',
                        component: 'custom-select',
                        label: this.i18nMappingObj['appName'],
                        disabled: !!this.appName,
                        readonly: !!this.appName,
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseSelectAppName'],
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'identifierNo', // 显示value的key
                                referenceList: this.appList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'status',
                        component: 'custom-select',
                        label: this.i18nMappingObj['status'],
                        disabled: false,
                        hidden: this.configType === 'GROUP',
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseSelectStatus'],
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'lebel', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.referenceList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        col: 12
                    }
                ];

                if (this.configType === 'GROUP') {
                    formData = [...formData, ...descriptionI18nJsonForm];
                } else {
                    formData = [...formData, ...itemForm, ...this.itemComponent, ...descriptionI18nJsonForm];
                }
                return formData;
            },
            referenceList() {
                return this.isActivate
                    ? [
                          {
                              value: '1',
                              lebel: this.i18nMappingObj['enable']
                          },
                          {
                              value: '2',
                              lebel: this.i18nMappingObj['disable']
                          }
                      ]
                    : [
                          {
                              value: '0',
                              lebel: this.i18nMappingObj['draft']
                          },
                          {
                              value: '1',
                              lebel: this.i18nMappingObj['enable']
                          },
                          {
                              value: '2',
                              lebel: this.i18nMappingObj['disable']
                          }
                      ];
            }
        },
        created() {
            this.requestHeader.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
        },
        mounted() {
            if (this.type === 'create') {
                this.getPeferences();
            }
        },
        methods: {
            formChange(isChanged) {
                this.$emit('form-change', isChanged);
            },
            submit() {
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                let attrRawList = dynamicForm.serializeEditableAttr();
                                attrRawList = attrRawList.map((item) => {
                                    if (item.attrName.includes('I18nJson')) {
                                        item.value = item?.value?.value || {};
                                    }
                                    if (item.attrName === 'status') {
                                        item.value = Number(item.value);
                                    }
                                    return item;
                                });
                                attrRawList.push({
                                    attrName: 'componentJson',
                                    value: _.isObject(this.componentJson)
                                        ? JSON.stringify(this.componentJson)
                                        : this.componentJson
                                });
                                resolve(attrRawList);
                            } else {
                                reject(new Error('请填入正确的部门信息'));
                            }
                        })
                        .catch(reject);
                });
            },
            async findComponent(data) {
                const newRealType = (await this.getPeferences())?.find((item) => item.name === data);
                if (newRealType?.oid) {
                    this.getComponent(newRealType.oid);
                }
            },
            // 获取组件下拉列表数据，防止多次请求数据
            getComponent(oid) {
                this.$famHttp({
                    url: '/fam/type/datatype/findLinkedComponentList',
                    data: {
                        oid
                    }
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.componentList = data;
                        // 默认选中第一个
                        if (this.isRealTypeChange) {
                            this.formData.componentRef = data?.[0]?.oid || '';
                        }
                        data.forEach((item) => {
                            if (item.oid === this.formData.componentRef) {
                                this.componentRefName = item.name;
                            }
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            // 获取数据类型下拉组件值,防止多次请求数据
            getPeferences() {
                return new Promise((resolve, reject) => {
                    if (_.isEmpty(this.peferencesList)) {
                        this.$famHttp({
                            url: '/fam/peferences/listData'
                        })
                            .then((resp) => {
                                const { data } = resp;
                                this.peferencesList = data;
                                resolve(data);
                            })
                            .catch(reject);
                    } else {
                        resolve(this.peferencesList);
                    }
                });
            },
            //
            handleChange(file) {
                if (file.response) {
                    if (file.response.success) {
                        this.$set(this.innerFormData, 'eSignature', file.response?.data || '');
                    } else {
                        this.$message({
                            type: 'error',
                            message: file?.response?.message || file?.response || file,
                            showClose: true
                        });
                    }
                }
            }
        }
    };
});
