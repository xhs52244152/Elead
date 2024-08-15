define([
    'text!' + ELMP.resource('erdc-product-components/ProductAssociatedUser/index.html'),
    'css!' + ELMP.resource('erdc-product-components/ProductAssociatedUser/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            AssociatedUserSelect: ErdcKit.asyncComponent(
                ELMP.resource('erdc-product-components/AssociatedUserSelect/index.js')
            )
        },
        props: {
            dialogTitle: {
                type: String,
                default: ''
            },
            oid: {
                type: String,
                default: ''
            },
            teamTableType: {
                type: String,
                default: 'product'
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                i18nMappingObj: {
                    associatedUser: this.getI18nByKey('关联用户'),
                    searchPlaceholder: this.getI18nByKey('searchPlaceholder'),
                    selectUser: this.getI18nByKey('请选择加入的成员'),
                    joinSuccess: this.getI18nByKey('加入成功'),
                    removeMember: this.getI18nByKey('是否移除所选用户？'),
                    remove: this.getI18nByKey('移除'),
                    tips: this.getI18nByKey('提示'),
                    pleaseCheck: this.getI18nByKey('请勾选要移除的数据'),
                    removeSuccess: this.getI18nByKey('移除成功'),
                    removeFailed: this.getI18nByKey('移除失败'),
                    ok: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消')
                },
                dialogVisible: false,
                isLoading: false,
                contextDetail: this.$store.state.space?.context
            };
        },
        computed: {
            viewTableConfig() {
                return {
                    tableKey: 'SimpleLinkTableKey',
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableRequestConfig: {
                            data: {
                                relationshipRef: this.oid
                            }
                        },
                        columnWidths: {
                            operation: window.LS.get('lang_current') === 'en_us' ? 90 : 65
                        },

                        // 工具栏
                        toolbarConfig: {
                            valueKey: 'attrName',
                            fuzzySearch: {
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            // 基础筛选
                            basicFilter: {
                                show: true // 是否显示基础筛选，默认不显示
                            },
                            actionConfig: {
                                name: 'Product_LINK_TABLE_ACTION',
                                containerOid: this.contextDetail?.oid || '',
                                className: this.$store.getters.className('DemoSimpleLink'),
                                isDefaultBtnType: true
                            }
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
                        fieldLinkConfig: {
                            // 超链接事件
                            linkClick: (row) => {
                                this.onDetail(row);
                            }
                        },

                        // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        slotsField: [
                            {
                                prop: 'operation', // 当前字段使用插槽
                                type: 'default'
                            }
                        ],
                        tableBaseEvent: {
                            scroll: _.throttle(() => {
                                let arr =
                                    _.chain(this.$refs)
                                        .pick((value, key) => key.indexOf('FamActionPulldown') > -1)
                                        .values()
                                        .value() || [];
                                this.$nextTick(() => {
                                    _.each(arr, (item) => {
                                        let [sitem = {}] = item?.$refs?.actionPulldowm || [];
                                        sitem.hide && sitem.hide();
                                    });
                                });
                            }, 100)
                        }
                    }
                };
            },
            typeDefVoList() {
                return this.$refs?.famViewTable?.viewInfo?.typeDefVoList || [];
            }
        },
        methods: {
            actionClick(type, data) {
                const eventClick = {
                    Product_Link_CREATE: this.handleOpenassociatedUsers,
                    Product_Link_BATCH_DELETE: this.removeAssociatedUser,
                    Product_Link_DELETE: this.removeAssociatedUser
                };
                eventClick[type.name] && eventClick[type.name](data);
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'Product_LINK_ROW_ACTION',
                    objectOid: row.oid,
                    className: this.$store.getters.className('DemoSimpleLink')
                };
            },
            handleOpenassociatedUsers() {
                this.dialogVisible = true;
            },
            removeAssociatedUser(data) {
                const oidList = this.getOidList(data);
                if (!oidList.length) {
                    return this.$message.warning(this.i18nMappingObj['pleaseCheck']);
                }
                this.$confirm(this.i18nMappingObj['removeMember'], this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                }).then(() => {
                    this.$famHttp({
                        url: '/example/deleteByIds',
                        method: 'DELETE',
                        params: {},
                        data: {
                            category: 'DELETE',
                            className: this.$store.getters.className('DemoSimpleLink'),
                            oidList
                        }
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['removeSuccess'],
                            showClose: true
                        });
                        this.refreshTable();
                    });
                });
            },
            getOidList(data) {
                let oidList = [];
                if (Array.isArray(data)) {
                    oidList = _.map(data, (item) => item.oid);
                } else {
                    oidList.push(data.oid);
                }
                return oidList;
            },
            submit() {
                const associatedUserSelectRef = this.$refs['associatedUserSelectRef'];
                associatedUserSelectRef?.$refs?.dynamicForm?.validate((valid) => {
                    if (valid) {
                        const { formData = {}, getSelectedMember = () => [] } = associatedUserSelectRef;
                        const { typeOid = '' } = formData;
                        const className = this.typeDefVoList.find((item) => item.typeOid === typeOid)?.typeName || '';
                        const selectMemberList = getSelectedMember();
                        this.isLoading = true;
                        if (!selectMemberList.length) {
                            this.isLoading = false;
                            return this.$message({
                                type: 'info',
                                message: this.i18nMappingObj['selectUser']
                            });
                        }
                        let rawDataVoList = [];
                        _.each(selectMemberList, (item) => {
                            rawDataVoList.push({
                                attrRawList: [
                                    {
                                        attrName: 'roleAObjectRef',
                                        value: this.oid
                                    },
                                    {
                                        attrName: 'roleBObjectRef',
                                        value: item.oid
                                    },
                                    {
                                        attrName: 'typeReference',
                                        value: typeOid
                                    }
                                ]
                            });
                        });
                        this.$famHttp({
                            url: '/example/saveOrUpdate',
                            method: 'POST',
                            data: {
                                className,
                                rawDataVoList,
                                typeReference: typeOid
                            }
                        })
                            .then((resp) => {
                                if (resp.success) {
                                    this.$message.success(this.i18nMappingObj['joinSuccess']);
                                    this.refreshTable();
                                }
                            })
                            .catch((err) => {})
                            .finally(() => {
                                this.dialogVisible = false;
                                this.isLoading = false;
                            });
                    }
                });
            },
            refreshTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')({ conditions: 'default' });
            }
        }
    };
});
