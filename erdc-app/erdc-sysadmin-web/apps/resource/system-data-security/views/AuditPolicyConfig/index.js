define(['text!' + ELMP.resource('system-data-security/views/AuditPolicyConfig/index.html'), 'erdc-kit'], function (
    template,
    ErdcKit
) {
    return {
        template,
        components: {
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource(`erdc-components/FamExport/index.js`)),
            AuditPolicyItemConfig: ErdcKit.asyncComponent(
                ELMP.resource('system-data-security/components/AuditPolicyItemConfig/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'system-data-security'),
                auditPolicyDialog: {
                    visible: false,
                    title: ''
                },
                importVisible: false,
                exportVisible: false,
                loading: false,
                curRowData: {},
                commonRequestConfig: { data: { className: 'erd.cloud.message.entity.EtOperationConfig' } }
            };
        },
        computed: {
            containerOid() {
                return this.$store.state.space?.context?.oid || '';
            },
            className() {
                return this.$store.getters.className('EtOperationConfig');
            },
            viewTableConfig() {
                const viewTableConfig = {
                    tableKey: 'OPERATION_LOG_CONFIG',
                    tableConfig: {
                        headerRequestConfig: {
                            data: {
                                className: this.mainModelType
                            }
                        },
                        tableRequestConfig: {
                            method: 'post',
                            data: {
                                className: this.mainModelType
                            },
                            transformResponse: [
                                (data) => {
                                    let resData;
                                    try {
                                        const parseData = data && JSON.parse(data);
                                        resData = parseData;
                                    } catch (error) {
                                        resData = data;
                                    }
                                    return resData;
                                }
                            ]
                        },
                        isDeserialize: true,
                        firstLoad: true,
                        sortFixRight: true,
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false
                            },
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                className: 'erd.cloud.message.entity.EtOperationConfig',
                                name: 'EtOperationConfig_TABLE_ACTION',
                                containerOid: this.containerOid
                            }
                        },
                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        tableBaseConfig: {
                            rowConfig: {
                                isCurrent: true,
                                isHover: true
                            },
                            align: 'left',
                            columnConfig: {
                                resizable: true
                            },
                            showOverflow: true
                        },
                        slotsField: [
                            {
                                prop: 'operation',
                                type: 'default'
                            }
                        ]
                    }
                };
                return viewTableConfig;
            }
        },
        methods: {
            getActionConfig(row) {
                return {
                    name: 'EtOperationConfig_ROW_ACTION',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            actionClick(type, data) {
                const eventClick = {
                    EtOperationConfig_CREATE: this.handleCreate,
                    EtOperationConfig_UPDATE: this.handleUpdate,
                    EtOperationConfig_ENABLE: this.handleEnable,
                    EtOperationConfig_DISABLE: this.handleDisable,
                    EtOperationConfig_DELETE: this.handleDelete,
                    EtOperationConfig_IMPORT: this.handleImport,
                    EtOperationConfig_EXPORT: this.handleExport
                };
                if (_.isFunction(eventClick[type.name])) {
                    eventClick[type.name](data);
                }
            },
            handleCreate() {
                this.auditPolicyDialog.visible = true;
                this.auditPolicyDialog.title = this.i18n.createConfigItem;
                this.curRowData = {};
            },
            handleUpdate(data) {
                this.auditPolicyDialog.visible = true;
                this.auditPolicyDialog.title = this.i18n.updateConfigItem;
                const deserializeRow = ErdcKit.deserializeArray(data.attrRawList);
                this.curRowData = {
                    oid: deserializeRow[`${this.className}#oid`],
                    interfaceType: deserializeRow[`${this.className}#interfaceType`],
                    operationModule: deserializeRow[`${this.className}#operationModule`],
                    nameI18nJson: deserializeRow[`${this.className}#nameI18nJson`],
                    operationType: deserializeRow[`${this.className}#operationType`],
                    typeName: deserializeRow[`${this.className}#typeName`]
                };
            },
            handleEnable(data) {
                this.updateStatusHttp('enable', data);
            },
            handleDisable(data) {
                this.updateStatusHttp('disable', data);
            },
            updateStatusHttp(tpye, data) {
                const selectData = this.getSelectedData(data);
                if (selectData) {
                    if (selectData.length > 1) {
                        const rawDataVoList = data.map((item) => {
                            return {
                                oid: item.oid,
                                className: this.className,
                                attrRawList: [
                                    {
                                        attrName: 'logEnabled',
                                        value: tpye === 'enable'
                                    }
                                ]
                            };
                        });
                        this.$famHttp({
                            url: 'message/saveOrUpdate',
                            data: {
                                className: this.className,
                                rawDataVoList: rawDataVoList
                            },
                            method: 'POST'
                        }).then(() => {
                            this.$message.success(this.i18n[tpye === 'enable' ? 'enableSuccess' : 'stopSuccess']);
                            this.refreshTable();
                        });
                    } else {
                        const attrRawList = [
                            {
                                attrName: 'logEnabled',
                                value: tpye === 'enable'
                            }
                        ];

                        this.$famHttp({
                            url: 'message/update',
                            data: {
                                className: this.className,
                                oid: selectData[0].oid,
                                attrRawList
                            },
                            method: 'POST'
                        }).then(() => {
                            this.$message.success(this.i18n[tpye === 'enable' ? 'enableSuccess' : 'stopSuccess']);
                            this.refreshTable();
                        });
                    }
                }
            },
            handleDelete(data) {
                const selectData = this.getSelectedData(data);
                if (selectData) {
                    this.$confirm(this.i18n.deleteTip, this.i18n.info, {
                        confirmButtonText: this.i18n['comfirm'],
                        cancelButtonText: this.i18n['cancel'],
                        type: 'warning'
                    }).then(() => {
                        let url = '/fam/delete';
                        let params = {};
                        let dataBody = {};
                        if (selectData.length > 1) {
                            url = '/fam/deleteByIds';
                            dataBody = {
                                oidList: selectData.map((item) => item.oid),
                                className: this.className
                            };
                        } else {
                            params.oid = selectData[0].oid;
                        }
                        this.$famHttp({
                            url,
                            params,
                            data: dataBody,
                            className: this.className,
                            method: 'DELETE'
                        }).then(() => {
                            this.$message({
                                type: 'success',
                                message: this.i18n.successfullyDeleted,
                                showClose: true
                            });
                            this.refreshTable();
                        });
                    });
                }
            },
            handleImport() {
                this.importVisible = true;
            },
            handleExport() {
                this.exportVisible = true;
            },
            importSuccess() {
                this.refreshTable();
            },
            handleCancel() {
                this.auditPolicyDialog.visible = false;
            },
            getSelectedData(data) {
                let selectData;
                if (Array.isArray(data)) {
                    if (!data.length) {
                        this.$message.warning(this.i18n.leastOneTip);
                        return;
                    }
                    selectData = data;
                } else {
                    selectData = Array.of(data);
                }
                return selectData;
            },
            refreshTable() {
                this.$refs['famViewTable'].refreshTable('default');
            },
            submit() {
                if (this.loading) return;
                this.$refs.auditPolicyItemConfig?.$refs?.dynamicForm.validate((validate) => {
                    if (validate) {
                        const {
                            form = {},
                            tableData: records = [],
                            tableDataCopy: recodrsCopy = []
                        } = this.$refs.auditPolicyItemConfig;

                        if (!records.length) {
                            this.$message.warning(this.i18n.emptyApiTip);
                            return;
                        }
                        const params = {
                            className: this.className,
                            oid: form.oid,
                            attrRawList: [
                                {
                                    attrName: 'interfaceType',
                                    value: form.interfaceType
                                },
                                {
                                    attrName: 'logEnabled',
                                    value: true
                                },
                                {
                                    attrName: 'typeName',
                                    value: form.typeName
                                },
                                {
                                    attrName: 'logType',
                                    value: 'INTERFACE'
                                },
                                {
                                    attrName: 'operationType',
                                    value: form.operationType
                                },
                                {
                                    attrName: 'nameI18nJson',
                                    value: form.nameI18nJson
                                },
                                {
                                    attrName: 'operationModule',
                                    value: form.operationModule
                                }
                            ],
                            associationField: 'roleAObjectRef'
                        };

                        params.relationList = records.map((item) => {
                            let newItem = {
                                attrRawList: [
                                    {
                                        attrName: 'roleBObjectRef',
                                        value: item.oid
                                    },
                                    {
                                        attrName: 'detailI18nJson',
                                        value: item['Link#detailI18nJson']
                                    },
                                    {
                                        attrName: 'dataCodeExp',
                                        value: item['Link#dataCodeExp']
                                    }
                                ],
                                className: 'erd.cloud.message.entity.EtOperationLink'
                            };
                            const apiObj = recodrsCopy.find((subItem) => subItem.oid === item.oid);
                            if (apiObj) {
                                newItem.oid = item['Link#oid'];
                                newItem.action = 'UPDATE';
                            } else {
                                newItem.action = 'CREATE';
                            }
                            return newItem;
                        });
                        recodrsCopy.forEach((item) => {
                            if (!records.some((subItem) => subItem.oid === item.oid)) {
                                params.relationList.push({
                                    attrRawList: [
                                        {
                                            attrName: 'roleBObjectRef',
                                            value: item.oid
                                        },
                                        {
                                            attrName: 'detailI18nJson',
                                            value: item['Link#detailI18nJson']
                                        },
                                        {
                                            attrName: 'dataCodeExp',
                                            value: item['Link#dataCodeExp']
                                        }
                                    ],
                                    action: 'DELETE',
                                    oid: item['Link#oid'],
                                    className: 'erd.cloud.message.entity.EtOperationLink'
                                });
                            }
                        });
                        const url = _.isEmpty(this.curRowData) ? 'message/create' : 'message/update';
                        this.$famHttp({
                            url,
                            data: params,
                            method: 'POST'
                        }).then(() => {
                            this.$message.success(this.i18n.saveSuccess);
                            this.auditPolicyDialog.visible = false;
                            this.refreshTable();
                        });
                    }
                });
            }
        }
    };
});
