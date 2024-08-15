define(['text!' + ELMP.resource('system-dashboard/views/LayoutManage/index.html'), 'erdc-kit'], function (
    template,
    ErdcKit
) {
    const layoutClass = 'erd.cloud.dashboard.entity.DashboardLayout';

    return {
        template,
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            LayoutForm: ErdcKit.asyncComponent(ELMP.resource('system-dashboard/components/LayoutForm/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            famAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'system-dashboard'),
                i18nMappingObj: {
                    create: this.getI18nByKey('创建'),
                    createlayout: this.getI18nByKey('创建布局'),
                    updatelayout: this.getI18nByKey('编辑布局'),
                    baseMsg: this.getI18nByKey('基础信息'),
                    name: this.getI18nByKey('名称'),
                    desc: this.getI18nByKey('描述'),
                    status: this.getI18nByKey('状态'),
                    app: this.getI18nByKey('应用'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),
                    sure_delect: this.getI18nByKey('确认移除'),
                    confirm_delete: this.getI18nByKey('确认删除'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    success: this.getI18nByKey('成功'),
                    edit: this.getI18nByKey('编辑'),
                    relateUser: this.getI18nByKey('关联用户组'),
                    relateMenu: this.getI18nByKey('关联菜单'),
                    deletelayout: this.getI18nByKey('删除'),
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
                    wxts: this.getI18nByKey('温馨提示'),
                    successRemove: this.getI18nByKey('移除成功'),
                    failedRemoveUser: this.getI18nByKey('移除人员失败'),
                    menuOperate: this.getI18nByKey('操作菜单'),
                    layout: this.getI18nByKey('布局'),
                    appName: this.getI18nByKey('appName'),
                    creator: this.getI18nByKey('creator'),
                    createTime: this.getI18nByKey('createTime'),
                    editor: this.getI18nByKey('editor'),
                    editTime: this.getI18nByKey('editTime'),
                    operation: this.getI18nByKey('operation')
                },
                currentRow: {},
                visible: false,
                visibleForRelateUser: false,
                realizeFold: true,
                baseInfoFold: true,
                relationUserData: [],
                relateMenuVal: '',
                relationTablePagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                },
                loadingForRelateUser: false,
                currentLan: window.LS.get('lang_current'),
                memberList: [],
                groupList: [],
                participantsList: [],
                loading: false,
                participantCache: {},
                appName: this.$route.query.appName || 'ALL',
                removeIds: [],
                participantSelectType: 'USER',
                defaultTableData: []
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
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
            viewTableConfig: function () {
                const self = this;
                const appListOptions = _.map(this.appList, function (i) {
                    return {
                        displayName: i.displayName,
                        id: i.number,
                        value: i.number
                    };
                });
                return {
                    columns: [
                        {
                            attrName: 'nameI18nJson',
                            label: this.i18nMappingObj.name,
                            minWidth: 150
                        },
                        {
                            attrName: 'appName',
                            label: this.i18nMappingObj.appName,
                            minWidth: 110
                        },
                        {
                            attrName: 'state',
                            label: this.i18nMappingObj.status,
                            minWidth: 110
                        },
                        {
                            attrName: 'createBy',
                            label: this.i18nMappingObj.creator,
                            minWidth: 110
                        },
                        {
                            attrName: 'createTime',
                            label: this.i18nMappingObj.createTime,
                            minWidth: 150
                        },
                        {
                            attrName: 'updateBy',
                            label: this.i18nMappingObj.editor,
                            minWidth: 110
                        },
                        {
                            attrName: 'updateTime',
                            label: this.i18nMappingObj.editTime,
                            minWidth: 150
                        },
                        {
                            attrName: 'operation',
                            label: this.i18nMappingObj.operation,
                            isDisable: true,
                            fixed: 'right',
                            width: 85,
                            showOverflow: false,
                            minWidth: 85
                        }
                    ],
                    searchParamsKey: 'searchKey',
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
                        url: '/fam/search',
                        params: {}, // 路径参数
                        data: {
                            className: layoutClass,
                            conditionDtoList: [
                                {
                                    attrName: 'layoutType',
                                    oper: 'EQ',
                                    value1: 'GLOBAL'
                                }
                            ]
                        },
                        method: 'post',
                        isFormData: false
                    },
                    toolbarConfig: {
                        showMoreSearch: false,
                        showConfigCol: true,
                        showRefresh: true,
                        valueKey: 'attrName',
                        mainBtn: {
                            label: self.i18nMappingObj.create,
                            onclick() {
                                self.visible = true;
                                self.currentRow = {};
                                self.$refs.layoutForm && self.$refs.layoutForm.reInit();
                            }
                        }
                    },
                    addOperationCol: true,
                    addCheckbox: false,
                    addSeq: true,
                    slotsField: [
                        {
                            prop: 'operation',
                            type: 'default'
                        },
                        {
                            prop: 'appName',
                            type: 'default'
                        },
                        {
                            prop: 'state',
                            type: 'default'
                        }
                    ],
                    pagination: {
                        // 分页
                        showPagination: true, // 是否显示分页
                        pageSize: 20
                    },
                    advanceQuery: {
                        state: ''
                    }
                };
            },
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
            formConfigs: function () {
                return [
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.name,
                        col: 12
                    },
                    {
                        field: 'resourceRef',
                        component: 'erd-cascader',
                        label: this.i18nMappingObj.relateMenu,
                        col: 12
                        // slots: {
                        //     component: 'resourceRef'
                        // }
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.desc,
                        props: {
                            type: 'textarea'
                        },
                        col: 24
                    },
                    {
                        field: 'state',
                        component: 'fam-radio',
                        label: this.i18nMappingObj.status,
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj.enable,
                                    value: 'STARTED'
                                },
                                {
                                    label: this.i18nMappingObj.disable,
                                    value: 'BANNED'
                                }
                            ]
                        },
                        col: 12
                    },
                    {
                        field: 'appName',
                        label: this.i18nMappingObj.app,
                        slots: {
                            component: 'appName'
                        },
                        col: 12
                    }
                ];
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
        methods: {
            handleCommand(command, row) {
                switch (command) {
                    case 'edit':
                        this.handleEditlayout(row);
                        break;
                    case 'relateUser':
                        this.handleOpenRelateUser(row);
                        break;
                    case 'layout':
                        this.configLayout(row);
                        break;
                    case 'deletelayout':
                        this.handleDeletelayout(row);
                        break;
                }
            },
            handleCloseRelateUser() {
                this.visibleForRelateUser = false;
                this.$refs.famParticipantSelect.clearInput();
            },
            advancedSearch: function () {
                var self = this;
                var advanceQueryKeys = Object.keys(this.advanceQuery);
                var conditionList = self.$refs.table.conditionDtoList.filter((i) => {
                    return advanceQueryKeys.indexOf(i.attrName) === -1;
                });
                advanceQueryKeys.forEach((i) => {
                    if (self.advanceQuery[i]) {
                        conditionList.push({
                            attrName: self.advanceQuery[i],
                            oper: 'EQ',
                            value1: self.advanceQuery[i]
                        });
                    }
                });
                self.$refs.table.fnSearchTableList();
            },
            configLayout(row) {
                this.$router.push({
                    name: 'layoutConfig',
                    params: {
                        id: row.oid
                    },
                    query: {
                        appName: row.appCode
                    }
                });
            },
            changeMember(id, data) {
                this.memberList = data;
                this.groupList = [];
                this.relate();
            },
            changeUserGroup(data) {
                this.memberList = [];
                this.groupList = data.selected;
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
                            className: layoutClass,
                            attrRawList: [],
                            oid: this.currentRow.oid,
                            relationList: relationList
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18nMappingObj.success);
                            this.visibleForRelateUser = false;
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
                this.defaultTableData = tableData;
            },
            close: function () {
                this.currentRow = {};
                this.visible = false;
            },
            saveMember() {
                this.relate();
            },
            cancel() {
                this.visibleForRelateUser = false;
            },
            submit() {
                var self = this;
                this.$refs.layoutForm
                    .submit()
                    .then((resp) => {
                        if (resp.success) {
                            self.$message.success({
                                message: self.i18nMappingObj.success,
                                duration: 2000
                            });
                            self.close();
                            self.$refs.table.fnRefreshTable('default');
                        } else {
                            self.$message.error(resp.message);
                        }
                    })
                    .then(() => {
                        self.$refs.table.fnRefreshTable('default');
                    });
            },
            handleEditlayout(row) {
                this.currentRow = row;
                this.visible = true;
            },
            handleOpenRelateUser(row) {
                this.currentRow = row;
                this.participantSelectType = 'USER';
                this.removeIds = [];
                this.visibleForRelateUser = true;
                this.loadRelateUserData();
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
                        // orderBy: 'createTime',
                        roleAObjectOId: this.currentRow.oid
                        // sortBy: 'desc'
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
                                participantType: item.linkName || '--', // 参与者类型
                                participant: userObj?.displayName || '--', // 参与者
                                department: userObj?.orgName || '--', // 部门
                                phone: userObj?.mobile || '--', // 电话
                                email: userObj?.email || '--', // 电话 || '',// 邮箱
                                roleBObjectRef: item.roleBObjectRef,
                                code: item.userInfo ? userObj?.code || '--' : ''
                            };
                        });
                        this.getTablePageData();
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || '获取列表失败'
                        });
                    })
                    .finally(() => {
                        self.loadingForRelateUser = false;
                    });
            },
            handleDeletelayout(data) {
                var self = this;
                this.$confirm(
                    `${this.i18nMappingObj.confirm_delete}【${data.nameI18nJson || ''}】?`,
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
                                    self.$refs.table.fnRefreshTable('default');
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
            handlerData(tableData, cb) {
                tableData = tableData.map((item) => {
                    let appCode = '';
                    const appAttr = _.find(item.attrRawList, function (i) {
                        return i.attrName === 'appName';
                    });
                    if (appAttr) {
                        appCode = appAttr.value;
                    }
                    let result = {
                        ...item,
                        ...ErdcKit.deserializeArray(item.attrRawList, {
                            valueKey: 'displayName',
                            isI18n: true
                        })
                    };
                    result.appCode = appCode;
                    return result;
                });
                return cb(tableData);
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
            }
        }
    };
});
