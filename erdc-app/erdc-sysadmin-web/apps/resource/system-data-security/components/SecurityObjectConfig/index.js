define(['text!' + ELMP.resource('system-data-security/components/SecurityObjectConfig/index.html')], function (
    template
) {
    const FamKit = require('erdcloud.kit');

    return {
        template,
        components: {
            FamErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-data-security/locale/index.js'),
                searchValue: '',
                tableData: [],
                isSaveOrCancel: false,
                isCreate: false,
                securityObjectData: [],
                nodeKey: 'oid',
                treeProps: {
                    children: 'children',
                    disabled: 'disabled',
                    label: 'displayName',
                    notOptional: 'notOptional'
                },
                appAppNames: [],
                tableHeight: 680
            };
        },
        watch: {
            searchValue(value) {
                const data = {
                    keyword: value
                };
                this.getTableData(data);
            }
        },
        computed: {
            columns() {
                return [
                    {
                        type: 'seq',
                        title: ' ',
                        width: 48,
                        align: 'center'
                    },
                    {
                        prop: 'appName',
                        title: this.i18n.application,
                        width: 180,
                        editRender: {}
                    },
                    {
                        prop: 'typeDefinitionDto',
                        title: this.i18n.needVerifyObject,
                        tips: this.i18n.typeDefinitionDtoTips,
                        editRender: {}
                    },
                    {
                        prop: 'operation',
                        title: this.i18n.operation,
                        width: 100
                    }
                ];
            },
            appNameRow() {
                return {
                    componentName: 'constant-select',
                    viewProperty: 'displayName',
                    valueProperty: 'identifierNo',
                    referenceList: this.appAppNames
                };
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                this.getTableData();
                this.getAppNameList();
            },
            getTableData: _.debounce(function (params) {
                this.$famHttp({
                    url: 'fam/access/getSecretObjectConfigListByAppName',
                    params,
                    method: 'POST'
                }).then(({ data = [] }) => {
                    const tableData = data.map((item) => {
                        return {
                            ...item,
                            typeDefinitionDto: item.secretObjectConfigDtos.map((ite) => {
                                return {
                                    ...ite.typeDefinitionDto
                                };
                            }),
                            securityObjectData: item?.securityObjectData || []
                        };
                    });
                    this.$set(this, 'tableData', tableData);
                });
            }, 300),
            async onCreate(row) {
                this.isCreate = true;
                this.isSaveOrCancel = false;
                const $table = this.$refs.erdTable.$table;
                const record = {
                    appName: '',
                    secretObjectConfigDtos: '',
                    isCreate: true
                };
                if ($table && !$table.getEditRecord()) {
                    const { row: newRow } = await $table.insertAt(record, row);
                    await $table.setEditRow(newRow);
                }
            },
            onEdit({ row }) {
                const $table = this.$refs.erdTable.$table;
                const hasEdit = this.tableData.find((row) => $table.isEditByRow(row));
                this.isSaveOrCancel = false;
                if ($table && !hasEdit) {
                    $table.setEditRow(row);
                    this.getTypeByInterFace(row);
                }
            },
            onDelete({ row }) {
                const data = {
                    className: row.className,
                    oidList: (row?.secretObjectConfigDtos || []).map((item) => item.oid)
                };
                this.$famHttp({
                    url: 'fam/deleteByIds',
                    data,
                    method: 'DELETE'
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18n.successfullyDeleted
                    });
                    this.getTableData();
                });
            },
            onSave({ row }) {
                const $table = this.$refs.erdTable.$table;
                if ($table) {
                    const appNameAll = this.tableData.map((item) => item.appName);
                    if (appNameAll.includes(row.appName) && this.isCreate) {
                        return this.$message({
                            type: 'error',
                            message: this.i18n.appAlreadyExists
                        });
                    }
                    const typeDefinitionDto = row?.typeDefinitionDto || [];
                    if (_.isEmpty(row.appName)) {
                        return this.$message({
                            type: 'error',
                            message: this.i18n.applicationMessage
                        })
                    }
                    if (_.isEmpty(row.typeDefinitionDto)) {
                        return this.$message({
                            type: 'error',
                            message: this.i18n.typeDefinitionDtoMessage
                        })
                    }
                    const rawDataVoList = typeDefinitionDto.map((item) => {
                        return {
                            action: 'CREATE',
                            attrRawList: [
                                {
                                    attrName: 'appName',
                                    value: row.appName
                                },
                                {
                                    attrName: 'typeName',
                                    value: item.typeName
                                }
                            ]
                        };
                    });
                    const data = {
                        className: 'erd.cloud.foundation.core.access.entity.SecretObjectConfig',
                        rawDataVoList
                    };
                    this.$famHttp({
                        url: 'fam/saveOrUpdate',
                        data,
                        method: 'POST'
                    })
                        .then(() => {
                            $table.clearEdit();
                            this.getTableData();
                            this.isCreate = false;
                            this.isSaveOrCancel = true;
                            this.$message({
                                type: 'success',
                                message: row.isCreate ? this.i18n.successfullyCreated : this.i18n.successfullyEdit
                            });
                        })
                }
            },
            onCancle({ row }) {
                const $table = this.$refs.erdTable.$table;
                if ($table) {
                    if (this.isCreate) {
                        this.isCreate = false;
                        return $table.remove(row);
                    }
                    this.isSaveOrCancel = true;
                    $table.clearEdit().then(() => {
                        $table.revertData(row);
                    });
                }
            },
            isActiveStatus({ row }) {
                const $table = this.$refs.erdTable.$table;
                return $table.isEditByRow(row);
            },
            handleEditClosed({ row }) {
                if (this.isSaveOrCancel) {
                    return;
                }
                const $table = this.$refs.erdTable.$table;
                if ($table) {
                    $table.setEditRow(row);
                }
            },
            objectDisplayName({ row, column }) {
                const data = row[column.property];
                let displayName = '';
                if (_.isArray(data)) {
                    displayName = data
                        .filter((item) => Boolean(item))
                        .map((item) => {
                            return item?.displayName;
                        })
                        ?.join(',');
                }
                return displayName || '--';
            },
            getTypeByInterFace(row) {
                this.$famHttp({
                    url: 'fam/type/typeDefinition/getTypeByInterFace',
                    params: {
                        appName: row.appName,
                        interfaceType: 'erd.cloud.core.base.SecurityLabeled'
                    }
                }).then(({ data = [] }) => {
                    this.$set(row, 'securityObjectData', data);
                });
            },
            getAppNameList() {
                this.$famHttp({
                    url: '/platform/application/list',
                    method: 'get'
                }).then(({ data = [] }) => {
                    this.appAppNames = data;
                });
            },
            onChange: _.debounce(function (value, data, row) {
                this.getTypeByInterFace(row);
            }, 10)
        }
    };
});
