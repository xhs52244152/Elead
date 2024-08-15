define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-participant/components/MemberTable/index.html'),
    ELMP.resource('system-participant/api.js'),
    'css!' + ELMP.resource('system-participant/components/MemberTable/style.css'),
    'underscore'
], function (ErdcKit, template, api) {
    const _ = require('underscore');
    const axios = require('fam:http'); // axios

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
                // 国际化locale文件地址
                i18nPath: ELMP.resource('system-participant/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['code', 'loginAccount', 'chineseName']),
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
                tableBodyData: {}, // 表格参数
                passwordRules: [],
                advancedSearchToDetails: null,
                importVisible: false,
                exportVisible: false,
                requestConfig: {
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('user')
                        }
                    }
                },
                businessName: 'UserExport',
                userOperMenu: []
            };
        },
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            MemberForm: ErdcKit.asyncComponent(ELMP.resource('system-participant/components/MemberForm/index.js')),
            JoinMemberSelect: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/JoinMemberSelect/index.js')
            ),
            DimissionHandover: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/DimissionHandover/index.js')
            ),
            FamImport: ErdcKit.asyncComponent(ELMP.resource(`erdc-components/FamImport/index.js`)),
            FamExport: ErdcKit.asyncComponent(ELMP.resource(`erdc-components/FamExport/index.js`))
        },
        watch: {
            advancedSearchToDetails(nv) {
                if (!_.isEmpty(nv) && nv.oid) {
                    this.form.oid = nv?.oid || '';
                    this.form.visible = true;
                    this.form.readonly = true;
                    this.$router.replace({ query: {} });
                }
            }
        },
        computed: {
            actionName() {
                switch (this.orgCode) {
                    case 'ORG000002':
                        return 'MENU_MODULE_UNALLOCATED_ORG_TABLE';
                    case 'ORG000003':
                        return 'MENU_MODULE_DISABLE_ORG_TABLE';
                    case 'ORG000004':
                        return 'MENU_MODULE_RESIGNED_ORG_TABLE';
                    case 'ORG999999':
                        return 'MENU_MODULE_LOCK_ORG_TABLE';
                    default:
                        return 'MENU_MODULE_USER_TABLE';
                }
            },
            showModifyPassword() {
                return this.$store.state.app.threeMemberOtherConfig?.updatePwd?.enable;
            },
            identifierNo() {
                return this.orgRow?.identifierNo || '';
            },
            formItemData() {
                return [
                    {
                        field: 'password',
                        component: 'erd-input',
                        label: this.i18n.newPassword,
                        required: true,
                        validators: [],
                        tooltip: ' ',
                        props: {
                            type: 'password',
                            clearable: false,
                            showPassword: true
                        },
                        slots: {
                            tooltip: 'password-tooltip'
                        },
                        col: 24
                    }
                ];
            },
            currentOrgId() {
                return this.orgId || '';
            },
            viewTableConfig() {
                let tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'keyword', // 模糊搜索参数传递key
                    sortParamsKey: 'orderBy', // 排序参数传递key
                    sortOrderParamsKey: 'sortBy',
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/user/page', // 表格数据接口
                        params: {}, // 路径参数
                        data: this.tableBodyData, // body参数
                        method: 'post' // 请求方法（默认get）
                    },
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18n.memberSearchPlaceholder, // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '280'
                        },
                        actionConfig: {
                            name: this.actionName
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
                    pagination: {
                        // 分页
                        pageSize: 20,
                        indexKey: 'current', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'size' // 参数pageSize key (默认pageSize)
                    },
                    addSeq: true,
                    addCheckbox: true,
                    columns: [
                        {
                            attrName: 'code', // 属性名
                            label: this.i18n.workNumber, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'name',
                            label: this.i18n.loginAccount,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        },
                        {
                            attrName: 'displayName',
                            label: this.i18n.chineseName,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        },
                        {
                            attrName: 'email',
                            label: this.i18n.email,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        },
                        {
                            attrName: 'mobile',
                            label: this.i18n.mobile,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        },
                        {
                            attrName: 'orgName',
                            label: this.i18n.orgName,
                            description: '',
                            sortAble: false,
                            minWidth: 150
                        }
                    ],
                    slotsField: [
                        // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        {
                            prop: 'code',
                            type: 'default' // 当前字段使用插槽
                        },
                        {
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ]
                };
                // 特殊处理，离职部门不需要显示操作列
                if (!['ORG000004'].includes(this.orgCode)) {
                    tableConfig.columns.push({
                        attrName: 'operation',
                        label: this.i18n.operation,
                        sortAble: false,
                        width: window.LS.get('lang_current') === 'en_us' ? 100 : 65,
                        fixed: 'right',
                        showOverflow: false
                    });
                }

                return tableConfig;
            },
            // 当前操作行
            currentOperMemberRow() {
                return this.currentOperRow || '';
            },
            passwordValidators() {
                return {
                    password: _.map(this.passwordRules, (passwordRule) => ({
                        trigger: ['input', 'blur'],
                        message: passwordRule.err,
                        validator: (rule, value, callback) => {
                            const regExp = new RegExp(passwordRule.RegEx);
                            if (!regExp.test(value)) {
                                callback(new Error(rule.message));
                            } else {
                                callback();
                            }
                        }
                    }))
                };
            },
            threeMemberEnv() {
                return +this.orgRow.level === -1 ? false : this.$store?.state?.app?.threeMemberEnv;
            },
            operPermObj() {
                return {
                    editMember: this.userOperMenu.includes('USER_EDIT'),
                    enableMember: this.userOperMenu.includes('USER_ENABLE'),
                    disabledMember: this.userOperMenu.includes('USER_DISABLE'),
                    resetPassword: this.userOperMenu.includes('USER_RESET_PASSWORD')
                };
            }
        },
        created() {
            this.fetchPasswordRule().then((rules) => {
                this.passwordRules = _.map(rules, (rule) => {
                    return {
                        RegEx: rule.RegEx,
                        desc: rule.desc,
                        err: rule.err
                    };
                });
            });
        },
        mounted() {
            this.advancedSearchToDetails = this.$route?.query || {};
        },
        methods: {
            fetchPasswordRule() {
                return new Promise((resolve) => {
                    axios.get('/fam/public/pwd/check/config').then(({ data }) => {
                        const rules = data || [];
                        resolve(_.compact(rules.filter((rule) => rule.del_flag === '1')));
                    });
                });
            },
            fnIsShowBtn(row, btn) {
                if (!this.operPermObj[btn.key]) {
                    return false;
                }
                // 如果是激活状态并且不是禁用虚拟部门，那么不显示启用按钮，
                if (btn.key === 'enableMember' && !row.isEnable && !['ORG000003'].includes(this.orgCode)) {
                    return false;
                } else if (row.isEnable && btn.key === 'disabledMember') {
                    // 如果不是激活状态，不显示禁用按钮
                    return false;
                }
                // 特殊处理admin账号, 不能禁用离职和删除
                if (
                    row.oid === 'OR:erd.cloud.foundation.principal.entity.User:27150477200197246' &&
                    (btn.key === 'disabledMember' || btn.key === 'dimissionMember')
                ) {
                    return false;
                }
                return true;
            },
            // 刷新表格
            reloadMemberTable(payload) {
                this.tableBodyData = { ...payload };
                // 避免首次进入加载过快还未渲染完成导致报错
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.$refs['famAdvancedTable'].fnRefreshTable();
                    }, 200);
                });
            },
            actionClick(type) {
                switch (type.name) {
                    case 'USER_CREATE':
                        this.fnCreateMemberShow();
                        break;
                    case 'USER_ADD':
                        this.joinOrgForm.joinOrgVisible = true;
                        break;
                    case 'USER_REMOVE':
                        this.checkSelect() && this.fnRemoveMemberConfirm('batchRemove');
                        break;
                    case 'USER_BATCH_ENABLE':
                        this.checkSelect() && this.fnEnabledMember('batch');
                        break;
                    case 'USER_BATCH_DISABLE':
                        this.checkSelect() && this.fnDisabledMember('batchDisabled');
                        break;
                    case 'USER_BATCH_DIMISSION':
                        this.checkSelect() && this.fnDimissionMember('batch');
                        break;
                    case 'USER_IMPORT':
                        this.importUser();
                        break;
                    case 'USER_EXPORT':
                    case 'USER_DIMISSION_EXPORT':
                        this.exportUser();
                        break;
                    case 'No_LICENSE_USER_EXPORT':
                        this.exportLicense();
                        break;
                    default:
                        break;
                }
            },
            checkSelect() {
                const selectData = this.$refs.famAdvancedTable.getCheckboxRecords();
                if (selectData.length) {
                    return true;
                } else {
                    this.$message.warning(this.i18n.pleaseSelectData);
                    return false;
                }
            },
            getActionConfig(row) {
                return {
                    name: 'MENU_MODULE_USER_MORE',
                    objectOid: row.oid
                };
            },
            rowActionClick(command, data) {
                switch (command?.name) {
                    case 'USER_EDIT':
                        this.fnEditorMember(data);
                        break;
                    case 'USER_DISABLE':
                        this.fnDisabledMember('singleDisabled', data);
                        break;
                    case 'USER_ENABLE':
                        this.fnEnabledMember('single', data);
                        break;
                    case 'USER_DIMISSION':
                        this.fnDimissionMember('single', data);
                        break;
                    default:
                        break;
                }
            },
            // 提交保存用户
            fnOnSubmit(formRef) {
                this.form.loading = true;
                this.$refs[formRef]
                    .submit()
                    .then(() => {
                        this.$refs['famAdvancedTable'].fnRefreshTable();
                        // 创建用户时，刷新左侧树
                        this.$emit('refresh-tree', this.orgRow?.oid);
                        this.fnCloseMemberForm();
                    })
                    .finally(() => {
                        this.form.loading = false;
                    });
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
                const orgNames = data.orgName?.split(';');
                this.form.defaultValue = {
                    orgIds: _.map(data.orgIds, (oid, idx) => ({ oid: oid, name: orgNames?.[idx] }))
                };
                this.form.oid = data?.oid || null;
                this.form.visible = true;
                this.form.editable = true;
            },
            // 禁用
            fnDisabledMember(op, user) {
                let confirmText = this.i18n.disabledMemberConfirm || ''; // 提示语
                this.$confirm(confirmText, this.i18n.disabledMember, {
                    type: 'warning',
                    confirmButtonText: this.i18n.ok,
                    cancelButtonText: this.i18n.cancel
                }).then(() => {
                    let disabledUserIds = [];
                    if (op === 'batchDisabled') {
                        let tableSelection = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                        const admin = tableSelection.find(
                            (item) => item.oid === 'OR:erd.cloud.foundation.principal.entity.User:27150477200197246'
                        );
                        if (admin) {
                            return this.$message({
                                type: 'warning',
                                message: this.i18n.cannotRemoveAdmin,
                                showClose: true
                            });
                        }
                        disabledUserIds = tableSelection.map((ite) => ite.id);
                    } else if (op === 'singleDisabled') {
                        disabledUserIds = [user.id];
                    }
                    if (disabledUserIds && disabledUserIds.length > 0) {
                        axios.post(`/fam/user/disabled`, disabledUserIds).then((resp) => {
                            if (resp.success) {
                                this.$message.success(this.i18n['disableSuccess']);
                                this.$refs['famAdvancedTable'].fnRefreshTable();
                                this.$emit('refresh-tree', this.orgRow?.oid);
                            }
                        });
                    }
                    this.fnCloseMemberForm();
                });
            },
            // 移出确认
            fnRemoveMemberConfirm(op, user) {
                let confirmText = this.i18n.removeMemberConfirm || ''; // 提示语
                this.$confirm(confirmText, this.i18n.removeCurrentOrg, {
                    type: 'warning',
                    confirmButtonText: this.i18n.ok,
                    cancelButtonText: this.i18n.cancel
                }).then(() => {
                    let removeUserIds = [];
                    if (op === 'batchRemove') {
                        let tableSelection = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                        removeUserIds = tableSelection.map((ite) => ite.id);
                    } else if (op === 'singleRemove') {
                        removeUserIds = [user.id];
                    }
                    this.fnMoveMember(removeUserIds);
                });
            },
            // 移出部门
            fnMoveMember(userIds) {
                if (userIds && userIds.length > 0) {
                    axios
                        .post(`/fam/org/remove/${this.currentOrgId || ''}`, userIds)
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success(this.i18n['removeSuccess']);
                                this.$refs['famAdvancedTable'].fnRefreshTable();
                                this.$emit('refresh-tree', this.orgRow?.oid);
                            }
                        })
                        .catch(() => {
                            // this.$message({
                            //     type: 'error',
                            //     message: err?.message || err
                            // });
                        });
                }
            },
            // 启用
            fnEnabledMember(op, user) {
                let confirmText = this.i18n.enabledMember || ''; // 提示语
                this.$confirm(confirmText, this.i18n.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18n.ok,
                    cancelButtonText: this.i18n.cancel
                }).then(() => {
                    let userIds = [];
                    let tableSelection = [];
                    if (op == 'batch') {
                        tableSelection = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                        userIds = tableSelection.map((ite) => ite.id);
                    } else if (op == 'single') {
                        userIds = [user.id];
                    }
                    if (userIds && userIds.length > 0) {
                        if (this.orgCode === 'ORG000004') {
                            const rawDataVoList = tableSelection.map((item) => {
                                return {
                                    oid: item.oid,
                                    className: this.$store.getters.className('user'),
                                    attrRawList: [
                                        {
                                            attrName: 'status',
                                            value: 'ACTIVE'
                                        }
                                    ]
                                };
                            });
                            this.$famHttp({
                                url: 'fam/saveOrUpdate',
                                data: {
                                    className: this.$store.getters.className('user'),
                                    rawDataVoList: rawDataVoList
                                },
                                method: 'POST'
                            }).then(() => {
                                this.$message.success(this.i18n['enabledSuccess']);
                                this.$refs['famAdvancedTable'].fnRefreshTable();
                                this.$emit('refresh-tree', this.orgRow?.oid);
                            });
                        } else {
                            axios.post(`/fam/user/enable`, userIds).then((resp) => {
                                if (resp.success) {
                                    this.$message.success(this.i18n['enabledSuccess']);
                                    this.$refs['famAdvancedTable'].fnRefreshTable();
                                    this.$emit('refresh-tree', this.orgRow?.oid);
                                }
                            });
                        }
                    }
                    this.fnCloseMemberForm();
                });
            },
            // 离职
            fnDimissionMember(op, user) {
                let dimissionMember = [];
                if (op === 'batch') {
                    dimissionMember = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                } else {
                    dimissionMember = [user];
                }
                let confirmText = this.i18n['是否把用户离职'] || ''; // 提示语
                this.$confirm(confirmText, this.i18n.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18n.ok,
                    cancelButtonText: this.i18n.cancel
                }).then(() => {
                    const admin = dimissionMember.find(
                        (item) => item.oid === 'OR:erd.cloud.foundation.principal.entity.User:27150477200197246'
                    );
                    if (admin) {
                        return this.$message({
                            type: 'warning',
                            message: this.i18n.cannotRemoveAdmin,
                            showClose: true
                        });
                    }
                    this.fnOnSubmitDimission(dimissionMember.map((item) => item.id));
                });
            },
            // 提交离职
            fnOnSubmitDimission(dimissionMemberArr) {
                axios.post(`/fam/user/dimission`, dimissionMemberArr).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18n['dimissionSuccess']);
                        this.$refs['famAdvancedTable'].fnRefreshTable();
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
                        .post(`/fam/org/join/${this.orgId || ''}`, selectMemberList)
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success(this.i18n['joinSuccess']);
                                this.$refs['famAdvancedTable'].fnRefreshTable();
                                this.$emit('refresh-tree', this.orgRow?.oid);
                                this.joinOrgForm.joinOrgVisible = false;
                            }
                        })
                        .catch(() => {
                            // this.$message({
                            //     type: 'error',
                            //     message: err?.data?.message || err?.data || err
                            // });
                        })
                        .finally(() => {
                            this.joinOrgForm.loading = false;
                        });
                } else {
                    this.$message({
                        type: 'info',
                        message: this.i18n['请选择加入的成员']
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
                                    this.$message.success(this.i18n['resetSuccess']);
                                    this.resetPassword.visible = false;
                                }
                            })
                            .catch(() => {
                                // this.$message({
                                //     type: 'error',
                                //     message: err?.data?.message || err?.data || err
                                // });
                            });
                    }
                });
            },
            // 查看用户
            async fnViewMemberDetail(row) {
                this.currentOperRow = row;
                this.form.oid = row?.oid || null;
                const orgNames = row?.orgName?.split(';');
                this.form.defaultValue = {
                    orgIds: _.map(row.orgIds, (oid, idx) => ({ oid: oid, name: orgNames[idx] })),
                    orgName: row?.orgName
                };
                this.userOperMenu = await api.menuQuery('MENU_MODULE_USER_DETAIL', row.oid);
                this.form.visible = true;
                this.form.readonly = true;
                // this.callback()
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
                if (!this.form.readonly) {
                    this.currentOperRow = data;
                    this.form.defaultValue = data || {};
                }
            },
            // 导入成员
            importUser() {
                this.importVisible = true;
            },
            importSuccess() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            // 导出成员
            exportUser() {
                this.businessName = 'UserExport';
                this.exportVisible = true;
            },
            exportLicense() {
                this.businessName = 'NoLicenseUserExport';
                this.exportVisible = true;
            },
            columnOperBtnList(row) {
                // 列的全部操作按钮
                let colOperAllList = [
                    {
                        isHiddenOrg: ['ORG000004'],
                        type: 'primary',
                        label: this.i18n.edit,
                        key: 'editMember',
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
                        isHiddenOrg: ['ORG000004'],
                        type: 'default',
                        label: this.i18n.enable,
                        key: 'enableMember',
                        hidden: false,
                        disable: false,
                        onclick: (row) => {
                            this.fnEnabledMember('single', row);
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000003', 'ORG000004'],
                        type: 'default',
                        label: this.i18n.disable,
                        key: 'disabledMember',
                        hidden: false,
                        disable: row.isThreeMember,
                        onclick: (row) => {
                            this.fnDisabledMember('singleDisabled', row);
                        }
                    },
                    {
                        isHiddenOrg: ['ORG000004'],
                        type: 'default',
                        label: this.i18n.dimission,
                        key: 'dimissionMember',
                        hidden: row.status === 'RESIGNED',
                        disable: row.isThreeMember,
                        onclick: (row) => {
                            this.fnDimissionMember('single', row);
                        }
                    }
                ];
                return colOperAllList.filter((item) => item.isHiddenOrg.indexOf(this.orgCode) === -1 && !item.hidden);
            },
            // 查看用户弹窗显示的按钮
            viewOperBtnList(row) {
                let operBtnList = this.columnOperBtnList(row).map((item) => item);
                // 过滤操作按钮，离职不需要在查看弹窗显示
                let filterBtn = ['dimissionMember'];
                // 重置密码
                if (this.currentOperRow.status !== 'RESIGNED' && this.showModifyPassword) {
                    operBtnList.push({
                        isHiddenOrg: [],
                        type: 'default',
                        label: this.i18n.resetPassword,
                        key: 'resetPassword',
                        hidden: false,
                        disable: false,
                        onclick: () => {
                            this.resetPassword.visible = true;
                        }
                    });
                }
                return operBtnList.filter((item) => !filterBtn.includes(item.key));
            },
            extendHideValidate(buttonInfo, rowData) {
                if (buttonInfo.name === 'USER_ENABLE') {
                    return !rowData.hasDisable;
                }
                if (buttonInfo.name === 'USER_DISABLE') {
                    return rowData.hasDisable;
                }
                return buttonInfo.hide;
            }
        }
    };
});
