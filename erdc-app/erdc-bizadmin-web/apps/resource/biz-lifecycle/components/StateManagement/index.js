/*
    类型基本信息配置
    先引用 kit组件
    StateManagement: FamKit.asyncComponent(ELMP.resource('biz-lifecycle/components/StateManagement/index.js')), // 类型基本信息配置


    <state-management>
    </state-management>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-lifecycle/components/StateManagement/index.html'),
    'erdc-kit',
    'erdcloud.kit',
    'css!' + ELMP.resource('biz-lifecycle/components/StateManagement/style.css')
], function (template, utils) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            // 显示隐藏
        },
        components: {
            // 基础表格
            ErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            StateManagementAdd: FamKit.asyncComponent(
                ELMP.resource('biz-lifecycle/components/StateManagementAdd/index.js')
            ),
            FamImport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js'))
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-lifecycle/components/StateManagement/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    stateManagement: this.getI18nByKey('状态管理'),
                    pleaseEnter: this.getI18nByKey('请输入内部名称或名称关键字'),
                    create: this.getI18nByKey('创建'),
                    import: this.getI18nByKey('导入'),
                    export: this.getI18nByKey('导出'),
                    enabled: this.getI18nByKey('已启用'),
                    disabled: this.getI18nByKey('已停用'),
                    edit: this.getI18nByKey('编辑'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),

                    name: this.getI18nByKey('内部名称'),
                    displayName: this.getI18nByKey('名称'),
                    description: this.getI18nByKey('描述'),
                    application: this.getI18nByKey('应用'),
                    state: this.getI18nByKey('状态'),
                    operation: this.getI18nByKey('操作'),
                    failedHead: this.getI18nByKey('获取head失败'),
                    failedList: this.getI18nByKey('获取列表失败'),
                    createState: this.getI18nByKey('创建状态'),
                    editState: this.getI18nByKey('编辑状态'),
                    stopSuccess: this.getI18nByKey('停用成功'),
                    enableSuccess: this.getI18nByKey('启用成功'),
                    stopFailure: this.getI18nByKey('停用失败'),
                    enableFailure: this.getI18nByKey('启用失败')
                },
                className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState',
                importRequestConfig: {
                    data: {
                        tableSearchDto: {
                            className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState'
                        }
                    }
                },
                searchVal: '',
                tableData: [
                    {
                        name: '内部名称',
                        displayNameI18nJson: { value: '名称', zh_cn: '', en_us: '' },
                        descriptionI18nJson: { value: '描述' },
                        application: '应用',
                        state: 'draft'
                    }
                ],
                validRules: {
                    name: [
                        {
                            required: true
                        }
                    ],
                    displayName: [
                        {
                            required: true
                        }
                    ]
                },
                visible: false,
                importVisible: false,
                formData: {},
                queryId: '',
                loading: false,
                title: '',
                oid: '',
                total: 0,
                pageSize: 20,
                currentPage: 1
            };
        },
        computed: {
            columns() {
                return [
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'name',
                        title: this.i18nMappingObj['name'],
                        minWidth: '160',
                        width: '160'
                    },
                    {
                        prop: 'displayName',
                        title: this.i18nMappingObj['displayName'],
                        minWidth: '160'
                    },
                    {
                        prop: 'description',
                        title: this.i18nMappingObj['description'],
                        minWidth: '160'
                    },
                    {
                        prop: 'enabled',
                        title: this.i18nMappingObj['state'],
                        minWidth: '160'
                    },
                    {
                        prop: 'oper',
                        title: this.i18nMappingObj['operation'],
                        minWidth: '160'
                    }
                ];
            },
            currentTenantId() {
                return this.$store.state.app.tenantId;
            }
        },
        mounted() {
            this.getHeade();
        },
        methods: {
            getHeade() {
                this.$famHttp({
                    url: '/fam/table/head',
                    method: 'POST',
                    data: {
                        attrGroupName: '',
                        className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState',
                        containerRef: '',
                        fieldList: [],
                        queryId: '',
                        tableKey: ''
                    }
                }).then((resp) => {
                    this.queryId = resp.data?.queryId || '';
                    this.refresh();
                });
            },
            getData() {
                this.loading = true;
                this.$famHttp({
                    url: '/fam/search',
                    method: 'POST',
                    data: {
                        pageIndex: this.currentPage,
                        pageSize: this.pageSize,
                        className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState',
                        queryId: this.queryId,
                        searchKey: this.searchVal || ''
                    }
                })
                    .then((resp) => {
                        let data = resp.data?.records || [];
                        this.total = Number(resp.data?.total || 0);
                        this.currentPage = Number(resp.data?.pageIndex);
                        this.pageSize = Number(resp.data?.pageSize);
                        data.forEach((item) => {
                            const attrRawList = item.attrRawList || [];
                            attrRawList.forEach((value) => {
                                item[value.attrName] = value.value;
                                if (value.attrName.includes('I18nJson')) {
                                    item[value.attrName] = {
                                        value: value.value
                                    };
                                }
                            });
                        });
                        this.tableData = data;
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            translateI18n(nameI18nJson) {
                return FamKit.translateI18n(nameI18nJson);
            },
            i18nValueInput(value, data, property) {
                const { row } = data;
                row[property] = value?.value;
            },
            search() {
                utils.debounceFn(() => {
                    this.currentPage = 1;
                    this.refresh();
                }, 300);
            },
            seachEnter() {
                utils.debounceFn(() => {
                    this.currentPage = 1;
                    this.refresh();
                }, 300);
            },
            onCreate() {
                this.visible = true;
                this.oid = '';
                this.title = this.i18nMappingObj['createState'];
            },
            importInterface() {
                this.importVisible = true;
            },
            onImportSuccess() {
                this.importVisible = false;
                this.refresh();
            },
            exportInterface() {
                this.$famHttp({
                    url: '/fam/export',
                    method: 'POST',
                    data: {
                        businessName: 'LifecycleStateExport',
                        tableSearchDto: {
                            className: this.className
                        }
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
            onSubmit() {
                this.refresh();
            },
            // 刷新页面
            refresh() {
                this.getData();
            },
            // 编辑
            onEdit(data) {
                const { row } = data;
                this.visible = true;
                this.formData = row;
                this.oid = row.oid;
                this.title = this.i18nMappingObj['editState'];
            },
            // 启用/停用
            onEnable(data) {
                const { row } = data;
                this.$famHttp({
                    url: '/fam/update',
                    data: {
                        attrRawList: [
                            {
                                attrName: 'enabled',
                                value: !row.enabled
                            }
                        ],
                        className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState',
                        oid: row.oid
                    },
                    method: 'POST'
                }).then(() => {
                    // 启用成功
                    this.$message({
                        type: 'success',
                        message: row.enabled
                            ? this.i18nMappingObj['stopSuccess']
                            : this.i18nMappingObj['enableSuccess'],
                        showClose: true
                    });
                    this.refresh();
                });
            },
            sizeChange(val) {
                this.pageSize = val;
                this.currentPage = 1;
                this.refresh();
            },
            currentChange(val) {
                this.currentPage = val;
                this.refresh();
            }
        }
    };
});
