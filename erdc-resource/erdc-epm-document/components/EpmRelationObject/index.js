define([
    'text!' + ELMP.func('erdc-epm-document/components/EpmRelationObject/index.html'),
    ELMP.func('erdc-epm-document/api.js'),
    ELMP.func('erdc-epm-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'css!' + ELMP.func('erdc-epm-document/components/EpmRelationObject/index.css')
], function (template, Api, viewCfg, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const Document_Class_Name = 'erd.cloud.cbb.doc.entity.EtDocument';
    const Part_Class_Name = 'erd.cloud.pdm.part.entity.EtPart';

    return {
        name: 'EpmRelationObject',
        template,
        components: {
            RelationObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelationObject/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-epm-document/locale/index.js')
            };
        },
        props: {
            vm: Object,
            readonly: Boolean
        },
        provide() {
            return {
                parentRelationObj: this
            };
        },
        computed: {
            init() {
                return this.oid && this.masterRef && this.vid;
            },
            oid() {
                return this.vm?.containerOid || '';
            },
            vid() {
                return this?.vm?.formData?.vid || '';
            },
            masterRef() {
                return this?.vm?.formData?.masterRef || '';
            },
            tabs() {
                const { readonly } = this;
                return [
                    {
                        label: this.i18n.reference, //参考
                        name: 'referenceDoc',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.epmReferenceTableView.className,
                                tableKey: viewCfg.epmReferenceTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.epmReferenceTableView.tableKey;
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.epmReferenceTableView.actionName;
                                    data.tableConfig.addOperationCol = true;
                                    data.tableConfig.fieldLinkConfig = {
                                        fieldLink: true, // 是否添加列超链接
                                        fieldLinkName: `${viewCfg.epmDocumentViewTableMap.className}#identifierNo`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                                        linkClick: (row) => {
                                            this.jumpToDetail(row, 'reference');
                                        }
                                    };
                                    return data;
                                },
                                actionConfig: {
                                    EPM_REF_ADD: {
                                        actionName: 'add',
                                        className: viewCfg.epmDocumentViewTableMap.className,
                                        valueField: 'masterRef'
                                    },
                                    EPM_REF_REMOVE: this.handleDelete
                                },
                                relatedObjectProps: {
                                    viewTypesList: (data) => {
                                        return _.filter(
                                            data,
                                            (item) => item.className === viewCfg.epmDocumentViewTableMap.className
                                        );
                                    },
                                    excluded: (data) => {
                                        const sourceData = ErdcKit.deepClone(this.vm?.sourceData) || {};
                                        const newIdentifierNo =
                                            sourceData?.identifierNo?.value || this.vm?.formData?.identifierNo || '';
                                        const excluded = _.chain(data)
                                            .map(`${viewCfg.epmDocumentViewTableMap.className}#identifierNo`)
                                            .union([newIdentifierNo])
                                            .compact()
                                            .value();
                                        return excluded;
                                    }
                                }
                            }
                        }
                    },
                    {
                        label: this.i18n.referenceParty, //参考方
                        name: 'referenceParty',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.epmReferencePartyTableView.className,
                                tableKey: viewCfg.epmReferencePartyTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.epmReferencePartyTableView.tableKey;
                                    data.tableConfig.tableRequestConfig.data = {
                                        relationshipRef: this?.masterRef || ''
                                    };
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.epmReferencePartyTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        fieldLink: true, // 是否添加列超链接
                                        fieldLinkName: `${viewCfg.epmDocumentViewTableMap.className}#identifierNo`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                                        linkClick: (row) => {
                                            this.jumpToDetail(row, 'reference');
                                        }
                                    };
                                    return data;
                                }
                            }
                        }
                    },
                    {
                        label: this.i18n.parts, //部件
                        name: 'parts',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.epmBuildRuleTableView.className,
                                tableKey: viewCfg.epmBuildRuleTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.epmBuildRuleTableView.tableKey;
                                    data.tableConfig.tableRequestConfig.data = {
                                        relationshipRef: this?.vid || '',
                                        lastestVersion: false
                                    };
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.epmBuildRuleTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        fieldLink: true, // 是否添加列超链接
                                        fieldLinkName: `${Part_Class_Name}#identifierNo`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                                        linkClick: (row) => {
                                            this.jumpToDetail(row, 'part');
                                        }
                                    };
                                    return data;
                                }
                            }
                        }
                    },
                    {
                        label: this.i18n.desDoc, //描述文档
                        name: 'desDoc',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.epmDocumentDescribeTableView.className,
                                tableKey: viewCfg.epmDocumentDescribeTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.epmDocumentDescribeTableView.tableKey;
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.epmDocumentDescribeTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        fieldLink: true, // 是否添加列超链接
                                        fieldLinkName: `${Document_Class_Name}#identifierNo`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                                        linkClick: (row) => {
                                            this.jumpToDetail(row, 'desc');
                                        }
                                    };
                                    return data;
                                }
                            }
                        }
                    }
                ];
            }
        },
        methods: {
            // 表单行内删除
            handleRemoveRow(row) {
                this.handleDelete(null, [row]);
            },
            // 参考移除
            handleDelete(type, selectedData) {
                const { i18n } = this;
                if (!selectedData || !selectedData.length) {
                    return this.$message.warning(i18n.selectTip);
                }
                const deleteIds = selectedData.map((item) => item.oid);
                this.$confirm(i18n.removeBatchTip, i18n.removeTip, {
                    type: 'warning',
                    confirmButtonText: i18n.confirm,
                    cancelButtonText: i18n.cancel
                }).then(() => {
                    this.$famHttp({
                        url: Api.deleteLinksByIds,
                        method: 'delete',
                        data: {
                            oidList: deleteIds,
                            className: viewCfg.epmReferenceTableView.className
                        }
                    }).then((resp) => {
                        this.$message.success(i18n.removeSuccess);
                        // 当前是已检出时刷新列表
                        if (resp.data === this.oid) {
                            this.$refs.relationObject?.refreshCurrent();
                        } else {
                            this.vm.refresh(resp.data);
                        }
                    });
                });
            },
            jumpToDetail(row, flag) {
                if (!row.oid) return;
                if (flag === 'reference') {
                    cbbUtils.goToDetail.call(
                        this,
                        row,
                        {},
                        `${viewCfg.epmDocumentViewTableMap.className}#oid`,
                        `${viewCfg.epmDocumentViewTableMap.className}#containerRef`
                    );
                }
                if (flag === 'part') {
                    cbbUtils.goToDetail.call(
                        this,
                        row,
                        {},
                        `${Part_Class_Name}#oid`,
                        `${Part_Class_Name}#containerRef`
                    );
                }
                if (flag === 'desc') {
                    cbbUtils.goToDetail.call(
                        this,
                        row,
                        {},
                        `${Document_Class_Name}#oid`,
                        `${Document_Class_Name}#containerRef`
                    );
                }
            }
        }
    };
});
