define([
    'text!' + ELMP.func('erdc-part/components/PartRelationObject/index.html'),
    ELMP.func('erdc-part/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'css!' + ELMP.func('erdc-part/components/PartRelationObject/index.css')
], function (template, viewCfg, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const Document_Class_Name = 'erd.cloud.cbb.doc.entity.EtDocument';
    const Epm_Doc_Class_Name = 'erd.cloud.pdm.epm.entity.EpmDocument';

    return {
        name: 'PartRelationObject',
        template,
        components: {
            RelationObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelationObject/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-part/locale/index.js')
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
            oid() {
                return this.vm?.containerOid || '';
            },
            vid() {
                return this.vm?.formData?.vid || '';
            },
            init() {
                return this.oid && this.vid;
            },
            tabs() {
                const { readonly } = this;
                return [
                    {
                        label: this.i18n.desDoc,
                        name: 'desDoc',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.partDescribeTableView.className,
                                tableKey: viewCfg.partDescribeTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.partDescribeTableView.tableKey;
                                    data.tableConfig.tableRequestConfig.data = {
                                        relationshipRef: this?.oid || '',
                                        lastestVersion: false
                                        // addCheckoutCondition: false
                                    };
                                    data.tableConfig.addOperationCol = true;
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.partDescribeTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        fieldLink: true, // 是否添加列超链接
                                        fieldLinkName: `${Document_Class_Name}#identifierNo`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                                        linkClick: (row) => {
                                            cbbUtils.goToDetail.call(this, row, {}, null, null, true);
                                        }
                                    };
                                    return data;
                                },
                                actionConfig: {
                                    PART_DESC_ADD: {
                                        actionName: 'add',
                                        className: 'erd.cloud.cbb.doc.entity.EtDocument'
                                    },
                                    PART_DESC_CREATE: this.handleDescCreate,
                                    PART_DESC_REMOVE: {
                                        actionName: 'delete'
                                    }
                                },
                                relatedObjectProps: {
                                    viewTypesList: (data) => {
                                        return _.filter(data, (item) => item.className === Document_Class_Name);
                                    },
                                    excluded: (data) => {
                                        const sourceData = ErdcKit.deepClone(this.vm?.sourceData) || {};
                                        const newIdentifierNo =
                                            sourceData?.identifierNo?.value || this.vm?.formData?.identifierNo || '';
                                        const excluded = _.chain(data)
                                            .map(`${Document_Class_Name}#identifierNo`)
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
                        label: 'CAD模型',
                        name: 'CADDoc',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.partCADDocTableView.className,
                                tableKey: viewCfg.partCADDocTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.partCADDocTableView.tableKey;
                                    data.tableConfig.tableRequestConfig.data = {
                                        relationshipRef: this.vid,
                                        idKey: 'vid'
                                        // addCheckoutCondition: false
                                    };
                                    data.tableConfig.addOperationCol = true;
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.partCADDocTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        fieldLink: true, // 是否添加列超链接
                                        fieldLinkName: `${Epm_Doc_Class_Name}#identifierNo`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                                        linkClick: (row) => {
                                            cbbUtils.goToDetail.call(this, row, {}, null, null, true);
                                        }
                                    };
                                    return data;
                                },
                                actionConfig: {
                                    PDM_PART_EPM_DOCUMENT_ADD: {
                                        actionName: 'add',
                                        className: Epm_Doc_Class_Name,
                                        valueField: 'vid',
                                        isRoleB: true
                                    },
                                    PDM_PART_EPM_DOCUMENT_CREATE: this.handleCADCreate,
                                    PDM_PART_EPM_DOCUMENT_REMOVE: {
                                        actionName: 'delete'
                                    }
                                },
                                relatedObjectProps: {
                                    viewTypesList: (data) => {
                                        return _.filter(data, (item) => item.className === Epm_Doc_Class_Name);
                                    },
                                    excluded: (data) => {
                                        const sourceData = ErdcKit.deepClone(this.vm?.sourceData) || {};
                                        const newIdentifierNo =
                                            sourceData?.identifierNo?.value || this.vm?.formData?.identifierNo || '';
                                        const excluded = _.chain(data)
                                            .map(`${Epm_Doc_Class_Name}#identifierNo`)
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
                        label: this.i18n.reference,
                        name: 'referenceDoc',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.partReferenceTableView.className,
                                tableKey: viewCfg.partReferenceTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.partReferenceTableView.tableKey;
                                    data.tableConfig.tableRequestConfig.data = {
                                        relationshipRef: this.oid
                                        // addCheckoutCondition: false
                                    };
                                    data.tableConfig.addOperationCol = true;
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.partReferenceTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        fieldLink: true, // 是否添加列超链接
                                        fieldLinkName: `${Document_Class_Name}#identifierNo`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                                        linkClick: (row) => {
                                            cbbUtils.goToDetail.call(this, row, {}, null, null, true);
                                        }
                                    };
                                    return data;
                                },
                                actionConfig: {
                                    PART_REF_ADD: {
                                        actionName: 'add',
                                        className: 'erd.cloud.cbb.doc.entity.EtDocument',
                                        valueField: 'masterRef'
                                    },
                                    PART_REF_CREATE: this.handleReferCreate,
                                    PART_REF_REMOVE: {
                                        actionName: 'delete'
                                    }
                                },
                                relatedObjectProps: {
                                    viewTypesList: (data) => {
                                        return _.filter(data, (item) => item.className === Document_Class_Name);
                                    },
                                    excluded: (data) => {
                                        const sourceData = ErdcKit.deepClone(this.vm?.sourceData) || {};
                                        const newIdentifierNo =
                                            sourceData?.identifierNo?.value || this.vm?.formData?.identifierNo || '';
                                        const excluded = _.chain(data)
                                            .map(`${Document_Class_Name}#identifierNo`)
                                            .union([newIdentifierNo])
                                            .compact()
                                            .value();
                                        return excluded;
                                    }
                                }
                            }
                        }
                    }
                ];
            }
        },
        methods: {
            async handleDescCreate() {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                const { currentOid } = await this.getCurrentOid();

                let createFunc = () => {
                    this.$router.push({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/create`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            originPath: 'part/detail',
                            currentClassName: viewCfg.partDescribeTableView.className,
                            currentOid: currentOid,
                            jump: 'relationObj',
                            relationObjActive: 'desDoc',
                            isOid: true
                        }
                    });
                };

                //检出之后要刷新标题
                if (currentOid === this.vm.containerOid) {
                    this.vm.refresh(currentOid);
                    createFunc();
                } else {
                    this.vm.refresh(currentOid, createFunc);
                }
            },
            async handleCADCreate() {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                const { currentOid, currentVid } = await this.getCurrentOid('oid');

                let createFunc = () => {
                    this.$router.push({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-epm-document/epmDocument/create`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            originPath: 'epmDocument/detail',
                            currentClassName: viewCfg.partCADDocTableView.className,
                            currentOid: currentOid,
                            currentVid: currentVid,
                            jump: 'relationObj',
                            relationObjActive: 'CADDoc',
                            origin: 'part'
                        }
                    });
                };

                //检出之后要刷新标题
                if (currentOid === this.vm.containerOid) {
                    this.vm.refresh(currentOid);
                    createFunc();
                } else {
                    this.vm.refresh(currentOid, createFunc);
                }
            },
            async handleReferCreate() {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                const { currentOid } = await this.getCurrentOid();

                let createFunc = () => {
                    this.$router.push({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/create`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            originPath: 'part/detail',
                            currentClassName: viewCfg.partReferenceTableView.className,
                            currentOid: currentOid,
                            isOid: false,
                            jump: 'relationObj',
                            relationObjActive: 'referenceDoc'
                        }
                    });
                };

                //检出之后要刷新标题
                if (currentOid === this.vm.containerOid) {
                    this.vm.refresh(currentOid);
                    createFunc();
                } else {
                    this.vm.refresh(currentOid, createFunc);
                }
            },
            async getCurrentOid() {
                const { oid } = this;
                let currentOid = '';
                let currentVid = '';
                const iterationInfo = this.vm?.sourceData?.['iterationInfo.state'];
                if (iterationInfo && iterationInfo.value === 'CHECKED_IN') {
                    const resp = await this.handleCheckout();
                    const rawData = resp.data.rawData;
                    currentOid = rawData.oid.value;
                    currentVid = rawData.vid.value;
                } else {
                    currentOid = oid;
                    currentVid = this.vm?.sourceData?.vid.value;
                }
                return { currentOid, currentVid };
            },
            // 添加相关对象前检出
            handleCheckout() {
                const { oid } = this;
                return this.$famHttp('/fam/common/checkout', {
                    method: 'GET',
                    className: viewCfg.partViewTableMap.className,
                    params: {
                        oid
                    }
                });
            }
        }
    };
});
