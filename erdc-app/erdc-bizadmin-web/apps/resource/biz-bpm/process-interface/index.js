define([
    'text!' + ELMP.resource('biz-bpm/process-interface/template.html'),
    'css!' + ELMP.resource('biz-bpm/process-interface/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'processInterface',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            InterfaceForm: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/process-interface/components/InterfaceForm/index.js')
            ),
            AssociatedProcessDef: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/process-interface/components/AssociatedProcessDef/index.js')
            ),
            HistoricalEdition: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/process-interface/components/HistoricalEdition/index.js')
            ),
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    '提示',
                    '确定',
                    '取消',
                    '创建',
                    '删除',
                    '查看接口',
                    '新增接口',
                    '编辑接口',
                    '创建成功',
                    '创建失败',
                    '更新成功',
                    '更新失败',
                    '编辑',
                    '更多',
                    '请勾选要删除的数据',
                    '你确定要删除数据吗？',
                    '删除成功',
                    '删除失败',
                    '关联的流程定义',
                    '历史版本',
                    '请输入接口名称',
                    '接口设计'
                ]),
                // 接口详情
                interfaceForm: {
                    title: '',
                    oid: '',
                    masterRef: '',
                    readonly: false,
                    visible: false
                },
                // 关联的流程定义
                associatedProcessDef: {
                    title: '',
                    masterOId: '',
                    interfaceType: '',
                    visible: false
                },
                // 历史版本
                historicalEdition: {
                    title: '',
                    masterOId: '',
                    visible: false
                },
                // 导入接口
                dialogObj: {
                    visible: false,
                    is: null,
                    title: '',
                    loading: false,
                    props: {},
                    handleClick: () => {}
                },
                // 加载中
                loading: false
            };
        },
        computed: {
            className() {
                return this.$store.getters.className('businessInterface');
            },
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: 'BusinessInterfaceTable', // UserViewTable productViewTable
                    viewTableTitle: this.i18nMappingObj['接口设计'],
                    saveAs: false, // 是否显示另存为
                    tableConfig: this.tableConfig
                };
            },
            // 高级表格配置
            tableConfig() {
                return {
                    toolbarConfig: {
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        basicFilter: {
                            show: true
                        },
                        actionConfig: {
                            name: 'INTERFACE_CONFIG_CREATE',
                            containerOid: this.$store.state.space?.context?.oid || '',
                            className: this.className
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            this.interfaceForm.oid = row.oid || '';
                            this.interfaceForm.masterRef = row.masterRef || '';
                            this.interfaceForm.readonly = true;
                            this.popover({
                                field: 'interfaceForm',
                                title: this.i18nMappingObj['查看接口'],
                                visible: true
                            });
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: '60px'
                    },
                    slotsField: [
                        {
                            prop: 'icon',
                            type: 'default'
                        },
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
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
                };
            }
        },
        methods: {
            // 表格空数据赋值为'--'
            handlerData(tableData, callback) {
                tableData = _.map(tableData, (item) => ErdcKit.deepClone(item)) || [];
                _.each(tableData, (item) => {
                    _.each(item, (value, key) => {
                        typeof value !== 'object' && (value === '' || value === undefined) && (item[key] = '--');
                    });
                });
                callback(tableData);
            },
            // 功能按钮点击事件
            actionClick(type, data) {
                const eventClick = {
                    // 创建接口
                    INTERFACE_CONFIG_CREATE: this.createInterface,
                    // 删除接口
                    INTERFACE_CONFIG_DELETE: this.batchDeletingInterfaces,
                    // 导入流程
                    INTERFACE_CONFIG_IMPORT: this.importInterface,
                    // 导出流程
                    INTERFACE_CONFIG_EXPORT: this.exportInterface,
                    // 编辑接口
                    INTERFACE_CONFIG_EDIT: this.editingInterface,
                    // 关联的流程定义
                    INTERFACE_PROCESSES_DEF: this.viewAssociatedProcessDef,
                    // 历史版本
                    INTERFACE_HISTORY_VERSION: this.viewHistoricalVersions
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'INTERFACE_CONFIG_MORE',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            // 创建接口
            createInterface() {
                this.popover({ field: 'interfaceForm', title: this.i18nMappingObj['新增接口'], visible: true });
            },
            // 查看历史版本
            viewHistoricalVersions(row) {
                this.historicalEdition.masterOId = row.masterRef || '';
                this.popover({ field: 'historicalEdition', title: this.i18nMappingObj['历史版本'], visible: true });
            },
            // 查看关联的流程定义
            viewAssociatedProcessDef(row) {
                this.associatedProcessDef.masterOId = row.masterRef || '';
                this.associatedProcessDef.interfaceType =
                    row[`${this.className}#interfaceType`] || '';
                this.popover({
                    field: 'associatedProcessDef',
                    title: this.i18nMappingObj['关联的流程定义'],
                    visible: true
                });
            },
            // 编辑接口
            editingInterface(row) {
                this.interfaceForm.oid = row.oid || '';
                this.interfaceForm.masterRef = row.masterRef || '';
                this.popover({ field: 'interfaceForm', title: this.i18nMappingObj['编辑接口'], visible: true });
            },
            // 确认批量删除
            batchDeletingInterfaces() {
                let { fnGetCurrentSelection } = this.$refs['famViewTable'] || {},
                    oidList = [];
                _.isFunction(fnGetCurrentSelection) && (oidList = fnGetCurrentSelection());
                if (!oidList.length) {
                    return this.$message.warning(this.i18nMappingObj['请勾选要删除的数据']);
                }
                oidList = _.map(oidList, (item) => item.oid);
                this.secondaryConfirmation(this.i18nMappingObj['你确定要删除数据吗？'], () => {
                    this.batchDeletingApi(oidList)
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success(this.i18nMappingObj['删除成功']);
                                this.refreshTable();
                            }
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                });
            },
            // 批量删除接口
            batchDeletingApi(oidList) {
                this.loading = true;
                return this.$famHttp({
                    url: `/bpm/deleteByIds`,
                    params: {},
                    data: {
                        className: this.className,
                        oidList: oidList
                    },
                    method: 'delete'
                });
            },
            // 二次确认框
            secondaryConfirmation(title, callback) {
                this.$confirm(title, this.i18nMappingObj['提示'], {
                    confirmButtonText: this.i18nMappingObj['确定'],
                    cancelButtonText: this.i18nMappingObj['取消'],
                    type: 'warning'
                }).then(() => {
                    _.isFunction(callback) && callback();
                });
            },
            // 导入接口
            importInterface() {
                this.dialogObj.visible = true;
            },
            // 导出接口
            exportInterface() {
                this.$famHttp({
                    url: '/bpm/export',
                    method: 'POST',
                    data: {
                        businessName: 'BusinessInterfaceExport'
                    }
                }).then(() => {
                    this.$message({
                        type: 'success',
                        dangerouslyUseHTMLString: true,
                        message: this.i18n.exporting,
                        showClose: true
                    });
                });
            },
            onImportSuccess() {
                this.refreshTable();
                this.dialogObj.visible = false;
                this.dialogObj.loading = false;
            },
            // 接口校验
            interfaceCheck() {
                let { interfaceForm = {} } = this.$refs || {},
                    { formVerification } = interfaceForm;
                let { submit, serializeEditableAttr } = formVerification();
                submit().then((resp) => {
                    if (resp.valid) {
                        const form = serializeEditableAttr() || {};
                        let { value: interfaceCategory } = _.find(form, { attrName: 'interfaceCategory' }) || {};
                        let interfaceType = _.find(form, { attrName: 'interfaceType' }) || {};
                        if (interfaceCategory === 'HANDLE_INTERFACE') {
                            if (_.isEmpty(interfaceType)) {
                                form.push({
                                    attrName: 'interfaceType',
                                    value: 'REST'
                                });
                            } else {
                                interfaceType.value = 'REST';
                            }
                        }
                        if (interfaceCategory === 'BUSINESS' && interfaceType.value === 'DUBBO') {
                            form.push({
                                attrName: 'address',
                                value: resp.data.address
                            });
                            form.push({
                                attrName: 'rpcInterface',
                                value: resp.data.rpcInterface
                            });
                        }
                        this.operInterfaceObject({ form })
                            .then((resp) => {
                                if (resp.success) {
                                    this.$message.success(
                                        this.interfaceForm.oid
                                            ? this.i18nMappingObj['更新成功']
                                            : this.i18nMappingObj['创建成功']
                                    );
                                    this.popover({ field: 'interfaceForm' });
                                    this.refreshTable();
                                }
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    }
                });
            },
            // 创建更新接口对象
            operInterfaceObject({ form }) {
                let data = {},
                    associatedAttrList = ['name', 'description'];
                data.relationList = [
                    {
                        attrRawList: _.filter(form, (item) => !associatedAttrList.includes(item.attrName)),
                        className: this.className
                    }
                ];
                this.interfaceForm.oid && (data.relationList[0].oid = this.interfaceForm.oid);
                data.associationField = 'masterRef';
                data.className = `${this.className}Master`;
                data.attrRawList = _.filter(form, (item) => associatedAttrList.includes(item.attrName));
                this.interfaceForm.masterRef && (data.oid = this.interfaceForm.masterRef);
                this.loading = true;
                return this.$famHttp({
                    url: this.interfaceForm.oid ? '/fam/update' : '/fam/create',
                    data,
                    method: 'post'
                });
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            },
            // 刷新视图表格
            refreshTable() {
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            }
        }
    };
});
