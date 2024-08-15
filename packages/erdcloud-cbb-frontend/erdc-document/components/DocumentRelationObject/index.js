define([
    'text!' + ELMP.func('erdc-document/components/DocumentRelationObject/index.html'),
    ELMP.func('erdc-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'css!' + ELMP.func('erdc-document/components/DocumentRelationObject/index.css')
], function (template, viewCfg, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const Part_Class_Name = 'erd.cloud.pdm.part.entity.EtPart';

    return {
        name: 'DocumentRelationObject',
        template,
        components: {
            RelationObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelationObject/index.js'))
        },
        provide() {
            return {
                parentRelationObj: this
            };
        },
        props: {
            vm: Object,
            readonly: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-document/locale/index.js')
            };
        },
        computed: {
            init() {
                return this.oid && this.masterRef;
            },
            oid() {
                return this.vm?.containerOid || '';
            },
            masterRef() {
                return this?.vm?.formData?.masterRef || '';
            },
            tabs() {
                const { readonly } = this;
                return [
                    // 参考文档
                    {
                        label: this.i18n.depend,
                        name: 'depend',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.docDependencyTableView.className,
                                tableKey: viewCfg.docDependencyTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.docDependencyTableView.tableKey;
                                    data.tableConfig.tableRequestConfig.data = {
                                        relationshipRef: this?.oid || '',
                                        lastestVersion: false
                                    };
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.docDependencyTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        linkClick: (row) => {
                                            cbbUtils.goToDetail(row, {}, null, null, true);
                                        }
                                    };
                                    return data;
                                },
                                actionConfig: {
                                    PART_REF_CREATE: this.handleReferCreate,
                                    PART_REF_ADD: {
                                        actionName: 'add',
                                        className: viewCfg.docViewTableMap.className
                                    },
                                    PART_REF_REMOVE: {
                                        actionName: 'delete'
                                    }
                                },
                                relatedObjectProps: {
                                    viewTypesList: (data) => {
                                        return _.filter(
                                            data,
                                            (item) => item.className === viewCfg.docViewTableMap.className
                                        );
                                    },
                                    excluded: (data) => {
                                        const sourceData = ErdcKit.deepClone(this.vm?.sourceData) || {};
                                        const newIdentifierNo =
                                            sourceData?.identifierNo?.value || this.vm?.formData?.identifierNo || '';
                                        const excluded = _.chain(data)
                                            .map(`${viewCfg.docViewTableMap.className}#identifierNo`)
                                            .union([newIdentifierNo])
                                            .compact()
                                            .value();
                                        return excluded;
                                    }
                                }
                            }
                        }
                    },
                    // 被参考的文档
                    {
                        label: this.i18n.dependOn,
                        name: 'dependOn',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.docDependencyOnTableView.className,
                                tableKey: viewCfg.docDependencyOnTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.docDependencyOnTableView.tableKey;
                                    data.tableConfig.tableRequestConfig.data = {
                                        relationshipRef: this?.oid || ''
                                        // addCheckoutCondition: false
                                    };
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.docDependencyOnTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        linkClick: (row) => {
                                            cbbUtils.goToDetail(row, {}, null, null, true);
                                        }
                                    };
                                    return data;
                                },
                                relatedObjectProps: {
                                    viewTypesList: (data) => {
                                        return _.filter(
                                            data,
                                            (item) => item.className === viewCfg.docViewTableMap.className
                                        );
                                    },
                                    excluded: (data) => {
                                        const sourceData = ErdcKit.deepClone(this.vm?.sourceData) || {};
                                        const newIdentifierNo =
                                            sourceData?.identifierNo?.value || this.vm?.formData?.identifierNo || '';
                                        const excluded = _.chain(data)
                                            .map(`${viewCfg.docViewTableMap.className}#identifierNo`)
                                            .union([newIdentifierNo])
                                            .compact()
                                            .value();
                                        return excluded;
                                    }
                                }
                            }
                        }
                    },
                    // 部件描述关系
                    {
                        label: this.i18n?.['部件描述关系'],
                        name: 'description',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.docDescribeTableView.className,
                                tableKey: viewCfg.docDescribeTableView.tableKey,
                                readonly,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.docDescribeTableView.tableKey;
                                    data.tableConfig.tableRequestConfig.data = {
                                        relationshipRef: this?.oid || ''
                                        // addCheckoutCondition: false
                                    };
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.docDescribeTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        linkClick: (row) => {
                                            cbbUtils.goToDetail(row, {}, null, null, true);
                                        }
                                    };
                                    return data;
                                },
                                actionConfig: {
                                    PART_DESC_CREATE: this.handlePartDescCreate,
                                    PART_DESC_ADD: {
                                        actionName: 'add',
                                        className: Part_Class_Name,
                                        isRoleB: true,
                                        isOid: true
                                    },
                                    PART_DESC_REMOVE: {
                                        actionName: 'delete'
                                    }
                                },
                                relatedObjectProps: {
                                    viewTypesList: (data) => {
                                        return _.filter(data, (item) => item.className === Part_Class_Name);
                                    },
                                    excluded: (data) => {
                                        const sourceData = ErdcKit.deepClone(this.vm?.sourceData) || {};
                                        const newIdentifierNo =
                                            sourceData?.identifierNo?.value || this.vm?.formData?.identifierNo || '';
                                        const excluded = _.chain(data)
                                            .map(`${Part_Class_Name}#identifierNo`)
                                            .union([newIdentifierNo])
                                            .compact()
                                            .value();
                                        return excluded;
                                    }
                                }
                            }
                        }
                    },
                    // 部件参考关系
                    {
                        label: this.i18n.reference,
                        name: 'reference',
                        component: {
                            is: ErdcKit.asyncComponent(
                                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
                            ),
                            props: {
                                className: viewCfg.docReferenceTableView.className,
                                tableKey: viewCfg.docReferenceTableView.tableKey,
                                readonly,
                                isMasterRef: true,
                                viewTableConfig: (data) => {
                                    data = ErdcKit.deepClone(data) || {};
                                    data.tableKey = viewCfg.docReferenceTableView.tableKey;
                                    data.tableConfig.tableRequestConfig.data = {
                                        relationshipRef: this.masterRef
                                        // addCheckoutCondition: false
                                    };
                                    data.tableConfig.toolbarConfig.actionConfig.name =
                                        viewCfg.docReferenceTableView.actionName;
                                    data.tableConfig.fieldLinkConfig = {
                                        linkClick: (row) => {
                                            cbbUtils.goToDetail(row, {}, null, null, true);
                                        }
                                    };
                                    return data;
                                },
                                actionConfig: {
                                    PART_REF_CREATE: this.handlePartReferCreate,
                                    PART_REF_ADD: {
                                        actionName: 'add',
                                        className: Part_Class_Name,
                                        isRoleB: true
                                    },
                                    PART_REF_REMOVE: {
                                        actionName: 'delete'
                                    }
                                },
                                relatedObjectProps: {
                                    viewTypesList: (data) => {
                                        return _.filter(data, (item) => item.className === Part_Class_Name);
                                    },
                                    excluded: (data) => {
                                        const sourceData = ErdcKit.deepClone(this.vm?.sourceData) || {};
                                        const newIdentifierNo =
                                            sourceData?.identifierNo?.value || this.vm?.formData?.identifierNo || '';
                                        const excluded = _.chain(data)
                                            .map(`${Part_Class_Name}#identifierNo`)
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
            // 参考文档 / 创建文档
            async handleReferCreate() {
                const currentOid = await this.getCurrentOid();

                let createFunc = () => {
                    const { prefixRoute, resourceKey } = this.$route?.meta || {};
                    this.$router.push({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/create`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            currentClassName: viewCfg.docDependencyTableView.className,
                            currentOid: currentOid,
                            relationObjActive: 'depend',
                            jump: 'relationObj',
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
            // 部件描述关系
            async handlePartDescCreate() {
                const currentOid = await this.getCurrentOid();

                let createFunc = () => {
                    const query = {
                        currentOid,
                        currentClassName: viewCfg.docDescribeTableView.className,
                        relationObjActive: 'description',
                        typeName: 'part',
                        isRoleB: true,
                        isOid: true
                    };
                    this.jumpCreatePart(query);
                };

                //检出之后要刷新标题
                if (currentOid === this.vm.containerOid) {
                    this.vm.refresh(currentOid);
                    createFunc();
                } else {
                    this.vm.refresh(currentOid, createFunc);
                }
            },
            // 部件参考关系
            async handlePartReferCreate() {
                const currentOid = await this.getCurrentOid();

                let createFunc = () => {
                    const query = {
                        currentClassName: viewCfg.docReferenceTableView.className,
                        relationObjActive: 'reference',
                        typeName: 'part',
                        isRoleB: true,
                        currentOid,
                        masterRef: this.masterRef
                    };
                    this.jumpCreatePart(query);
                };

                //检出之后要刷新标题
                if (currentOid === this.vm.containerOid) {
                    this.vm.refresh(currentOid);
                    createFunc();
                } else {
                    this.vm.refresh(currentOid, createFunc);
                }
            },
            // 跳转到创建部件
            jumpCreatePart(query) {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                this.$router.push({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/create`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        ...query,
                        jump: 'relationObj'
                    }
                });
            },

            async getCurrentOid() {
                let oid = this.oid || '';
                const iterationInfo = this.vm?.sourceData?.['iterationInfo.state'];
                if (iterationInfo && iterationInfo.value === 'CHECKED_IN') {
                    const resp = await this.handleCheckout();
                    oid = resp?.data?.rawData?.oid?.value || '';
                }
                return oid;
            },
            // 添加相关对象前检出
            handleCheckout() {
                const { oid } = this;
                return this.$famHttp('/fam/common/checkout', {
                    method: 'GET',
                    className: viewCfg.docViewTableMap.className,
                    params: {
                        oid
                    }
                });
            }
        }
    };
});
