/*
    类型属性配置
    先引用 kit组件
    FolderListConfig: FamKit.asyncComponent(ELMP.resource('erdc-product-components/FolderListConfig/index.js')), // 编辑子类型

    <folder-list-config
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :title="title"
    :oid="oid"
    :openType="openType"
    @onsubmit="onSubmit"></folder-list-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-product-components/FolderListConfig/template.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js')
], function (template, fieldTypeMapping) {
    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },

            // oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // formType表单类型，新增三种表单，用于区分
            formType: {
                type: String,
                default: ''
            },
            // openType
            openType: {
                type: String,
                default: () => {
                    return '';
                }
            },
            rowData: {
                type: Object | Array,
                default: () => {
                    return {};
                }
            },
            containerRef: String,
            setFormConfig: Function,
            extendTreeParams: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-product-components/FolderListConfig/locale/index.js'),
                i18nMappingObj: {
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    moreActions: this.getI18nByKey('更多操作'),
                    delete: this.getI18nByKey('删除'),
                    export: this.getI18nByKey('导出数据'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),

                    name: this.getI18nByKey('名称'),
                    context: this.getI18nByKey('上下文'),
                    position: this.getI18nByKey('所在位置'),
                    more: this.getI18nByKey('更多'),

                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    type: this.getI18nByKey('类型'),

                    confirmDelete: this.getI18nByKey('确认删除'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    update: this.getI18nByKey('更新成功'),
                    createSuccess: this.getI18nByKey('创建成功'),
                    discardCreate: this.getI18nByKey('是否放弃属性的创建？'),
                    discardEdit: this.getI18nByKey('是否放弃属性的编辑？'),

                    internalNameError: this.getI18nByKey('请填写内部名称'),
                    code: this.getI18nByKey('编码'),
                    passwordValidityPeriod: this.getI18nByKey('密级有效期'),
                    securityLevel: this.getI18nByKey('安全密级'),
                    movedSuccessfully: this.getI18nByKey('移动成功')
                },
                primaryOid: '',
                constraintOid: '',
                className: null,
                formData: {
                    name: '',
                    context: '',
                    folderRef: ''
                },
                typeLevel: false,
                TypeData: {},
                editDetail: {}, // 编辑详情
                unfold: true,
                showInfo: true,
                categoryData: '',
                dynamicFormConfig: [], // 动态组件配置
                dynamicFormData: [], // 动态表单数据
                attrKey: [],
                categoryOptions: [], // 获取属性分类
                treeData: [], // 树形选择数据
                disabled: false,
                defaultList: undefined,
                isChanged: false,
                loading: false,
                isAddDomainDisabled: true,
                isAddDomainHidden: true
            };
        },
        watch: {
            formData: {
                handler(newV) {
                    if (newV) {
                        if (this.defaultList === undefined) {
                            this.defaultList = newV;
                            this._unwatchDefaultList = this.$watch('defaultList', {
                                deep: true,
                                handler: function () {
                                    this.isChanged = true;
                                    this.disabled = false;
                                }
                            });
                        }
                    }
                },
                deep: true
            },
            editDetail(nv) {
                if (nv) {
                    let { folderRef } = nv;

                    this.formData['folderRef'] = folderRef;
                }
            }
        },
        components: {},
        computed: {
            // 处理接口下拉框多次调用接口
            dataKeyConfig: function () {
                let dataKey = '';
                if (this.formData?.dataTypeRefOid || this.formData?.dataTypeRef) {
                    dataKey = {
                        url: '/fam/type/datatype/findLinkedComponentList',
                        data: { oid: this.formData?.dataTypeRefOid || this.formData?.dataTypeRef },
                        viewProperty: 'displayName',
                        valueProperty: 'oid'
                    };
                }
                return dataKey;
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            // 创建属性表单
            // 新加另两种新增表单和移动表单
            formConfig() {
                let _this = this;
                const formConfigList = {
                    // 文件夹新增编辑
                    FOLDER_FORM: [
                        {
                            field: 'name',
                            component: 'erd-input',
                            label: this.i18nMappingObj['name'],
                            labelLangKey: 'name',
                            disabled: false,
                            hidden: false,
                            required: true,
                            props: {
                                maxlength: '30',
                                clearable: false,
                                placeholder: this.i18nMappingObj['pleaseEnter'],
                                placeholderLangKey: 'pleaseEnter'
                            },
                            col: 24
                        },
                        {
                            field: 'context',
                            component: 'custom-select',
                            label: this.i18nMappingObj['context'],
                            labelLangKey: 'context',
                            disabled: true,
                            required: true,
                            validators: [],
                            hidden: false,
                            readonly: true,
                            props: {
                                clearable: true,
                                placeholder: this.i18nMappingObj['pleaseSelect'],
                                placeholderLangKey: 'pleaseSelect',
                                row: {
                                    componentName: 'custom-virtual-context-select',
                                    viewProperty: 'displayName', // 显示的label的key
                                    valueProperty: 'oid', // 显示value的key
                                    clearNoData: true,
                                    requestConfig: {}
                                }
                            },
                            listeners: {},
                            col: 24
                        },
                        {
                            field: 'folderRef',
                            component: 'custom-select',
                            label: this.i18nMappingObj['position'],
                            labelLangKey: 'position',
                            disabled: false,
                            required: true,
                            validators: [],
                            hidden: false,
                            props: {},
                            col: 24,
                            slots: {
                                component: 'positionComponent'
                            }
                        },
                        {
                            field: 'isAddDomain',
                            component: 'FamRadio',
                            label: this.i18n.isAddDomain,
                            tooltip: this.i18n.isAddDomainTips,
                            required: true,
                            disabled: this.isAddDomainDisabled,
                            hidden: this.isAddDomainHidden,
                            props: {
                                type: 'radio',
                                options: [
                                    {
                                        label: this.i18n.yesDomain,
                                        value: true
                                    },
                                    {
                                        label: this.i18n.noDomain,
                                        value: false
                                    }
                                ]
                            },
                            col: 24
                        }
                    ],
                    // 版本对象新增编辑
                    ITEM_VERSION_FORM: [
                        {
                            field: 'name',
                            component: 'erd-input',
                            label: this.i18nMappingObj['name'],
                            labelLangKey: 'name',
                            disabled: false,
                            hidden: false,
                            required: true,
                            props: {
                                maxlength: '30',
                                clearable: false,
                                placeholder: this.i18nMappingObj['pleaseEnter'],
                                placeholderLangKey: 'pleaseEnter'
                            },
                            col: 12
                        },
                        {
                            field: 'identifierNo',
                            component: 'erd-input',
                            label: this.i18nMappingObj['code'],
                            labelLangKey: 'code',
                            disabled: false,
                            validators: [],
                            hidden: false,
                            required: true,
                            props: {
                                clearable: false,
                                placeholder: this.i18nMappingObj['pleaseSelect'],
                                placeholderLangKey: 'pleaseSelect'
                            },
                            listeners: {},
                            col: 12
                        },
                        {
                            field: 'securityDate',
                            component: 'erd-date-picker',
                            label: this.i18nMappingObj['passwordValidityPeriod'],
                            labelLangKey: 'passwordValidityPeriod',
                            disabled: false,
                            validators: [],
                            hidden: false,
                            required: true,
                            props: {
                                'value-format': 'yyyy-MM-dd'
                            },
                            col: 12
                        },
                        {
                            field: 'securityLabel',
                            component: 'custom-select',
                            label: this.i18nMappingObj['securityLevel'],
                            labelLangKey: 'securityLevel',
                            disabled: false,
                            validators: [],
                            hidden: false,
                            required: true,
                            props: {
                                clearable: true,
                                placeholder: this.i18nMappingObj['pleaseSelect'],
                                placeholderLangKey: 'pleaseSelect',
                                row: {
                                    componentName: 'custom-virtual-enum-select',
                                    viewProperty: 'name', // 显示的label的key
                                    valueProperty: 'value', // 显示value的key
                                    clearNoData: true,
                                    enumClass: 'erd.cloud.core.enums.SecurityLabel'
                                }
                            },
                            col: 12
                        }
                    ],

                    // 普通对象新增编辑
                    ITEM_FORM: [
                        {
                            field: 'name',
                            component: 'erd-input',
                            label: this.i18nMappingObj['name'],
                            labelLangKey: 'name',
                            disabled: false,
                            hidden: false,
                            required: true,
                            props: {
                                maxlength: '30',
                                clearable: false,
                                placeholder: this.i18nMappingObj['pleaseEnter'],
                                placeholderLangKey: 'pleaseEnter'
                            },
                            col: 12
                        },
                        {
                            field: 'identifierNo',
                            component: 'erd-input',
                            label: this.i18nMappingObj['code'],
                            labelLangKey: 'code',
                            disabled: false,
                            validators: [],
                            hidden: false,
                            required: true,
                            props: {
                                clearable: false,
                                placeholder: this.i18nMappingObj['pleaseEnter'],
                                placeholderLangKey: 'pleaseEnter'
                            },
                            listeners: {},
                            col: 12
                        }
                    ],

                    // 文件夹批量移动
                    FOLDER_MOVE_FORM: [
                        {
                            field: 'context',
                            component: 'custom-select',
                            label: this.i18nMappingObj['context'],
                            labelLangKey: 'context',
                            disabled: false,
                            required: true,
                            validators: [],
                            hidden: false,
                            props: {
                                clearable: true,
                                placeholder: this.i18nMappingObj['pleaseSelect'],
                                placeholderLangKey: 'pleaseSelect',
                                row: {
                                    componentName: 'custom-virtual-context-select',
                                    viewProperty: 'displayName', // 显示的label的key
                                    valueProperty: 'oid', // 显示value的key
                                    clearNoData: true,
                                    requestConfig: {}
                                }
                            },
                            listeners: {
                                change: (value) => {
                                    _this.contextChange(value);
                                }
                            },
                            col: 24
                        },
                        {
                            field: 'folderRef',
                            component: 'custom-select',
                            label: this.i18nMappingObj['position'],
                            labelLangKey: 'position',
                            disabled: false,
                            required: true,
                            validators: [],
                            hidden: false,
                            props: {},
                            col: 24,
                            slots: {
                                component: 'positionComponent'
                            }
                        }
                    ]
                };
                if (_.isFunction(this.setFormConfig)) this.setFormConfig(formConfigList);
                return formConfigList[this.formType];
            }
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            this._unwatchDefaultList && this._unwatchDefaultList();
        },
        methods: {
            init() {
                this.getListTree();
                this.judgeFn();
                this.attrKey = Object.keys(this.formData);
                const data = new FormData();
                data.append('realType', 'erd.cloud.core.enums.AttributeCategory');
                this.categoryData = data;
                if (this.openType === 'create' || this.openType === 'createTree') {
                    this.visibleChange(this.formData.folderRef);
                }
            },
            judgeFn() {
                if (this.rowData) {
                    let containerRef = this.containerRef;
                    let { name, oid, parentKey } = this.rowData;
                    switch (this.openType) {
                        // 新增文件夹
                        case 'create':
                            this.formData = {
                                name: '',
                                context: containerRef,
                                folderRef: this.oid
                            };
                            break;
                        // 编辑文件夹
                        case 'edit':
                            this.getDetail(oid);
                            this.formData = {
                                name,
                                context: containerRef,
                                folderRef: parentKey
                            };
                            break;
                        // 树形新增文件夹
                        case 'createTree':
                            this.formData = {
                                name: '',
                                context: containerRef,
                                folderRef: oid
                            };

                            break;
                        // 树形编辑文件夹
                        case 'editTree':
                            this.getDetail(oid);
                            this.formData = {
                                name,
                                context: containerRef,
                                folderRef: this.oid
                            };
                            break;
                        // 新增版本对象
                        case 'createItemVersion':
                            this.formData = {
                                name: '',
                                context: containerRef,
                                identifierNo: '',
                                securityDate: '',
                                securityLabel: '',
                                containerRef
                            };
                            break;
                        // 新增普通对象
                        case 'createItem':
                            this.formData = {
                                name: '',
                                context: containerRef,
                                identifierNo: '',
                                containerRef
                            };
                            break;
                        // 移动数据
                        case 'moveFolder':
                            this.formData = {
                                context: containerRef,
                                folderRef: this.oid
                            };
                            break;
                        default:
                    }
                }
            },
            getListTree() {
                this.$famHttp({
                    url: '/fam/listAllTree',
                    method: 'get',
                    data: {
                        className: this.$store.getters.className('subFolder'),
                        containerRef: this.formData.context || this.containerRef
                    },
                    ...this.extendTreeParams
                }).then((resp) => {
                    this.treeData = resp?.data;
                    if (!['create'].includes(this.openType)) {
                        // 创建时可以设到任何位置
                        this.setTreeDisabled(this.treeData);
                    }
                });
            },
            // 所处位置不允许移动到自己节点或自己的子节点，设置禁用
            setTreeDisabled(tree) {
                const rowData = Array.isArray(this.rowData) ? this.rowData : [this.rowData];
                rowData.forEach((item) => {
                    const oid = item.oid;
                    tree.forEach((item) => {
                        if (item.oid === oid) {
                            item.disabled = true;
                            if (item.childList?.length) {
                                return this.setTreeChildListDisabled(item.childList);
                            }
                        } else if (item.childList?.length) {
                            this.setTreeDisabled(item.childList);
                        }
                    });
                });
            },
            setTreeChildListDisabled(childList) {
                childList.forEach((item) => {
                    item.disabled = true;
                    if (item.childList?.length) {
                        this.setTreeChildListDisabled(item.childList);
                    }
                });
            },
            getDetail(oid) {
                this.$famHttp({
                    url: '/fam/getByOid',
                    data: {
                        oid,
                        className: this.rowData?.idKey
                    },
                    method: ''
                }).then((res) => {
                    this.editDetail = res.data;
                });
            },
            onCancel() {
                return this.toggleShow();
            },
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            showInfoFn(flag) {
                this.showInfo = flag;
            },
            submit() {
                this.submitEditForm().then(() => {
                    // do nothing
                });
            },
            submitEditForm() {
                let result = this.$refs.editForm.formData;
                const { editForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    editForm
                        .submit()
                        .then(({ valid }) => {
                            let formData = editForm.serialize();
                            let attrRawList = formData.filter((item) => item.attrName !== 'context');
                            let containerRef = result['context'];
                            if (valid) {
                                // 根据4种不同表单，获取不同请求数据
                                const { obj, url } = this.getHttpData(attrRawList, containerRef);
                                this.$famHttp({
                                    url,
                                    data: obj,
                                    method: 'post'
                                })
                                    .then((res) => {
                                        resolve(res);
                                        if (res.code === '200') {
                                            this.innerVisible = false;
                                            const message =
                                                this.openType === 'edit' || this.openType === 'editTree'
                                                    ? this.i18nMappingObj['update']
                                                    : this.openType === 'moveFolder'
                                                      ? this.i18nMappingObj['movedSuccessfully']
                                                      : this.i18nMappingObj['createSuccess'];
                                            this.$message({
                                                message,
                                                type: 'success',
                                                showClose: true
                                            });
                                            this.$emit('onsubmit', this.oid);
                                        }
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject(new Error());
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            getHttpData(attrRawList, containerRef) {
                let obj = {};
                let url = '';
                switch (this.formType) {
                    case 'FOLDER_FORM':
                        if (this.openType === 'edit' || this.openType === 'editTree') {
                            url = '/fam/update';
                            // 类型编辑
                            obj = {
                                attrRawList,
                                oid: this.rowData.oid,
                                className: this.$store.getters.className('subFolder'),
                                containerRef
                            };
                        } else {
                            // 新增属性
                            obj = {
                                attrRawList,
                                className: this.$store.getters.className('subFolder'),
                                containerRef
                            };

                            url = '/fam/create';
                        }
                        break;
                    case 'ITEM_VERSION_FORM':
                        obj = {
                            attrRawList,
                            className: this.$store.getters.className('itemVersion'),
                            folderRef: this.oid
                        };
                        url = '/fam/create';
                        break;
                    case 'ITEM_FORM':
                        obj = {
                            attrRawList,
                            className: this.$store.getters.className('simpleFolderItem'),
                            folderRef: this.oid
                        };
                        url = '/fam/create';
                        break;
                    case 'FOLDER_MOVE_FORM':
                        obj = {
                            memberList: Array.isArray(this.rowData)
                                ? this.rowData.map((item) => item.oid)
                                : [this.rowData.oid],
                            newFolderId: attrRawList[0]?.value?.split(':')?.[2],
                            newFolderKey: attrRawList[0]?.value?.split(':')?.[1],
                            newContainerId: containerRef.split(':')?.[2],
                            newContainerKey: containerRef.split(':')?.[1]
                        };
                        url = '/fam/folder/batchMoveObject';
                        break;
                    default:
                }
                return { obj, url };
            },
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            },
            contextChange() {
                this.formData.folderRef = '';
                this.getListTree();
            },
            visibleChange(visible) {
                if (visible) {
                    this.$famHttp({
                        url: '/fam/folder/hasDomain',
                        method: 'GET',
                        data: {
                            subFolderOid: visible
                        }
                    }).then(({ data }) => {
                        this.isAddDomainDisabled = !data;
                        this.isAddDomainHidden = false;
                        this.$set(this.formData, 'isAddDomain', false);
                    });
                }
            }
        }
    };
});
