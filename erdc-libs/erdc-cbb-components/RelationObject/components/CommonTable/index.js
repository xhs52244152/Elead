define([
    'text!' + ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.html'),
    'css!' + ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    const partClassName = 'erd.cloud.pdm.part.entity.EtPart';
    // const docClassName = 'erd.cloud.cbb.doc.entity.EtDocument';
    const epmClassName = 'erd.cloud.pdm.epm.entity.EpmDocument';

    return {
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js'))
        },
        inject: ['parentRelationObj'],
        props: {
            relatedObjectProps: Object,
            className: String,
            tableKey: String,
            viewTableConfig: Function,
            actionConfig: Object,
            vm: Object,
            isMasterRef: Boolean,
            readonly: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/RelationObject/locale/index.js'),
                showDialog: false,
                associationCfg: {
                    className: ''
                },
                operationData: []
            };
        },
        computed: {
            oid() {
                return this.parentRelationObj.oid || '';
            },
            masterRef() {
                return this.parentRelationObj.masterRef || '';
            },
            rowRemoveStauts() {
                if (!this.operationData.length) return true;
                let actionConfig = this.operationData.find((item) => item.displayName === this.i18n.remove);
                return actionConfig ? actionConfig.enabled : true;
            },
            defaultViewTableConfig() {
                return {
                    // 视图表格定义的内部名称
                    tableKey: this?.tableKey || '',
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            data: {
                                relationshipRef: this.oid
                            }
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            // 基础筛选
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                isDefaultBtnType: true,
                                containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                                objectOid: this?.oid,
                                className: this?.oid?.split(':')?.[1] || this?.className
                            }
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                            operation: window.LS.get('lang_current') === 'en_us' ? 100 : 70
                        },
                        fieldLinkConfig: {},
                        slotsField: [
                            {
                                prop: 'icon',
                                type: 'default'
                            },
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            {
                                prop: 'operation',
                                type: 'default'
                            }
                        ],
                        pagination: {
                            showPagination: false
                        }
                    }
                };
            },
            innerViewTableConfig() {
                let viewTableConfig = this.viewTableConfig;
                if (_.isFunction(this.viewTableConfig)) {
                    viewTableConfig = this.viewTableConfig(this.defaultViewTableConfig);
                }

                // 只读状态处理
                const { readonly } = this;
                if (readonly && viewTableConfig?.tableConfig?.toolbarConfig) {
                    // 隐藏上方按钮
                    viewTableConfig.tableConfig.toolbarConfig.actionConfig = {};
                }
                if (readonly && viewTableConfig?.tableConfig) {
                    // 隐藏操作列
                    viewTableConfig.tableConfig.addOperationCol = false;
                    let customColums = viewTableConfig.tableConfig.customColums || ((cols) => cols);
                    viewTableConfig.tableConfig.customColums = function (columns) {
                        let computedCols = customColums(columns);
                        return computedCols.filter((item) => item.attrName !== 'operation');
                    };
                }

                return viewTableConfig;
            }
        },
        methods: {
            loaded(data) {
                this.operationData = data;
            },
            // 功能按钮点击事件
            actionClick(type, data) {
                const actionHandler = this.actionConfig[type.name];
                if (_.isFunction(actionHandler)) {
                    actionHandler(type, data, this);
                } else if (_.isObject(actionHandler)) {
                    switch (actionHandler.actionName) {
                        case 'add':
                            this.handleAdd(actionHandler, data);
                            break;
                        case 'delete':
                            this.handleDelete(data, actionHandler);
                            break;
                        default:
                            break;
                    }
                }
            },
            handleAdd(actionHandler) {
                this.associationCfg = _.extend({}, this.associationCfg, actionHandler);
                this.showDialog = true;
            },
            handleDelete(row) {
                row = _.isArray(row) ? row : [row];
                if (!row || !row.length) {
                    return this.$message.warning(this.i18n.selectTip);
                }
                const data = {
                    oidList: _.map(row, 'oid')
                };
                this.$confirm(this.i18n.deleteBatchTip, this.i18n.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel
                }).then(async () => {
                    let iterationInfoState = this?.vm?.sourceData?.['iterationInfo.state'],
                        resp = {};
                    if (iterationInfoState && iterationInfoState?.value === 'CHECKED_IN') {
                        resp = await this.handleCheckout();
                        if (!resp?.success) {
                            return;
                        }
                    }
                    const tableRequestConfigData =
                        this.innerViewTableConfig?.tableConfig?.tableRequestConfig?.data || {};
                    const oid = resp?.data?.rawData?.oid?.value || this.oid || '';
                    const pageId =
                        resp?.data?.rawData?.[tableRequestConfigData.idKey || 'oid']?.value ||
                        tableRequestConfigData.relationshipRef ||
                        '';
                    const masterRef = resp?.data?.rawData?.masterRef?.value;
                    if (oid !== this.oid) {
                        const resp = await this.$famHttp({
                            url: 'fam/view/table/page', // 表格数据接口
                            data: {
                                relationshipRef: this.isMasterRef ? masterRef : pageId || oid,
                                addCheckoutCondition: false, //查询当前数据版本
                                lastestVersion: false,
                                conditionDtoList: [],
                                tableKey: this?.tableKey
                            },
                            className: this?.className,
                            method: 'post'
                        });
                        if (!resp?.success) {
                            return;
                        }
                        const records = resp?.data?.records || [],
                            oidList = [];
                        for (let i = 0; i < row.length; i++) {
                            for (let j = 0; j < records.length; j++) {
                                const rowObj = _.find(row[i]?.attrRawList, (item) =>
                                    new RegExp('identifierNo$').test(item?.attrName)
                                );
                                const recordsObj = _.find(records[j]?.attrRawList, (item) =>
                                    new RegExp('identifierNo$').test(item?.attrName)
                                );
                                if (rowObj?.value === recordsObj?.value) {
                                    oidList.push(records[j]?.oid);
                                }
                            }
                        }
                        data.oidList = oidList;
                    }
                    this.$famHttp({
                        url: '/fam/deleteByIds',
                        method: 'delete',
                        className: this?.className || '',
                        data
                    })
                        .then(() => {
                            this.$message.success(this.i18n.removeSuccess);
                        })
                        .finally(() => {
                            if (this.oid !== oid) {
                                this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                                    const { route } = this.$router.resolve({
                                        path: this.$route?.path,
                                        query: {
                                            ..._.pick(this.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: oid || this.oid,
                                            activeName: this.$router.query?.activeName || 'relationObj'
                                        }
                                    });
                                    this.$router.replace(route);
                                });
                            } else {
                                this.$emit('refresh-current');
                            }
                        });
                });
            },
            refreshTable() {
                this.$refs.famViewTable.getTableInstance('advancedTable', 'refreshTable')();
            },
            refresh() {
                this.refreshTable(...arguments);
            },
            async submit(data) {
                let { i18n } = this;
                if (!data.length) {
                    return this.$message.error(this.i18n.NullPrompt);
                }
                const { isRoleB, isOid, valueField = 'oid' } = this.associationCfg;
                const masterRef = isRoleB && !isOid ? this.masterRef : null;
                let childrenAttrs = data.map((item) => {
                    return item[valueField];
                });

                let sourceData = this?.vm?.sourceData ?? {};

                const iterationInfo = sourceData['iterationInfo.state'];

                if (iterationInfo && iterationInfo.value === 'CHECKED_IN') {
                    const resp = await this.handleCheckout();
                    if (!resp?.success) {
                        return;
                    }
                    sourceData = resp?.data?.rawData || {};
                }

                let oid = this?.oid || '';

                if (this.associationCfg.className == epmClassName && this?.oid?.split(':')[1] == partClassName) {
                    oid = sourceData?.vid?.value || oid;
                } else {
                    oid = sourceData?.oid?.value || oid;
                }

                this.batchAddRelate(oid, childrenAttrs, this.className, masterRef)
                    .then(() => {
                        this.$message.success(i18n.operationSuccess);
                    })
                    .finally(() => {
                        if (this.oid !== sourceData?.oid?.value) {
                            this.vm.refresh(sourceData?.oid?.value || oid);
                        } else {
                            this.$emit('refresh-current');
                        }
                    });
            },

            // 添加相关对象前检出
            handleCheckout() {
                const { oid } = this;
                let className = oid?.split(':')?.[1];
                return this.$famHttp('/fam/common/checkout', {
                    method: 'GET',
                    className,
                    params: {
                        oid
                    }
                });
            },

            /**
             * 批量增加关联
             * @param { String } parentRef - 父对象oid
             * @param { Array } childrenAttrs - 子对象oid数组
             * @param { String } className
             * */
            batchAddRelate(parentRef, childrenAttrs, className, masterRef) {
                const { isRoleB } = this.associationCfg;
                const parentValue = masterRef ? masterRef : parentRef;
                let params = {
                    className,
                    rawDataVoList: []
                };
                childrenAttrs.forEach((oid) => {
                    params.rawDataVoList.push({
                        attrRawList: [
                            {
                                attrName: 'roleAObjectRef',
                                value: isRoleB ? oid : parentValue
                            },
                            {
                                attrName: 'roleBObjectRef',
                                value: isRoleB ? parentValue : oid
                            }
                        ]
                    });
                });

                return this.$famHttp({
                    url: '/fam/saveOrUpdate',
                    method: 'POST',
                    data: params
                });
            },
            fnGetCurrentSelection() {
                const advancedTable = this.$refs.famViewTable.getTableInstance('advancedTable', 'instance');
                return ErdcKit.deepClone(advancedTable?.tableData || []);
            }
        }
    };
});
