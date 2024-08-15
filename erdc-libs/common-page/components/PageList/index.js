define([
    'text!' + ELMP.resource('common-page/components/PageList/index.html'),
    'EventBus',
    'css!' + ELMP.resource('common-page/components/PageList/style.css')
], function (template, EventBus) {
    const FamKit = require('erdcloud.kit');

    const getObjectTitle = function (prefix, object) {
        const nameI18nJson = object?.nameI18nJson || {
            zh_cn: object?.displayName || object?.name || '',
            en_us: object?.displayName || object?.name || ''
        };
        return FamKit.translateI18n(
            Object.keys(nameI18nJson).reduce((prev, key) => {
                prev[key] = [prefix, nameI18nJson[key]].filter(Boolean).join(' - ');
                return prev;
            }, {})
        );
    };

    return {
        template,
        props: {
            className: {
                type: String,
                default: ''
            },
            routeQueryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            classNameKey: {
                type: String,
                default: ''
            }
        },
        components: {
            FamViewTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            LayoutInDialog: FamKit.asyncComponent(ELMP.resource('common-page/components/LayoutInDialog/index.js')),
            FamExport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js')),
            FamImport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js'))
        },
        data() {
            return {
                dialogVisible: false,
                exportVisible: false,
                importVisible: false,
                dialogFormInfo: {},
                businessName: '',
                requestConfig: {},
                formOid: ''
            };
        },
        computed: {
            vm() {
                return this;
            },
            menuStatus() {
                return this.routeQueryParams.menuStatus;
            },
            openType() {
                return this.routeQueryParams.openType;
            },
            view() {
                return this.routeQueryParams.view || `${this.classNameKey}_LIST`;
            },
            matchResource() {
                return this.$store.getters['route/matchResource'](this.$route) || {};
            },
            viewTableConfig() {
                return {
                    tableKey: this.view, // UserViewTable productViewTable
                    saveAs: false, // 是否显示另存为
                    viewTableTitle: this.matchResource?.name,
                    tableConfig: this.tableConfig
                };
            },
            tableConfig() {
                let tableConfig = {
                    tableRequestConfig: {},
                    columnWidths: {
                        operation: window.LS.get('lang_current') === 'en_us' ? 180 : 120
                    },
                    addCheckbox: true,
                    addSeq: true,
                    toolbarConfig: {
                        // 工具栏
                        valueKey: 'attrName',

                        // 模糊搜索
                        fuzzySearch: {
                            show: false
                        },

                        // 基础筛选
                        basicFilter: {
                            show: true // 是否显示基础筛选，默认不显示
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
                    fieldLinkConfig: this.fieldLinkConfig,
                    pagination: {
                        showPagination: true,
                        // 分页
                        pageSize: 20,
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    slotsField: [
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ]
                };
                tableConfig.toolbarConfig = _.extend(tableConfig.toolbarConfig, {
                    actionConfig: {
                        name: `${this.classNameKey}_TABLE_ACTION`
                    }
                });
                return tableConfig;
            },
            fieldLinkConfig() {
                return {
                    fieldLink: true,
                    // 是否添加列超链接
                    fieldLinkName: `${this.className}#name`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                    linkClick: (row) => {
                        // 超链接事件
                        this.onDetail(row);
                    }
                };
            }
        },
        methods: {
            refreshTable() {
                this.$refs.famCommonPageViewTable.refreshTable();
            },
            onDetail(rowData) {
                this.$router.push({
                    path: `/space/common-page/info`,
                    query: {
                        ...this.routeQueryParams,
                        className: this.className,
                        pageType: 'detail',
                        pid: rowData.oid,
                        oid: rowData.oid,
                        typeOid: rowData.typeReference,
                        title: getObjectTitle('详情', rowData)
                    }
                });
            },
            getActionConfig(row) {
                return {
                    className: this.className,
                    name: `${this.classNameKey}_ROW_ACTION`,
                    objectOid: row.oid
                };
            },
            onCommand(btnInfo = {}, rowData = {}) {
                switch (btnInfo.name) {
                    case `${this.classNameKey}_CREATE`:
                        this.handlerCreate(rowData);
                        break;
                    case `${this.classNameKey}_UPDATE`:
                        this.handlerUpdate(rowData);
                        break;
                    case `${this.classNameKey}_DELETE`:
                        this.handlerDelete(rowData);
                        break;
                    case `${this.classNameKey}_DETAIL`:
                        this.onDetail(rowData);
                        break;
                    case `${this.classNameKey}_COMMON_END_PROCESS`:
                    default:
                        this.handlerBtnEvent(btnInfo, rowData);
                        break;
                }
            },
            handlerCommonStartProcess() {
                const containerRef = this.$store.state?.app?.container?.oid || '';
                const className = this.className;
                return this.$router.push({
                    path: '/container/bpm-resource/workflowLauncher/LAUNCH_PROCESS_DEMO',
                    query: {
                        holderRef: '',
                        containerRef,
                        className
                    }
                });
            },
            actionClick(btnInfo, selectedData) {
                switch (btnInfo.name) {
                    case `${this.classNameKey}_CREATE`:
                        this.handlerCreate();
                        break;
                    case `${this.classNameKey}_UPDATE`:
                        this.handlerUpdate(selectedData);
                        break;
                    case `${this.classNameKey}_DELETE`:
                        this.handlerBatchDelete(btnInfo, selectedData);
                        break;
                    case `${this.classNameKey}_EXPORT`:
                        this.handlerBatchExport(btnInfo, selectedData);
                        break;
                    case `${this.classNameKey}_IMPORT`:
                        this.handlerBatchImport(btnInfo, selectedData);
                        break;
                    case `${this.classNameKey}_COMMON_START_PROCESS`:
                        this.handlerCommonStartProcess();
                        break;
                    default:
                        this.handlerBatchEvent(btnInfo, selectedData);
                        break;
                }
            },
            handlerCreate() {
                this.$router.push({
                    path: '/container/common-page/info',
                    query: {
                        ...this.routeQueryParams,
                        pageType: 'create',
                        title: '创建'
                    }
                });
            },
            handlerUpdate(rowData) {
                this.$router.push({
                    path: '/space/common-page/info',
                    query: {
                        ...this.routeQueryParams,
                        pageType: 'edit',
                        oid: rowData.oid,
                        pid: rowData.oid,
                        typeOid: rowData.typeReference,
                        title: getObjectTitle('编辑', rowData)
                    }
                });
            },
            handlerDelete(rowData) {
                this.$confirm('确认删除此行吗？', {
                    type: 'warning',
                    title: '信息'
                }).then(() => {
                    this.$famHttp('/fam/delete', {
                        method: 'DELETE',
                        params: {
                            oid: rowData.oid
                        },
                        className: this.className
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: `删除成功`,
                            showClose: true
                        });
                        this.refreshTable();
                    });
                });
            },
            handlerBatchDelete(btnInfo, selectedData) {
                if (!selectedData || !selectedData.length) {
                    this.$message({
                        type: 'warning',
                        message: '请选择要删除的行!'
                    });
                    return;
                }
                const deleteIds = selectedData.map((item) => item.oid);
                this.$confirm('确认删除选中的数据吗？', {
                    type: 'warning',
                    title: '提示'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/deleteByIds',
                        method: 'delete',
                        params: {},
                        data: {
                            oidList: deleteIds,
                            className: this.className
                        }
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18n.deleteSuccess,
                            showClose: true
                        });
                        this.refreshTable();
                    });
                });
            },
            handlerBatchExport() {
                this.exportVisible = true;
                this.businessName = this.classNameKey + 'Export';
                const requestConfig = this.$refs?.famCommonPageViewTable?.getTableInstance(
                    'advancedTable',
                    'requestConfig'
                );
                this.requestConfig = {
                    data: {
                        className: this.className,
                        tableSearchDto: requestConfig?.data || {}
                    }
                };
            },
            handlerBatchImport() {
                this.importVisible = true;
                this.businessName = this.classNameKey + 'Import';
                const requestConfig = this.$refs?.famCommonPageViewTable?.getTableInstance(
                    'advancedTable',
                    'requestConfig'
                );
                this.requestConfig = {
                    data: {
                        className: this.className,
                        tableSearchDto: requestConfig?.data || {}
                    }
                };
            },
            handlerBtnEvent(btnInfo, rowData) {
                EventBus.emit('commonPage:table:btn:click', { btnInfo, rowData, instance: this });
            },
            handlerBatchEvent(btnInfo, selectedData) {
                EventBus.emit('commonPage:operation:btn:click', { btnInfo, selectedData, instance: this });
            },
            handlerClickFormEditBtn() {
                this.$set(this.dialogFormInfo, 'dialogFormType', 'UPDATE');
            },
            handlerDialogSuccess(dialogVisible, refreshTable) {
                this.dialogVisible = dialogVisible;
                if (refreshTable) {
                    this.refreshTable();
                }
            }
        }
    };
});
