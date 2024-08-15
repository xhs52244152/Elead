define([
    'text!' + ELMP.resource('biz-template/components/TemplateList/index.html'),
    'css!' + ELMP.resource('biz-template/components/TemplateList/style.css')
], function (template) {
    const ErdcloudKit = require('erdcloud.kit');
    const ErdcKit = require('erdc-kit');

    return {
        template,
        components: {
            FamAdvancedTable: ErdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            ProductForm: ErdcloudKit.asyncComponent(ELMP.resource('erdc-product-components/ProductForm/index.js')),
            ComponentWidthLabel: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            FamPageTitle: ErdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamActionPulldown: ErdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-template/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    templateManagement: this.getI18nByKey('模板管理'),
                    type: this.getI18nByKey('type'),
                    edit: this.getI18nByKey('编辑'),
                    remove: this.getI18nByKey('删除'),
                    save: this.getI18nByKey('保存'),
                    create: this.getI18nByKey('创建'),
                    editProduct: this.getI18nByKey('编辑产品'),
                    createTemplate: this.getI18nByKey('创建模板'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    deleteSuccessfully: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消')
                },
                tableHeight: 450,
                tableColumns: [],
                showTable: false,
                dialogTitle: '',
                dialogVisible: false,
                rowData: null,
                formType: '',
                containerRef: '',
                openType: '',
                typeName: '',
                typeNameList: []
            };
        },
        watch: {
            typeName: {
                immediate: true,
                handler(val) {
                    if (val && this.customComponentName === 'FamAdvancedTable') {
                        this.changeTableConfig(val);
                    } else {
                        this.handlerChangeTypeName(val);
                    }
                }
            }
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            applyFilter() {
                return {
                    showComponent: 'erd-ex-select',
                    value: this.typeName,
                    label: this.i18nMappingObj.type
                };
            },
            customComponentName() {
                const pageComponentNameMapping =
                    this.$store?.state?.famTemplateManagement?.pageComponentNameMapping || {};
                const customComponentName = pageComponentNameMapping[this.typeName];
                return customComponentName || 'FamAdvancedTable';
            },
            tableConfig() {
                const tableConfig = this.$store?.getters.getTableConfig(this.typeName, this);
                return tableConfig || this.viewTableConfig;
            },
            viewInfo() {
                return {
                    mainModelType: this.typeName
                };
            },
            viewTableConfig() {
                if (!this.typeName) return {};
                const tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addOperationCol: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/search', // 表格数据接口
                        params: {}, // 路径参数
                        data: {
                            tmplTemplated: true,
                            className: this.typeName
                        }, // body参数
                        method: 'post' // 请求方法（默认get）
                    },
                    fieldLinkConfig: {
                        fieldLink: true,
                        // 是否添加列超链接
                        fieldLinkName: 'name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            // 超链接事件
                            this.onDetail(row);
                        }
                    },
                    headerRequestConfig: {
                        // 表格列头查询配置(默认url: '/fam/table/head')
                        url: '/fam/table/head',
                        method: 'POST',
                        data: {
                            className: this.typeName
                        }
                    },
                    firstLoad: true,
                    isDeserialize: true, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        fuzzySearch: {
                            show: false, // 是否显示普通模糊搜索，默认显示
                            clearable: true,
                            width: '280'
                        },
                        mainBtn: {
                            // 主要操作按钮
                            label: this.i18nMappingObj.create,
                            class: '',
                            icon: '',
                            onclick: () => {
                                this.rowData = null;
                                this.containerRef = this.createContainerRef;
                                this.openType = 'create';
                                this.dialogTitle = this.i18nMappingObj['createTemplate'];
                                this.openOrHideDialog(true, 'CREATE');
                            }
                        },
                        basicFilter: {
                            show: true,
                            maxNumber: 3
                        }
                    },
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left', // 全局文本对齐方式
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true // 溢出隐藏显示省略号
                    },
                    pagination: {
                        // 分页
                        pageSize: 20,
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    addSeq: true,
                    columns: [],
                    columnWidths: {
                        operation: window.LS.get('lang_current') === 'en_us' ? 180 : 120
                    },
                    slotsField: [
                        {
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ]
                };
                return tableConfig;
            },
            createContainerRef() {
                return this.$store?.state?.app?.container?.oid || '';
            },
            queryLayoutParams() {
                let layoutParams = {
                    objectOid: this?.rowData?.oid,
                    containerRef: this.containerRef,
                    attrRawList: [{ attrName: 'templateInfo.tmplTemplated', value: true }]
                };
                if (this.openType === 'create') {
                    delete layoutParams.name;
                    delete layoutParams.containerRef;
                } else {
                    delete layoutParams.attrRawList;
                }
                return layoutParams;
            }
        },
        mounted() {
            this.tableHeight = document.documentElement.clientHeight - 190;
            this.getTypeNameData();
        },
        methods: {
            handlerChangeTypeName() {
                const fnName = this.$refs[this.customComponentName]?.handlerChangeTypeName;
                if (fnName && _.isFunction(fnName)) {
                    fnName();
                }
            },
            changeTableConfig() {
                this.showTable = true;
                this.$nextTick(() => {
                    this.$refs.FamAdvancedTable?.refreshViewTableAndConditions();
                });
            },
            onDetail(row) {
                const attrRawList = row?.attrRawList || [];
                let containerRef = row?.containerRef || '';
                let typeReference = row?.typeReference || '';
                attrRawList.forEach((item) => {
                    if (item.attrName === 'containerRef') {
                        containerRef = item.oid;
                    }
                    if (item.attrName === 'typeReference') {
                        typeReference = item.oid;
                    }
                });
                if (containerRef) {
                    ErdcKit.open(`/space/example-product/productDemo/info`, {
                        appName: 'erdc-product-example-web',
                        query: {
                            pid: row.oid,
                            typeOid: typeReference,
                            isTemplate: true
                        }
                    });
                }
            },
            openOrHideDialog(flag, type) {
                this.dialogVisible = flag;
                if (flag) {
                    this.formType = type;
                }
            },
            submit() {
                const $form = this.$refs.productForm;
                if ($form) {
                    $form.submitEditForm();
                }
            },
            onSubmit() {
                this.openOrHideDialog(false);
                this.$refs[this.customComponentName]?.fnRefreshTable();
            },
            handlerEdit(row) {
                this.rowData = row;
                const attrRawList = row.attrRawList || [];
                const containerRef = attrRawList.find((item) => {
                    return item.attrName === 'containerRef';
                });
                containerRef && (this.containerRef = containerRef.oid);
                this.openType = 'edit';
                this.dialogTitle = this.i18nMappingObj['editProduct'];
                this.openOrHideDialog(true, 'UPDATE');
            },
            handlerRemove(row) {
                const data = {
                    oid: row.oid,
                    className: this.$store.getters.className('productDemo')
                };
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({ url: '/fam/delete', params: data, method: 'delete' }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['deleteSuccessfully'],
                            showClose: true
                        });
                        this.onSubmit();
                    });
                });
            },
            getTypeNameData() {
                this.$famHttp({ url: '/fam/template/model/list', method: 'GET' }).then((resp) => {
                    if (resp.success) {
                        this.typeNameList = resp.data?.[0]?.children || [];
                        const prdTypeName = this.$store.getters.className('productDemo');
                        const node = this.typeNameList.find(
                            (item) => item.typeName === this.$route?.query?.typeName || item.typeName === prdTypeName
                        );
                        if (node) {
                            this.typeName = node.typeName;
                        } else {
                            this.typeName = this.typeNameList[0]?.typeName || '';
                        }
                    }
                });
            },
            typeNameChange(val) {
                this.typeName = val;
            },
            getActionConfig(row) {
                return {
                    name: 'Product_Template_ROW_ACTION',
                    objectOid: row.oid,
                    className: this.$store.getters.className('productDemo')
                }
            },
            actionClick(type, row) {
                switch (type.name) {
                    case 'Product_UPDATE':
                        this.handlerEdit(row)
                        break;
                    case 'Product_DELETE':
                        this.handlerRemove(row)
                        break;
                    case 'MENU_ACTION_FAVORITES_LINK_COLLECT':
                        this.onToggleCollect('/common/create', row);
                        break;
                    case 'MENU_ACTION_FAVORITES_LINK_CANCEL_COLLECTION':
                        this.onToggleCollect('/common/update', row);
                        break;
                
                    default:
                        break;
                }
            },
            onToggleCollect(url, row) {
                const data = {
                    attrRawList: [
                        {
                            attrName: 'roleBObjectRef',
                            value: row.oid
                        },
                        {
                            attrName: 'type',
                            value: 'FAVORITE'
                        },
                        {
                            attrName: 'tmplTemplated',
                            value: true
                        }
                    ],
                    className: 'erd.cloud.favorites.entity.FavoritesLink'
                };
                return this.$famHttp({
                    url,
                    data,
                    method: 'post'
                }).then((res) => {
                    if (res.success) {
                        this.$message.success('操作成功');
                    }
                });
            },
        }
    };
});
