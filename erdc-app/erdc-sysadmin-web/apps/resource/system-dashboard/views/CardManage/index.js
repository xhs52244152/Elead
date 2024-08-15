define([
    'text!' + ELMP.resource('system-dashboard/views/CardManage/index.html'),
    'erdcloud.kit',
    'TreeUtil',
    'erdc-kit'
], function (tmpl, erdcloudKit, TreeUtil, ErdcKit) {
    const defaultFormData = {
        widget: '',
        nameI18nJson: {},
        descriptionI18nJson: {},
        state: 'STARTED',
        appName: '',
        apiType: 'INNER',
        apiConfig: {},
        menu: '[{"clazz":"dashboard-card-edit-btn", "text":"编辑"},{"clazz":"dashboard-card-config-btn", "text":"配置"}]'
    };
    const defaultFormDataForRealize = {
        api: '',
        chartType: ''
    };

    function convertUpdateToFormData(formConfig, rawData) {
        let newRowData = {};
        formConfig.forEach(function (i) {
            if (rawData[i.field]) {
                if (rawData[i.field].attrName.includes('I18nJson')) {
                    newRowData[i.field] = {
                        attrName: rawData[i.field].attrName,
                        value: rawData[i.field].value
                    };
                } else {
                    newRowData[i.field] = rawData[i.field].value;
                }
            }
        });
        return newRowData;
    }
    const cardClass = 'erd.cloud.dashboard.entity.DashboardCard';
    return {
        template: tmpl,
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            famAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                tenantId: JSON.parse(window.LS.get('tenantId')),
                i18nLocalePath: ELMP.resource('locale/index.js', 'system-dashboard'),
                i18nMappingObj: {
                    create: this.getI18nByKey('创建'),
                    createCard: this.getI18nByKey('创建卡片'),
                    updateCard: this.getI18nByKey('编辑卡片'),
                    baseMsg: this.getI18nByKey('基础信息'),
                    realizeMeg: this.getI18nByKey('实现方式'),
                    code: this.getI18nByKey('编码'),
                    name: this.getI18nByKey('名称'),
                    desc: this.getI18nByKey('描述'),
                    status: this.getI18nByKey('状态'),
                    app: this.getI18nByKey('应用'),
                    dataAPI: this.getI18nByKey('数据API'),
                    showType: this.getI18nByKey('显示方式'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),
                    resourceType: this.getI18nByKey('动态资源实现'),
                    apiType: this.getI18nByKey('高级API实现'),
                    line_chart: this.getI18nByKey('折线图'),
                    bar_chart: this.getI18nByKey('柱状图'),
                    sure_delect: this.getI18nByKey('确认移除'),
                    confirm_delete: this.getI18nByKey('确认删除'),
                    pie_chart: this.getI18nByKey('饼图'),
                    dashboard_manage_pure_num: this.getI18nByKey('纯数字'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    success: this.getI18nByKey('成功'),
                    edit: this.getI18nByKey('编辑'),
                    relateUser: this.getI18nByKey('关联用户组'),
                    relateMenu: this.getI18nByKey('关联菜单'),
                    deleteCard: this.getI18nByKey('删除'),
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
                    cardAuth: this.getI18nByKey('卡片权限'),
                    wxts: this.getI18nByKey('温馨提示'),
                    successRemove: this.getI18nByKey('移除成功'),
                    failedRemoveUser: this.getI18nByKey('移除人员失败'),
                    menuErrorTips: this.getI18nByKey('操作菜单JSON错误'),
                    menuOperate: this.getI18nByKey('操作菜单'),
                    editor: this.getI18nByKey('editor'),
                    editTime: this.getI18nByKey('editTime'),
                    operation: this.getI18nByKey('operation')
                },
                currentRow: null,
                visible: false,
                visibleForRelateMenu: false,
                visibleForRelateUser: false,
                realizeFold: true,
                baseInfoFold: true,
                formData: Object.assign({}, defaultFormData),
                formDataForRealize: Object.assign({}, defaultFormDataForRealize),
                relationUserData: [],
                relateMenuVal: '',
                relationTablePagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                },
                loadingForRelateUser: false,
                cardState: [],
                tableHeight: document.body.clientHeight - 40 - 24 - 55 - 48 - 28 - 16 - 16,
                currentLan: window.LS.get('lang_current'),
                participantCache: {},
                loading: false,
                appName: this.$route.query.appName || 'ALL',
                removeIds: [],
                participantsList: [],
                participantSelectType: 'USER',
                defaultTableData: []
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            menuResources: function () {
                return this.$store.state.route.allResourceTree;
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
            isAdvanceAPIType: function () {
                return this.formData.apiType === 'ADVANCE';
            },
            chartTypeOptions: function () {
                return [
                    {
                        value: 'line',
                        name: this.i18nMappingObj.line_chart //'折线图'
                    },
                    {
                        value: 'bar',
                        name: this.i18nMappingObj.bar_chart //'柱状图'
                    },
                    {
                        value: 'pie',
                        name: this.i18nMappingObj.pie_chart //'饼图'
                    },
                    {
                        value: 'num',
                        name: this.i18nMappingObj.dashboard_manage_pure_num //'纯数字'
                    }
                ];
            },
            viewTableConfig: function () {
                var self = this;
                return {
                    columns: [
                        {
                            attrName: 'widget',
                            label: this.i18nMappingObj.code,
                            minWidth: 80
                        },
                        {
                            attrName: 'nameI18nJson',
                            label: this.i18nMappingObj.name,
                            minWidth: 150
                        },
                        {
                            attrName: 'state',
                            label: this.i18nMappingObj.status,
                            minWidth: 80
                        },

                        {
                            attrName: 'apiType',
                            label: this.i18nMappingObj.realizeMeg,
                            minWidth: 110
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
                        }
                    ],
                    searchParamsKey: 'searchKey',
                    isDeserialize: true, // 是否反序列数据源
                    sortFixRight: true, // 排序图标是否显示在右边
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        tableKey: 200,
                        nameI18nJson: 200,
                        operation: 85
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
                            className: cardClass,
                            conditionDtoList: []
                        },
                        method: 'post',
                        isFormData: false,
                        transformResponse: [
                            function (data) {
                                let resData = data;
                                try {
                                    resData = data && JSON.parse(data);
                                    _.each(resData.records, function (i) {
                                        i.attrRawList = i.attrRawList || [];
                                        i.attrRawList.push({
                                            attrName: 'tenantId',
                                            value: i.tenantId
                                        });
                                    });
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    toolbarConfig: {
                        showMoreSearch: false,
                        showConfigCol: true,
                        showRefresh: true,
                        valueKey: 'attrName',
                        mainBtn: {
                            label: self.i18nMappingObj.create,
                            onclick() {
                                self.currentRow = null;
                                self.visible = true;
                                self.formData = Object.assign({}, defaultFormData, {
                                    appName: _.some(self.appList, (i) => {
                                        return i.identifierNo === 'plat';
                                    })
                                        ? 'plat'
                                        : self.appList[0]
                                          ? self.appList[0].identifierNo
                                          : ''
                                });
                                self.formDataForRealize = Object.assign({}, defaultFormDataForRealize);
                                self.$nextTick(function () {
                                    self.$refs.form?.clearValidate();
                                    self.$refs.formForRealize?.clearValidate();
                                });
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
                            prop: 'state',
                            type: 'default'
                        },
                        {
                            prop: 'apiType',
                            type: 'default'
                        }
                    ],
                    headerRequestConfig: {
                        // 表格列头查询配置(默认url: '/fam/table/head')
                        method: 'POST',
                        data: {
                            className: cardClass
                        }
                    },
                    // fieldLinkConfig: {
                    //     fieldLink: true, // 是否添加列超链接
                    //     fieldLinkName: 'nameI18nJson', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                    //     linkClick: (row) => {
                    //         // 超链接事件
                    //         this.linkClick(row);
                    //     }
                    // },
                    pagination: {
                        // 分页
                        showPagination: true, // 是否显示分页
                        pageSize: 20
                    }
                };
            },
            appList: function () {
                return this.$store.state.app.appNames || [];
            },
            formConfigs: function () {
                var self = this;
                return [
                    {
                        field: 'widget',
                        component: 'erd-input',
                        label: this.i18nMappingObj.code,
                        required: true,
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.name,
                        required: true,
                        col: 12
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
                        field: 'menu',
                        component: 'erd-input',
                        label: this.i18nMappingObj.menuOperate,
                        props: {
                            'type': 'textarea',
                            'show-word-limit': true,
                            'maxlength': 200
                        },
                        col: 24,
                        validators: [
                            {
                                required: true,
                                trigger: ['submit'],
                                validator(rule, value, callback) {
                                    try {
                                        JSON.parse(value);
                                        callback();
                                    } catch (e) {
                                        callback(self.i18nMappingObj.menuErrorTips);
                                    }
                                }
                            }
                        ]
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
                    },
                    {
                        field: 'apiType',
                        component: 'fam-radio',
                        label: this.i18nMappingObj.realizeMeg,
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj.resourceType,
                                    value: 'INNER'
                                },
                                {
                                    label: this.i18nMappingObj.apiType,
                                    value: 'ADVANCE'
                                }
                            ]
                        },
                        col: 12
                    }
                ];
            },
            formConfigsForRealize: function () {
                return [
                    {
                        field: 'api',
                        component: 'erd-input',
                        label: this.i18nMappingObj.dataAPI,
                        required: true,
                        col: 12
                    },
                    {
                        field: 'chartType',
                        label: this.i18nMappingObj.showType,
                        slots: {
                            component: 'chartType'
                        },
                        required: true,
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
            handleData(tableData, callback) {
                tableData.forEach((i) => {
                    if (i.apiType) {
                        i.apiType = i.attrRawList.find((ii) => ii.attrName === 'apiType').value;
                    }
                });
                callback(tableData);
            },
            handleCommand(command, row) {
                switch (command) {
                    case 'edit':
                        this.handleEditCard(row);
                        break;
                    case 'relateUser':
                        this.handleOpenRelateUser(row);
                        break;
                    case 'relateMenu':
                        this.handleOpenRelateMenu(row);
                        break;
                    case 'deleteCard':
                        this.handleDeleteCard(row);
                        break;
                }
            },
            handleCloseRelateUser() {
                this.visibleForRelateUser = false;
                this.$refs.famParticipantSelect.clearInput(true);
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
                        className: 'erd.cloud.dashboard.entity.DashboardCardLink'
                    };
                });
                const removeList = this.removeIds?.map((item) => {
                    return {
                        action: 'DELETE',
                        oid: item,
                        className: 'erd.cloud.dashboard.entity.DashboardCardLink'
                    };
                });
                relationList = createList.concat(removeList);
                this.loading = true;
                this.$famHttp({
                    url: '/fam/update',
                    method: 'post',
                    data: {
                        associationField: 'roleAObjectRef',
                        className: cardClass,
                        attrRawList: [],
                        oid: this.currentRow.oid,
                        relationList: relationList
                    }
                })
                    .then((resp) => {
                        if (resp.success) {
                            this.$message.success(`${this.i18nMappingObj.relateUser}${this.i18nMappingObj.success}`);
                            this.visibleForRelateUser = false;
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            saveMember() {
                this.relate();
            },
            cancel() {
                this.visibleForRelateUser = false;
            },
            close: function () {
                this.$refs.form?.clearValidate();
                this.$refs.formForRealize?.clearValidate();
                this.visible = false;
            },
            saveData(data) {
                var self = this;
                var rowList = [];
                _.each(data, function (value, key) {
                    rowList.push({
                        attrName: key,
                        value: value
                    });
                });
                this.$famHttp({
                    url: data.oid ? '/fam/update' : '/fam/create',
                    method: 'post',
                    data: {
                        className: cardClass,
                        attrRawList: rowList,
                        oid: data.oid
                    }
                })
                    .then(function (resp) {
                        if (resp.success) {
                            self.$message.success({
                                message: data.oid
                                    ? self.i18nMappingObj.updateSuccess
                                    : self.i18nMappingObj.createSuccess,
                                duration: 2000,
                                onClose: function () {
                                    self.close();
                                    self.$refs.table.fnRefreshTable('default');
                                }
                            });
                        } else {
                            self.$message.error(resp.message);
                        }
                    })
                    .catch(function (resp) {
                        self.$message.error(resp.data.message || resp.message);
                    });
            },
            submit() {
                this.$refs.form.submit().then((validateResult) => {
                    if (validateResult.valid) {
                        if (this.isAdvanceAPIType) {
                            this.$refs.formForRealize.submit().then((data) => {
                                if (data.valid) {
                                    let data = Object.assign({}, this.formData);
                                    this.currentRow && (data.oid = this.currentRow.oid);
                                    data.menu && (data.menu = JSON.parse(data.menu));
                                    data.apiConfig = this.formDataForRealize;
                                    this.saveData(data);
                                }
                            });
                        } else {
                            let data = Object.assign({}, this.formData);
                            data.menu && (data.menu = JSON.parse(data.menu));
                            this.currentRow && (data.oid = this.currentRow.oid);
                            this.saveData(data);
                        }
                    }
                });
            },
            handleEditCard(row) {
                this.currentRow = row;
                this.visible = true;
                var self = this;
                this.$famHttp({
                    url: '/fam/attr',
                    params: {
                        className: cardClass,
                        oid: row.oid
                    }
                }).then(function (resp) {
                    if (resp.success) {
                        var formData = convertUpdateToFormData(self.formConfigs, resp.data.rawData);
                        formData.menu && (formData.menu = JSON.stringify(formData.menu));
                        var apiConfig = Object.assign({}, defaultFormDataForRealize);
                        if (formData.apiType === 'ADVANCE' && resp.data.rawData.apiConfig) {
                            apiConfig = resp.data.rawData.apiConfig.value;
                        }
                        self.formData = formData;
                        self.formDataForRealize = apiConfig;
                    }
                });
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
                this.currentSelected = null;
                this.loadingForRelateUser = true;
                this.$famHttp({
                    url: '/common/dashboard/card/link/page',
                    data: {
                        className: 'erd.cloud.dashboard.entity.DashboardCardLink',
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
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || '获取列表失败'
                        });
                    })
                    .finally(() => {
                        self.loadingForRelateUser = false;
                    });
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
            handleOpenRelateMenu(row) {
                this.currentRow = row;
                this.visibleForRelateMenu = true;
                this.$famHttp({
                    url: '/common/dashboard/card/resource/link/list',
                    params: {
                        cardOid: row.oid
                    }
                }).then((resp) => {
                    if (resp.success) {
                        let hasAuthResources = [];
                        this.relateMenuVal = resp.data
                            .map((item) => {
                                let i = item.roleBObjectRef;
                                let path = TreeUtil.findPath(this.menuResources, {
                                    target: {
                                        oid: i
                                    }
                                });
                                if (path.length) {
                                    hasAuthResources.push(item);
                                    return _.pluck(path, 'oid');
                                }
                                return false;
                            })
                            .filter(Boolean);
                        this.relateMenuValBak = erdcloudKit.deepClone(hasAuthResources);
                    }
                });
            },
            relateMenu() {
                var self = this;
                var relationList = [];
                var relateMenuValBak = self.relateMenuValBak || [];
                if (this.relateMenuVal && this.relateMenuVal.length > 0) {
                    this.relateMenuVal.forEach((i) => {
                        var oldIndex = relateMenuValBak.findIndex((item) => {
                            return item.roleBObjectRef === i[i.length - 1];
                        });
                        if (oldIndex === -1) {
                            relationList.push({
                                action: 'CREATE',
                                className: 'erd.cloud.dashboard.entity.DashboardCardResourceLink',
                                attrRawList: [
                                    {
                                        attrName: 'roleAObjectRef',
                                        value: this.currentRow.oid
                                    },
                                    {
                                        attrName: 'roleBObjectRef',
                                        value: i[i.length - 1]
                                    }
                                ]
                            });
                        } else {
                            relateMenuValBak.splice(oldIndex, 1);
                        }
                    });
                }
                // relateMenuValBak.forEach(function (i) {
                //     relationList.push({
                //         action: 'DELETE',
                //         className: 'erd.cloud.dashboard.entity.DashboardCardResourceLink',
                //         oid: i.oid
                //     });
                // });
                let createPromise = null;
                let deletePromise = null;
                if (relationList && relationList.length > 0) {
                    createPromise = this.$famHttp({
                        url: '/common/saveOrUpdate',
                        method: 'post',
                        data: {
                            className: 'erd.cloud.dashboard.entity.DashboardCardResourceLink',
                            rawDataVoList: relationList
                        }
                    });
                } else {
                    createPromise = Promise.resolve();
                }
                if (relateMenuValBak && relateMenuValBak.length) {
                    deletePromise = this.$famHttp({
                        url: '/common/deleteByIds',
                        method: 'delete',
                        data: {
                            oidList: relateMenuValBak.map((i) => i.oid)
                        }
                    });
                } else {
                    deletePromise = Promise.resolve();
                }
                Promise.all([createPromise, deletePromise])
                    .then(() => {
                        this.$message.success(`${this.i18nMappingObj.relateMenu}${this.i18nMappingObj.success}`);
                    })
                    .catch(() => {
                        console.log();
                    })
                    .finally(() => {
                        this.visibleForRelateMenu = false;
                    });
            },
            handleDeleteCard(data) {
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
                    .then(() => {
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
                                        message: `${self.i18nMappingObj.deleteCard}${self.i18nMappingObj.success}`
                                    });
                                    // 刷新表格
                                    self.$refs.table.fnSearchTableList();
                                }
                            })
                            .catch(() => {
                                // self.$message.error(this.i18nMappingObj.failedRemoveUser);
                            });
                    })
                    .finally(() => {
                        self.$loading().close();
                    });
            },
            removeRelation(data) {
                const self = this;
                this.$confirm(
                    `${this.i18nMappingObj.sure_delect}【${data?.row?.participant || ''}】${
                        this.i18nMappingObj.cardAuth
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
