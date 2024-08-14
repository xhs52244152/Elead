define([
    'text!' + ELMP.resource('erdc-ppm-process-application-rules/views/list/index.html'),
    'css!' + ELMP.resource('erdc-ppm-process-application-rules/views/list/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'processApplicationRules',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamRuleEngine: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamRuleEngine/index.js')),
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-ppm-process-application-rules/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([]),
                ruleConfigVisible: false,
                formLoading: false,
                currentRow: {},
                visible: false,
                dialogTitle: '',
                // 加载中
                loading: false,
                formData: {
                    holderTypeRef: '',
                    procDefMasterRef: '',
                    operationScenario: '',
                    sortOrder: 0
                },
                isEdit: false,
                oid: ''
            };
        },
        computed: {
            formType() {
                return this.isEdit ? 'UPDATE' : 'CREATE';
            },
            isUpdate() {
                return Boolean(this.currentRow.constantRef);
            },
            typeReferenceOid() {
                return this.currentRow.typeReference || '';
            },
            objectTypeOid() {
                let holderTypeRef =
                    this.currentRow?.attrRawList?.find((item) => item.attrName === this.className + '#holderTypeRef') ||
                    {};
                return holderTypeRef.oid || '';
            },
            className() {
                return this.$store.getters.className('procApplicationRule');
            },
            ruleConditionDtoList() {
                return this.currentRow.ruleConditionDtoList || [];
            },
            operBtns() {
                return function (row) {
                    return [
                        {
                            label: this.i18n.edit,
                            name: 'edit',
                            hidden: false
                        },
                        {
                            label: this.i18n.delete,
                            name: 'remove',
                            hidden: false
                        },
                        {
                            label: this.i18n.configureRules,
                            name: 'configRule',
                            hidden: !row.isConfigRule
                        }
                        // {
                        //     label: this.i18n.moveUp,
                        //     name: 'moveUp',
                        //     hidden: false
                        // },
                        // {
                        //     label: this.i18n.moveDown,
                        //     name: 'moveDown',
                        //     hidden: false
                        // }
                    ];
                };
            },
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: 'ProcApplicationRuleView', // UserViewTable productViewTable
                    saveAs: false, // 是否显示另存为
                    tableConfig: this.tableConfig
                };
            },
            // 高级表格配置
            tableConfig() {
                return {
                    tableRequestConfig: {
                        data: {
                            sortFields: { operationScenario: true, sortOrder: true }
                        }
                    },
                    toolbarConfig: {
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        // 基础筛选
                        basicFilter: {
                            show: true
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: '60px'
                    },
                    fieldLinkConfig: {
                        fieldLink: false // 是否添加列超链接
                    },
                    slotsField: [
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        },
                        {
                            prop: 'icon',
                            type: 'default'
                        }
                    ]
                };
            }
        },
        created() {},
        methods: {
            queryLayoutParams() {
                return {
                    objectOid: this.oid,
                    name: this.formType,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.formType
                        // }
                    ]
                };
            },
            // 功能按钮点击事件
            actionClick(type, data) {
                this.currentRow = data || {};
                const eventClick = {
                    create: this.onCreate,
                    edit: this.onEdit,
                    remove: this.onDelete,
                    configRule: this.onConfigRule,
                    moveUp: this.onMoveUp,
                    moveDown: this.onMoveDown
                };
                eventClick?.[type] && eventClick?.[type](data);
            },
            // 创建规则
            onCreate() {
                this.dialogTitle = this.i18n.createApplicationRules;
                this.isEdit = false;
                this.visible = true;
            },
            handleClose() {
                this.formData = {
                    holderTypeRef: '',
                    procDefMasterRef: '',
                    operationScenario: '',
                    sortOrder: 0
                };
                this.visible = false;
            },
            fieldChange: _.debounce(function (field, value, $event) {
                if (field.field === 'holderTypeRef' && value && value.indexOf('ServiceInfo') != -1) {
                    this.formData.holderTypeRef = '';
                    return this.$message({
                        type: 'warning',
                        message: this.i18n.pleaseSelectSubItem
                    });
                }
            }, 150),
            // 编辑规则
            onEdit(val) {
                this.dialogTitle = this.i18n.editApplicationRules;
                this.isEdit = true;
                this.visible = true;
                this.oid = val.oid;
            },
            handlerApplicationRules() {
                let attrRawList = [];
                Object.keys(this.formData).forEach((elem) => {
                    if (['procDefMasterRef', 'holderTypeRef', 'operationScenario', 'sortOrder'].includes(elem)) {
                        attrRawList.push({
                            attrName: elem,
                            value: this.formData[elem]
                        });
                    }
                });
                let params = {
                    className: this.className,
                    attrRawList
                };
                if (this.isEdit) {
                    params['oid'] = this.currentRow.oid;
                }
                this.$famHttp({
                    url: this.isEdit ? '/fam/update' : '/fam/create',
                    method: 'post',
                    data: params
                }).then((res) => {
                    this.$message({
                        message: this.isEdit ? this.i18n.creationFailure : this.i18n.successfullyCreated,
                        type: 'success',
                        showClose: true
                    });
                    this.refreshTable();
                    this.handleClose();
                });
            },
            onDelete(row) {
                this.$confirm(`${this.i18n.deleteConfirm}?`, this.i18n.tips, {
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    type: 'warning'
                }).then(() => {
                    const param = {
                        oid: row.oid
                    };
                    this.$famHttp({
                        url: '/fam/delete',
                        params: param,
                        className: this.className,
                        method: 'DELETE'
                    }).then(() => {
                        this.$message({
                            message: this.i18n.deletedSuccessfully,
                            type: 'success',
                            showClose: true
                        });
                        this.refreshTable();
                    });
                });
            },
            onConfigRule() {
                this.$famHttp({
                    url: '/fam/attr',
                    method: 'get',
                    className: this.className,
                    params: {
                        oid: this.currentRow.oid
                    }
                }).then((res) => {
                    let result = res.data?.rawData || {};
                    this.$set(this.currentRow, 'ruleConditionDtoList', result?.ruleConditionDtoList?.value);
                    if (result?.constantRef?.value) {
                        this.$set(this.currentRow, 'constantRef', result?.constantRef?.value);
                    }
                    this.ruleConfigVisible = true;
                });
            },
            clearAllConditions() {
                this.$refs.famRuleEngine.clearAllConditions();
            },
            ruleConfigSubmit() {
                const conditionsList = this.$refs.famRuleEngine.getRuleEngineParams();
                if (!conditionsList) return;
                let ruleEngineParams = {
                    attrRawList: [
                        {
                            attrName: 'name',
                            value: 'procApplication'
                        },
                        {
                            attrName: 'holderRef',
                            value: this.currentRow.oid
                        },
                        {
                            attrName: 'typeReference',
                            value: this.typeReferenceOid
                        }
                    ],
                    className: this.$store.getters.className('constantDefinition'), //fam  className
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
                                this.$message.success(this.i18n.configurationRuleSuccess);
                                this.refreshTable();
                            }
                        })
                        .catch(() => {})
                        .finally(() => {
                            this.formLoading = false;
                        });
                }
            },
            // 刷新视图表格
            refreshTable() {
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            }
        }
    };
});
