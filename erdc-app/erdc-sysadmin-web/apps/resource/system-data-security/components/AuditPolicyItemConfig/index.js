define(['text!' + ELMP.resource('system-data-security/components/AuditPolicyItemConfig/index.html')], function (
    template
) {
    const erdcloudKit = require('erdcloud.kit');
    return {
        template,
        components: {
            FamDynamicForm: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            AssociateCustomInterface: erdcloudKit.asyncComponent(
                ELMP.resource('system-data-security/components/AssociateCustomInterface/index.js')
            ),
            FamErdTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            curRowData: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'system-data-security'),
                dialogVisible: false,
                form: {
                    interfaceType: 'BASIC_BEHAVIOR',
                    operationModule: '',
                    nameI18nJson: {},
                    operationType: '',
                    appName: '',
                    typeName: '',
                    ...this.curRowData
                },
                applicationList: [],
                typeList: [],
                tableData: []
            };
        },
        computed: {
            lan() {
                return this.$store.state.i18n?.lang || 'zh_cn';
            },
            isCreate() {
                return _.isEmpty(this.curRowData);
            },
            className() {
                return this.$store.getters.className('EtOperationLink');
            },
            formLayout() {
                let layout = [
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: '基本信息',
                        props: {
                            unfold: true
                        },
                        children: [
                            {
                                field: 'interfaceType',
                                component: 'custom-select',
                                disabled: Boolean(this.tableData.length),
                                label: '接口类型',
                                required: true,
                                defaultValue: 'BASIC_BEHAVIOR',
                                props: {
                                    row: {
                                        componentName: 'virtual-select',
                                        clearNoData: true,
                                        requestConfig: {
                                            url: '/message/enumDataList',
                                            method: 'POST',
                                            viewProperty: 'description',
                                            valueProperty: 'name',
                                            params: {
                                                realType: 'erd.cloud.message.dto.InterfaceType'
                                            }
                                        }
                                    }
                                },
                                col: 12
                            },
                            {
                                field: 'operationModule',
                                component: 'custom-select',
                                label: '系统模块',
                                required: true,
                                props: {
                                    clearable: true,
                                    multiple: false,
                                    treeSelect: true,
                                    treeProps: {
                                        label: 'displayName',
                                        children: 'children',
                                        value: 'identifierNo'
                                    },
                                    row: {
                                        componentName: 'virtual-select',
                                        clearNoData: true,
                                        requestConfig: {
                                            url: '/fam/dictionary/tree/SYSTEM_MODEL',
                                            viewProperty: 'displayName',
                                            valueProperty: 'identifierNo',
                                            params: { status: 1 }
                                        }
                                    }
                                },
                                col: 12
                            },
                            {
                                field: 'nameI18nJson',
                                component: 'FamI18nbasics',
                                label: '名称',
                                required: true,
                                props: {
                                    clearable: false
                                },
                                col: 12,
                                slots: {}
                            },
                            {
                                field: 'operationType',
                                component: 'custom-select',
                                label: '操作类型',
                                required: true,
                                props: {
                                    clearable: true,
                                    multiple: false,
                                    treeSelect: true,
                                    treeProps: {
                                        label: 'displayName',
                                        children: 'children',
                                        value: 'identifierNo'
                                    },
                                    row: {
                                        componentName: 'virtual-select',
                                        clearNoData: true,
                                        requestConfig: {
                                            url: '/fam/dictionary/tree/OPERATION_TYPE',
                                            viewProperty: 'displayName',
                                            valueProperty: 'identifierNo',
                                            params: { status: 1 }
                                        }
                                    }
                                },
                                col: 12
                            },
                            {
                                field: 'typeName',
                                label: '模型',
                                required: true,
                                component: 'slot',
                                props: {
                                    name: 'model'
                                },
                                col: 12
                            }
                        ]
                    },
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: '关联接口',
                        props: {
                            unfold: true
                        },
                        children: [
                            {
                                field: 'associatedInterface',
                                label: '',
                                component: 'slot',
                                props: {
                                    name: 'associated-interface'
                                },
                                col: 24
                            }
                        ]
                    }
                ];
                return layout;
            },
            dialogTitle() {
                return this.i18n[this.form.interfaceType === 'CUSTOM' ? 'associateCustom' : 'associateBasic'];
            },
            columns() {
                return [
                    {
                        type: 'seq',
                        title: ' ',
                        width: 48,
                        align: 'center'
                    },
                    {
                        prop: 'serverCode',
                        title: this.i18n.microService,
                        width: 180
                    },
                    {
                        prop: 'apiName',
                        title: this.i18n.APIFnName
                    },
                    {
                        prop: 'displayName',
                        title: this.i18n.remarks
                    },
                    {
                        prop: 'Link#dataCodeExp',
                        title: this.i18n.businessObjectCode,
                        tips: this.i18n.businessObjectCodeTip,
                        editRender: {}
                    },
                    {
                        prop: 'Link#detailI18nJson',
                        title: this.i18n.operationDetail,
                        tips: this.i18n.detailI18nJsonTip,
                        editRender: {}
                    },
                    {
                        prop: 'operation',
                        title: this.i18n.operation,
                        width: 100
                    }
                ];
            }
        },
        watch: {
            'form.appName'(val) {
                if (val) {
                    this.getModleList(val);
                } else {
                    this.typeList = [];
                    this.form.typeName = '';
                }
            }
        },
        created() {
            this.getApplication();
            if (!this.isCreate) {
                this.getTableData();
                const entityPrefix = this.$store.getters.getEntityPrefix(this.form.typeName);
                if (entityPrefix) {
                    this.form.appName = this.$store.getters.appNameByService(entityPrefix);
                }
            }
        },
        methods: {
            getApplication() {
                this.$famHttp({
                    url: '/platform/application/getCurrentTenantIdApplication'
                }).then((resp) => {
                    const { data } = resp || [];
                    this.applicationList = data.map((item) => {
                        return {
                            label: item.displayName,
                            value: item.identifierNo,
                            key: item.identifierNo
                        };
                    });
                });
            },
            getTableData() {
                this.$famHttp({
                    url: '/message/searchTargetList',
                    method: 'POST',
                    data: {
                        isSearchCount: false,
                        pageSize: 500,
                        className: this.className,
                        relationshipField: 'roleAObjectRef',
                        sourceOidList: [this.form.oid]
                    }
                }).then((resp) => {
                    this.tableData =
                        resp.data?.records.map((item) => {
                            const newItem = erdcloudKit.deserializeArray(item.attrRawList, {
                                valueKey: 'displayName',
                                isI18n: true,
                                valueMap: {
                                    'Link#detailI18nJson'({ value }) {
                                        return value;
                                    }
                                }
                            });
                            return newItem;
                        }) || [];
                    this.tableDataCopy = erdcloudKit.deepClone(this.tableData);
                });
            },
            getModleList() {
                this.$famHttp({
                    url: '/fam/type/typeDefinition/findNotAccessTypes',
                    params: {
                        appName: this.form.appName
                    }
                }).then((resp) => {
                    const { data } = resp || [];
                    this.typeList = data.map((item) => {
                        return {
                            label: item.displayName,
                            value: item.typeName,
                            key: item.typeName
                        };
                    });
                });
            },
            handleCancel() {
                this.dialogVisible = false;
            },
            getI18nValue({ row }) {
                let i18nValue = row['Link#detailI18nJson'] || {};
                if (_.isObject(i18nValue.value)) {
                    i18nValue = i18nValue.value;
                }
                return i18nValue[this.lan] || i18nValue?.value || '';
            },
            getIsEditing({ row }) {
                return this.$refs.erdTable.$table?.isEditByRow(row);
            },
            onEdit({ row }) {
                this.$refs.erdTable.$table?.setEditRow(row);
            },
            onDelete({ row }) {
                this.tableData = this.tableData.filter((item) => item.oid !== row.oid);
            },
            onSave() {
                this.$refs.erdTable.$table?.clearEdit();
            },
            onCancle() {
                this.$refs.erdTable.$table?.clearEdit({});
            },
            submit() {
                const { fnGetCurrentSelection } = this.$refs.associateInterface?.$refs['famAdvancedTable'] || {};
                if (_.isFunction(fnGetCurrentSelection)) {
                    let selectData = fnGetCurrentSelection();
                    if (!selectData.length) {
                        this.$message.warning(this.i18n.selectDataFirst);
                        return;
                    }

                    // 新添加的关联接口 追加到已关联后面
                    const oldTableDataOids = this.tableData.map((item) => item.oid);
                    selectData = selectData.filter((item) => !oldTableDataOids.includes(item.oid));
                    this.tableData = [...this.tableData, ...selectData];
                    this.close();
                }
            },
            close() {
                this.dialogVisible = false;
            }
        }
    };
});
