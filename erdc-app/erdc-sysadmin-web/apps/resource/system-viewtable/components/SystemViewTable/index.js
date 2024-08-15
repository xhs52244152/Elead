define([
    'erdc-kit',
    'text!' + ELMP.resource('system-viewtable/components/SystemViewTable/index.html'),
    'css!' + ELMP.resource('system-viewtable/styles/index.css')
], function (utils, template) {
    const ErdcKit = require('erdcloud.kit');
    const viewItemsEnum = {
        number: 'seqCol',
        selectionBox: 'selectBoxCol',
        icon: 'iconCol',
        operate: 'operationCol',
        refresh: 'refreshBtn',
        config: 'configBtn',
        advancedSearch: 'advancedFilterBtn',
        hasView: 'tabs'
    };

    return {
        name: 'systemViewTable',
        template,
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-viewtable/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    viewTableManage: this.getI18nByKey('视图表格管理'),
                    create: this.getI18nByKey('创建'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    edit: this.getI18nByKey('编辑'),
                    delete: this.getI18nByKey('删除'),

                    internalName: this.getI18nByKey('内部名称'),
                    tableViewName: this.getI18nByKey('表格视图名称'),
                    automaticMemory: this.getI18nByKey('自动记忆'),
                    conditions: this.getI18nByKey('可添加条件'),
                    addView: this.getI18nByKey('是否添加视图'),
                    modify: this.getI18nByKey('是否修改'),
                    creater: this.getI18nByKey('创建人'),
                    operation: this.getI18nByKey('操作'),
                    cancelTips: this.getI18nByKey('是否放弃编辑'),
                    tipsTitle: this.getI18nByKey('提示'),
                    deleteSuccess: this.getI18nByKey('删除成功')
                },
                importVisible: false,
                importRequestConfig: {},
                exportVisible: false,
                exportRequestConfig: {},
                viewTableForm: {
                    oid: '',
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false
                },
                isChanged: false
            };
        },
        watch: {
            '$route.query': {
                immediate: true,
                handler(query) {
                    if (query.openCreateViewTable === 'true') {
                        this.fnShowDialog('create');
                        const newQuery = ErdcKit.deepClone(query);
                        delete newQuery.openCreateViewTable;
                        this.$router.replace({ ...this.$route, query: newQuery });
                    }
                }
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            ViewTableForm: ErdcKit.asyncComponent(ELMP.resource('system-viewtable/components/ViewTableForm/index.js')),
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        computed: {
            viewTableConfig() {
                return {
                    tableKey: 'systemViewTable',
                    viewTableTitle: this.i18nMappingObj['viewTableManage'],
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        viewOid: '', // 视图id
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            // url: '/fam/search', // 表格数据接口
                            params: {}, // 路径参数
                            headers: {
                                'App-Name': 'ALL'
                            },
                            method: 'post', // 请求方法（默认get）
                            data: {
                                className: this.className
                            }
                        },
                        isDeserialize: true, // 是否反序列数据源
                        firstLoad: true, // 进入页面就执行查询
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: true
                            }
                        },
                        headerRequestConfig: {
                            // 表格列头查询配置(默认url: '/fam/table/head')
                            method: 'POST',
                            data: {
                                className: this.className
                            }
                        },
                        sortFixRight: true, // 排序图标是否显示在右边
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                            tableKey: 200,
                            nameI18nJson: 200,
                            operation: 100
                        },
                        fieldLinkConfig: {
                            linkClick: (row) => {
                                // 超链接事件
                                this.linkClick(row);
                            }
                        },
                        slotsField: [
                            {
                                prop: `${this.className}#pageStyle`,
                                type: 'default'
                            },
                            {
                                prop: `${this.className}#viewConfigItems`,
                                type: 'default'
                            },
                            {
                                prop: 'operation',
                                type: 'default'
                            }
                        ],
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
                        tableBaseEvent: {
                            // 基础表格的事件，参考vxe官方API(这里事件官方写什么名称就是什么，不能驼峰命名)
                            // 'checkbox-change': this.selectChangeEvent
                        }
                    }
                };
            },
            className() {
                return this.$store.getters.className('tableDefinition');
            },
            // 插槽名称
            slotName() {
                return {
                    pageStyle: `column:default:${this.className}#pageStyle:content`,
                    viewConfigItems: `column:default:${this.className}#viewConfigItems:content`
                };
            }
        },
        methods: {
            // 创建、编辑表格
            fnFormSubmit(formRef) {
                this.viewTableForm.loading = true;
                this.$refs[formRef]
                    .submit()
                    .then(async () => {
                        this.toggleShow();
                        await this.$refs.famViewTable?.$refs?.FamViewNavbar.getTableViews();
                        this.$refs['famViewTable'].getTableInstance('advancedTable', 'refreshTable')();
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.viewTableForm.loading = false;
                    });
            },
            // 编辑
            fnEditTable(row) {
                this.viewTableForm.oid = row?.oid || '';
                this.viewTableForm.visible = true;
                this.viewTableForm.editable = true;
            },
            // 删除
            fnDeleteTableRow(row) {
                let tableName = row[`${this.className}#nameI18nJson`];
                let confirmText = utils.setTextBySysLanguage({
                    CN: `您确定删除【${tableName}】吗？`,
                    EN: `Are you sure delete [${tableName}]?`
                });
                this.$confirm(confirmText, this.i18nMappingObj['tipsTitle'], {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel']
                })
                    .then(() => {
                        this.$famHttp({
                            url: `/fam/delete`,
                            params: {
                                oid: row.oid
                            },
                            method: 'delete'
                        }).then((resp) => {
                            const { success, message } = resp;
                            if (success) {
                                this.$message.success(this.i18nMappingObj['deleteSuccess']);
                                this.$refs['famViewTable'].getTableInstance(
                                    'advancedTable',
                                    'refreshTable'
                                )({ conditions: 'default' });
                            } else {
                                this.$message({
                                    type: 'error',
                                    message: message
                                });
                            }
                        });
                    })
                    .catch(() => {
                        // do nothing.
                    });
            },
            linkClick(row) {
                let serializeRow = {};
                if (row && row?.attrRawList) {
                    row.attrRawList.forEach((item) => {
                        if (!item.attrName.includes('I18nJson')) {
                            let attrName = item.attrName.split('#').slice(-1);
                            serializeRow[attrName] = item.value;
                        }
                    });
                }
                let extendRow = $.extend(true, row, serializeRow);
                this.$emit('switch-component', 'viewManager', extendRow);
            },
            getPageStyleName(row) {
                const currentRow = ErdcKit.deserializeArray(row.attrRawList);
                return this.i18n[currentRow[`${this.className}#pageStyle`]];
            },
            getViewConfigItems(row) {
                const currentRow = ErdcKit.deserializeArray(row.attrRawList);
                const viewConfigItems = currentRow[`${this.className}#viewConfigItems`];
                const viewConfigItemsArr = viewConfigItems?.split(',') || [];
                return viewConfigItemsArr.map((item) => this.i18n[viewItemsEnum[item]]).join();
            },
            // 显示模态框
            fnShowDialog(op) {
                if (op === 'create') {
                    this.viewTableForm.visible = true;
                }
            },
            // 关闭弹窗表单
            fnCloseForm() {
                this.toggleShow();
            },
            showImportDialog() {
                this.importVisible = true;
            },
            showExportDialog() {
                this.exportVisible = true;
            },
            toggleShow() {
                this.viewTableForm = {
                    oid: '',
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false
                };
                this.isChanged = false;
            },
            fnFormChange(changed) {
                this.isChanged = changed;
            },
            async refreshTable() {
                await this.$refs.famViewTable?.$refs?.FamViewNavbar.getTableViews();
                const pagination = this.$refs['famViewTable'].getTableInstance('advancedTable', 'pagination');
                this.$refs['famViewTable'].getTableInstance('advancedTable', 'refreshTable')({ pagination });
            }
        }
    };
});
