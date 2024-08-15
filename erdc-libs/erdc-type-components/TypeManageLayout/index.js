define([
    'text!' + ELMP.resource('erdc-type-components/TypeManageLayout/template.html'),
    'css!' + ELMP.resource('erdc-type-components/TypeManageLayout/style.css'),
    'erdc-kit',
    'erdcloud.kit',
    'fam:http',
    'underscore'
], function(template) {
    const ErdcKit = require('erdcloud.kit');
    const FamUtils = require('erdc-kit');

    return {
        template,
        components: {
            TypeAttrConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeAttrConfig/index.js')), // 编辑子类型
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            TypeLayoutForm: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeLayoutForm/index.js')),
            FamRuleEngine: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamRuleEngine/index.js')),
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js'))
        },
        props: {
            oid: {
                type: String,
                default: ''
            },
            typeName: {
                type: String,
                default: ''
            },
            useForm: {
                type: String,
                default: 'type'
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeManageLayout/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    enter: this.getI18nByKey('请输入'),
                    name: this.getI18nByKey('名称'),
                    innerName: this.getI18nByKey('内部名称'),
                    showName: this.getI18nByKey('显示名称'),
                    description: this.getI18nByKey('描述'),
                    source: this.getI18nByKey('模板来源'),
                    type: this.getI18nByKey('布局类型'),
                    status: this.getI18nByKey('状态'),
                    operation: this.getI18nByKey('操作'),
                    delete: this.getI18nByKey('删除'),
                    edit: this.getI18nByKey('编辑'),
                    disabled: this.getI18nByKey('停用'),
                    enabled: this.getI18nByKey('启用'),
                    clearConditions: this.getI18nByKey('清空条件'),
                    cancel: this.getI18nByKey('取消'),
                    confirm: this.getI18nByKey('确认'),
                    create: this.getI18nByKey('创建'),
                    more: this.getI18nByKey('更多'),
                    configRule: this.getI18nByKey('配置规则'),
                    configRuleSuccess: this.getI18nByKey('配置成功'),
                    moveUp: this.getI18nByKey('上移'),
                    moveDown: this.getI18nByKey('下移'),
                    copyType: this.getI18nByKey('拷贝到本类型'),
                    copyLayout: this.getI18nByKey('拷贝布局'),
                    confirmCopy: this.getI18nByKey('确认拷贝'),

                    confirmRemove: this.getI18nByKey('确认删除'),
                    removeSuccessfully: this.getI18nByKey('删除成功'),
                    removeFailure: this.getI18nByKey('删除失败'),
                    updateSuccessfully: this.getI18nByKey('更新成功'),
                    addSuccess: this.getI18nByKey('新增成功'),
                    nonCurrentTenant: this.getI18nByKey('nonCurrentTenant'),
                    inheritLayout: this.getI18nByKey('inheritLayout'),
                    customLayout: this.getI18nByKey('customLayout')
                },
                searchValue: '',
                formData: [],
                viewData: [],
                formLoading: false,
                dialogVisible: false,
                title: '',
                openType: '',
                rowPropertyMap: {},
                unfold: true,
                showInfo: true,
                // 表单设计器传参
                layoutForm: {
                    // 是否显示
                    visible: false,
                    // 布局id
                    layoutId: null,
                    // 是否只读
                    readonly: false
                },
                ruleConfigVisible: false,
                conditionsColumns: [],
                currentRow: {},
                importVisible: false,
                typeMap: {}
            };
        },
        computed: {
            columns() {
                return [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 52,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'icon',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'displayName',
                        title: this.i18nMappingObj?.['showName']
                    },
                    {
                        prop: 'name',
                        title: this.i18nMappingObj?.['innerName']
                    },
                    {
                        prop: 'type',
                        title: this.i18nMappingObj?.['type']
                    },
                    // {
                    //     prop: 'categoryName',
                    //     title: this.i18nMappingObj?.['status'],
                    // },
                    {
                        prop: 'oper',
                        title: this.i18nMappingObj?.['operation'],
                        width: 80,
                        sort: false,
                        fixed: 'right'
                    }
                ];
            },
            isUpdate() {
                return Boolean(this.currentRow.constantRef);
            },
            className() {
                return this.$store.getters.className('constantDefinition');
            },
            ruleConditionDtoList() {
                return this.currentRow.ruleConditionDtoList || [];
            },
            actionConfig() {
                return {
                    name: 'LAYOUT_TABLE_ACTION',
                    objectOid: this.oid
                };
            }
        },
        watch: {
            oid(newV) {
                this.getTypeAttrList(newV);
            }
        },
        mounted() {
            this.init();
            this.fetchLayoutTypes();
        },
        methods: {
            fetchLayoutTypes() {
                const formData = new FormData();
                formData.append('realType', 'erd.cloud.core.layout.enums.LayoutType');
                return this.$famHttp({
                    url: '/fam/type/component/enumDataList',
                    method: 'POST',
                    className: 'erd.cloud.core.layout.enums.LayoutType',
                    data: formData
                }).then(({ data }) => {
                    this.typeMap = data.reduce((map, item) => {
                        return {
                            ...map,
                            [item.name]: item.value
                        };
                    }, {});
                });
            },
            operBtns(row) {
                let operBtns = [
                    {
                        label: this.i18nMappingObj['edit'],
                        name: 'edit',
                        hidden: false
                    },
                    {
                        label: this.i18nMappingObj['delete'],
                        name: 'delete',
                        hidden: false
                    }
                ];
                if (this.useForm === 'type') {
                    operBtns = [
                        {
                            label: this.i18nMappingObj['edit'],
                            name: 'edit',
                            hidden: false
                        },
                        {
                            label: this.i18nMappingObj['delete'],
                            name: 'delete',
                            hidden: false
                        },
                        {
                            label: this.i18nMappingObj['configRule'],
                            name: 'configRule',
                            hidden: !row.isConfigRule
                        },
                        {
                            label: this.i18nMappingObj['moveUp'],
                            name: 'moveUp',
                            hidden: false
                        },
                        {
                            label: this.i18nMappingObj['moveDown'],
                            name: 'moveDown',
                            hidden: false
                        }
                    ];
                }
                return operBtns.filter((item) => !item.hidden);
            },
            showInfoFn(flag) {
                this.showInfo = flag;
            },
            getTypeAttrList(oid) {
                // oid = oid.split(':')[2];
                this.$famHttp({
                    url: '/fam/type/layout/list',
                    data: { contextRef: oid },
                    method: 'get'
                }).then((resp) => {
                    this.viewData = this.formData = resp.data?.records || [];
                });
            },
            init() {
                this.getTypeAttrList(this.oid);
            },
            getIconObj(row) {
                let className = 'font-18 erd-iconfont erd-icon-';
                let tooltip = '';
                if (row.contextRef === this.oid) {
                    className += 'custom-attributes';
                    tooltip = this.i18n.customLayout;
                } else {
                    className += 'process';
                    tooltip = this.i18n.inheritLayout;
                }
                return { value: className, tooltip };
            },
            // 搜索
            search(val) {
                FamUtils.debounceFn(() => {
                    let [...arr] = this.formData;
                    this.filterColumns(val, arr);
                }, 300);
            },
            // 过滤数据
            filterColumns(val, data) {
                if (!val) {
                    this.viewData = this.formData;
                    return true;
                }
                const searchKey = val.replace(/\s/gi, '');
                this.viewData = data.filter(({ displayName, name, layoutType: { value: typeNameCn = '' } = {} }) => {
                    return [displayName, name, typeNameCn].some((subItem) => subItem?.includes(searchKey));
                });
            },
            onCreate() {
                this.openLayoutForm(null, false);
            },
            onDetail({ row }) {
                this.openLayoutForm(row.id, true);
            },
            onEdit(row) {
                this.openLayoutForm(row.id, false);
            },
            onCopy(row) {
                let val = new FormData();
                val.append('layoutOid', row.oid);
                val.append('contextRef', this.oid);
                this.$confirm(this.i18nMappingObj['copyLayout'], this.i18nMappingObj['confirmCopy'], {
                    confirmButtonText: '确认' || this.i18nMappingObj['confirm'],
                    cancelButtonText: '取消' || this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/type/layout/copyAsTypeRef',
                        data: val,
                        method: 'post'
                    }).then(() => {
                        this.init();
                        this.$message({
                            type: 'success',
                            message: '拷贝成功'
                        });
                    });
                });
            },
            onSubmit() {
                // do nothing.
            },
            onDelete(row) {
                this.$confirm(`${this.i18nMappingObj?.['confirmRemove']}?`, this.i18nMappingObj?.['confirmRemove'], {
                    confirmButtonText: this.i18nMappingObj?.['confirm'],
                    cancelButtonText: this.i18nMappingObj?.['cancel'],
                    type: 'warning'
                }).then(() => {
                    const param = {
                        oid: row.oid
                    };
                    this.$famHttp({
                        url: '/fam/delete',
                        params: param,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            message: this.i18nMappingObj?.['removeSuccessfully'],
                            type: 'success',
                            showClose: true
                        });
                        this.init();
                        this.$refs?.famActionButton && this.$refs?.famActionButton?.getActionButtons();
                    });
                });
            },
            onCommand(type, row) {
                this.currentRow = row;
                switch (type) {
                    case 'edit':
                        this.onEdit(row);
                        break;
                    case 'delete':
                        this.onDelete(row);
                        break;
                    case 'configRule':
                        this.onConfigRule(row);
                        break;
                    case 'moveUp':
                        this.onMoveUp(row);
                        break;
                    case 'moveDown':
                        this.onMoveDown(row);
                        break;
                    case 'copy':
                        this.onCopy(row);
                        break;
                    default:
                        break;
                }
            },
            openLayoutForm(layoutId = null, readonly = true) {
                this.layoutForm.visible = true;
                this.layoutForm.layoutId = layoutId;
                this.layoutForm.readonly = readonly;
            },
            createLayout() {
                this.openLayoutForm(null);
            },
            onLayoutChange() {
                this.init();
                this.$refs?.famActionButton && this.$refs?.famActionButton?.getActionButtons();
            },
            ruleConfigSubmit() {
                const conditionsList = this.$refs.famRuleEngine.getRuleEngineParams();
                if (!conditionsList) return;
                let ruleEngineParams = {
                    attrRawList: [
                        {
                            attrName: 'name',
                            value: 'layout'
                        },
                        {
                            attrName: 'holderRef',
                            value: this.currentRow.oid
                        },
                        {
                            attrName: 'typeReference',
                            value: this.oid
                        }
                    ],
                    className: this.className,
                    associationField: 'holderRef',
                    relationList: conditionsList
                };
                if (this.isUpdate && this.currentRow?.constantRef) {
                    ruleEngineParams.oid = this.currentRow.constantRef;
                }
                if (ruleEngineParams) {
                    this.formLoading = true;
                    this.$famHttp({
                        url: `/fam/${this.currentRow.constantRef ? 'update' : 'create'}`,
                        data: ruleEngineParams,
                        method: 'post'
                    })
                        .then((response) => {
                            if (response.success) {
                                this.ruleConfigVisible = false;
                                this.$message.success(this.i18nMappingObj.configRuleSuccess);
                                this.getTypeAttrList(this.oid);
                            }
                        })
                        .finally(() => {
                            this.formLoading = false;
                        });
                }
            },
            clearAllConditions() {
                this.$refs.famRuleEngine.clearAllConditions();
            },
            onConfigRule() {
                this.ruleConfigVisible = true;
            },
            onMoveUp(row) {
                const reduceStep = -1;
                this.onMove(row, reduceStep);
            },
            onMoveDown(row) {
                const addStep = 1;
                this.onMove(row, addStep);
            },
            onMove(row, moveStep) {
                const tableData = ErdcKit.deepClone(this.viewData);
                const currentRowIndex = tableData.findIndex((item) => item.oid === row.oid);
                if (currentRowIndex + moveStep < 0) {
                    this.$message.warning('不能上移');
                    return;
                }
                if (currentRowIndex + moveStep > tableData.length - 1) {
                    this.$message.warning('不能下移');
                    return;
                }
                const currentRowType = row.type;
                const afterRow = tableData[currentRowIndex + moveStep];
                const afterRowType = afterRow?.type;
                if (currentRowType !== afterRowType) {
                    const message = `仅支持同类别数据调整顺序，当前已是同类别数据${moveStep < 0 ? '首位' : '末位'}`;
                    this.$message.warning(message);
                    return;
                }
                const isAfterRowExtend = this.getIsExtend(afterRow);
                if (isAfterRowExtend) {
                    const message = '不能移动';
                    this.$message.warning(message);
                    return;
                }
                tableData.splice(currentRowIndex + moveStep, 0, tableData.splice(currentRowIndex, 1)[0]);
                const data = tableData.filter((item) => item.type === currentRowType).map((item) => item.oid);
                this.$famHttp({
                    url: `/fam/sort`,
                    method: 'POST',
                    data
                })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: moveStep < 1 ? '上移成功' : '下移成功',
                            showClose: true
                        });
                    })
                    .finally(() => {
                        this.getTypeAttrList(this.oid);
                    });
            },
            getIsExtend(row) {
                return row.contextRef !== this.oid;
            },
            onImport() {
                this.importVisible = true;
            },
            onExport(exportChild) {
                this.$famHttp({
                    url: '/fam/export',
                    method: 'POST',
                    data: {
                        businessName: 'LayoutExport',
                        tableSearchDto: {
                            className: this.$store.getters.className('layoutDefinition')
                        },
                        customParams: {
                            typeReference: this.oid,
                            exportChild
                        }
                    }
                }).then(() => {
                    this.$message({
                        type: 'success',
                        dangerouslyUseHTMLString: true,
                        message: this.i18n.exporting,
                        showClose: true
                    });
                });
            },
            importSuccess() {
                this.init();
            },
            beforeUpload(file) {
                const accept = file.name.substring(file.name.lastIndexOf('.') + 1);
                return accept === 'json';
            },
            actionClick(action) {
                switch (action.name) {
                    case 'LAYOUT_CREATE':
                        this.onCreate();
                        break;
                    case 'LAYOUT_IMPORT':
                        this.onImport();
                        break;

                    case 'LAYOUT_EXPORT_SELF':
                        this.onExport(false);
                        break;
                    case 'LAYOUT_EXPORT_CHILD':
                        this.onExport(true);
                        break;
                    default:
                        break;
                }
            }
        }
    };
});
