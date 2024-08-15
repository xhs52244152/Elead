/**
 * @module 视图表格
 * @component ViewManager
 * @props { viewManagerProps }
 * @description 表格应用>视图列表
 * @author Mr.JinFeng
 * @example 使用方式参考： system-viewtable/index.js
 * 组件声明
 * components: {
 *   ViewManager: FamKit.asyncComponent(ELMP.resource('erdc-components/ViewManager/index.js'))
 * }
 *
 * @typedef {Object} viewManagerProps
 * @property {Object} row -- 表格应用行数据
 * @property {string} viewType -- 视图类型（system: 系统视图，person：个人视图），默认system
 * @property {string | number} tableMaxHeight -- 视图表格最大高度
 * @property {boolean} autoRecordView -- 个人视图管理，是否开启记忆功能
 *
 * @events TODO
 */
define([
    'erdc-kit',
    'text!' + ELMP.resource('erdc-components/FamViewTable/ViewManager/index.html'),
    'css!' + ELMP.resource('erdc-components/FamViewTable/ViewManager/style.css')
], function (utils, template) {
    const FamKit = require('fam:kit');
    return {
        template,
        props: {
            row: {
                type: Object,
                default: () => ({})
            },
            showBack: {
                type: Boolean,
                default: false
            },
            viewType: {
                type: String,
                default() {
                    return 'system';
                }
            },
            tableMaxHeight: {
                type: String | Number,
                default() {
                    return '';
                }
            },
            autoRecordView: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            dataType: {
                type: Boolean,
                default: true
            },
            appName: String
        },
        data() {
            return {
                tableData: [],
                currentDefaultRowId: '', // 默认视图rowId
                viewRow: '',
                btnLoading: false,
                resetLoading: false,
                isRelationType: true,
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-viewtable/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    save: this.getI18nByKey('保存'),
                    reset: this.getI18nByKey('重置'),
                    create: this.getI18nByKey('创建'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    edit: this.getI18nByKey('编辑'),
                    delete: this.getI18nByKey('删除'),
                    operation: this.getI18nByKey('操作'),
                    cancelTips: this.getI18nByKey('是否放弃编辑'),
                    tipsTitle: this.getI18nByKey('提示'),
                    deleteSuccess: this.getI18nByKey('删除成功'),
                    saveSuccess: this.getI18nByKey('保存成功'),

                    viewName: this.getI18nByKey('视图名称'),
                    内部名称: this.getI18nByKey('内部名称'),
                    表格视图名称: this.getI18nByKey('表格视图名称'),
                    createView: this.getI18nByKey('创建视图'),
                    负责人: this.getI18nByKey('负责人'),
                    默认视图: this.getI18nByKey('默认视图'),
                    启动视图: this.getI18nByKey('启动视图'),
                    视图类型: this.getI18nByKey('视图类型'),
                    描述: this.getI18nByKey('描述'),
                    视图: this.getI18nByKey('视图'),
                    系统视图: this.getI18nByKey('系统视图'),
                    个人视图: this.getI18nByKey('个人视图'),
                    默认视图禁用: this.getI18nByKey('默认视图禁用'),
                    不能编辑: this.getI18nByKey('不能编辑'),
                    不能删除: this.getI18nByKey('不能删除'),
                    视图未启动: this.getI18nByKey('视图未启动')
                },
                viewForm: {
                    oid: '',
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false
                },
                baseFilterFieldDtos: []
            };
        },
        components: {
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            ViewForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/ViewForm/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        computed: {
            title: function () {
                let title = this.row.nameI18nJson;
                if (this.row.tableKey) {
                    if (!title) {
                        title = this.row[`${this.$store.getters.className('tableDefinition')}#nameI18nJson`];
                    }
                    title = title + '(' + this.row.tableKey + ')';
                }
                return title;
            },
            tenantId() {
                return this.$store?.state?.app?.user?.tenantId;
            },
            viewTableConfig() {
                return {
                    dataKey: 'data.tableViewVos', // 数据源key，支持多层级
                    viewOid: '', // 视图id
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/view/getViews', // 表格数据接口
                        appName: this.appName,
                        params: {
                            viewType: this.isSysViewType,
                            tableKey: this.row.tableKey, // 表格key
                            containerOid: this.$store?.state.app?.container?.oid // 容器id
                        }, // 路径参数
                        method: 'get', // 请求方法（默认get）
                        transformResponse: [
                            (respData) => {
                                let resData = respData;
                                try {
                                    resData = respData && JSON.parse(respData);
                                    this.isRelationType = resData?.data?.relationType;
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    isDeserialize: true, // 是否反序列数据源
                    firstLoad: true, // 进入页面就执行查询
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false,
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: 100
                    },
                    addSeq: true,
                    addOperationCol: true, // 是否添加操作列（该列需要自己写插槽，prop固定operation）
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
                        // 'cell-class-name': ({ row, rowIndex, column, columnIndex })=>{ // cell增加class
                        //     let className = ''
                        //     if(column.property === 'isDefault' || column.property === 'enabled'){
                        //         className += 'my-table-form'
                        //     }
                        //     return className
                        // }
                    },
                    enableDrag: true, // 开启行拖拽排序
                    dragCallBack: () => {
                        // 拖拽后事件
                        this.fnSaveAllView();
                    },
                    columns: [
                        {
                            attrName: 'displayName', // 属性名
                            label: this.i18nMappingObj['viewName'],
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 300
                        },
                        {
                            attrName: 'owner', // 属性名
                            label: this.i18nMappingObj['负责人'],
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 150
                        },
                        {
                            attrName: 'isDefault', // 属性名
                            label: this.i18nMappingObj['默认视图'],
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 70,
                            props: {
                                'class-name': 'my-table-form'
                            }
                        },
                        {
                            attrName: 'enabled', // 属性名
                            label: this.i18nMappingObj['启动视图'],
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 70,
                            props: {
                                'class-name': 'my-table-form'
                            }
                        },
                        {
                            attrName: 'viewType', // 属性名
                            label: this.i18nMappingObj['视图类型'],
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            // hide: this.isSysViewType ? true : false, // 是否隐藏
                            width: 90
                        },
                        {
                            attrName: 'displayDesc', // 属性名
                            label: this.i18nMappingObj['描述'],
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 200
                        }
                    ],
                    slotsField: [
                        // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        {
                            type: 'default',
                            prop: 'isDefault'
                        },
                        {
                            prop: 'operation',
                            type: 'default' // 显示字段内容插槽
                        },
                        {
                            prop: 'enabled',
                            type: 'default'
                        },
                        {
                            prop: 'viewType',
                            type: 'default'
                        }
                    ],
                    userFieldConfig: {
                        // 展示用户列特殊处理(插槽优先级比默认的高)
                        userFields: ['owner'], // 需要展示用户卡片的列，该列的数据必须是用户数组
                        fieldMapUser: {
                            // 自定义用户映射数据，配置映射的优先级最高，其次取row数据
                        }
                    },
                    pagination: {
                        // 分页
                        showPagination: false
                    }
                };
            },
            defaultModel: {
                get() {
                    let _this = this;
                    return (scope) => {
                        let row = scope.row;
                        let res =
                            (_this.currentDefaultRowId === '' && row?.isDefault) ||
                            row.id === _this.currentDefaultRowId;
                        row.isDefault = res;
                        return res;
                    };
                }
            },
            isSysViewType() {
                return this.viewType === 'system';
            },
            isPersonViewType() {
                return this.viewType === 'person';
            }
        },
        methods: {
            getOperationTip(row) {
                return row.tenantId === this.$store.state.app.tenantId ? '' : this.i18n.noCurrentTenant;
            },
            getIsDiffTenant(row) {
                return row.tenantId !== this.$store.state.app.tenantId;
            },
            isOpreator(data) {
                return data?.owner?.oid === this.$store.state.user.oid;
            },
            getConfigIsDisabled(row) {
                if (this.isSysViewType) {
                    if (!row.whetherOpreator || !row.viewType) {
                        return true;
                    }
                }
                return false;
            },
            btnDisabled(row) {
                if (this.isSysViewType) {
                    return !row.whetherOpreator;
                } else {
                    return false;
                }
            },
            // 设置默认视图单选按钮值
            setRadioValue(row) {
                let message = this.getWarningMsg(row, this.i18nMappingObj['不能编辑']);
                if (message) return;
                if (!row.enabled) {
                    return this.showMessage(this.i18nMappingObj['视图未启动']);
                }
                this.$set(row, 'isDefault', true);
                this.currentDefaultRowId = row.id;
                this.fnSaveAllView();
            },
            // 创建、编辑表格
            fnFormSubmit(formRef) {
                this.viewForm.loading = true;
                this.$refs[formRef]
                    .submit()
                    .then(({ data }) => {
                        this.toggleShow();

                        // 刷新数据
                        this.$refs['FamAdvancedViewTable'].fnRefreshTable('');
                        this.$emit('table-change', data);
                    })
                    .finally(() => {
                        this.viewForm.loading = false;
                    });
            },
            // 编辑
            fnEditView(row) {
                let message = this.getWarningMsg(row, this.i18nMappingObj['不能编辑']);
                if (message) return;
                this.viewRow = row;
                this.viewForm.oid = row?.oid || '';
                this.viewForm.visible = true;
                this.viewForm.editable = true;
            },
            // 删除
            fnDeleteTableRow(row) {
                let message = this.getWarningMsg(row, this.i18nMappingObj['不能删除']);
                if (message) return;
                let tableName = FamKit.translateI18n(row.nameI18nJson);
                let confirmText = utils.setTextBySysLanguage({
                    CN: `您确定删除【${tableName}】视图吗？`,
                    EN: `Are you sure delete [${tableName}] view?`
                });
                this.$confirm(confirmText, this.i18nMappingObj['tipsTitle'], {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel']
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        appName: this.appName,
                        params: {
                            oid: row.oid
                        },
                        method: 'delete'
                    })
                        .then((resp) => {
                            const { success, message } = resp;
                            if (success) {
                                this.$message.success(this.i18nMappingObj['deleteSuccess']);
                                this.$refs['FamAdvancedViewTable'].fnRefreshTable('');
                                this.$emit('table-change');
                            } else {
                                this.$message({
                                    type: 'error',
                                    message: resp?.data?.message || message || '未知错误'
                                });
                            }
                        })
                        .catch(() => {
                            // this.$message({
                            //     type: 'error',
                            //     message: err?.data?.message || err?.data || err
                            // });
                        });
                });
            },
            getWarningMsg(row, msgType) {
                if (this.isSysViewType) {
                    if (!this.row.enabledModify || !row.viewType) {
                        return this.showMessage(`${this.i18nMappingObj['视图']}${msgType}`);
                    }
                }
            },
            showMessage(message) {
                return this.$message({
                    type: 'warning',
                    message,
                    showClose: true
                });
            },
            // 表格数据源改变后，回调该函数
            fnTableData(tableData = [], isChange) {
                if (isChange) {
                    if (this.viewType) {
                        this.submitViewsSort(tableData);
                    } else {
                        this.fnSaveAllView();
                    }
                }
                this.tableData = FamKit.deepClone(tableData) || [];
            },
            // 表格回调
            fnTableCallback(res) {
                this.btnLoading = false;
                this.resetLoading = false;
                this.baseFilterFieldDtos = res?.data?.baseFilterFieldDtos || [];
            },
            // 提交视图数据
            fnSubmitViewData() {
                return new Promise((resolve, reject) => {
                    let className = this.$store.getters.className('tableView');
                    // 如果是个人视图管理保存视图列表，则需要更换className
                    if (this.isPersonViewType) {
                        className = this.$store.getters.className('tableViewUserConfig');
                    }

                    // .filter((item) => {
                    //     return this.tenantId ? item.tenantId === this.tenantId : true;
                    // })
                    let params = {
                        className: className,
                        rawDataVoList: this.tableData.map((item, index) => {
                            let temp = {
                                attrRawList: [
                                    {
                                        attrName: 'enabled',
                                        value: item.enabled
                                    },
                                    {
                                        attrName: 'isDefault',
                                        value: item.isDefault
                                    },
                                    {
                                        attrName: 'sortOrder',
                                        value: index + 1
                                    }
                                ],
                                className: className
                            };
                            // 个人视图管理保存的，需要加两个参数
                            if (this.isPersonViewType) {
                                temp.attrRawList.push(
                                    {
                                        attrName: 'tableDefRef',
                                        value: this.row.oid
                                    },
                                    {
                                        attrName: 'viewRef',
                                        value: item.oid
                                    }
                                );
                            } else {
                                temp['oid'] = item.oid;
                            }
                            return temp;
                        })
                    };
                    // 个人视图管理保存，需要保存是否开启记忆功能
                    if (this.isPersonViewType) {
                        params.rawDataVoList.push({
                            attrRawList: [
                                {
                                    attrName: 'tableDefRef',
                                    value: this.row.oid
                                },
                                {
                                    attrName: 'autoRecord',
                                    value: this.autoRecordView || false
                                }
                            ],
                            className: className
                        });
                    }
                    this.$famHttp({
                        url: '/fam/saveOrUpdate',
                        appName: this.appName,
                        data: params,
                        method: 'post'
                    })
                        .then((response) => {
                            const { success, message } = response;
                            if (success) {
                                // this.$message.success(this.i18nMappingObj['saveSuccess']);
                                resolve(response);
                            } else {
                                // this.$message({
                                //     type: 'error',
                                //     message: message
                                // })
                                reject(message);
                            }
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            },
            // 保存视图
            fnSaveAllView() {
                this.$nextTick(() => {
                    this.btnLoading = true;
                    this.fnSubmitViewData()
                        .then(() => {
                            if (this.isPersonViewType) {
                                this.$emit('table-change');
                            }
                            this.$refs['FamAdvancedViewTable'].fnRefreshTable();
                        })
                        .finally(() => {
                            this.btnLoading = false;
                        });
                });
            },

            // 拖动排序 增加防抖 避免连续多次调用sort接口
            submitViewsSort: _.debounce(function (tableData) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/fam/sort',
                        data: tableData.map((i) => i.oid),
                        method: 'post'
                    })
                        .then((response) => {
                            const { success, message } = response;
                            if (success) {
                                resolve(response);
                            } else {
                                reject(message);
                            }
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            }, 1000),
            // 处理表格数据源，通过回调方法设置显示
            fnHandlerTableData(tableData = [], cb) {
                // 如果是系统视图，则过滤个人视图不显示
                // if (this.isSysViewType) {
                //     let newTableData = tableData?.filter((ite) => ite.viewType);
                tableData = _.sortBy(tableData, 'sortOrder');
                cb && cb(tableData);
                // }
            },
            // 重置
            // 显示模态框
            fnShowDialog(op) {
                if (op === 'create') {
                    this.viewForm.visible = true;
                }
            },
            // 关闭弹窗表单
            fnCloseForm() {
                this.toggleShow();
            },
            toggleShow() {
                this.viewForm = {
                    oid: '',
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false
                };
                this.viewRow = '';
            },
            switchChange(row) {
                let message = this.getWarningMsg(row, this.i18nMappingObj['不能编辑']);
                if (message) {
                    this.$set(row, 'enabled', !row.enabled);
                    return;
                }
                if (row.isDefault) {
                    this.$set(row, 'enabled', !row.enabled);
                    return this.showMessage(this.i18nMappingObj['默认视图禁用']);
                }
                this.fnSaveAllView();
            }
        }
    };
});
