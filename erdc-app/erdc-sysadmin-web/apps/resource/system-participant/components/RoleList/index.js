define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-participant/components/RoleList/index.html'),
    ELMP.resource('erdc-components/FamErdTable/index.js'),
    ELMP.resource('system-participant/api.js'),
    'css!' + ELMP.resource('system-participant/components/RoleList/style.css')
], function (ErdcKit, template, FamErdTable, api) {
    return {
        template,
        components: {
            RoleCreateEdit: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/RoleCreateEdit/index.js')
            ),
            // 基础表格
            FamErdTable,
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 角色信息
            role: {
                type: Object,
                default: () => {
                    return {};
                }
            }

            //
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/components/RoleList/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    number: this.getI18nByKey('编码'),
                    name: this.getI18nByKey('角色名称'),
                    type: this.getI18nByKey('角色类型'),
                    sortOrder: this.getI18nByKey('排序'),
                    whetherEnable: this.getI18nByKey('是否启用'),
                    describe: this.getI18nByKey('描述'),
                    operation: this.getI18nByKey('操作'),
                    edit: this.getI18nByKey('编辑'),
                    delete: this.getI18nByKey('删除'),
                    comfirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    comfirmDelete: this.getI18nByKey('确认删除'),
                    comfirmDeleteRole: this.getI18nByKey('确定删除角色'),

                    queryFails: this.getI18nByKey('查询失败'),
                    character: this.getI18nByKey('查看角色'),
                    createRole: this.getI18nByKey('创建角色'),
                    editRole: this.getI18nByKey('编辑角色'),
                    deleteSuccessfully: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    create: this.getI18nByKey('创建'),
                    delTips: this.getI18nByKey('delTips')
                },
                searchVal: '',
                dataList: [],
                createEditVisible: false,
                oid: '',
                createEditType: 'check',
                pagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                },
                loading: false,
                title: '',
                i18nMap: {
                    CN: 'zh_cn',
                    EN: 'en_us'
                },
                lan: this.$store.state.i18n?.lang || 'zh_cn',
                advancedSearchToDetails: null,
                tableHeaderMenu: []
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
            roleName() {
                return this.role.name || '';
            },
            identifierNo() {
                return 'column:default:identifierNo';
            },
            columns: {
                get() {
                    return [
                        {
                            title: ' ',
                            prop: '',
                            type: 'seq',
                            width: 48,
                            align: 'center'
                        },
                        {
                            prop: 'identifierNo',
                            title: this.i18nMappingObj['number'],
                            minWidth: '150',
                            slots: {
                                default: 'typeLink'
                            }
                        },
                        {
                            prop: 'nameI18nJson',
                            title: this.i18nMappingObj['name'],
                            minWidth: '150'
                        },
                        {
                            prop: 'roleType',
                            title: this.i18nMappingObj['type'],
                            minWidth: '120'
                        },
                        {
                            prop: 'sortOrder',
                            title: this.i18nMappingObj['sortOrder'],
                            minWidth: '80'
                        },
                        {
                            prop: 'statusDisplayName',
                            title: this.i18nMappingObj['whetherEnable'],
                            minWidth: '50'
                        },
                        {
                            prop: 'descriptionI18nJson',
                            title: this.i18nMappingObj['describe'],
                            minWidth: '150'
                        },
                        {
                            prop: 'oper',
                            title: this.i18nMappingObj['operation'],
                            width: 100,
                            fixed: 'right',
                            slots: {
                                default: 'oper'
                            }
                        }
                    ];
                },
                set(val) {}
            },
            createPrem() {
                return this.tableHeaderMenu.includes('ROLE_CREATE');
            }
        },
        watch: {
            role: function (n, o) {
                if (n) {
                    this.pagination.pageIndex = 1;
                    this.reloadTable();
                }
            },
            advancedSearchToDetails(nv) {
                if (!_.isEmpty(nv) && nv?.oid) {
                    this.createEditVisible = true;
                    this.createEditType = 'check';
                    this.title = this.i18nMappingObj['character'];
                    this.oid = nv?.oid || '';
                    this.$router.replace({ query: {} });
                }
            },
            searchVal(val) {
                this.getRoleList();
            }
        },
        async created() {
            this.tableHeaderMenu = await api.menuQuery('MENU_MODULE_ROLE_TABLE');
        },
        mounted() {
            this.advancedSearchToDetails = this.$route?.query || {};
        },
        methods: {
            getActionConfig(row) {
                return {
                    name: 'MENU_MODULE_ROLE_MORE',
                    objectOid: row.oid
                };
            },
            rowActionClick(command, data) {
                switch (command?.name) {
                    case 'ROLE_EDIT':
                        this.onEdit(data);
                        break;
                    case 'ROLE_DELETE':
                        this.onDelete(data);
                        break;
                    default:
                        break;
                }
            },
            getRoleList: _.debounce(function (cb) {
                let conditionDtoList = [
                    {
                        attrName: 'appName',
                        oper: 'EQ',
                        value1: this.role.appName || ''
                    }
                ];
                if (this.role && this.role.level != 0) {
                    conditionDtoList.push({
                        attrName: 'roleType',
                        oper: 'EQ',
                        value1: this.role.key || ''
                    });
                }
                const data = {
                    className: 'erd.cloud.foundation.principal.entity.Role',
                    pageIndex: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize,
                    conditionDtoList: conditionDtoList,
                    sortBy: 'asc',
                    orderBy: 'sortOrder',
                    searchKey: this.searchVal
                };

                this.$famHttp({
                    url: '/fam/search',
                    data,
                    method: 'POST'
                })
                    .then(({ data }) => {
                        const { records, total, pageIndex, pageSize, headers } = data;
                        let respData = records || [];
                        this.pagination = {
                            pageIndex: +pageIndex,
                            pageSize: +pageSize,
                            total: +total
                        };
                        this.dataList = [];

                        // 配置表头(等待接口处理完成，再去写逻辑)
                        if (headers && headers.length) {
                            let itemMap = {};
                            headers.forEach((item) => {
                                itemMap[item.attrName] = item.label;
                            });
                            this.columns.forEach((item) => {
                                item.title = itemMap[item.field] || item.title;
                            });
                        }
                        this.dataList = respData
                            .map((item) => {
                                let obj = {};
                                if (!item.attrRawList) {
                                    return;
                                }
                                item.attrRawList.forEach((attrData) => {
                                    // if (['nameI18nJson', 'descriptionI18nJson'].includes(attrData.attrName)) {
                                    //     obj[attrData.attrName+'Name'] = attrData.value?.[this.i18nMap[this.lan]] || attrData.value?.value || ''
                                    // } else {
                                    //     obj[attrData.attrName] = attrData.value
                                    // }
                                    obj[attrData.attrName] = attrData.displayName;
                                    if (attrData.attrName === 'status') {
                                        obj[attrData.attrName] = attrData.value;
                                        obj['statusDisplayName'] = attrData.displayName;
                                    }
                                });
                                return obj;
                            })
                            .filter((item) => item);

                        cb && cb();
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || this.i18nMappingObj['queryFails']
                        });
                    });
            }, 300),
            // 查看详情
            checkDetail(data) {
                this.createEditVisible = true;
                this.createEditType = 'check';
                this.title = this.i18nMappingObj['character'];
                this.oid = data.oid;

                this.$emit('rowdata', data);
            },
            // 新增
            onCreate() {
                this.createEditVisible = true;
                this.createEditType = 'create';
                this.title = this.i18nMappingObj['createRole'];
                this.oid = '';
            },
            // 编辑
            onEdit(data) {
                this.createEditVisible = true;
                this.createEditType = 'update';
                this.title = this.i18nMappingObj['editRole'];
                this.oid = data.oid;
            },
            // 删除
            onDelete(data) {
                this.$confirm(this.i18nMappingObj['comfirmDeleteRole'], this.i18nMappingObj['comfirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['comfirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    // 调用删除接口
                    const param = {
                        params: {
                            oid: data.oid || ''
                        }
                    };
                    this.$famHttp({
                        url: '/fam/delete',
                        params: {
                            oid: data.oid || ''
                        },
                        method: 'DELETE'
                    })
                        .then(() => {
                            this.$message({
                                message: this.i18nMappingObj['deleteSuccessfully'],
                                type: 'success',
                                showClose: true
                            });
                            this.$emit('reloadtree', this.role.appNameKey);
                            this.pagination.pageIndex = 1;
                            this.reloadTable();
                        })
                        .catch((error) => {
                            this.$message({
                                type: 'error',
                                message: error?.data?.message || this.i18nMappingObj['deleteFailed'],
                                showClose: true
                            });
                        });
                });
            },
            // 刷新表格
            reloadTable() {
                this.loading = true;
                // this.pagination.pageIndex = 1;
                this.getRoleList(() => {
                    this.loading = false;
                });
            },
            handleSizeChange: function (value) {
                this.pagination.pageIndex = 1;
                this.reloadTable();
            },
            handelCurrentChange(value) {
                this.pagination.pageIndex = value;
                this.reloadTable();
            },
            onSubmit() {
                this.pagination.pageIndex = 1;
                this.reloadTable();
                this.$emit('reloadtree', this.role.appNameKey);
            }
        }
    };
});
