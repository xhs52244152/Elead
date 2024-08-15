define(['text!' + ELMP.resource('platform-microservice/views/ApplicationManagement/index.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {},
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            ApplicationForm: ErdcKit.asyncComponent(
                ELMP.resource('platform-microservice/components/ApplicationForm/index.js')
            ),
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('platform-microservice/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    edit: this.getI18nByKey('编辑'),
                    name: this.getI18nByKey('名称'),
                    number: this.getI18nByKey('编码'),
                    status: this.getI18nByKey('状态'),
                    description: this.getI18nByKey('描述'),
                    operation: this.getI18nByKey('操作'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    maintancedApp: this.getI18nByKey('已维护的应用'),
                    baseInfo: this.getI18nByKey('基本信息'),
                    searchName: this.getI18nByKey('搜索名称'),
                    editApplication: this.getI18nByKey('编辑应用'),
                    applicationDetail: this.getI18nByKey('应用详情'),
                    updateSuccess: this.getI18nByKey('修改应用成功'),
                    updateError: this.getI18nByKey('修改应用失败'),
                    version: this.getI18nByKey('版本号')
                },
                tableHeight: 450,
                tableBodyData: {},
                dialogVisiable: false,
                readonly: false,
                formData: {},
                loading: false
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            viewTableConfig() {
                return {
                    viewOid: '', // 视图id
                    searchParamsKey: 'name', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/platform/application/list', // 表格数据接口
                        data: this.tableBodyData, // body参数
                        method: 'GET',
                        transformResponse: [
                            function (data) {
                                // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                // 对接收的 data 进行任意转换处理
                                let resData = data;
                                try {
                                    const parseData = data && JSON.parse(data);
                                    parseData.data.records = parseData?.data || [];
                                    resData = parseData;
                                } catch (error) {
                                    resData = data && JSON.parse(data);
                                }
                                return resData;
                            }
                        ]
                    },
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: true,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18nMappingObj.searchName, // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '280'
                        }
                    },
                    pagination: {
                        showPagination: false
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
                    columns: [
                        {
                            attrName: 'displayName', // 属性名
                            label: this.i18nMappingObj.name, // 字段名
                            description: '', // 描述
                            width: 200,
                            fixed: 'left'
                        },
                        {
                            attrName: 'identifierNo', // 属性名
                            label: this.i18nMappingObj.number, // 字段名
                            description: '', // 描述
                            width: 200
                        },
                        {
                            attrName: 'version', // 属性名
                            label: this.i18nMappingObj.version, // 字段名
                            description: '', // 描述
                            width: 250
                        },
                        {
                            attrName: 'displayDesc', // 属性名
                            label: this.i18nMappingObj.description, // 字段名
                            description: '', // 描述
                            minWidth: 450
                        },
                        {
                            attrName: 'operation', // 属性名
                            label: this.i18nMappingObj.operation, // 字段名
                            description: '', // 描述
                            width: 100,
                            fixed: 'right'
                        }
                    ],
                    addSeq: true,
                    slotsField: [
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'displayName',
                            type: 'default' // 当前字段使用插槽
                        },
                        {
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ]
                };
            },
            dialogTitle() {
                return this.readonly ? this.i18nMappingObj.applicationDetail : this.i18nMappingObj.editApplication;
            }
        },
        mounted() {
            this.tableMaxHeight = document.documentElement.clientHeight - 144;
        },
        methods: {
            reSetTableHeight() {
                this.tableHeight = window.innerHeight - ErdcKit.offset(this.$el).top - 76;
            },
            handlerViewDetail(row) {
                this.formData = {};
                this.readonly = true;
                this.dialogVisiable = true;
                this.getApplicationDetail(row.oid);
            },
            getApplicationDetail(oid) {
                this.$famHttp({ url: `/platform/application/${oid}`, method: 'GET' }).then((resp) => {
                    this.formData = resp.data;
                });
            },
            handlerEdit(row) {
                this.dialogVisiable = true;
                this.formData = row;
                this.readonly = false;
            },
            onHandlerConfirm() {
                this.$refs.applicationForm.validateForm();
            },
            onHandlerCancel() {
                this.dialogVisiable = false;
            },
            refreshTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            handlerUpdate(data) {
                this.loading = true;
                this.$famHttp({ url: `/platform/application`, method: 'PUT', data: data })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.updateSuccess,
                            showClose: true
                        });
                        this.dialogVisiable = false;
                        this.refreshTable();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    };
});
