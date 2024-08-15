define([
    'text!' + ELMP.resource('biz-signature/docTmpl/docTmplHistory/index.html'),
    ELMP.resource('biz-signature/CONST.js')
], (template, CONST) => {
    const FamKit = require('fam:kit');

    return {
        name: 'SignatureDocTmplHistory',
        template,
        components: {
            ReviseOperate: FamKit.asyncComponent(ELMP.resource('biz-signature/docTmpl/ReviseOperate/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamViewTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            DocTmplDesign: FamKit.asyncComponent(ELMP.resource('biz-signature/docTmpl/docTmplDesign/index.js'))
        },
        props: {},
        data() {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'createDocTmpl',
                    'editWatermark',
                    'docTmplHistoryTitle',
                    'confirm',
                    'operate',
                    'delete',
                    'deleteConfirm',
                    'success',
                    'signatureSearchTips',
                    'cancel',
                    'signatureTmpl',
                    'success',
                    'delete',
                    'success'
                ]),
                CONST: CONST,
                defaultTemplate: ''
            };
        },
        computed: {
            title: function () {
                return this.i18nMappingObj.docTmplHistoryTitle;
            },
            defaultBtnConfig() {
                return {
                    label: this.i18nMappingObj.operate,
                    type: 'text'
                };
            },
            viewTableConfig() {
                return {
                    tableKey: CONST.tableKey.docTmplHistory, // UserViewTable productViewTable
                    saveAs: false, // 是否显示另存为]
                    showTitle: false,
                    tableConfig: {
                        viewOid: '', // 视图id
                        searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            url: '/fam/search', // 表格数据接口
                            data: {
                                className: CONST.className.docTmplHistory,
                                orderBy: 'createTime',
                                sortBy: 'desc',
                                lastestVersion: false,
                                conditionDtoList: [
                                    {
                                        attrName: 'identifierNo',
                                        oper: 'EQ',
                                        value1: this.$route.params.code
                                    }
                                ]
                            }, // 路径参数
                            method: 'post', // 请求方法（默认get）
                            transformResponse: [
                                (respData) => {
                                    let resData = respData;
                                    try {
                                        resData = respData && JSON.parse(respData);
                                        let { records } = resData?.data || {};
                                        records = records || [];
                                        resData.data.records = records.map((item) => {
                                            const obj = {};
                                            item.attrRawList.forEach((ite) => {
                                                obj[`${CONST.className.docTmpl}#${ite.attrName}`] = ite.displayName;
                                                obj[ite.attrName] = ite.value;
                                                if (_.isObject(ite.value)) {
                                                    obj[ite.attrName] = ite.displayName;
                                                    obj[`${CONST.className.docTmpl}#${ite.attrName}`] = ite.displayName;
                                                }
                                            });
                                            return {
                                                ...item,
                                                ...obj
                                            };
                                        });
                                    } catch (error) {
                                        console.error(error);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        tableRequestDataConfig: 'records', // 获取表格接口请求回来数据的字段名称
                        headerRequestConfig: {
                            // 表格列头查询配置(默认url: '/fam/table/head')
                            method: 'POST',
                            data: { className: CONST.className.docTmplHistory }
                        },
                        firstLoad: true,
                        isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                        toolbarConfig: {
                            // 工具栏
                            fuzzySearch: {
                                show: false, // 是否显示普通模糊搜索，默认显示
                                placeholder: '请输入名称或编码', // 输入框提示文字，默认请输入
                                clearable: true,
                                width: '320'
                            },
                            actionConfig: {
                                name: CONST.operationKey.docTmplHistory.table
                            },
                            basicFilter: {
                                show: true,
                                maxLength: 4
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
                        // fieldLinkConfig: {
                        //     fieldLink: false
                        // },
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: `${CONST.className.docTmpl}#name`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                this.$refs.docTmplDesign.open(row.id, row.oid, 'view');
                            }
                        },
                        addSeq: true,
                        addOperationCol: true,
                        slotsField: [
                            {
                                prop: 'erd.cloud.signature.entity.SignatureTmpl#isDefault',
                                type: 'default' // 显示字段内容插槽
                            },
                            {
                                prop: 'operation',
                                type: 'default' // 显示字段内容插槽
                            }
                        ],
                        pagination: {
                            showPagination: true
                        }
                    }
                };
            }
        },
        methods: {
            goBack: function () {
                this.$router.replace({
                    path: '/docTmpl'
                });
            },
            // 刷新表格方法
            refreshTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')({ conditions: 'default' });
            },
            onEdit(row) {
                let self = this;
                function checkout(row) {
                    let attrRawList = row.attrRawList || [];
                    let iterationInfoState = attrRawList.find((i) => i.attrName === `iterationInfo.state`);
                    if (iterationInfoState && iterationInfoState.value === 'CHECKED_IN') {
                        self.isCancelNeedCheckInFlag = true;
                        return self.$famHttp({
                            url: '/doc/common/checkout',
                            params: {
                                oid: row.oid,
                                className: 'erd.cloud.signature.entity.SignatureTmpl'
                            }
                        });
                    } else {
                        self.isCancelNeedCheckInFlag = false;
                        return Promise.resolve({
                            success: true,
                            data: { rawData: { oid: { value: row.oid }, id: { value: row.id } } }
                        });
                    }
                }
                checkout(row).then((resp) => {
                    this.currentEditObjOid = resp.data.rawData.oid.value;
                    if (resp.success) {
                        this.$refs.docTmplDesign.open(resp.data.rawData.id.value, resp.data.rawData.oid.value);
                    }
                });
            },
            onRevise(data) {
                this.$refs.reviseOperate.open(data);
            },
            // 按钮配置
            getActionConfig(row) {
                return {
                    name: CONST.operationKey.docTmplHistory.row,
                    objectOid: row.oid
                };
            },
            /**
             * 行操作
             * @param type
             * @param data
             */
            onCommand(type, data) {
                const eventClick = {
                    SIGNATURE_TMPL_EDIT: this.onEdit,
                    SIGNATURE_TMPL_REVISE: this.onRevise,
                    SIGNATURE_TMPL_ABANDON: this.onDelete,
                    SIGNATURE_TMPL_PUBLISH: this.onPublish
                };
                eventClick[type.name] && eventClick[type.name](data);
            },
            setDefaultTemplate(defaultTemplateId, row) {
                let self = this;
                this.$refs.famViewTable.$refs.FamAdvancedTable.tableData.forEach((i) => {
                    i.isDefault = false;
                });
                row.isDefault = true;
                this.$famHttp({
                    url: `/doc/signature/v1/tmpl/set/default/${defaultTemplateId}`,
                    data: {
                        className: 'erd.cloud.signature.entity.SignatureTmpl'
                    },
                    method: 'put'
                }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(self.i18nMappingObj.success);
                        // self.refreshTable();
                    }
                });
            },
            onDelete(row) {
                this.$confirm(`${this.i18nMappingObj.deleteConfirm}?`, this.i18nMappingObj.delete, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                })
                    .then(() => {
                        // let total = this.$refs.famViewTable.$refs.FamAdvancedTable.pagination.total;
                        let version = row.version;
                        let isLowVersion = version === 'A.1';
                        // let isSingleData = total * 1 === 1;
                        let attrRawList = row.attrRawList || [];
                        let iterationInfoState = attrRawList.find((i) => i.attrName === `iterationInfo.state`);
                        if (iterationInfoState && iterationInfoState.value === 'CHECKED_IN') {
                            this.$famHttp({
                                url: '/fam/common/batchResetState',
                                method: 'post',
                                data: {
                                    className: CONST.className.docTmpl,
                                    resetVoList: [
                                        {
                                            oid: row.oid,
                                            stateName: 'OBSOLESCENCE' // 已废弃
                                        }
                                    ]
                                }
                            }).then(() => {
                                this.$famHttp({
                                    url: '/fam/deleteByIds',
                                    method: 'DELETE',
                                    data: {
                                        oidList: [isLowVersion ? row.masterRef : row.oid],
                                        className: isLowVersion
                                            ? CONST.className.docTmplMaster
                                            : CONST.className.docTmpl,
                                        category: 'DELETE'
                                    }
                                }).then((resp) => {
                                    if (resp.success) {
                                        this.$message.success(this.i18nMappingObj.success);
                                    }
                                    if (isLowVersion) {
                                        this.goBack();
                                    } else {
                                        this.refreshTable();
                                    }
                                });
                            });
                        } else {
                            this.$famHttp({
                                url: '/doc/common/undo/checkout',
                                method: 'get',
                                params: {
                                    oid: row.oid,
                                    className: 'erd.cloud.signature.entity.SignatureTmpl'
                                }
                            }).then(() => {
                                this.refreshTable();
                            });
                        }
                    })
                    .catch(() => {});
            },
            onPublish(row) {
                this.$famHttp({
                    url: '/fam/common/batchResetState',
                    method: 'post',
                    data: {
                        className: CONST.className.docTmpl,
                        resetVoList: [
                            {
                                oid: row.oid,
                                stateName: 'RELEASED'
                            }
                        ]
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18nMappingObj.success);
                        this.refreshTable();
                    }
                });
            },
            handleCancel() {
                if (this.isCancelNeedCheckInFlag && this.currentEditObjOid) {
                    this.$famHttp({
                        url: '/doc/common/undo/checkout',
                        method: 'get',
                        params: {
                            oid: this.currentEditObjOid,
                            className: 'erd.cloud.signature.entity.SignatureTmpl'
                        }
                    }).then(() => {
                        this.refreshTable();
                    });
                } else {
                    this.refreshTable();
                }
            }
            // loadLifecycle(oid) {
            //     return this.$famHttp({
            //         url: '/fam/common/template/states',
            //         method: 'post',
            //         data: {
            //             branchIdList: [oid],
            //             className: CONST.className.docTmpl,
            //             successionType: 'SET_STATE'
            //         }
            //     });
            // }
        }
    };
});
