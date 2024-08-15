/*
    类型属性配置
    先引用 kit组件
    FamTemplateManage: FamKit.asyncComponent(ELMP.resource('erdc-components/FamTemplateManage/components/index.js')),

    <FamTemplateManage
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :title="title"
    :oid="typeOid"
    :openType="openType"
    @onsubmit="onSubmit"></FamTemplateManage>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-components/FamTemplateManage/index.html'),
    'erdc-kit',
    'underscore',
    'css!' + ELMP.resource('erdc-components/FamTemplateManage/style.css')
], function (template, FamUtils) {
    const FamKit = require('fam:kit');

    return {
        inheritAttrs: false,
        template,
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamTemplateManage/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    keys: this.getI18nByKey('请输入关键字'),
                    role: this.getI18nByKey('增加角色'),
                    member: this.getI18nByKey('增加成员'),
                    remove: this.getI18nByKey('删除'),
                    add: this.getI18nByKey('新增'),
                    responsible: this.getI18nByKey('设为主责任人'),
                    cancelResponsible: this.getI18nByKey('取消主责任人'),
                    enter: this.getI18nByKey('请输入'),
                    edit: this.getI18nByKey('编辑'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    cancel: this.getI18nByKey('取消'),
                    confirm: this.getI18nByKey('确定'),
                    detail: this.getI18nByKey('详情'),
                    confirmCancel: this.getI18nByKey('确认取消主责任人'),
                    continue: this.getI18nByKey('此操作将取消主责任人，是否继续？'),
                    selectData: this.getI18nByKey('请先选择数据'),

                    name: this.getI18nByKey('名称'),
                    code: this.getI18nByKey('编码'),
                    enabled: this.getI18nByKey('已启用'),
                    context: this.getI18nByKey('上下文'),
                    createTime: this.getI18nByKey('创建时间'),
                    founder: this.getI18nByKey('创建人'),
                    modification: this.getI18nByKey('最后修改时间'),
                    modifier: this.getI18nByKey('最后修改人'),
                    enabledSuccess: this.getI18nByKey('启用成功'),
                    disabledSuccess: this.getI18nByKey('关闭成功'),
                    disabled: this.getI18nByKey('启用失败')
                },
                height: '450',
                searchValue: '',
                tableData: [],

                tableMaxHeight: 380, // 表格高度
                defaultTableHeight: 380,
                heightDiff: 350,
                dialogVisible: false,
                mergeCells: [],
                pagination: {
                    currentPage: 1,
                    pageSize: 20,
                    total: 0
                },
                isResponsible: false,
                dialogTitle: '',
                teamOid: '',
                roleRef: '',
                productOid: 'OR:erd.cloud.foundation.principal.entity.Organization:26150477200197225'
            };
        },
        mounted() {
            this.init();
            this.$nextTick(() => {
                let bodyHeight = document.getElementsByClassName('framework-container')[0].clientHeight;
                this.height = bodyHeight - 300;
            });
        },
        components: {
            // 基础表格
            ErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            OpenCreate: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamTemplateManage/components/OpenCreate/index.js')
            ),
            ProductTeamTable: FamKit.asyncComponent(ELMP.resource('erdc-product-components/ProductTeamTable/index.js'))
        },
        props: {},
        watch: {},
        computed: {
            tableVisible() {
                return this.visible;
            },
            tableConfig() {
                return {
                    border: true,
                    height: this.tableMaxHeight,
                    rowConfig: {
                        isCurrent: true,
                        isHover: true
                    },
                    columnConfig: {
                        resizable: true
                    },
                    align: 'left',
                    showOverflow: true,
                    sortConfig: {
                        showIcon: false,
                        multiple: false
                    },
                    filterConfig: {
                        iconNone: 'erd-iconfont erd-icon-filter',
                        iconMatch: 'erd-iconfont erd-icon-filter on'
                    },
                    treeConfig: {
                        transform: true,
                        expandAll: true, // 默认展开全部
                        reserve: true, // 刷新数据保持默认展开
                        rowField: 'id',
                        iconOpen: 'erd-iconfont erd-icon-arrow-down',
                        iconClose: 'erd-iconfont erd-icon-arrow-right',
                        parentField: 'parentId' //父级key
                    },
                    // 列
                    column: [
                        {
                            prop: 'checkbox',
                            title: '',
                            minWidth: '50',
                            width: '50',
                            type: 'checkbox',
                            align: 'center'
                        },
                        {
                            prop: 'name', // 名称
                            treeNode: true,
                            width: '210',
                            title: this.i18nMappingObj?.['name']
                        },
                        {
                            prop: 'code', // 编码
                            title: this.i18nMappingObj?.['code']
                        },
                        {
                            prop: 'enabled', // 已启用
                            title: this.i18nMappingObj?.['enabled']
                        },
                        {
                            prop: 'domainRef', // 上下文
                            title: this.i18nMappingObj?.['context']
                        },
                        {
                            prop: 'ownedByRef', // 创建时间
                            title: this.i18nMappingObj?.['createTime']
                        },
                        {
                            prop: 'HARD', // 创建人
                            title: this.i18nMappingObj?.['founder']
                        },
                        {
                            prop: 'isUsed', // 最后修改时间
                            title: this.i18nMappingObj?.['modification']
                        },
                        {
                            prop: 'description', // 最后修改人
                            title: this.i18nMappingObj?.['modifier'],
                            width: 160,
                            sort: false,
                            fixed: 'right'
                        }
                    ]
                };
            }
        },
        methods: {
            init() {
                this.getTableData();
            },
            changeCheck(data) {
                this.checkList = data.records.map((item) => item.oid);
            },
            changeCheckbox(row) {
                let formData = new FormData();
                formData.append('id', row.id);
                formData.append('enabled', row.enabled);
                this.$famHttp({
                    url: '/fam/team/template/enabled',
                    data: formData,
                    method: 'put'
                })
                    .then((res) => {
                        if (!row.enabled) {
                            this.$message.success(this.i18nMappingObj.disabledSuccess);
                        } else {
                            this.$message.success(this.i18nMappingObj.enabledSuccess);
                        }
                    })
                    .catch((err) => {
                        this.$message.error(this.i18nMappingObj.disabled);
                    });
            },
            teamFn(val) {
                //
                this.teamOid = val;
            },
            getTableData() {
                this.$famHttp({
                    url: '/fam/search',
                    data: {
                        pageIndex: this.pagination.pageIndex,
                        pageSize: this.pagination.pageSize,
                        attrNames: [],
                        className: 'erd.cloud.foundation.core.team.entity.TeamTemplate',
                        queryId: '209893989'
                    },
                    method: 'post'
                }).then((res) => {
                    if (res?.data) {
                        let { pageIndex, pageSize, pages, total } = res.data;
                        this.pagination = {
                            pageSize,
                            pageIndex,
                            currentPage: Number(pages),
                            total: Number(total)
                        };
                        let tableData = res?.data?.records;
                        this.tableData = tableData.map((item) => {
                            let extractRaw = {};
                            let attrRawList = item.attrRawList || [];
                            delete item.attrRawList;
                            if (attrRawList && attrRawList.length > 0) {
                                extractRaw = FamKit.deserializeArray(attrRawList, {
                                    valueKey: 'displayName',
                                    isI18n: true
                                });
                                if (extractRaw.enabled == '是') {
                                    extractRaw.enabled = true;
                                } else if (extractRaw.enabled == '否') {
                                    extractRaw.enabled = false;
                                }
                            }
                            return {
                                ...item,
                                ...extractRaw
                            };
                        });
                    }
                });
            },
            // 分页
            handlePageChange(data) {
                this.pagination.currentPage = data;
                this.getTableData();
            },

            handleSizeChange(data) {
                this.pagination.pageIndex = 1;
                this.getTableData();
            },
            onSubmit() {
                this.onRefresh();
            },
            onCreateRole() {
                this.roleRef = '';
                this.dialogTitle = this.i18nMappingObj.role;
                this.dialogVisible = true;
            },
            onCreateMember() {
                this.dialogTitle = this.i18nMappingObj.member;
                this.dialogVisible = true;
            },
            onRemove() {
                let checkList = this.$refs?.teamTable.checkList;
                if (checkList.length > 0) {
                    this.$refs?.teamTable.fnBatchRemove();
                } else {
                    this.$message.warning(this.i18nMappingObj['selectData']);
                }
            },
            onRefresh() {
                this.getTableData();
            },
            onConfig() {},
            // 分页
            PageSizeChange() {},
            CurrentPageChange() {},
            // 搜索
            search(val) {
                FamUtils.debounceFn(() => {
                    let [...arr] = this.formPageData;

                    this.filterColumns(val, arr);
                }, 300);
            },
            /**
             * checkbox
             * 复选框
             * @checkbox-all="selectAllEvent"
                 @checkbox-change="selectChangeEvent"
                * **/
            selectAllEvent(data) {
                const records = this.$refs['erdTable'].$table.getCheckboxRecords();
                this.selectData = records || [];
            },
            selectChangeEvent(data) {
                const records = this.$refs['erdTable'].$table.getCheckboxRecords();
                this.selectData = records || [];
            }
        }
    };
});
