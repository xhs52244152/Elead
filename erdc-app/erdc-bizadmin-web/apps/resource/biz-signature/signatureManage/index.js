define(['text!' + ELMP.resource('biz-signature/signatureManage/index.html'), ELMP.resource('biz-signature/CONST.js')], (
    template,
    CONST
) => {
    const FamKit = require('fam:kit');

    return {
        name: 'SignatureManage',
        template,
        components: {
            FamViewTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            SignatureForm: FamKit.asyncComponent(ELMP.resource('biz-signature/signatureManage/signatureForm/index.js')),
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
                    'operate',
                    'cancel',
                    'signatureSearchTips',
                    'signatureManage',
                    'selectTip'
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
                    tableKey: CONST.tableKey.signature, // UserViewTable productViewTable
                    viewTableTitle: this.i18nMappingObj.signatureManage,
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        viewOid: '', // 视图id
                        searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            url: '/fam/search', // 表格数据接口
                            data: {
                                className: CONST.className.signature,
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
                                                obj[`${CONST.className.signature}#${ite.attrName}`] = ite.displayName;
                                                obj[ite.attrName] = ite.value;
                                                if (_.isObject(ite.value)) {
                                                    obj[ite.attrName] = ite.displayName;
                                                    obj[`${CONST.className.signature}#${ite.attrName}`] =
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
                            data: { className: CONST.className.signature }
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
                                name: CONST.operationKey.signature.table
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
                            fieldLinkName: `${CONST.className.signature}#name`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                this.$router.push({
                                    path: `/signatureManage/history/${row.code}`,
                                    query: {
                                        fromUrl: this.$route.fullPath
                                    }
                                });
                            }
                        },
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
            },
            type() {
                const viewInfo = this.$refs?.famViewTable?.viewInfo;
                const conditionDtos = viewInfo?.conditionDtos || [];
                const conditionDto = conditionDtos.find((i) => i.attrName === `${CONST.className.signature}#signType`);
                return conditionDto.value1;
            }
        },
        methods: {
            // 刷新表格方法
            refreshTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')({ conditions: 'default' });
            },
            actionClick(action, row) {
                const eventClick = {
                    SIGNATURE_PICTURE_CREATE: this.onCreate,
                    SIGNATURE_PICTURE_IMPORT: this.onImport,
                    SIGNATURE_PICTURE_EXPORT: this.onExport
                };
                eventClick?.[action.name] && eventClick?.[action.name](row);
            },
            onCreate() {
                this.$refs.signatureForm.open('', CONST.layoutKey.create);
            },
            onEdit(data) {
                this.$refs.signatureForm.open(data.id, CONST.layoutKey.update, data);
            },
            onDelete(row) {
                this.$confirm(this.i18nMappingObj.deleteConfirmDocTmplTips, this.i18nMappingObj.deleteConfirm, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: {
                            oid: row.oid
                        },
                        method: 'DELETE'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.deleteSuccess,
                            showClose: true
                        });
                        this.refreshTable();
                    });
                });
            },
            // 操作按钮配置
            getActionConfig(row) {
                return {
                    name: CONST.operationKey.signature,
                    objectOid: row.oid
                };
            },
            onCommand(type, data) {
                const eventClick = {
                    SIGNATURE_PICTURE_EDIT: this.onEdit
                };
                eventClick[type.name] && eventClick[type.name](data);
            },
            onImport() {
                this.$refs.importModal.show();
            },
            importSucess(file) {
                const data = new FormData();
                data.append('file', file);
                this.$famHttp({
                    url: '/file/signature/v1/picture/upload',
                    method: 'post',
                    data: data,
                    params: {
                        type: this.type,
                        className: 'erd.cloud.site.console.file.entity.FileInfo'
                    }
                });
                this.$message({
                    message: this.i18nMappingObj.systemImport,
                    type: 'success',
                    showClose: true,
                    dangerouslyUseHTMLString: true
                });
                this.refreshTable();
            },
            onExport(row) {
                let ids = [];
                let codes = '';
                if (row.length) {
                    row.forEach((item) => {
                        ids.push(item.code);
                    });
                    codes = ids.join(',');
                }
                this.$famHttp({
                    url: '/file/signature/v1/picture/download',
                    method: 'put',
                    params: {
                        type: this.type,
                        codes: codes
                    }
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
