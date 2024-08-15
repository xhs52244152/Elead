define([
    'text!' + ELMP.resource('erdc-type-components/PropertyDefineDetail/index.html'),
    'erdc-kit',
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('erdc-type-components/PropertyDefineDetail/style.css')
], function (template, utils, fieldTypeMapping) {
    const famHttp = require('fam:http');
    const ErdcKit = require('erdcloud.kit');
    const store = require('fam:store');

    return {
        mixins: [fieldTypeMapping],
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/PropertyDefineDetail/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    edit: this.getI18nByKey('编辑'),
                    moreActions: this.getI18nByKey('更多操作'),
                    delete: this.getI18nByKey('删除'),
                    export: this.getI18nByKey('导出数据'),
                    basicInformation: this.getI18nByKey('基本信息'),
                    basicConfiguration: this.getI18nByKey('editFeatureAttr'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),

                    internalName: this.getI18nByKey('内部名称'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    showName: this.getI18nByKey('显示名称'),
                    peaseSelect: this.getI18nByKey('请选择'),
                    dataType: this.getI18nByKey('数据类型'),
                    realType: this.getI18nByKey('属性类型'),
                    componentType: this.getI18nByKey('组件类型'),
                    // 'objectBelong': this.getI18nByKey('属性所属对象'),
                    belongClass: this.getI18nByKey('所属类'),
                    // 'belongsBusiness': this.getI18nByKey('所属业务对象'),
                    privateModel: this.getI18nByKey('私有模型'),
                    whetherInherited: this.getI18nByKey('是否可继承'),
                    length: this.getI18nByKey('值长度'),
                    readOnly: this.getI18nByKey('是否只读'),
                    hidden: this.getI18nByKey('是否隐藏'),
                    required: this.getI18nByKey('是否必填'),
                    modifiedit: this.getI18nByKey('是否覆盖'),
                    sort: this.getI18nByKey('排序'),
                    max: this.getI18nByKey('最大值'),
                    min: this.getI18nByKey('最小值'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirmDeleteProperty: this.getI18nByKey('是否要删除该特性属性'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    dataKey: this.getI18nByKey('值选项')
                },
                formData: {
                    name: '', // 内部名称
                    nameI18nJson: {
                        // 显示名称
                        attrName: 'nameI18nJson'
                    },
                    dataTypeRef: '', // 数据类型
                    classNameKey: '', // 所属对象
                    privateClassName: '', // 所属业务对象 / 私有模型
                    sortOrder: '', // 排序
                    overridable: false, // 继承过能否修改
                    isExtends: true, // 是否可继承

                    componentRef: '', // 组件
                    maxLength: '', // 属性值长度
                    maxValue: '', // 最大值
                    minValue: '', // 最小值
                    isReadonly: false, // 是否只读
                    isHidden: false, // 是否隐藏
                    isRequired: false, // 是否必填
                    dataKey: '', // 值选项
                    realType: '' // 属性类型
                },
                componentRefName: '',
                title: '',
                basicInforConfigVisible: false,
                detailData: {},
                oid: '',
                unfold: true,
                appName: ''
            };
        },
        watch: {},
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            data() {
                let formItem = [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        labelLangKey: 'internalName',
                        disabled: true,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['showName'],
                        labelLangKey: 'showName',
                        disabled: true,
                        required: false,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect',
                            type: 'basics'
                        },
                        col: 12
                    },
                    {
                        field: 'realType',
                        component: 'erd-input',
                        label: this.i18nMappingObj['realType'],
                        labelLangKey: 'realType',
                        disabled: true,
                        required: false,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12
                    },
                    {
                        field: 'componentRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj['componentType'],
                        labelLangKey: 'componentType',
                        disabled: true,
                        required: false,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/type/component/listData',
                                    viewProperty: 'displayName',
                                    valueProperty: 'oid'
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'classNameKey',
                        component: 'erd-input',
                        label: this.i18nMappingObj['belongClass'],
                        labelLangKey: 'belongClass',
                        disabled: true,
                        required: false,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findNotAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeName',
                                    params: {
                                        params: {
                                            isHardType: true
                                        }
                                    }
                                }
                            }
                        },
                        col: 12,
                        slots: {}
                    },
                    {
                        field: 'privateClassName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['privateModel'],
                        labelLangKey: 'privateModel',
                        disabled: true,
                        required: false,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findNotAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeName',
                                    params: {
                                        params: {
                                            isHardType: false
                                        }
                                    }
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'dataTypeRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataType'],
                        labelLangKey: 'dataType',
                        disabled: true,
                        required: false,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/fam/type/datatype/listData',
                                    viewProperty: 'displayName',
                                    valueProperty: 'oid'
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'isExtends',
                        component: 'erd-radio',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['whetherInherited'],
                        labelLangKey: 'whetherInherited',
                        disabled: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12
                    },
                    {
                        field: 'maxLength',
                        component: 'erd-input',
                        label: this.i18nMappingObj['length'],
                        labelLangKey: 'length',
                        disabled: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'isReadonly',
                        component: 'erd-radio',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['readOnly'],
                        labelLangKey: 'readOnly',
                        disabled: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12,
                        slots: {
                            // component: 'readOnlyComponent',
                            // readonly: 'readOnlyComponent'
                        }
                    },
                    {
                        field: 'isHidden',
                        component: 'erd-radio',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['hidden'],
                        labelLangKey: 'hidden',
                        disabled: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12
                    },
                    {
                        field: 'isRequired',
                        component: 'erd-radio',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['required'],
                        labelLangKey: 'required',
                        disabled: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12
                    },
                    {
                        field: 'overridable',
                        component: 'erd-radio',
                        readonlyComponent: 'FamBooleanStaticText',
                        label: this.i18nMappingObj['modifiedit'],
                        labelLangKey: 'modifiedit',
                        disabled: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['peaseSelect'],
                            placeholderLangKey: 'peaseSelect'
                        },
                        col: 12
                    },
                    {
                        field: 'sortOrder',
                        component: 'erd-input',
                        label: this.i18nMappingObj['sort'],
                        labelLangKey: 'sort',
                        disabled: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'maxValue',
                        component: 'erd-input',
                        label: this.i18nMappingObj['max'],
                        labelLangKey: 'max',
                        disabled: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'minValue',
                        component: 'erd-input',
                        label: this.i18nMappingObj['min'],
                        labelLangKey: 'min',
                        disabled: true,
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    }
                ];
                return _.compact([...formItem, this.dataKeyConfig(ErdcKit.pascalize(this.componentRefName))]);
            }
        },
        mounted() {},
        methods: {
            dataKeyConfig(component) {
                const components = {
                    FamDict: {
                        // 数据字典组件时，值选项显示内容
                        field: 'dataKey',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataKey'],
                        // label: '值选项',
                        labelLangKey: 'dataKey',
                        disabled: false,
                        // hidden: this.componentRefName == 'fam-dict' ? false : true,
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
                    },
                    CustomVirtualEnumSelect: {
                        // 枚举组件时，值选项显示内容
                        field: 'dataKey',
                        component: 'custom-select',
                        label: this.i18nMappingObj['dataKey'],
                        // label: '值选项',
                        labelLangKey: 'dataKey',
                        disabled: false,
                        // hidden: this.componentRefName == 'custom-virtual-enum-select' ? false : true,
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
                    },
                    CustomVirtualSelect: {
                        // 其他组件值选项显示
                        field: 'dataKey',
                        component: 'erd-input',
                        label: this.i18nMappingObj['dataKey'],
                        // label: '值选项',
                        labelLangKey: 'dataKey',
                        disabled: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    }
                };
                return components[component];
            },
            fetchTypeDefById(data) {
                this.oid = data.oid;
                const paramsData = {
                    oid: data.oid
                };
                this.$famHttp({
                    url: '/fam/type/property/detail',
                    data: paramsData,
                    method: 'get'
                }).then((resp) => {
                    const formData = resp.data || {};
                    this.title = formData?.displayName || '';
                    this.appName = formData?.appName || '';
                    this.componentRefName = formData.constraintDefinitionDto?.componentName || '';
                    this.formData = this.getFormData(formData);
                });
            },
            // 不适用
            getFormData(data) {
                let newData = data.constraintDefinitionDto || {};
                const i18nAttrs = ['nameI18nJson'];
                const i18nMap = {
                    nameI18nJson: '显示名称'
                };
                i18nAttrs.forEach((item) => {
                    let obj = {};
                    if (data[item]) {
                        obj = {
                            attr: item,
                            attrName: i18nMap[item],
                            value: {
                                ...data[item]
                            }
                        };
                        data[item] = obj;
                    }
                });
                if (data.sortOrder) {
                    data.sortOrder = data.sortOrder.toString();
                }
                let formData = { ...data, ...newData };
                let formDataKeys = [];

                _.keys(formData).forEach((item) => {
                    formDataKeys.push(item);
                    if (_.isNumber(formData[item])) {
                        formData[item] = formData[item].toString();
                    }
                });
                return formData;
            },
            onCreate() {},
            onExport() {},
            onCheck(item) {},
            // 编辑
            onEdit() {
                this.basicInforConfigVisible = true;
            },
            onCommand(val) {
                if (val == 'delete') {
                    this.onDelete();
                }
                if (val == 'export') {
                    this.onExport();
                }
            },
            // 删除
            onDelete() {
                this.$confirm(this.i18nMappingObj['confirmDeleteProperty'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    const data = {
                        oid: this.oid
                    };
                    this.$famHttp({
                        url: '/fam/delete',
                        params: data,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            message: this.i18nMappingObj['successfullyDelete'],
                            type: 'success',
                            showClose: true
                        });
                        this.$emit('refresh-tree');
                        this.$emit('onsubmit', '删除数据成功');
                    });
                });
            },
            // 编辑完成之后的回调
            onSubmit(oid) {
                this.fetchTypeDefById({ oid });
                this.$emit('refresh-tree', oid);
            }
        },
        components: {
            BasicInforConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/BasicInforConfig/index.js')) // 类型基本信息配置
        }
    };
});
