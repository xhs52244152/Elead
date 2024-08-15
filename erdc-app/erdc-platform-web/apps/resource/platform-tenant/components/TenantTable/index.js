define([
    'text!' + ELMP.resource('platform-tenant/components/TenantTable/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/index.js'),
    'css!' + ELMP.resource('platform-tenant/components/TenantTable/style.css')
], function (template, FamAdvancedTable) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            slotsField: {
                type: Array,
                default: () => {
                    return [
                        {
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ];
                }
            },
            tableType: {
                type: String,
                default: 'editView'
            },
            baseParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            tableHeight: {
                type: Number,
                default: 450
            }
        },
        components: {
            FamAdvancedTable: FamAdvancedTable,
            TenantForm: ErdcKit.asyncComponent(ELMP.resource('platform-tenant/components/TenantForm/index.js')),
            ApplicationForm: ErdcKit.asyncComponent(
                ELMP.resource('platform-tenant/components/ApplicationForm/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('platform-tenant/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    searchTips: this.getI18nByKey('搜索提示'),
                    add: this.getI18nByKey('新增'),
                    edit: this.getI18nByKey('编辑'),
                    name: this.getI18nByKey('名称'),
                    number: this.getI18nByKey('编码'),
                    status: this.getI18nByKey('状态'),
                    startTime: this.getI18nByKey('开始时间'),
                    endTime: this.getI18nByKey('结束时间'),
                    isShare: this.getI18nByKey('是否共享'),
                    description: this.getI18nByKey('描述'),
                    operation: this.getI18nByKey('操作'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    enabled: this.getI18nByKey('启用'),
                    disabled: this.getI18nByKey('停用'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    applcationMaintance: this.getI18nByKey('应用维护'),
                    createTenant: this.getI18nByKey('创建租户'),
                    editTenant: this.getI18nByKey('编辑租户'),
                    detail: this.getI18nByKey('租户详情'),
                    createSuccess: this.getI18nByKey('创建成功'),
                    editSuccess: this.getI18nByKey('编辑成功'),
                    createError: this.getI18nByKey('创建失败'),
                    editError: this.getI18nByKey('创建失败'),
                    enabledSuceess: this.getI18nByKey('启用成功'),
                    disabledSuccess: this.getI18nByKey('停用成功')
                },
                tableBodyData: {},
                activeCompnenet: 'TenantForm',
                dialogVisiable: false,
                dialogTitle: '',
                isReadonly: false,
                formData: {},
                isEditForm: false,
                loading: false
            };
        },
        computed: {
            mainBtn() {
                let mainBtn = '';
                if (this.tableType === 'editView') {
                    mainBtn = {
                        // 主要操作按钮
                        label: this.i18nMappingObj.add,
                        class: '',
                        icon: '',
                        onclick: () => {
                            this.dialogTitle = this.i18nMappingObj.createTenant;
                            this.activeCompnenet = 'TenantForm';
                            this.isReadonly = false;
                            this.formData = {
                                isShare: false,
                                enabled: true
                            };
                            this.dialogVisiable = true;
                            this.isEditForm = false;
                        }
                    };
                }
                return mainBtn;
            },
            viewTableConfig() {
                return {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/platform/tenant/page', // 表格数据接口
                        params: {}, // 路径参数
                        data: this.baseParams, // body参数
                        method: 'post', // 请求方法（默认get）
                        transformResponse: [
                            (data) => {
                                // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                // 对接收的 data 进行任意转换处理
                                let resData = data;
                                try {
                                    const parseData = data && JSON.parse(data);
                                    const records = parseData?.data?.records || [];
                                    parseData.data.records = records.map((item) => {
                                        item.status = item.enabled
                                            ? this.i18nMappingObj.enabled
                                            : this.i18nMappingObj.disabled;
                                        item.isShareText = item.isShare
                                            ? this.i18nMappingObj.yes
                                            : this.i18nMappingObj.no;
                                        return item;
                                    });
                                    resData = parseData;
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    firstLoad: this.tableType === 'editView',
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: this.tableType === 'editView',
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18nMappingObj.searchTips, // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '280'
                        },
                        mainBtn: this.mainBtn
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
                    pagination: {
                        // 分页
                        pageSize: 20,
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    addSeq: true,
                    fieldLinkConfig: {
                        fieldLink: true, // 是否添加列超链接
                        fieldLinkName: 'displayName', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            this.handlerViewDetail(row);
                        }
                    },
                    columns: [
                        {
                            attrName: 'displayName', // 属性名
                            label: this.i18nMappingObj.name, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100,
                            fixed: 'left'
                        },
                        {
                            attrName: 'identifierNo', // 属性名
                            label: this.i18nMappingObj.number, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 200
                        },
                        {
                            attrName: 'status', // 属性名
                            label: this.i18nMappingObj.status, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'starTime', // 属性名
                            label: this.i18nMappingObj.startTime, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'endTime', // 属性名
                            label: this.i18nMappingObj.endTime, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'isShareText', // 属性名
                            label: this.i18nMappingObj.isShare, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'displayDesc', // 属性名
                            label: this.i18nMappingObj.description, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 250
                        },
                        {
                            attrName: 'operation', // 属性名
                            label: this.i18nMappingObj.operation, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            hide: this.tableType !== 'editView',
                            minWidth: 200,
                            fixed: 'right'
                        }
                    ],
                    slotsField: this.slotsField
                };
            }
        },
        watch: {
            baseParams: {
                handler(newVal) {
                    if (newVal && newVal.appId) {
                        this.getTableData();
                    }
                },
                immediate: true,
                deep: true
            }
        },
        methods: {
            // 表格空数据赋值为'--'
            handlerData(tableData, callback) {
                tableData = _.map(tableData, (item) => ErdcKit.deepClone(item)) || [];
                _.each(tableData, (item) => {
                    _.each(item, (value, key) => {
                        (value === '' || value === undefined) && (item[key] = '--');
                    });
                });
                callback(tableData);
            },
            getTableData() {
                this.refreshTable();
            },
            handlerViewDetail(row) {
                const callback = () => {
                    this.dialogTitle = this.i18nMappingObj.detail;
                    this.activeCompnenet = 'TenantForm';
                    this.isReadonly = true;
                    this.dialogVisiable = true;
                };

                this.getTenantDetail(row, callback);
            },
            getTenantDetail(row, cb) {
                this.$famHttp({ url: `/platform/tenant/${row.oid}`, method: 'GET' }).then((resp) => {
                    this.$set(this, 'formData', resp.data);
                    cb && cb();
                });
            },
            handlerEdit(row) {
                const callback = () => {
                    this.dialogVisiable = true;
                    this.dialogTitle = this.i18nMappingObj.editTenant;
                    this.activeCompnenet = 'TenantForm';
                    this.isReadonly = false;
                    this.isEditForm = true;
                };
                this.$nextTick(() => {
                    this.getTenantDetail(row, callback);
                });
            },
            hanlderChangeState(row) {
                const params = {
                    nameI18nJson: row.nameI18nJson,
                    descriptionI18nJson: row.descriptionI18nJson,
                    enabled: !row.enabled,
                    id: row.id,
                    endTime: row.endTime,
                    isShare: row.isShare,
                    identifierNo: row.identifierNo,
                    starTime: row.starTime,
                    icon: row.icon
                };
                this.handlerCreateOrEditTenant('PUT', params, true, 'changeState');
            },
            handlerEditApplication(row) {
                this.$set(this, 'formData', row);
                this.$forceUpdate();
                this.dialogTitle = this.i18nMappingObj.applcationMaintance;
                this.activeCompnenet = 'ApplicationForm';
                this.dialogVisiable = true;
            },
            onHandlerConfirm() {
                this.$refs[this.activeCompnenet].validate();
            },
            onHandlerCancel() {
                this.dialogVisiable = false;
            },
            handlerValidSuccess(data) {
                if (this.activeCompnenet === 'TenantForm') {
                    let method = 'POST';
                    let params = data;
                    if (this.isEditForm) {
                        params.id = this.formData.id;
                        method = 'PUT';
                    }
                    this.handlerCreateOrEditTenant(method, params);
                }
            },
            refreshTable() {
                setTimeout(() => {
                    // 只读情况下，会取不到refs的值， 所以需要使用setTimeout， 视图更新之后，再调用接口查询
                    this.$refs['famAdvancedTable'].fnRefreshTable();
                }, 0);
            },
            handlerCreateOrEditTenant(method, params, refreshTable = true, messageType = null) {
                this.loading = true;
                this.$famHttp({ url: '/platform/tenant', data: params, method: method })
                    .then(() => {
                        let message = this.i18nMappingObj.createSuccess;
                        if (method === 'PUT') {
                            if ('changeState' === messageType) {
                                message = params.enabled
                                    ? this.i18nMappingObj.enabledSuceess
                                    : this.i18nMappingObj.disabledSuccess;
                            } else {
                                message = this.i18nMappingObj.editSuccess;
                            }
                        }
                        this.$message({ type: 'success', message: message, showClose: true });
                        this.dialogVisiable = false;
                        this.dialogTitle = '';
                        this.activeCompnenet = '';
                        this.formData = {};
                        if (refreshTable) {
                            this.refreshTable();
                        }
                    })
                    .catch(() => {
                        let message = this.i18nMappingObj.createError;
                        if (method === 'PUT') {
                            message = this.i18nMappingObj.editError;
                        }
                        this.$message({ type: 'error', message: message, showClose: true });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            handlerCloseDialog() {
                this.$set(this, 'formData', {});
            }
        }
    };
});
