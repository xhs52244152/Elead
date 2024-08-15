define([
    'text!' + ELMP.resource('erdc-version-view/views/list/index.html'),
    ELMP.resource('erdc-version-view/util.js'),
    'css!' + ELMP.resource('erdc-version-view/views/list/index.css')
], function (template, util) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'VersionViewList',
        template,
        components: {
            // 表格
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            // 操作
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            // 表单
            VersionViewForm: ErdcKit.asyncComponent(ELMP.resource('erdc-version-view/components/Form/index.js')),
            // 标题组件
            FormPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/FormPageTitle/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-version-view/locale/index.js'),
                title: '',
                visibleValue: false,
                ViewVersoinTitle: '',
                formId: '',
                blockData: {},
                vm: null,
                loading: false,
                oid: ''
            };
        },
        computed: {
            className() {
                return this.$store.state?.pdmVersionViewStore?.classNameMapping?.versionView;
            },
            viewTableConfig() {
                const { className, handleEditView } = this;
                return {
                    vm: this,
                    columns: [
                        {
                            attrName: 'seq',
                            type: 'seq',
                            width: 48,
                            fixed: 'left',
                            align: 'center',
                            label: ''
                        },
                        {
                            attrName: 'displayName', // 列数据字段key
                            label: this.i18n['显示名称'] // 列头部标题
                        },
                        {
                            attrName: 'name', // 列数据字段key
                            label: this.i18n['内部名称'] // 列头部标题
                        },
                        {
                            attrName: 'enabled', // 列数据字段key
                            label: this.i18n['是否有效'] // 列头部标题
                        },
                        {
                            attrName: 'supportedName', // 列数据字段key
                            label: this.i18n['类型'] // 列头部标题
                        },
                        {
                            attrName: 'createTime', // 列数据字段key
                            label: this.i18n['创建时间'] // 列头部标题
                        },
                        {
                            attrName: 'updateTime', // 列数据字段key
                            label: this.i18n['更新时间'] // 列头部标题
                        },
                        {
                            attrName: 'description', // 列数据字段key
                            label: this.i18n['描述'], // 列头部标题
                            width: 90
                        },
                        {
                            attrName: 'operation',
                            label: '操作',
                            isDisable: true,
                            fixed: 'right',
                            showOverflow: false,
                            minWidth: 100,
                            width: 100
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'enabled',
                            type: 'default'
                        },
                        {
                            prop: 'description',
                            type: 'default'
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ],
                    firstLoad: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/view/all', // 表格数据接口
                        params: {
                            className
                        }, // 路径参数
                        method: 'GET', // 请求方法（默认get）
                        transformResponse: [
                            (respData) => {
                                let resData = respData;
                                try {
                                    resData = respData && JSON.parse(respData);
                                    const { data } = resData;
                                    util.flatPropertyValues(data);
                                    data.forEach((d) => {
                                        delete d.children;
                                    });
                                    resData.data.records = util.getTreeTableData(data, 'parentRef');
                                } catch (err) {}
                                return resData;
                            }
                        ]
                    },
                    toolbarConfig: {
                        showMoreSearch: false,
                        showConfigCol: false,
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        },
                        actionConfig: {
                            name: 'PDM_CORE_VIEW_CREATE_MENU'
                        }
                    },
                    fieldLinkConfig: {
                        fieldLink: true,
                        // 是否添加列超链接
                        fieldLinkName: 'displayName', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            // 超链接事件
                            handleEditView(row);
                        }
                    },
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true, // 溢出隐藏显示省略号
                        treeNode: 'displayName',
                        treeConfig: {
                            children: 'children',
                            expandAll: true
                        }
                    },
                    pagination: {
                        // 分页
                        showPagination: false, // 是否显示分页
                        pageSize: 20
                    }
                };
            }
        },
        mounted() {
            this.vm = this;
            this.title = this.i18n['创建版本视图'];
            this.ViewVersoinTitle = this.i18n['版本视图管理'];
        },
        methods: {
            // 操作按钮配置
            // eslint-disable-next-line no-unused-vars
            getActionConfig(row) {
                return {
                    name: 'PDM_CORE_VIEW_MENU'
                    // objectOid: row.oid
                };
            },
            // 创建版本视图
            handleCreateView() {
                const _this = this;
                _this.formId = 'CREATE';
                _this.visibleValue = true;
                _this.oid = '';
                _this.title = _this.i18n['创建版本视图'];
            },
            // 编辑版本视图
            handleEditView(row) {
                const _this = this;
                _this.oid = row?.oid;
                _this.blockData = row;
                _this.formId = 'UPDATE';
                _this.title = _this.i18n['编辑版本视图'];
                _this.visibleValue = true;
            },
            // 有效失效切换
            handleUnEnabled(row, flag) {
                const _this = this;
                const { className } = this;
                const { oid } = row;
                this.$famHttp({
                    url: `/fam/view/disable?oid=${oid}&flag=${flag}`,
                    method: 'POST',
                    className
                }).then((res) => {
                    let { success } = res || {};
                    if (success) {
                        // 重新获取表格数据
                        _this.$refs.version_view_table.fnRefreshTable();
                    }
                });
            },
            handleSubmit(data) {
                const _this = this;
                return _this.$famHttp({
                    url: _this.formId == 'CREATE' ? '/base/create' : '/base/update',
                    data: { ...data },
                    method: 'POST'
                });
            },
            submitBeforeCheck() {
                const _this = this;
                _this.loading = true;
                let { submit, serializeEditableAttr } = _this.$refs.versionTableForm.$refs.versionViewForm;
                submit().then((resp) => {
                    if (resp.valid) {
                        const attrRawList = serializeEditableAttr(null, 'attrName', true) || {};
                        const className = _this.className;
                        const oid = _this.oid;
                        _this
                            .handleSubmit({
                                attrRawList,
                                className,
                                oid
                            })
                            .then((resp) => {
                                if (resp.success) {
                                    _this.$message.success(this.oid ? '编辑成功' : '创建成功');
                                    _this.visibleValue = false;
                                    // 重新获取表格数据
                                    _this.$refs.version_view_table.fnRefreshTable();
                                }
                            })
                            .finally(() => {
                                _this.loading = false;
                            });
                    }
                });
            },
            handleCancel() {
                const _this = this;
                _this.visibleValue = false;
                // 重新获取表格数据
                _this.$refs.version_view_table.fnRefreshTable();
            },
            getDescription(row) {
                return row?.description?.value || '--';
            }
        }
    };
});
