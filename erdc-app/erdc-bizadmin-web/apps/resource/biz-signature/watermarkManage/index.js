define([
    'text!' + ELMP.resource('biz-signature/watermarkManage/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], (template, CONST) => {
    const FamKit = require('fam:kit');

    return {
        name: 'SignatureWatermarkManage',
        template,
        components: {
            FamViewTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            WatermarkForm: FamKit.asyncComponent(ELMP.resource('biz-signature/watermarkManage/watermarkForm/index.js')),
            ImportDialog: FamKit.asyncComponent(ELMP.resource('biz-signature/components/importDialog/index.js'))
        },
        props: {},
        data() {
            let paveStylesMap = {};
            CONST.paveStyles.forEach((i) => {
                paveStylesMap[i.value] = i;
            });
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'watermarkManage',
                    'operate',
                    'paveStyle',
                    'signatureWatermarkCenteredMagnification',
                    'signatureWatermarkSparseTile',
                    'signatureWatermarkDenseTile',
                    'deleteConfirm',
                    'deleteConfirmDocWaterTips',
                    'confirm',
                    'deleteSuccess',
                    'cancel',
                    'signatureSearchTips'
                ]),
                oid: '',
                CONST: CONST,
                paveStylesMap: paveStylesMap
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
                    tableKey: CONST.tableKey.watermark, // UserViewTable productViewTable
                    viewTableTitle: this.i18nMappingObj.watermarkManage,
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        viewOid: '', // 视图id
                        searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            url: '/fam/search', // 表格数据接口
                            data: {
                                className: CONST.className.watermark,
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
                                                obj[`${CONST.className.watermark}#${ite.attrName}`] = ite.displayName;
                                                obj[ite.attrName] = ite.value;
                                                if (_.isObject(ite.value)) {
                                                    obj[ite.attrName] = ite.displayName;
                                                    obj[`${CONST.className.watermark}#${ite.attrName}`] =
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
                            data: { className: CONST.className.watermark }
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
                                name: CONST.operationKey.watermark.table
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
                            fieldLink: false
                        },
                        addSeq: true,
                        addOperationCol: true,
                        slotsField: [
                            {
                                prop: 'operation',
                                type: 'default' // 显示字段内容插槽
                            }
                        ]
                    }
                };
            }
        },
        methods: {
            // 刷新表格方法
            refreshTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')();
            },
            actionClick(action, row) {
                const eventClick = {
                    DOC_WATERMARK_CREATE: this.onCreate,
                    DOC_WATERMARK_DELETE: this.onDelete,
                    DOC_WATERMARK_IMPORT: this.onImport,
                    DOC_WATERMARK_EXPORT: this.onExport
                };
                eventClick?.[action.name] && eventClick?.[action.name](row);
            },
            onCreate() {
                this.$refs.watermarkForm.open('', CONST.layoutKey.create);
            },
            onEdit(data) {
                this.$refs.watermarkForm.open(data.oid, CONST.layoutKey.update);
            },
            onDelete(rows) {
                if (rows.length <= 0) {
                    this.$message.warning(this.i18nMappingObj.selectTip);
                } else {
                    this.$confirm(this.i18nMappingObj.deleteConfirmDocWaterTips, this.i18nMappingObj.deleteConfirm, {
                        confirmButtonText: this.i18nMappingObj.confirm,
                        cancelButtonText: this.i18nMappingObj.cancel,
                        type: 'warning'
                    }).then(() => {
                        this.$famHttp({
                            url: '/fam/deleteByIds',
                            data: {
                                oidList: rows.map((i) => i.oid),
                                className: CONST.className.watermark,
                                category: 'DELETE'
                            },
                            method: 'DELETE'
                        })
                            .then((resp) => {
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj.deleteSuccess,
                                    showClose: true
                                });
                                this.refreshTable();
                            })
                            .catch(() => {});
                    });
                }
            },
            // 操作按钮配置
            getActionConfig(row) {
                return {
                    name: CONST.operationKey.watermark,
                    objectOid: row.oid
                };
            },
            onCommand(type, data) {
                const eventClick = {
                    DOC_WATERMARK_EDIT: this.onEdit
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
                    url: '/file/watermark/v1/export',
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
