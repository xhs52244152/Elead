define([
    'text!' + ELMP.resource('system-viewtable/components/ViewTableForm/template.html'),
    'erdcloud.kit',
    'fam:store',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const store = require('fam:store');
    const _ = require('underscore');

    return {
        template,
        components: {
            FiltersConfig: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamViewTable/ViewForm/components/FiltersConfig/index.js')
            )
        },
        props: {
            oid: String,
            type: Object,
            defaultValue: {
                default() {
                    return {};
                }
            },
            editable: {
                type: Boolean,
                default: false
            },
            readonly: {
                type: Boolean,
                default() {
                    return false;
                }
            }
        },
        data() {
            return {
                isLoading: true,
                form: {
                    tableKey: '',
                    autoRecord: true,
                    enabledFilter: true,
                    enabledCreate: true,
                    enabledModify: true,
                    mainModelType: '',
                    viewConfigItems: [
                        'number',
                        'selectionBox',
                        'operate',
                        'icon',
                        'config',
                        'refresh',
                        'advancedSearch',
                        'classifySearch',
                        'hasView'
                    ],
                    modelTypes: []
                },
                mainClassifyEnable: false,
                testRadio: {},
                leaders: [],
                isChanged: false,
                types: [],
                mainTypes: [],

                // 默认不可选
                disabledPersonView: true,

                // 如果为true，则需要显示已知条件选择
                isRelationLink: false,

                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-viewtable/locale/index.js'),

                // 国际化页面引用对象
                i18nMappingObj: {
                    tableKey: this.getI18nByKey('表格键值'),
                    displayName: this.getI18nByKey('显示名称'),
                    autoRecord: this.getI18nByKey('自动记忆'),
                    enabledFilter: this.getI18nByKey('可添加条件'),
                    enabledCreate: this.getI18nByKey('是否添加视图'),
                    enabledModify: this.getI18nByKey('是否修改'),
                    mainModelType: this.getI18nByKey('主类型'),
                    personalView: this.getI18nByKey('是否私有'),
                    type: this.getI18nByKey('类型'),
                    defaultFilterConfig: this.getI18nByKey('defaultFilterConfig'),
                    请选择: this.getI18nByKey('请选择'),
                    请输入: this.getI18nByKey('请输入'),
                    可选列表: this.getI18nByKey('可选列表'),
                    已选列表: this.getI18nByKey('已选列表'),
                    请填入正确的信息: this.getI18nByKey('请填入正确的信息'),
                    createSuccess: this.getI18nByKey('创建成功'),
                    updateSuccess: this.getI18nByKey('更新成功'),
                    relationshipField: this.getI18nByKey('已知条件'),
                    internalNameError: this.getI18nByKey('请填写内部名称'),
                    internalNameError1: this.getI18nByKey('名称不能包含点'),
                    internalNameError2: this.getI18nByKey('名称内容错误'),
                    boundcode: this.getI18nByKey('该键值与前端代码绑定'),
                    listDisplayConfig: this.getI18nByKey('listDisplayConfig'),
                    pagination: this.getI18nByKey('pagination'),
                    pageStyle: this.getI18nByKey('pageStyle'),
                    simple: this.getI18nByKey('simple'),
                    standard: this.getI18nByKey('standard'),
                    defaultSizePerPage: this.getI18nByKey('defaultSizePerPage'),
                    viewConfigItems: this.getI18nByKey('viewConfigItems'),
                    viewConfigDisabledTip: this.getI18nByKey('viewConfigDisabledTip'),
                    selectBoxType: this.getI18nByKey('selectBoxType'),
                    radio: this.getI18nByKey('radio'),
                    multipleChoice: this.getI18nByKey('multipleChoice'),
                    seqCol: this.getI18nByKey('seqCol'),
                    selectBoxCol: this.getI18nByKey('selectBoxCol'),
                    iconCol: this.getI18nByKey('iconCol'),
                    operationCol: this.getI18nByKey('operationCol'),
                    configBtn: this.getI18nByKey('configBtn'),
                    refreshBtn: this.getI18nByKey('refreshBtn'),
                    advancedSearch: this.getI18nByKey('advancedSearch'),
                    classifySearch: this.getI18nByKey('classifySearch'),
                    tabs: this.getI18nByKey('tabs')
                },
                sortDescendList: [],
                selectedFilterIds: [],
                selectedFiltersCopy: [],
                allFilters: []
            };
        },
        computed: {
            formLayout() {
                return [
                    {
                        field: 'tableKey',
                        component: 'erd-input',
                        label: this.i18n['tableKey'],
                        disabled: this.editable,
                        required: this.readonly || this.editables,
                        readonly: this.editable,
                        validators: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    var reg = /^[a-zA-Z0-9]+(\.?_?[a-zA-Z0-9]+)*$/g;
                                    if (value.trim() === '') {
                                        callback(new Error(this.i18n['internalNameError']));
                                    } else if (!reg.test(value)) {
                                        if (value.match(/[^a-zA-Z0-9._]/gi)) {
                                            callback(new Error(this.i18n['internalNameError2']));
                                        } else {
                                            if (value.match(/[._]$/g)) {
                                                callback(new Error(this.i18n['internalNameError1']));
                                            } else {
                                                callback(new Error(this.i18n['internalNameError2']));
                                            }
                                        }
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: ['blur', 'change']
                            }
                        ],
                        props: {
                            clearable: false,
                            disabled: true,
                            placeholder: this.i18n['请输入']
                        },
                        col: 12,
                        tooltip: this.i18n.boundcode
                    },

                    // 显示名称
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18n['displayName'],
                        required: !this.readonly,
                        props: {
                            clearable: false,
                            i18nName: this.i18n['displayName']
                        },
                        col: 12,
                        slots: {}
                    },

                    // 自动记忆
                    {
                        field: 'autoRecord',
                        component: 'erd-radio',
                        label: this.i18n['autoRecord'],
                        validators: [],
                        props: {},
                        col: 12,
                        defaultValue: true,
                        readonly: this.readonly || false,
                        class: 'radio-form-item',
                        slots: {
                            component: 'statusComponent',
                            readonly: 'statusReadonly'
                        }
                    },

                    // 可添加条件
                    {
                        field: 'enabledFilter',
                        component: 'erd-radio',
                        label: this.i18n['enabledFilter'],
                        validators: [],
                        props: {},
                        col: 12,
                        defaultValue: true,
                        readonly: this.readonly || false,
                        class: 'radio-form-item',
                        slots: {
                            component: 'statusComponent',
                            readonly: 'statusReadonly'
                        }
                    },

                    // 是否添加
                    {
                        field: 'enabledCreate',
                        component: 'erd-radio',
                        label: this.i18n['enabledCreate'],
                        validators: [],
                        props: {},
                        col: 12,
                        defaultValue: true,
                        readonly: this.readonly || false,
                        class: 'radio-form-item',
                        slots: {
                            component: 'statusComponent',
                            readonly: 'statusReadonly'
                        }
                    },

                    // 是否修改
                    {
                        field: 'enabledModify',
                        component: 'erd-radio',
                        label: this.i18n['enabledModify'],
                        validators: [],
                        props: {},
                        col: 12,
                        defaultValue: true,
                        readonly: this.readonly || false,
                        class: 'radio-form-item',
                        slots: {
                            component: 'statusComponent',
                            readonly: 'statusReadonly'
                        }
                    },

                    // 是否私有
                    {
                        field: 'addCurrentUser',
                        component: 'erd-radio',
                        label: this.i18n['personalView'],
                        validators: [],
                        props: {},
                        col: 12,
                        defaultValue: !this.disabledPersonView,
                        readonly: this.readonly || false,
                        disabled: this.disabledPersonView,
                        class: 'radio-form-item',
                        slots: {
                            component: 'statusComponent',
                            readonly: 'statusReadonly'
                        }
                    },
                    {
                        field: 'appName',
                        component: 'custom-select',
                        label: '所属应用',
                        labelLangKey: 'componentType',
                        disabled: this.editable,
                        required: !this.editable,
                        readonly: this.editable,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: '请选择',
                            placeholderLangKey: 'peaseSelect',
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'displayName',
                                valueProperty: 'identifierNo',
                                referenceList: this.appNameOptions
                            }
                        },
                        listeners: {
                            change: this.handleAppNameChange
                        },
                        col: 12
                    },

                    // 主类型
                    {
                        field: 'mainModelType',
                        component: 'custom-select',
                        label: this.i18n['mainModelType'],
                        disabled: this.editable,
                        required: !this.editable,
                        readonly: this.editable,
                        defaultValue: [],
                        validators: [{ required: true, message: '请选择主类型', trigger: 'blur' }],
                        props: {
                            clearable: true,
                            filterable: true,
                            placeholder: this.i18n['请选择'],
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'displayName',
                                valueProperty: 'typeName',
                                referenceList: this.mainTypes
                            }
                        },
                        listeners: {
                            callback: ({ selected }) => {
                                // 如果主类型是包含指定类，则允许选择是否私有，其他不允许选
                                this.disabledPersonView = !(
                                    (selected &&
                                        selected.treePath &&
                                        selected.treePath?.includes('erd.cloud.core.base.entity.BaseObject')) ||
                                    false
                                );
                                this.mainClassifyEnable = selected?.classifyEnable;
                            }
                        },
                        col: 24,
                        slots: {}
                    },

                    // 已知条件
                    {
                        field: 'relationshipField',
                        component: 'custom-select',
                        label: this.i18n['relationshipField'],
                        validators: [],
                        hidden: !this.isRelationLink,
                        required: true,
                        props: {
                            clearable: true,
                            filterable: true,
                            placeholder: this.i18n['请选择'],
                            row: {
                                isHidden: !this.isRelationLink,
                                componentName: 'virtual-select',
                                viewProperty: 'label',
                                valueProperty: 'attrName',
                                requestConfig: {
                                    url: `/fam/view/getFieldsByType`,
                                    params: {
                                        isAttrAddModelName: true,
                                        relationLinkAttr: false
                                    },
                                    method: 'post',
                                    data: this.mainTypeSelectData
                                }
                            }
                        },
                        listeners: {},
                        col: 24,
                        slots: {}
                    },

                    // 类型
                    {
                        field: 'modelTypes',
                        component: 'ErdExTransfer',
                        label: this.i18n['type'],
                        validators: [],
                        hidden: !this.isRelationLink,
                        props: {
                            leftWidth: 'calc(50% - 15px)',
                            rightWidth: '50%',
                            rowColumnNum: 1,
                            height: '280px',
                            leftTitle: this.i18n['可选列表'],
                            rightTitle: this.i18n['已选列表'],
                            showDraggable: false,
                            allColumnsList: this.types || [],
                            valueKey: 'typeName'
                        },
                        col: 24,
                        slots: {}
                    },
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: this.i18n.defaultFilterConfig,
                        props: {
                            unfold: true,
                            style: {
                                marginTop: '16px',
                                marginBottom: '16px'
                            }
                        },
                        children: [
                            {
                                field: 'filters',
                                label: '',
                                component: 'slot',
                                props: {
                                    name: 'filters'
                                },
                                col: 24
                            }
                        ]
                    },
                    {
                        field: 'listDisplayConfig',
                        col: 24,
                        component: 'fam-classification-title',
                        label: this.i18n.listDisplayConfig,
                        props: {
                            unfold: true,
                            style: {
                                marginTop: '16px',
                                marginBottom: '16px'
                            }
                        },
                        slots: {
                            tooltip: 'configItemsTooltip'
                        },
                        children: [
                            {
                                field: 'viewConfigItems',
                                component: 'slot',
                                tooltip: 'configItemsTooltip',
                                label: this.i18n.viewConfigItems,
                                props: {
                                    name: 'view-config-item'
                                },
                                col: 24
                            },
                            {
                                field: 'pageStyle',
                                label: this.i18n.pageStyle,
                                component: 'FamRadio',
                                props: {
                                    type: 'radio',
                                    options: [
                                        {
                                            label: this.i18n.easy,
                                            value: 'easy'
                                        },
                                        {
                                            label: this.i18n.standard,
                                            value: 'standard'
                                        }
                                    ]
                                },
                                defaultValue: 'standard',
                                col: 12
                            },
                            {
                                field: 'pageSize',
                                label: this.i18n.defaultSizePerPage,
                                component: 'custom-select',
                                defaultValue: '20',
                                props: {
                                    row: {
                                        componentName: 'constant-select',
                                        viewProperty: 'value',
                                        valueProperty: 'value',
                                        referenceList: [
                                            { value: '5' },
                                            { value: '10' },
                                            { value: '20' },
                                            { value: '50' },
                                            { value: '100' }
                                        ]
                                    }
                                },
                                col: 12
                            },
                            {
                                field: 'selectBoxType',
                                label: this.i18n.selectBoxType,
                                component: 'FamRadio',
                                hidden: !this.form.viewConfigItems?.includes('selectionBox'),
                                props: {
                                    type: 'radio',
                                    options: [
                                        {
                                            label: this.i18n['radio'],
                                            value: 'radio'
                                        },
                                        {
                                            label: this.i18n['multipleChoice'],
                                            value: 'multipleChoice'
                                        }
                                    ]
                                },
                                defaultValue: 'multipleChoice',
                                col: 12
                            }
                        ]
                    }
                ];
            },
            appNameOptions() {
                return store.state.app.appNames || [];
            },
            viewConfigArr() {
                const viewConfigArr = [
                    {
                        label: this.i18n.seqCol,
                        value: 'number'
                    },
                    {
                        label: this.i18n.selectBoxCol,
                        value: 'selectionBox'
                    },
                    {
                        label: this.i18n.iconCol,
                        value: 'icon'
                    },
                    {
                        label: this.i18n.operationCol,
                        value: 'operate',
                        disabled: this.form.tableKey === 'systemViewTable',
                        tooltip: this.form.tableKey === 'systemViewTable' ? this.i18n.viewConfigDisabledTip : ''
                    },
                    {
                        label: this.i18n.refreshBtn,
                        value: 'refresh'
                    },
                    {
                        label: this.i18n.configBtn,
                        value: 'config'
                    },
                    {
                        label: this.i18n.advancedSearch,
                        value: 'advancedSearch',
                        disabled: !this.form.viewConfigItems.includes('hasView')
                    },
                    {
                        label: this.i18n.classifySearch,
                        value: 'classifySearch',
                        hidden: !this.isClassifyEnable,
                        disabled: !this.form.viewConfigItems.includes('hasView')
                    },
                    {
                        label: this.i18n.tabs,
                        value: 'hasView'
                    }
                ];
                return viewConfigArr.filter((item) => !item.hidden);
            },
            isClassifyEnable() {
                return (
                    this.mainClassifyEnable ||
                    this.form.modelTypes?.some((item) => item.classifyEnable) ||
                    this.form.enableClassifySearch
                );
            },
            mainTypeSelectData() {
                const mainModelType = this.form.mainModelType;
                let res = [];
                if (mainModelType) {
                    if (Array.isArray(mainModelType)) {
                        res = mainModelType;
                    } else {
                        res = [mainModelType];
                    }
                }
                return res;
            },
            containerOid() {
                return this.$store?.state?.app?.container?.oid;
            },
            imgSrc() {
                return ELMP.resource('system-viewtable/components/ViewTableForm/viewConfigItemsTips.png');
            }
        },
        watch: {
            'oid': {
                immediate: true,
                handler(oid) {
                    if (oid) {
                        this.fetchDetailByOid();
                        this.getSelectedFilters(oid);
                    }
                }
            },
            'form.mainModelType': {
                immediate: true,
                handler(val) {
                    this.fnGetTypes(val, this.form.appName).then(() => {
                        this.isLoading = false;
                    });
                    this.getFilters(val);
                }
            }
        },
        methods: {
            // 查询类型，根据主类型联动
            fnGetTypes(mainModelType = '', appName = 'ALL') {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/view/getTypeListByContainerRef',
                        headers: {
                            'App-Name': appName
                        },
                        params: {
                            containerRef: this.containerOid,
                            typeName: mainModelType
                        }
                    }).then((rep) => {
                        const res = rep?.data || {};
                        const data = res.childTypeDefList || [];

                        if (mainModelType) {
                            this.isRelationLink = res.isRelationLink;
                            this.types = data;
                            if (this.editable) {
                                this.types = this.types.map((item) => {
                                    item.isDisable = this.form.modelTypes?.some(
                                        (subItem) => subItem.typeName === item.typeName
                                    );
                                    return item;
                                });
                            }
                        } else {
                            this.mainTypes = data;
                        }
                        resolve();
                    });
                });
            },

            // 获取条件列
            getFilters(typeOid) {
                if (typeOid?.length) {
                    this.$famHttp({
                        url: `/fam/view/getSearchFields`,
                        method: 'post',
                        params: {
                            isAttrAddModelName: true,
                            tableKey: this.tableKey,
                            searchCondition: 'VIEWSEARCH'
                        },
                        data: [typeOid]
                    }).then((resp) => {
                        this.allFilters = resp?.data || [];
                    });
                }
            },
            getSelectedFilters(oid) {
                this.$famHttp({
                    url: '/fam/search',
                    data: {
                        className: this.$store.getters.className('BaseFilterField'),
                        pageIndex: 1,
                        pageSize: 100,
                        sortBy: 'asc',
                        orderBy: 'sortOrder',
                        conditionDtoList: [
                            {
                                attrName: 'holderRef',
                                oper: 'EQ',
                                value1: oid
                            }
                        ]
                    },
                    method: 'POST'
                }).then((resp) => {
                    const { records = [] } = resp?.data || {};
                    const selectedFilterIds = [];
                    const selectedFiltersCopy = [];
                    records.forEach((item) => {
                        const attrNameObj = item?.attrRawList.find((ite) => ite.attrName === 'attrName');
                        selectedFilterIds.push(attrNameObj?.value);
                        selectedFiltersCopy.push({
                            attrName: attrNameObj?.value,
                            oid: item.oid
                        });
                    });
                    this.selectedFilterIds = selectedFilterIds;
                    this.selectedFiltersCopy = selectedFiltersCopy;
                });
            },
            submit() {
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                // 过滤只取当前表单显示的字段，特殊字段额外增加数组处理
                                const excludeAttrs = [''];
                                let includeAttrs = [];
                                this.formLayout?.forEach((item) => {
                                    if (item.field) {
                                        if (item.field === 'listDisplayConfig') {
                                            item.children?.forEach((subItem) => {
                                                includeAttrs.push(subItem.field);
                                            });
                                        } else {
                                            includeAttrs.push(item.field);
                                        }
                                    }
                                });
                                includeAttrs.filter((item) => !excludeAttrs.includes(item));
                                let attrRawList = _.filter(dynamicForm.serialize(), (item) =>
                                    _.includes(includeAttrs, item.attrName)
                                );

                                // 处理请求参数
                                attrRawList.forEach((item) => {
                                    let itemVal = item.value;
                                    if (item.attrName === 'modelTypes') {
                                        item.value = itemVal?.map((ite) => ite.typeName) || [];
                                    }
                                    if (item.attrName === 'viewConfigItems') {
                                        if (!this.isClassifyEnable) {
                                            itemVal = itemVal.filter((item) => item !== 'classifySearch');
                                        }
                                        item.value = itemVal?.join();
                                    }

                                    // 如果是国际化，需要解析里面的值放到value里面
                                    if (item.attrName.includes('I18nJson')) {
                                        item.value = itemVal?.value;
                                    }
                                });

                                // 添加上下文
                                attrRawList.push({
                                    attrName: 'contextRef',
                                    value: this.containerOid
                                });
                                let relationList = [];
                                const filtersConfigRef = this.$refs.filtersConfig;
                                if (filtersConfigRef) {
                                    relationList = filtersConfigRef.getFiltersParams(this.editable);
                                }
                                let className = this.$store.getters.className('tableDefinition');
                                let params = {
                                    associationField: 'holderRef',
                                    relationList,
                                    attrRawList,
                                    className
                                };

                                // 更新
                                if (this.editable) {
                                    params.oid = this.oid;
                                }
                                this.saveFormData(params)
                                    .then((response) => {
                                        resolve(response);
                                    })
                                    .catch(reject);
                            } else {
                                reject(new Error(this.i18n['请填入正确的信息']));
                            }
                        })
                        .catch(reject);
                });
            },
            saveFormData(payload) {
                return new Promise((resolve, reject) => {
                    // 编辑
                    if (this.editable) {
                        this.$famHttp({
                            url: '/fam/update',
                            data: payload,
                            method: 'post'
                        })
                            .then((response) => {
                                const { success, message } = response;
                                if (success) {
                                    this.$message.success(this.i18n['updateSuccess']);
                                    resolve(response);
                                } else {
                                    reject(new Error(message));
                                }
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    } else {
                        this.$famHttp({
                            url: '/fam/create',
                            data: payload,
                            method: 'post'
                        })
                            .then((response) => {
                                const { success, message } = response;
                                if (success) {
                                    this.$message.success(this.i18n['createSuccess']);
                                    resolve(response);
                                } else {
                                    reject(new Error(message));
                                }
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    }
                });
            },

            // 根据oid查询详情
            fetchDetailByOid() {
                this.$famHttp({
                    url: '/fam/attr',
                    data: {
                        oid: this.oid
                    },
                    method: 'get'
                }).then(({ data }) => {
                    const { rawData } = data;
                    this.extractOrganizationAttr(rawData);
                });
            },

            // 反序列字段key值
            extractOrganizationAttr(rawData) {
                let formModel = ErdcKit.deserializeAttr(rawData, {
                    valueMap: {}
                });

                // 子类型model回显
                formModel.viewConfigItems = formModel.viewConfigItems?.split(',') || [];
                formModel.pageStyle = formModel.pageStyle || 'standard';
                formModel.pageSize = formModel.pageSize || '20';
                formModel.modelTypes = (formModel?.modelTypes || []).map((val) => {
                    return {
                        typeName: val
                    };
                });
                formModel.mainModelType = formModel?.mainModelType === '[]' ? '' : formModel?.mainModelType;
                if (!formModel.mainModelType) {
                    this.isLoading = false;
                }
                this.form = formModel;
            },
            handleAppNameChange(appName) {
                this.form.mainModelType = '';
                this.fnGetTypes(this.form.mainModelType, appName);
            },
            onConfigItemsChange(val) {
                if (!val?.includes('hasView')) {
                    this.form.viewConfigItems = val.filter(
                        (item) => !['advancedSearch', 'classifySearch'].includes(item)
                    );
                }
            }
        }
    };
});
