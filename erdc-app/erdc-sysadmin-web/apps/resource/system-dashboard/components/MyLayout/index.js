define([
    'text!' + ELMP.resource('system-dashboard/components/MyLayout/index.html'),
    'erdcloud.kit',
    'erdc-kit',
    'css!' + ELMP.resource('system-dashboard/components/MyLayout/index.css')
], function (tmpl, erdcloudKit, ErdcKit) {
    return {
        template: tmpl,
        props: {
            appName: String,
            tenantId: String
        },
        components: {
            FamParticipantSelect: erdcloudKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            ErdTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            LayoutForm: erdcloudKit.asyncComponent(ELMP.resource('system-dashboard/components/LayoutForm/index.js')),
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        computed: {
            appList: function () {
                return this.$store.state.app.appNames || [];
            },
            appMap: function () {
                var appMap = {};
                this.appList.forEach(function (i) {
                    appMap[i.identifierNo] = i;
                });
                return appMap;
            },
            relationUserDataColumn: function () {
                return [
                    {
                        prop: 'participantType', // 列数据字段key
                        title: this.i18nMappingObj.participantType, // 列头部标题
                        minWidth: '150', // 列宽度
                        fixed: 'left'
                    },
                    {
                        prop: 'participant', // 列数据字段key
                        title: this.i18nMappingObj.participant, // 列头部标题
                        minWidth: '100' // 列宽度
                    },
                    {
                        prop: 'department', // 列数据字段key
                        title: this.i18nMappingObj.department, // 列头部标题
                        minWidth: '230' // 列宽度
                    },
                    {
                        prop: 'phone', // 列数据字段key
                        title: this.i18nMappingObj.phone, // 列头部标题
                        minWidth: '100' // 列宽度
                    },
                    {
                        prop: 'email', // 列数据字段key
                        title: this.i18nMappingObj.email, // 列头部标题
                        minWidth: '100' // 列宽度
                    },
                    {
                        prop: 'operation', // 列数据字段key
                        title: this.i18nMappingObj.operation, // 列头部标题
                        width: '90',
                        fixed: 'right'
                    }
                ];
            },
            menuInfo: function () {
                return this.$store.getters['route/matchResource'](this.$route);
            },
            columns: function () {
                return [];
            },
            viewTableConfig: function () {
                const { i18nMappingObj } = this;
                const self = this;
                var resourceInfo = this.menuInfo || {};
                return {
                    columns: [
                        {
                            attrName: 'name',
                            label: i18nMappingObj.name,
                            minWidth: 200
                        },
                        {
                            attrName: 'pinned',
                            label: i18nMappingObj.常用,
                            minWidth: 80
                        },
                        {
                            attrName: 'layoutType',
                            label: i18nMappingObj.layoutType,
                            minWidth: 150
                        },
                        {
                            attrName: 'appName',
                            label: i18nMappingObj.appName,
                            minWidth: 110
                        },
                        {
                            attrName: 'createBy',
                            label: i18nMappingObj.creator,
                            minWidth: 110
                        },
                        {
                            attrName: 'createTime',
                            label: i18nMappingObj.createTime,
                            minWidth: 150
                        },
                        {
                            attrName: 'operation',
                            label: i18nMappingObj.operation,
                            sortAble: false,
                            extraCol: true,
                            fixed: 'right',
                            width: 250,
                            showOverflow: false,
                            minWidth: 250
                        }
                    ],
                    searchParamsKey: 'name',
                    isDeserialize: false, // 是否反序列数据源
                    sortFixRight: true, // 排序图标是否显示在右边
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        tableKey: 200,
                        nameI18nJson: 200,
                        operation: 250
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
                    tableBaseEvent: {
                        // 基础表格的事件，参考vxe官方API(这里事件官方写什么名称就是什么，不能驼峰命名)
                        // 'checkbox-change': this.selectChangeEvent
                    },
                    firstLoad: true,
                    tableRequestConfig: {
                        url: '/common/dashboard/layout/owner/list',
                        method: 'GET',
                        data: {
                            className: this.layoutClass,
                            resourceId: resourceInfo.id
                        }
                    },
                    toolbarConfig: {
                        showConfigCol: false,
                        showRefresh: true,
                        showMoreSearch: false,
                        fuzzySearch: {
                            show: true,
                            clearable: true,
                            width: '280',
                            placeholder: i18nMappingObj.searchPlac
                        },
                        mainBtn: {
                            label: i18nMappingObj.create,
                            onclick() {
                                self.createLayout();
                            }
                        }
                    },
                    addOperationCol: true,
                    addCheckbox: false,
                    addSeq: false,
                    slotsField: [
                        {
                            prop: 'name',
                            type: 'default'
                        },
                        {
                            prop: 'appName',
                            type: 'default'
                        },
                        {
                            prop: 'pinned',
                            type: 'default'
                        },
                        {
                            prop: 'layoutType',
                            type: 'default'
                        },
                        {
                            prop: 'createBy',
                            type: 'default'
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ],
                    fieldLinkConfig: {},
                    pagination: {
                        // 分页
                        showPagination: true, // 是否显示分页
                        pageSize: 20,
                        indexKey: 'pageIndex',
                        sizeKey: 'pageSize'
                    }
                };
            },
            validators: function () {
                return {
                    nameI18nJson: [
                        {
                            trigger: ['input', 'blur'],
                            validator(rule, value, callback) {
                                const temp = value.value.value;
                                if (temp === '') {
                                    callback(new Error('请输入名称'));
                                } else {
                                    if (!/\S/.test(temp)) {
                                        callback(new Error(rule.message));
                                    } else if (temp.length > 61) {
                                        callback(new Error('长度不能超过60个字符'));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        }
                    ]
                };
            },
            participantVal: {
                get() {
                    return {
                        type: this.participantSelectValue.type,
                        value: this.participantSelectValue.value.map((item) => item.oid)
                    };
                },
                set(val) {}
            },
            participantSelectValue() {
                let list = [];
                this.relationUserData.forEach((item) => {
                    if (item.participantType === this.participantSelectType) {
                        list.push(item.principal || item.roleBObjectRef);
                    }
                });
                const value = this.relationUserData
                    .map((item) => {
                        return {
                            ...item,
                            displayName: item?.participant,
                            oid: item.roleBObjectRef || item.oid,
                            orgName: item.department
                        };
                    })
                    .filter((item) => list.includes(item.oid) || list.includes(item.roleBObjectRef));
                return {
                    type: this.participantSelectType,
                    value
                };
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'system-dashboard'),
                i18nMappingObj: {
                    create: this.getI18nByKey('创建'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    edit: this.getI18nByKey('编辑'),
                    share: this.getI18nByKey('分享'),
                    sure_delect: this.getI18nByKey('确认移除'),
                    confirm_delete: this.getI18nByKey('确认删除'),
                    wxts: this.getI18nByKey('温馨提示'),
                    deletelayout: this.getI18nByKey('删除'),
                    shareLayout: this.getI18nByKey('分享仪表盘'),
                    setDefault: this.getI18nByKey('设为默认'),
                    createlayout: this.getI18nByKey('创建布局'),
                    updatelayout: this.getI18nByKey('编辑布局'),
                    baseMsg: this.getI18nByKey('基础信息'),
                    name: this.getI18nByKey('名称'),
                    desc: this.getI18nByKey('描述'),
                    status: this.getI18nByKey('状态'),
                    app: this.getI18nByKey('应用'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),
                    success: this.getI18nByKey('成功'),
                    relateUser: this.getI18nByKey('分享用户组'),
                    relateMenu: this.getI18nByKey('关联菜单'),
                    relatedRequired: this.getI18nByKey('没有值'),
                    close: this.getI18nByKey('关闭'),
                    participantType: this.getI18nByKey('参与者类型'),
                    participant: this.getI18nByKey('参与者'),
                    department: this.getI18nByKey('部门'),
                    phone: this.getI18nByKey('电话'),
                    email: this.getI18nByKey('邮箱'),
                    failedAdd: this.getI18nByKey('添加成员失败'),
                    addUser: this.getI18nByKey('添加成员'),
                    remove: this.getI18nByKey('移除'),
                    layoutAuth: this.getI18nByKey('布局权限'),
                    successRemove: this.getI18nByKey('移除成功'),
                    failedRemoveUser: this.getI18nByKey('移除人员失败'),
                    menuOperate: this.getI18nByKey('操作菜单'),
                    layout: this.getI18nByKey('布局'),
                    lastWarning: this.getI18nByKey('最后一条不允许删除')
                },
                layoutClass: 'erd.cloud.dashboard.entity.DashboardLayout',
                contentHeight: $(window).height() - 152,
                visible: false,
                visibleForShare: false,
                listData: [],
                tableHeight: 500,
                total: 0,
                pageSize: 10,
                currentPage: 1,
                currentLayout: {},
                relationUserData: [],
                relateMenuVal: '',
                relationTablePagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                },
                loadingForRelateUser: false,
                currentLan: window.LS.get('lang_current'),
                myLoading: false,
                firstLayout: null,
                appCode: '',
                participantsList: [],
                loading: false,
                removeIds: [],
                participantSelectType: 'USER',
                defaultTableData: []
            };
        },
        mounted() {
            this.getFirstPage();
            this.getAppCode();
        },
        methods: {
            getFirstPage() {
                this.$famHttp({
                    url: '/commnon/dashboard/layout/first/layout',
                    method: 'get',
                    data: {
                        className: this.layoutClass
                    }
                }).then((res) => {
                    if (res.success) {
                        this.firstLayout = res?.data ?? null;
                    }
                });
            },
            getAppCode() {
                const resourcePath = this.$store.getters['route/matchResourcePath'](
                    this.$route,
                    this.$store.state.route.resources
                );
                if (resourcePath && resourcePath.length > 0) {
                    this.appCode = [...resourcePath].reverse().reduce((prev, resource) => {
                        return prev ? prev : this.$store.getters.appNameByResourceKey(resource.identifierNo);
                    }, '');
                    if (typeof this.appCode === 'string') {
                        this.appCode = window.encodeURIComponent(this.appCode);
                    }
                }
            },
            callback(resp) {
                const self = this;
                const records = resp?.data?.records || [];
                if (records.length > 0) {
                    if (self.firstLayout !== null) {
                        const temp = records.find((item) => item.id === self.firstLayout.id);
                        if (temp !== undefined) {
                            self.$set(temp, "isFirst", true);
                        }
                    }
                }
            },
            switchPinned(row) {
                var self = this;
                self.myLoading = true;
                this.$famHttp({
                    url: '/fam/update',
                    method: 'post',
                    data: {
                        className: self.layoutClass,
                        attrRawList: [
                            {
                                attrName: 'pinned',
                                value: row.pinned
                            }
                        ],
                        oid: row.oid
                    }
                })
                    .then((resp) => {
                        if (resp.success) {
                            self.$message.success(self.i18nMappingObj.success);
                            self.reload();
                        }
                    })
                    .finally(() => {
                        self.myLoading = false;
                    });
            },
            removeRelation(data) {
                var self = this;
                this.$confirm(
                    `${this.i18nMappingObj.sure_delect}【${data?.row?.participant || ''}】${
                        this.i18nMappingObj.layoutAuth
                    }?`,
                    this.i18nMappingObj.wxts,
                    {
                        confirmButtonText: this.i18nMappingObj.confirm,
                        cancelButtonText: this.i18nMappingObj.cancel,
                        type: 'warning'
                    }
                ).then(() => {
                    self.$refs.erdTable.$refs.xTable.remove(data.row);
                    const index = self.relationUserData.findIndex(
                        (item) => item.roleBObjectRef === data.row.roleBObjectRef
                    );
                    self.relationUserData.splice(index, 1);
                });
            },
            handleOpenRelateUser(row) {
                this.currentLayout = row;
                this.visibleForShare = true;
                this.participantSelectType = 'USER';
                this.loadRelateUserData();
            },
            handleCloseRelateUser() {
                this.visibleForShare = false;
            },
            loadRelateUserData: function () {
                var self = this;
                this.loadingForRelateUser = true;
                this.$famHttp({
                    url: '/common/dashboard/layout/link/page',
                    data: {
                        className: 'erd.cloud.dashboard.entity.DashboardLayoutLink',
                        pageIndex: this.relationTablePagination.pageIndex,
                        pageSize: this.relationTablePagination.pageSize,
                        roleAObjectOId: this.currentLayout.oid
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        const { data } = resp || [];
                        this.relationTablePagination.total = Number(data.total);
                        this.participantsList = data.records.map((item) => {
                            // 各自人员类型对象 包含用户 角色 群组 组织
                            let userObj =
                                item?.userInfo || item?.roleDto || item?.organizationDto || item?.groupDto || {};
                            return {
                                id: item.id,
                                oid: item.oid,
                                participantType: item.linkName || '-', // 参与者类型
                                participant: userObj?.displayName || '—', // 参与者
                                department: userObj?.orgName || '—', // 部门
                                phone: userObj?.mobile || '—', // 电话
                                email: userObj?.email || '—', // 电话 || '',// 邮箱
                                roleBObjectRef: item.roleBObjectRef,
                                code: item.userInfo ? userObj?.code || '--' : ''
                            };
                        });
                        this.getTablePageData();
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || '获取列表失败'
                        // });
                    })
                    .finally(() => {
                        self.loadingForRelateUser = false;
                    });
            },
            handleDeletelayout(data) {
                var self = this;
                if (this.$refs.table.pagination.total === 1) {
                    this.$message.warning(this.i18nMappingObj.lastWarning);
                    return;
                }
                this.$confirm(
                    `${this.i18nMappingObj.confirm_delete}【${data.name || ''}】?`,
                    this.i18nMappingObj.confirm_delete,
                    {
                        confirmButtonText: this.i18nMappingObj.confirm,
                        cancelButtonText: this.i18nMappingObj.cancel,
                        type: 'warning'
                    }
                )
                    .then((res) => {
                        this.$loading({ lock: true });
                        this.$famHttp({
                            url: '/common/delete',
                            method: 'DELETE',
                            params: {
                                oid: data.oid,
                                category: 'DELETE'
                            }
                        })
                            .then((res) => {
                                if (res.success) {
                                    this.$message({
                                        type: 'success',
                                        message: `${self.i18nMappingObj.deletelayout}${self.i18nMappingObj.success}`
                                    });
                                    // 刷新表格
                                    self.reload();
                                }
                            })
                            .catch((error) => {
                                self.$message.error(this.i18nMappingObj.failedRemoveUser);
                            });
                    })
                    .catch(() => {})
                    .finally((res) => {
                        self.$loading().close();
                    });
            },
            handleEditlayout: function (row) {
                this.currentLayout = row;
                this.visible = true;
            },
            setFirstLayout(layoutOid) {
                this.useSystemLayout(layoutOid).then((res) => {
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.setDefaultTips
                        });
                        this.getFirstPage();
                        this.reload();
                    }
                });
            },
            useSystemLayout: function (layoutOid) {
                return this.$famHttp.post('fam/create', {
                    action: 'CREATE',
                    className: 'erd.cloud.dashboard.entity.DashboardLayoutFirstLink',
                    attrRawList: [
                        {
                            attrName: 'roleAObjectRef',
                            value: layoutOid
                        },
                        {
                            attrName: 'roleBObjectRef',
                            value: this.$store.state.user.oid
                        },
                        {
                            attrName: 'appName',
                            value: this.appCode
                        },
                        {
                            attrName: 'tenantId',
                            value: this.tenantId
                        }
                    ]
                });
            },
            createLayout: function () {
                this.currentLayout = {};
                this.visible = true;
                this.$refs.layoutForm && this.$refs.layoutForm.reInit();
            },
            submitCreateLayout: function () {
                var self = this;
                this.$refs.layoutForm
                    .submit()
                    .then((resp) => {
                        if (resp.success) {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.createSuccess
                            });
                        } else {
                            self.$message.error(resp.message);
                        }
                    })
                    .then(() => {
                        self.visible = false;
                        self.reload();
                    });
            },
            close: function () {
                this.currentLayout = {};
                this.visible = false;
            },
            reload: function () {
                this.$refs.table.fnRefreshTable('default');
            },
            getLayoutType(type) {
                const layoutList = {
                    PERSONAL: this.i18nMappingObj.personalLayout,
                    GLOBAL: this.i18nMappingObj.systemLayout
                };
                return layoutList[type];
            },
            saveMember() {
                this.relate();
            },
            async handleParticipantInput({ type, value }) {
                this.participantSelectType = type;
            },
            handleParticipantChange(ids, objectList) {
                let newParticipant = [];
                const participantType = this.participantSelectType;
                objectList?.forEach((item) => {
                    const obj = {
                        id: null,
                        oid: null,
                        participantType: participantType,
                        participant: item.displayName,
                        department: item.orgName || '--',
                        phone: item.mobile || '--',
                        email: item.email || '--',
                        roleBObjectRef: item.oid,
                        __NEW_ROW__: true,
                        code: participantType === 'USER' ? item.code || '--' : ''
                    };
                    newParticipant.push(obj);
                });
                const tableData = JSON.parse(JSON.stringify(this.relationUserData));
                newParticipant?.forEach((item) => {
                    const sameItem = tableData.find((el) => {
                        return (
                            (el?.participant || el?.roleBObjectRef) === item.participant &&
                            el.participantType === item.participantType
                        );
                    });
                    if (!sameItem) {
                        this.relationUserData.push(item);
                    }
                });
                let newTableData = [];
                if (newParticipant.length) {
                    this.relationUserData.forEach((item) => {
                        const sameItem = newParticipant.find((el) => {
                            return (
                                this.participantSelectType !== item.participantType ||
                                ((item?.participant || item?.roleBObjectRef) === el.participant &&
                                    el.participantType === item.participantType)
                            );
                        });
                        if (sameItem) {
                            newTableData.push(item);
                        }
                    });
                } else {
                    newTableData = this.relationUserData.filter(
                        (item) => item.participantType !== this.participantSelectType
                    );
                }
                this.relationUserData = newTableData;
            },
            relate() {
                let relationList = [];
                this.removeIds = [];
                const selectUser = this.relationUserData.filter((item) => item.__NEW_ROW__);
                this.defaultTableData.forEach((item) => {
                    const found = !this.relationUserData.some((ele) => ele.roleBObjectRef === item.roleBObjectRef);
                    if (found) {
                        this.removeIds.push(item.oid);
                    }
                });
                const createList = selectUser?.map((item) => {
                    return {
                        action: 'CREATE',
                        attrRawList: [
                            {
                                attrName: 'roleBObjectRef',
                                value: item.roleBObjectRef
                            }
                        ],
                        className: 'erd.cloud.dashboard.entity.DashboardLayoutLink'
                    };
                });
                const removeList = this.removeIds?.map((item) => {
                    return {
                        action: 'DELETE',
                        oid: item,
                        className: 'erd.cloud.dashboard.entity.DashboardLayoutLink'
                    };
                });
                relationList = createList.concat(removeList);
                ErdcKit.debounceFn(() => {
                    this.$famHttp({
                        url: '/fam/update',
                        method: 'post',
                        data: {
                            associationField: 'roleAObjectRef',
                            className: this.layoutClass,
                            attrRawList: [],
                            oid: this.currentLayout.oid,
                            relationList: relationList
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18nMappingObj.success);
                            this.visibleForShare = false;
                        }
                    });
                }, 200);
            },
            getTablePageData() {
                const { participantsList, relationTablePagination: pagination } = this;

                const tableData = participantsList.slice(
                    (pagination.pageIndex - 1) * pagination.pageSize,
                    pagination.pageIndex * pagination.pageSize
                );
                this.relationUserData = tableData;
                this.defaultTableData = JSON.parse(JSON.stringify(tableData));
            }
        }
    };
});
