define([
    'text!' + ELMP.resource('biz-signature/docTmpl/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], (template, CONST) => {
    const FamKit = require('fam:kit');

    return {
        name: 'SignatureDocTmplManage',
        template,
        components: {
            FamViewTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            DocTmplForm: FamKit.asyncComponent(ELMP.resource('biz-signature/docTmpl/docTmplForm/index.js')),
            ImportDialog: FamKit.asyncComponent(ELMP.resource('biz-signature/components/importDialog/index.js'))
        },
        props: {},
        data() {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'createDocTmpl',
                    'editWatermark',
                    'confirm',
                    'selectTip',
                    'operate',
                    'signatureSearchTips',
                    'cancel',
                    'signatureTmpl'
                ]),
                CONST: CONST
            };
        },
        computed: {
            defaultBtnConfig() {
                return {
                    label: this.i18nMappingObj.operate,
                    type: 'text'
                };
            },
            viewTableConfig() {
                return {
                    tableKey: CONST.tableKey.docTmplMaster, // UserViewTable productViewTable
                    viewTableTitle: this.i18nMappingObj.signatureTmpl,
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        viewOid: '', // 视图id
                        searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            url: '/fam/search', // 表格数据接口
                            data: {
                                className: CONST.className.docTmplMaster,
                                orderBy: 'createTime',
                                sortBy: 'desc'
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
                                                obj[`${CONST.className.docTmplMaster}#${ite.attrName}`] =
                                                    ite.displayName;
                                                obj[ite.attrName] = ite.value;
                                                if (_.isObject(ite.value)) {
                                                    obj[ite.attrName] = ite.displayName;
                                                    obj[`${CONST.className.docTmplMaster}#${ite.attrName}`] =
                                                        ite.displayName;
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
                            data: { className: CONST.className.docTmplMaster }
                        },
                        firstLoad: true,
                        isDeserialize: true, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                        toolbarConfig: {
                            // 工具栏
                            fuzzySearch: {
                                show: true, // 是否显示普通模糊搜索，默认显示
                                placeholder: this.i18nMappingObj.signatureSearchTips, // 输入框提示文字，默认请输入
                                clearable: true,
                                width: '320'
                                // isLocalSearch: false, // 使用前端搜索
                                // searchCondition: [`${this.$store.getters.className('codeRule')}#name`]
                            },
                            actionConfig: {
                                name: CONST.operationKey.docTmpl.table
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
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: `${CONST.className.docTmplMaster}#name`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                this.$router.push({
                                    path: `/docTmpl/history/${row.identifierNo}`
                                });
                            }
                        },
                        // columnWidths: {
                        //     operation: 300
                        // },
                        addSeq: true,
                        addOperationCol: true,
                        slotsField: [
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
            // 刷新表格方法
            refreshTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')({ conditions: 'default' });
            },
            /**
             * 表头操作
             * @param action
             * @param row
             */
            actionClick(action, row) {
                const eventClick = {
                    SIGNATURE_TMPL_MASTER_CREATE: this.onCreate,
                    SIGNATURE_TMPL_IMPORT: this.onImport,
                    SIGNATURE_TMPL_EXPORT: this.onExport
                };
                eventClick?.[action.name] && eventClick?.[action.name](row);
            },
            onCreate() {
                this.$refs.docTmplForm.open('', CONST.layoutKey.create);
            },
            onEdit(data) {
                this.$refs.docTmplForm.open(data.oid, CONST.layoutKey.update);
            },
            // 操作按钮配置
            getActionConfig(row) {
                return {
                    name: CONST.operationKey.docTmpl.row,
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
                    SIGNATURE_TMPL_MASTER_EDIT: this.onEdit
                };
                eventClick[type.name] && eventClick[type.name](data);
            },
            onImport() {
                this.$refs.importModal.show();
            },
            onExport(row) {
                let ids = [];
                row?.forEach((item) => {
                    ids.push(item.id);
                });
                this.$famHttp({
                    url: '/file/signature/v1/tmpl/export',
                    method: 'put',
                    data: ids
                });
                this.$message({
                    type: 'success',
                    message: this.i18nMappingObj.exporting,
                    showClose: true,
                    dangerouslyUseHTMLString: true
                });
            }
        }
    };
});
