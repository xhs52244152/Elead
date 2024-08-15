define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-participant/components/MemberViewTable/index.html'),
    'css!' + ELMP.resource('system-participant/components/MemberViewTable/style.css'),
    'underscore'
], function (ErdcKit, template) {
    const _ = require('underscore');
    const axios = require('fam:http');
    return {
        template,
        props: {
            orgId: {
                type: String,
                default() {
                    return '';
                }
            },
            orgCode: {
                type: String,
                default() {
                    return '';
                }
            },
            orgRow: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                joinOrgForm: {
                    joinOrgVisible: false,
                    loading: false
                },
                form: {
                    oid: null,
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false,
                    defaultValue: {}
                },
                dimission: {
                    dimissionMember: [], // 离职人员
                    visible: false,
                    multiple: true,
                    loading: false
                },
                resetPassword: {
                    visible: false,
                    loading: false
                },
                currentOperRow: '',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'addMember',
                    'editMember',
                    'sure',
                    'cancel',
                    'ok',
                    'removeMemberConfirm',
                    'removeCurrentOrg',
                    'disabledMemberConfirm',
                    'disabledMember',
                    'joinOrgTitle',
                    'tips',
                    'enabledMember',
                    'readonlyMember',
                    'dimissionTips',
                    'create',
                    'join',
                    'removeOut',
                    'enable',
                    'disable',
                    'dimission',
                    'memberSearchPlaceholder',
                    'edit',
                    'disableSuccess',
                    'removeSuccess',
                    'enabledSuccess',
                    'joinSuccess',
                    '请选择交接人员',
                    '请选择加入的成员',
                    // 表格列
                    'code',
                    'loginAccount',
                    'displayName',
                    'email',
                    'mobile',
                    'orgName',
                    'operation',
                    '是否把用户离职',
                    'dimissionSuccess',
                    'resetPassword',
                    'newPassword',
                    'resetSuccess'
                ]),
                heightDiff: 260,
                tableBodyData: {} // 表格参数
            };
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            MemberForm: ErdcKit.asyncComponent(ELMP.resource('system-participant/components/MemberForm/index.js')),
            JoinMemberSelect: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/JoinMemberSelect/index.js')
            ),
            DimissionHandover: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/DimissionHandover/index.js')
            )
        },
        computed: {
            formItemData() {
                let formConfig = [
                    {
                        field: 'password',
                        component: 'erd-input',
                        label: this.i18nMappingObj.newPassword,
                        required: true,
                        validators: [],
                        props: {
                            type: 'password',
                            clearable: false,
                            showPassword: true
                        },
                        col: 24
                    }
                ];
                return formConfig;
            },
            currentOrgId() {
                return this.orgId || '';
            },
            // 处理表格右上角显示的按钮
            rightBtnList() {
                let rightOperBtnAllList = [
                    {
                        isHiddenOrg: ['ORG000002', 'ORG000003', 'ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'primary',
                        label: this.i18nMappingObj.create,
                        class: '',
                        icon: 'el-icon-plus',
                        disabledBySelect: false, // 根据表格选中数据来校验是否启用按钮
                        onclick: () => {
                            this.fnCreateMemberShow();
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000002', 'ORG000003', 'ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'default',
                        class: '',
                        icon: '',
                        label: this.i18nMappingObj.join,
                        disabledBySelect: false, // 根据表格选中数据来校验是否启用按钮
                        onclick: () => {
                            this.joinOrgForm.joinOrgVisible = true;
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000002', 'ORG000003', 'ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'default',
                        class: '',
                        icon: '',
                        label: this.i18nMappingObj.removeOut,
                        disabledBySelect: true, // 根据表格选中数据来校验是否启用按钮
                        onclick: () => {
                            this.fnRemoveMemberConfirm('batchRemove');
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'default',
                        label: this.i18nMappingObj.enable,
                        key: 'memberEnable',
                        class: '',
                        icon: '',
                        disabledBySelect: true, // 根据表格选中数据来校验是否启用按钮
                        onclick: () => {
                            this.fnEnabledMember('batch');
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000003', 'ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'default',
                        label: this.i18nMappingObj.disable,
                        key: 'memberDisabled',
                        class: '',
                        icon: '',
                        disabledBySelect: true, // 根据表格选中数据来校验是否启用按钮
                        onclick: () => {
                            this.fnDisabledMember('batchDisabled');
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'default',
                        label: this.i18nMappingObj.dimission,
                        key: 'dimissionMember',
                        class: '',
                        icon: '',
                        disabledBySelect: true, // 根据表格选中数据来校验是否启用按钮
                        onclick: () => {
                            this.fnDimissionMember('batch');
                        }
                    }
                ];
                let currentOrgShowBtnList = rightOperBtnAllList.filter((item) => {
                    // 过滤隐藏的按钮
                    if (item.isHiddenOrg && item.isHiddenOrg.indexOf(this.orgCode) != -1) {
                        return false;
                    }
                    return true;
                });
                // 组装按钮
                let mainBtn = '';
                let secondaryBtn = [];
                let moreOperateList = [];
                let isEmpty = true;
                currentOrgShowBtnList.forEach((item, index) => {
                    isEmpty = false;
                    if (index == 0) mainBtn = { ...item };
                    if (index == 1 || index == 2) secondaryBtn.push({ ...item });
                    if (index > 2) moreOperateList.push({ ...item });
                });
                return {
                    isEmpty,
                    mainBtn,
                    secondaryBtn,
                    moreOperateList
                };
            },
            // 视图表格配置
            viewTableConfig() {
                let config = {
                    tableKey: 'OrgUserTableView', // 视图表格key，在系统管理>视图表格中创建，唯一标识
                    viewTableTitle: '',
                    saveAs: false, // 是否显示另存为
                    tableConfig: this.tableConfig
                };
                return config;
            },
            // 高级表格配置
            tableConfig() {
                let tableConfig = {
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        data: this.tableBodyData // body参数
                    },
                    columnWidths: {
                        operation: window.LS.get('lang_current') === 'en_us' ? 180 : 160
                    },
                    toolbarConfig: {
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18nMappingObj.memberSearchPlaceholder, // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '280'
                        }
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
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            // 超链接事件
                            this.fnViewMemberDetail(row);
                        }
                    },
                    pagination: {
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    slotsField: [
                        // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        {
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ]
                };
                // 特殊处理，离职部门不需要显示操作列
                if (!['ORG000004'].includes(this.orgCode)) {
                    tableConfig['addOperationCol'] = true; // 是否添加操作列（该列需要自己写插槽，prop固定operation）
                }
                tableConfig.toolbarConfig = _.extend(tableConfig.toolbarConfig, this.rightBtnList);

                return tableConfig;
            },
            columnOperBtnList() {
                // 列的全部操作按钮
                let colOperAllList = [
                    {
                        isHiddenOrg: ['ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'primary',
                        label: this.i18nMappingObj.edit,
                        key: 'editMember',
                        class: '',
                        icon: '',
                        hidden: false,
                        disable: false,
                        clickParams: {
                            oper: 'viewToEdit'
                        },
                        onclick: (row, btnParams) => {
                            let rowItem = JSON.parse(JSON.stringify(row));
                            if (btnParams?.oper === 'viewToEdit') {
                                this.fnCloseMemberForm();
                            }
                            this.fnEditorMember(rowItem);
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'default',
                        label: this.i18nMappingObj.enable,
                        key: 'enableMember',
                        class: '',
                        icon: '',
                        hidden: false,
                        disable: false,
                        onclick: (row) => {
                            this.fnEnabledMember('single', row);
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000003', 'ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'default',
                        label: this.i18nMappingObj.disable,
                        key: 'disabledMember',
                        class: '',
                        icon: '',
                        hidden: false,
                        disable: false,
                        onclick: (row) => {
                            this.fnDisabledMember('singleDisabled', row);
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000004'], // 需要隐藏按钮的部门，02：未分配部门，03：已禁用，：04：已离职
                        type: 'default',
                        label: this.i18nMappingObj.dimission,
                        key: 'dimissionMember',
                        class: '',
                        icon: '',
                        hidden: false,
                        disable: false,
                        onclick: (row) => {
                            this.fnDimissionMember('single', row);
                        }
                    }
                ];
                return colOperAllList.filter((item) => item.isHiddenOrg.indexOf(this.orgCode) == -1);
            },
            // 查看用户弹窗显示的按钮
            viewOperBtnList() {
                let operBtnList = (this.columnOperBtnList || []).map((item) => item);
                // 过滤操作按钮，离职不需要在查看弹窗显示
                let filterBtn = ['dimissionMember'];
                // 重置密码
                if (this.currentOperRow.status !== 'RESIGNED') {
                    operBtnList.push({
                        isHiddenOrg: [],
                        type: 'default',
                        label: this.i18nMappingObj.resetPassword,
                        key: 'resetPassword',
                        class: '',
                        icon: '',
                        hidden: false,
                        disable: false,
                        onclick: () => {
                            this.resetPassword.visible = true;
                        }
                    });
                }
                return operBtnList.filter((item) => !filterBtn.includes(item.key));
            },
            // 当前操作行
            currentOperMemberRow() {
                return this.currentOperRow || '';
            }
        },
        created() {
            this.getHeight();
        },
        mounted() {
            // 用来判断全局搜索跳转打开详情
            if (
                this.$store.state?.['advancedSearch:To:Details'] &&
                Object.keys(this.$store.state?.['advancedSearch:To:Details']).length
            ) {
                this.form.oid = this.$store.state?.['advancedSearch:To:Details']?.oid || '';
                this.form.visible = true;
                this.form.readonly = true;
                // 使用完成之后，清空state，防止第二次进入时触发该方法
                this.$store.state['advancedSearch:To:Details'] = {};
            }
        },
        methods: {
            getHeight() {
                //获取浏览器高度并计算得到表格所用高度。 减去表格外的高度
                let height = document.documentElement.clientHeight - this.heightDiff;
                this.tableMaxHeight = height;
            },
            fnIsShowBtn(row, btn) {
                // 如果是激活状态并且不是禁用虚拟部门，那么不显示启用按钮，
                if (btn.key === 'enableMember' && !row.isEnable && !['ORG000003'].includes(this.orgCode)) {
                    return false;
                } else if (row.isEnable && btn.key === 'disabledMember') {
                    // 如果不是激活状态，不显示禁用按钮
                    return false;
                }
                return true;
            },
            // 刷新表格
            reloadMemberTable(payload) {
                this.tableBodyData = { relationshipRef: payload?.orgId };
                // 避免首次进入加载过快还未渲染完成导致报错
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnGetViewTableData();
                    }, 100);
                });
            },
            // 提交保存用户
            fnOnSubmit(formRef) {
                this.form.loading = true;
                this.$refs[formRef].submit().then(() => {
                    this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnRefreshTable();
                    this.fnCloseMemberForm();
                });
                this.form.loading = false;
            },
            fnCreateMemberShow() {
                this.form.visible = true;
                this.form.defaultValue = {
                    orgIds: this.orgRow?.oid
                        ? [
                            {
                                oid: this.orgRow?.oid,
                                name: this.orgRow?.displayName
                            }
                        ]
                        : null
                };
            },
            // 编辑用户
            fnEditorMember(data) {
                const orgAttr = ErdcKit.getObjectAttr(data, 'roleAObjectRef') || {};
                this.form.defaultValue = {
                    orgIds: orgAttr.oid
                        ? [
                            {
                                oid: orgAttr.oid,
                                name: orgAttr.displayName
                            }
                        ]
                        : null
                };
                this.form.oid = data?.relationOid || null;
                this.form.visible = true;
                this.form.editable = true;
            },
            // 禁用
            fnDisabledMember(op, user) {
                let confirmText = this.i18nMappingObj.disabledMemberConfirm || ''; // 提示语
                this.$confirm(confirmText, this.i18nMappingObj.disabledMember, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                }).then(() => {
                    let disabledUserIds = [];
                    if (op == 'batchDisabled') {
                        let tableSelection =
                            this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnGetCurrentSelection();
                        disabledUserIds = tableSelection.map((ite) => ite.id);
                    } else if (op == 'singleDisabled') {
                        disabledUserIds = [user.id];
                    }
                    if (disabledUserIds && disabledUserIds.length > 0) {
                        axios.post(`/fam/user/disabled`, disabledUserIds).then((resp) => {
                            if (resp.success) {
                                this.$message.success(this.i18nMappingObj['disableSuccess']);
                                this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnRefreshTable();
                            }
                        });
                    }
                    this.fnCloseMemberForm();
                });
            },
            // 移出确认
            fnRemoveMemberConfirm(op, user) {
                let confirmText = this.i18nMappingObj.removeMemberConfirm || ''; // 提示语
                this.$confirm(confirmText, this.i18nMappingObj.removeCurrentOrg, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                }).then(() => {
                    let removeUserIds = [];
                    if (op == 'batchRemove') {
                        let tableSelection =
                            this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnGetCurrentSelection();
                        removeUserIds = tableSelection.map((ite) => ite.id);
                    } else if (op == 'singleRemove') {
                        removeUserIds = [user.id];
                    }
                    this.fnMoveMember(removeUserIds);
                });
            },
            // 移出部门
            fnMoveMember(userIds) {
                if (userIds && userIds.length > 0) {
                    axios.post(`/fam/org/remove/${this.currentOrgId || ''}`, userIds).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18nMappingObj['removeSuccess']);
                            this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnRefreshTable();
                        }
                    });
                }
            },
            // 启用
            fnEnabledMember(op, user) {
                let confirmText = this.i18nMappingObj.enabledMember || ''; // 提示语
                this.$confirm(confirmText, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                }).then(() => {
                    let userIds = [];
                    if (op == 'batch') {
                        let tableSelection =
                            this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnGetCurrentSelection();
                        userIds = tableSelection.map((ite) => ite.id);
                    } else if (op == 'single') {
                        userIds = [user.id];
                    }
                    if (userIds && userIds.length > 0) {
                        axios.post(`/fam/user/enable`, userIds).then((resp) => {
                            if (resp.success) {
                                this.$message.success(this.i18nMappingObj['enabledSuccess']);
                                this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnRefreshTable();
                            }
                        });
                    }
                    this.fnCloseMemberForm();
                });
            },
            // 离职
            fnDimissionMember(op, user) {
                let dimissionMember = [];
                if (op == 'batch') {
                    dimissionMember =
                        this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnGetCurrentSelection();
                } else {
                    dimissionMember = [user];
                }
                let confirmText = this.i18nMappingObj['是否把用户离职'] || ''; // 提示语
                this.$confirm(confirmText, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                }).then(() => {
                    this.fnOnSubmitDimission(dimissionMember.map((item) => item.id));
                });
            },
            // 提交离职
            fnOnSubmitDimission(dimissionMemberArr) {
                axios.post(`/fam/user/dimission`, dimissionMemberArr).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18nMappingObj['dimissionSuccess']);
                        this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnRefreshTable();
                        this.$emit('refresh-tree', this.orgRow?.oid);
                    }
                });
            },
            // 关闭离职弹窗
            fnCloseDimissionDialog() {
                this.dimission.visible = false;
                this.dimission.disabledMember = [];
                this.dimission.loading = false;
            },
            // 加入部门提交
            fnSubmitJoinMember() {
                let selectMemberList = this.$refs['joinMemberSelect'].fnGetSelectedMember();
                this.joinOrgForm.loading = true;

                if (selectMemberList && selectMemberList.length > 0) {
                    axios
                        .post(
                            `/fam/org/join/${this.orgId || ''}`,
                            selectMemberList.map((item) => item.id)
                        )
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success(this.i18nMappingObj['joinSuccess']);
                                this.$refs?.['famViewTable']?.$refs?.['FamAdvancedTable']?.fnRefreshTable();
                            }
                        })
                        .finally(() => {
                            this.joinOrgForm.joinOrgVisible = false;
                            this.joinOrgForm.loading = false;
                        });
                } else {
                    this.$message({
                        type: 'info',
                        message: this.i18nMappingObj['请选择加入的成员']
                    });
                    this.joinOrgForm.loading = false;
                }
            },
            // 重置密码提交
            resetPasswordSubmit() {
                const { resetPassDynamicForm } = this.$refs;
                resetPassDynamicForm.submit().then(({ valid }) => {
                    if (valid) {
                        // 表单序列化
                        let form = resetPassDynamicForm.serialize();
                        let { value } = form[0];
                        axios
                            .put(`/fam/user/password/${this.currentOperRow?.id}`, {
                                newPwd: value
                            })
                            .then((resp) => {
                                if (resp.success) {
                                    this.$message.success(this.i18nMappingObj['resetSuccess']);
                                    this.resetPassword.visible = false;
                                }
                            });
                    }
                });
            },
            // 查看用户
            fnViewMemberDetail(row) {
                this.currentOperRow = row;
                this.form.oid = row?.relationOid || null;

                const orgAttr = ErdcKit.getObjectAttr(row, 'roleAObjectRef') || {};
                this.form.defaultValue = {
                    orgIds: orgAttr.oid
                        ? [
                            {
                                oid: orgAttr.oid,
                                name: orgAttr.displayName
                            }
                        ]
                        : null
                };

                this.form.visible = true;
                this.form.readonly = true;
            },
            // 关闭表单
            fnCloseMemberForm() {
                // this.form.defaultValue = {}
                // this.form.editable = false
                // this.form.readonly = false
                // this.form.visible = false
                this.form = {
                    oid: null,
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false,
                    defaultValue: {}
                };
                this.currentOperRow = '';
            },
            // 表单回调
            callback(data) {
                this.currentOperRow = data;
                this.form.defaultValue = data || {};
            }
        }
    };
});
