/*
    类型基本信息配置
    先引用 kit组件
    BasicInforConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/BasicInforConfig/index.js')), // 类型基本信息配置


    <basic-infor-config
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </basic-infor-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-type-components/ComponentManagement/index.html'),
    // ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('erdc-type-components/ComponentManagement/style.css')
], function (template, fieldTypeMapping) {
    const famHttp = require('fam:http');
    const ErdcKit = require('erdcloud.kit');
    const store = require('fam:store');

    return {
        template,
        // mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/ComponentManagement/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    create: this.getI18nByKey('创建'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),
                    edit: this.getI18nByKey('编辑'),
                    delete: this.getI18nByKey('删除'),
                    checkComponent: this.getI18nByKey('查看组件'),
                    createComponent: this.getI18nByKey('创建组件'),
                    editComponent: this.getI18nByKey('编辑组件'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    WhetherDeleteConfirm: this.getI18nByKey('是否要删除该组件'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    deleteSuccessful: this.getI18nByKey('删除成功'),
                    deleteFailure: this.getI18nByKey('删除失败'),
                    stopSuccessful: this.getI18nByKey('停用成功'),
                    enableSuccessful: this.getI18nByKey('启用成功'),
                    stopFailure: this.getI18nByKey('停用失败'),
                    enableFailure: this.getI18nByKey('启用失败'),
                    whetherDisableComponent: this.getI18nByKey('是否停用该组件'),
                    whetherEnableComponent: this.getI18nByKey('是否启用该组件'),
                    disableComponents: this.getI18nByKey('停用组件'),
                    enableComponent: this.getI18nByKey('启用组件'),

                    componentName: this.getI18nByKey('组件名称'),
                    showName: this.getI18nByKey('显示名称'),
                    description: this.getI18nByKey('描述'),
                    state: this.getI18nByKey('状态'),
                    operation: this.getI18nByKey('操作')
                },
                searchValue: '',
                listData: [],
                pagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 100
                },
                NewEditComponentVisible: false,
                oid: '',
                componentTitle: '',
                componentType: 'create'
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            data() {},
            columns: {
                get() {
                    return [
                        {
                            prop: 'name',
                            minWidth: 180,
                            width: 180,
                            title: this.i18nMappingObj?.['componentName']
                        },
                        {
                            prop: 'displayName',
                            minWidth: 160,
                            width: 160,
                            title: this.i18nMappingObj?.['showName']
                        },
                        {
                            prop: 'description',
                            minWidth: 160,
                            width: 160,
                            title: this.i18nMappingObj?.['description']
                        },
                        {
                            prop: 'enabled',
                            minWidth: 80,
                            width: 80,
                            title: this.i18nMappingObj?.['state']
                        },
                        {
                            prop: 'oper',
                            title: this.i18nMappingObj?.['operation'],
                            minWidth: 180,
                            width: 180,
                            sort: false,
                            fixed: 'right'
                        }
                    ];
                },
                set(val) {}
            }
        },
        mounted() {
            this.columns = [...this.columns];
            this.getListData();
        },
        methods: {
            handleSizeChange: function (value) {
                this.pagination.pageIndex = 1;
                this.getListData();
            },
            handelCurrentChange(value) {
                this.getListData();
            },
            // 获取列表数据
            getListData() {
                const data = {
                    pageIndex: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize
                };
                this.$famHttp({
                    url: '/fam/type/component/page',
                    data,
                    method: 'post'
                }).then((resp) => {
                    const { pageIndex, pageSize, total, records } = resp.data || {};
                    this.pagination.pageIndex = +pageIndex;
                    this.pagination.pageSize = +pageSize;
                    this.pagination.total = +total;
                    this.listData = _.map(records, (item) => {
                        // item.nameI18nJsonName = item.nameI18nJson['zh_cn'] || item.nameI18nJson.value
                        // item.descriptionI18nJsonName = item.descriptionI18nJson['zh_cn'] || item.descriptionI18nJson.value
                        item.enabledName = item.enabled
                            ? this.i18nMappingObj['enable']
                            : this.i18nMappingObj['disable'];
                        return item;
                    }).filter((item) => item);
                });
            },
            onCheck(data) {
                const { row } = data;
                this.oid = row.oid || '';
                this.componentTitle = this.i18nMappingObj['checkComponent'];
                this.componentType = 'check';
                this.NewEditComponentVisible = true;
            },
            // 添加组件
            addComponent() {
                this.oid = '';
                this.componentTitle = this.i18nMappingObj['createComponent'];
                this.componentType = 'create';
                this.NewEditComponentVisible = true;
            },
            // 编辑组件
            onEdit(data) {
                const { row, column } = data;
                this.oid = row.oid || '';
                this.componentTitle = this.i18nMappingObj['editComponent'];
                this.componentType = 'update';
                this.NewEditComponentVisible = true;
            },
            onDelete(data) {
                const { row, column } = data;
                const param = {
                    oid: row.oid
                };
                this.$confirm(this.i18nMappingObj['WhetherDeleteConfirm'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: param,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['deleteSuccessful'],
                            showClose: true
                        });
                        this.refreshList();
                    });
                });
            },
            OnEnabled(data) {
                const { row } = data;

                this.$confirm(
                    row.enabled
                        ? this.i18nMappingObj['whetherDisableComponent']
                        : this.i18nMappingObj['whetherEnableComponent'],
                    row.enabled ? this.i18nMappingObj['disableComponents'] : this.i18nMappingObj['enableComponent'],
                    {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    }
                ).then(() => {
                    const paramData = {
                        className: 'erd.cloud.foundation.layout.entity.Component',
                        oid: row.oid,
                        attrRawList: [
                            {
                                attrName: 'enabled',
                                value: !row.enabled
                            }
                        ]
                    };
                    this.$famHttp({
                        url: '/fam/update',
                        data: paramData,
                        method: 'post'
                    }).then((resp) => {
                        this.$message({
                            type: 'success',
                            message: row.enabled
                                ? this.i18nMappingObj['stopSuccessful']
                                : this.i18nMappingObj['enableSuccessful'],
                            showClose: true
                        });
                        this.getListData();
                    });
                });
            },
            // 刷新列表
            refreshList() {
                this.getListData();
            }
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            NewEditComponent: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/NewEditComponent/index.js'))
        }
    };
});
