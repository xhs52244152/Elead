define([
    'text!' + ELMP.resource('erdc-type-components/GlobalAttributesDetail/index.html'),
    'erdc-kit',
    'EventBus',
    'css!' + ELMP.resource('erdc-type-components/GlobalAttributesDetail/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const FamUtils = require('erdc-kit');

    return {
        template,
        components: {
            // 基础表格
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            GlobalAttributesConfig: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/GlobalAttributesConfig/index.js')
            ), // 编辑子类型
            PropertyMobileNode: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/PropertyMobileNode/index.js')
            ) // 移动节点
        },
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
                i18nLocalePath: ELMP.resource('erdc-type-components/GlobalAttributesDetail/locale/index.js'),
                i18nMappingObj: {
                    edit: this.getI18nByKey('编辑'),
                    delete: this.getI18nByKey('删除'),
                    create: this.getI18nByKey('创建'),
                    move: this.getI18nByKey('移动到'),
                    description: this.getI18nByKey('描述'),
                    operation: this.getI18nByKey('操作'),
                    name: this.getI18nByKey('显示名称'),
                    innerName: this.getI18nByKey('内部名称'),
                    dataType: this.getI18nByKey('数据类型'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    confirmDelete: this.getI18nByKey('确定删除'),
                    confirmDeleteTips: this.getI18nByKey('确定删除该数据'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    mobileNode: this.getI18nByKey('请选择移动的节点'),
                    addAttr: this.getI18nByKey('创建属性'),
                    editAttr: this.getI18nByKey('编辑属性'),
                    viewAttr: this.getI18nByKey('查看属性'),
                    deleteSuccessfully: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    attributeList: this.getI18nByKey('属性列表')
                },
                treeHeight: '100%',

                dialogVisible: false,
                moveVisible: false,
                title: '',
                openType: 'create',
                typeOid: '',
                rowData: {}, // 编辑时当前行数据
                rowPropertyMap: {},
                viewData: [],
                formPageData: [],
                categoryData: '',
                useComponentName: 'custom-select', // 组件名
                typeInfoData: {},

                formData: {
                    nameI18nJson: {
                        attrName: 'nameI18nJson'
                    },
                    descriptionI18nJson: {
                        attrName: 'descriptionI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_us: '',
                            en_gb: ''
                        }
                    },
                    name: ''
                },
                listData: [],
                selectChangeArr: [], // 勾选的数据
                selectRadio: [], // 单选框数据
                oid: '',
                searchValue: '',
                isDisabled: false,
                typeAttrGlobal: false,
                appName: '',
                detailTitle: ''
            };
        },
        watch: {
            oid(nv) {
                if (nv) {
                    // 避免首次进入加载过快还未渲染完成导致报错
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.selectChangeArr = [];
                            this.$refs['famAdvancedTable'].fnRefreshTable();
                            this.selectRadio = null;
                        }, 200);
                    });
                }
            },
            selectRadio(val) {
                this.$emit('radioSelectChange', val);
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            lan() {
                return this.$store.state.i18n?.lang || 'zh_cn';
            },
            viewTableConfig() {
                let formData = new FormData();
                formData.append('catalogId', this.oid);
                let tableConfig = {
                    oid: this.oid,
                    searchParamsKey: 'keyword', // 模糊搜索参数传递key
                    dataKey: 'data',
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/type/attribute/listGlobalAttribute', // 表格数据接口
                        params: {}, // 路径参数
                        data: formData, // body参数
                        isFormData: true,
                        method: 'post' // 请求方法（默认get）
                    },
                    isDeserialize: false,
                    firstLoad: false, // 首次进入就加载数据（在钩子里面执行）
                    pagination: {
                        showPagination: false
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
                    toolbarConfig: {
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false, // 是否显示刷新表格，默认显示
                        fuzzySearch: {
                            isLocalSearch: true, //是否开启本地搜索，默认否
                            searchCondition: [] //本地搜索匹配条件，默认全部字段
                        }
                    },
                    tableBaseEvent: {
                        // 基础表格的事件，参考vxe官方API(这里事件官方写什么名称就是什么，不能驼峰命名)
                        'checkbox-change': this.selectChangeEvent,
                        'checkbox-all': this.selectAllEvent,
                        'radio-change': this.selectRadioChange
                    },
                    columns: [
                        {
                            prop: 'checkbox', // 列数据字段key
                            type: 'checkbox', // 特定类型 复选框[checkbox] 单选框[radio]
                            attrName: 'checkbox',
                            width: '48',
                            hide: this.typeAttrGlobal,
                            align: 'center'
                        },
                        {
                            prop: 'radio', // 列数据字段key
                            type: 'radio', // 特定类型 复选框[checkbox] 单选框[radio]
                            attrName: 'radio',
                            width: '40',
                            hide: !this.typeAttrGlobal,
                            align: 'center'
                        },
                        {
                            prop: 'seq',
                            type: 'seq',
                            attrName: 'seq',
                            label: ' ',
                            width: '48',
                            align: 'center' //多选框默认居中显示
                        },
                        {
                            attrName: 'displayName', // 属性key
                            label: this.i18nMappingObj['name'] // 属性名称
                        },
                        {
                            attrName: 'attrName', // 属性key
                            label: this.i18nMappingObj['innerName'] // 属性名称
                        },
                        {
                            attrName: 'dataTypeDto.displayName', // 属性key
                            label: this.i18nMappingObj['dataType'] // 属性名称
                        },
                        {
                            width: 88,
                            attrName: 'operation', // 属性key
                            label: this.i18nMappingObj?.['operation'], // 属性名称
                            hide: this.typeAttrGlobal // 是否隐藏
                        }
                    ],
                    slotsField: [
                        // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        {
                            prop: 'operation', // 字段名
                            type: 'default' // 头部文本插槽
                        },
                        {
                            prop: 'displayName', // 字段名
                            type: 'default' // 头部文本插槽
                        }
                    ]
                };
                if (!this.typeAttrGlobal) {
                    tableConfig.toolbarConfig['mainBtn'] = {
                        // 主要操作按钮
                        label: this.i18nMappingObj['create'],
                        class: '',
                        onclick: () => {
                            this.onCreate();
                        }
                    };
                    tableConfig.toolbarConfig['secondaryBtn'] = [
                        {
                            type: 'default',
                            class: '',
                            icon: '',
                            label: this.i18nMappingObj['move'],
                            onclick: () => {
                                this.onMove();
                            }
                        }
                    ];
                }
                // tableConfig.toolbarConfig = _.extend(tableConfig.toolbarConfig, this.rightBtnList)
                return tableConfig;
            },
            treeSelectList() {
                let newTreeList = JSON.parse(JSON.stringify(this.viewData));
                const treeOidArr = this.selectChangeArr.map((item) => item.id);

                const newTree = (data) => {
                    _.each(data, (item) => {
                        if (item.oid == this.oid) {
                            item.disabled = true;
                        }
                    });
                    for (let i = 0; i < data.length; i++) {
                        if (treeOidArr.includes(data[i].id)) {
                            data.splice(i, 1);
                            i--;
                        } else if (data[i].children && data[i].children.length) {
                            newTree(data[i].children);
                        }
                    }
                };
                newTree(newTreeList);
                return [
                    {
                        displayName: '全局属性分类',
                        id: '-1',
                        disabled: true,
                        children: newTreeList
                    }
                ];
            }
        },
        mounted() {
            if (this?.$store?.state?.app?.typeAttrGlobal) {
                this.typeAttrGlobal = true;
            }
        },
        methods: {
            getGlobalAttrTreeData(data) {
                this.viewData = data;
            },
            fetchTypeDefById(data) {
                this.appName = data?.appName || '';
                this.oid = data.oid || '';
                this.detailTitle = data.displayName || '';
            },
            getTree() {
                this.$famHttp({
                    url: '/fam/type/catalog/listTree',
                    data: { type: 'GLOBAL_ATTR' },
                    method: 'get'
                }).then((resp) => {
                    let { data } = resp;
                    this.viewData = data;
                });
            },
            getDetail() {
                let formData = new FormData();
                formData.append('catalogId', this.oid);

                this.$famHttp({
                    url: '/fam/type/attribute/listGlobalAttribute',
                    data: formData,
                    method: 'post'
                }).then((resp) => {
                    this.formPageData = resp?.data;
                });
            },
            // 搜索
            search(val) {
                FamUtils.debounceFn(() => {
                    let [...arr] = this.formPageData;

                    this.filterColumns(val, arr);
                }, 300);
            },
            // 过滤数据
            filterColumns(val, data) {
                if (!val) {
                    this.viewData = this.formPageData;
                    return true;
                }
                const searchData = [];
                const res = val.replace(/\s/gi, '');
                let searchArr = data;
                searchArr.forEach((e) => {
                    let { displayName, attrName } = e;
                    if (displayName.includes(res) || attrName.includes(res)) {
                        if (searchData.indexOf(e) == '-1') {
                            searchData.push(e);
                        }
                    }
                });

                this.viewData = searchData;
            },
            /**
             * checkbox
             * 复选框
             * @checkbox-all="selectAllEvent"
                 @checkbox-change="selectChangeEvent"
                * **/
            selectAllEvent(data) {
                const records = data?.$table.getCheckboxRecords();
                this.selectChangeArr = records || [];
            },
            selectChangeEvent(data) {
                const records = data?.$table.getCheckboxRecords();
                this.selectChangeArr = records || [];
            },
            selectRadioChange(data) {
                this.selectRadio = data.row;
            },
            // 父节点取消
            traverse(obj) {
                if (obj.children) {
                    obj.checked = false;
                    obj.children.forEach((item) => {
                        this.traverse(item);
                    });
                } else {
                    obj.checked = false;
                }
            },
            // 父节点选择，子节点也要都选择上
            checkFather(data) {
                data.forEach((item) => {
                    if (item.children && item.children) {
                        this.checkFather(item.children);
                    }
                    item.checked = true;
                });
            },
            // 子节点选中，如果非全部子节点选中，则父节点为半选中状态
            relationFather(row) {
                var parent = this.$refs.FamAdvancedTable.$refs.xTable.getParentRow(row);
                if (parent) {
                    if (!row.checked) {
                        parent.checked = false;
                        this.relationFather(parent);
                    }
                }
            },
            onMove() {
                if (!this.selectChangeArr.length) {
                    this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj['mobileNode'],
                        showClose: true
                    });
                    return;
                }
                this.moveVisible = true;
            },
            onCreate() {
                if (this.oid === 'OR:erd.cloud.foundation.type.entity.Catalog:0' || !this.oid) {
                    return this.$message({
                        type: 'warning',
                        message: '未找到属性归属的分类，请先创建全局属性分类目录并选择该分类后再创建',
                        showClose: true
                    });
                }
                this.title = this.i18nMappingObj.addAttr;
                this.dialogVisible = true;
                this.openType = 'create';
            },
            onEdit(row) {
                this.rowData = row;
                this.title = this.i18nMappingObj.editAttr;
                this.dialogVisible = true;
                this.openType = 'edit';
            },
            onDetail(row) {
                this.rowData = row;
                this.title = this.i18nMappingObj.viewAttr;
                this.dialogVisible = true;
                this.openType = 'detail';
            },
            onDelete(row) {
                const data = {
                    oid: row.oid
                };
                this.$confirm(this.i18nMappingObj['confirmDeleteTips'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: data,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['deleteSuccessfully'],
                            showClose: true
                        });
                        this.$refs.famAdvancedTable.fnRefreshTable();
                    });
                });
            },
            onSubmit(oid) {
                this.oid = oid;
                // this.getDetail();
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            onMobileSubmit() {
                this.selectChangeArr = [];
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            refresh(data) {
                this.fetchTypeDefById(data);
                this.$emit('refresh-tree', data);
            }
        }
    };
});
