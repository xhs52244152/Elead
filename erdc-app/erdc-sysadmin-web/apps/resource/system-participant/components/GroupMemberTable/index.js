define([
    'erdcloud.kit',
    'text!' + ELMP.resource('system-participant/components/GroupMemberTable/index.html'),
    ELMP.resource('erdc-components/FamParticipantSelect/ParticipantTypes.js'),
    'css!' + ELMP.resource('system-participant/components/GroupMemberTable/style.css'),
    'underscore'
], function (ErdcKit, template, ParticipantTypes) {
    const _ = require('underscore');
    const store = require('fam:store');
    return {
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            AddParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource('erdc-product-components/AddParticipantSelect/index.js')
            ),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            currentOperNode: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 编码
            number: {
                type: String,
                default() {
                    return '';
                }
            }
        },
        data() {
            return {
                searchParticipantVal: '', // 参与者过滤值
                form: {
                    oid: null,
                    defaultValue: {},
                    visible: false,
                    loading: false,
                    editable: false
                },
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    addMember: this.getI18nByKey('addMember'),
                    editMember: this.getI18nByKey('editMember'),
                    sure: this.getI18nByKey('sure'),
                    cancel: this.getI18nByKey('cancel'),
                    ok: this.getI18nByKey('ok'),
                    removeMemberConfirm: this.getI18nByKey('removeMemberConfirm'),
                    removeCurrentOrg: this.getI18nByKey('removeCurrentOrg'),
                    disabledMemberConfirm: this.getI18nByKey('disabledMemberConfirm'),
                    disabledMember: this.getI18nByKey('disabledMember'),
                    joinOrgTitle: this.getI18nByKey('joinOrgTitle'),
                    tips: this.getI18nByKey('tips'),
                    enabledMember: this.getI18nByKey('enabledMember'),
                    readonlyMember: this.getI18nByKey('readonlyMember'),
                    dimissionTips: this.getI18nByKey('dimissionTips'),
                    addGroupParticipant: this.getI18nByKey('addGroupParticipant'),
                    addSuccess: this.getI18nByKey('addSuccess'),
                    removeParticipant: this.getI18nByKey('removeParticipant'),
                    removeSuccess: this.getI18nByKey('removeSuccess'),
                    memberSearchPlaceholder: this.getI18nByKey('memberSearchPlaceholder'),
                    add: this.getI18nByKey('add'),
                    remove: this.getI18nByKey('remove'),
                    principal: this.getI18nByKey('principal'),
                    participantType: this.getI18nByKey('participantType'),
                    department: this.getI18nByKey('department'),
                    mobile: this.getI18nByKey('mobile'),
                    email: this.getI18nByKey('email'),
                    selectParticipant: this.getI18nByKey('selectParticipant')
                },
                tableBodyData: {}, // 表格参数
                selectedParticipant: {},
                searchParams: {},
                userDefaultValue: [],
                queryScope: 'fullTenant',
                participantTypesMap: ParticipantTypes.reduce((pre, next) => {
                    pre[next.value] = next.name;
                    return pre;
                }, {}),
                threeMember: ['system', 'security', 'audit']
            };
        },
        watch: {
            searchParticipantVal(nv) {
                let params = {
                    roleAObjectOId: this.currentOperNode?.oid || '',
                    orderBy: 'createTime'
                };
                if (nv?.value && nv?.value?.length > 0) params.roleBObjectOIds = nv.value;
                this.searchParams = params;
                this.reloadMemberTable(params);
            }
        },
        computed: {
            threeMemberEnv() {
                return this.$store.state?.app?.threeMemberEnv || false;
            },
            showParticipantType() {
                const threeMemberEnv = this.$store.state?.app?.threeMemberEnv;
                return threeMemberEnv && this.threeMember.includes(this.currentOperNode?.identifierNo)
                    ? ['USER']
                    : ['USER', 'GROUP'];
            },
            // 处理表格右上角显示的按钮
            rightBtnList() {
                let rightOperBtnAllList = [
                    {
                        isHiddenNumber: [], // 需要隐藏按钮的特殊编码
                        type: 'primary',
                        label: this.i18nMappingObj.add,
                        class: '',
                        disabledBySelect: false, // 根据表格选中数据来校验是否启用按钮
                        onclick: () => {
                            this.form.visible = true;
                            let users = (this.$refs?.famAdvancedTable?.sourceData || []).filter(
                                (ite) => ite.roleBObjectRef == 'User'
                            );
                            let userGroups = (this.$refs?.famAdvancedTable?.sourceData || []).filter(
                                (ite) => ite.roleBObjectRef == 'Group'
                            );
                            this.selectedParticipant = {
                                users,
                                userGroups
                            };
                        }
                    },
                    {
                        isHiddenNumber: [], // 需要隐藏按钮的特殊编码
                        type: 'default',
                        label: this.i18nMappingObj.remove,
                        key: 'remove',
                        class: '',
                        icon: '',
                        disabledBySelect: false, // 根据表格选中数据来校验是否启用按钮
                        onclick: () => {
                            this.fnRemoveParticipant();
                        }
                    }
                ];
                let currentOrgShowBtnList = rightOperBtnAllList.filter((item) => {
                    // 过滤隐藏的按钮
                    if (item.isHiddenNumber && item.isHiddenNumber.indexOf(this.identifierNo) != -1) {
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
            viewTableConfig() {
                let tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'keyword', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/group/link/page', // 表格数据接口
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
                            show: false, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18nMappingObj.memberSearchPlaceholder, // 输入框提示文字，默认请输入
                            clearable: false,
                            width: '280'
                        },
                        actionConfig: {
                            name: 'MENU_MODULE_GROUP_TABLE'
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
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    addCheckbox: true, // 是否添加复选框（勾选事件可参考vxe-table官网提供事件）
                    addSeq: true,
                    columns: [
                        {
                            attrName: 'displayName', // 属性名
                            label: this.i18nMappingObj.principal, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'linkName',
                            label: this.i18nMappingObj.participantType,
                            description: '',
                            sortAble: false,
                            minWidth: 100
                        },
                        {
                            attrName: 'userInfo.name',
                            label: this.i18n.loginAccount,
                            description: '',
                            sortAble: false,
                            minWidth: 100
                        },
                        {
                            attrName: 'userInfo.orgName',
                            label: this.i18nMappingObj.department,
                            description: '',
                            sortAble: false,
                            minWidth: 100
                        },
                        {
                            attrName: 'userInfo.mobile',
                            label: this.i18nMappingObj.mobile,
                            description: '',
                            sortAble: false,
                            minWidth: 100
                        },
                        {
                            attrName: 'userInfo.email',
                            label: this.i18nMappingObj.email,
                            description: '',
                            sortAble: false,
                            minWidth: 100
                        }
                    ],
                    slotsField: [
                        // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        {
                            prop: 'displayName', // 字段名
                            type: 'default' // 头部文本插槽
                        },
                        {
                            prop: 'linkName',
                            type: 'default'
                        }
                    ]
                };
                // tableConfig.toolbarConfig = _.extend(tableConfig.toolbarConfig, this.rightBtnList);
                return tableConfig;
            },
            queryParams() {
                return {
                    params: {
                        appName: this.currentOperNode?.appName || '',
                        isGetVirtual: false
                    }
                };
            }
        },
        methods: {
            actionClick(type) {
                switch (type.name) {
                    case 'GROUP_ADD':
                        this.fnCreateGroup();
                        break;
                    case 'GROUP_REMOVE':
                        this.fnRemoveParticipant();
                        break;
                    default:
                        break;
                }
            },
            dragEnd() {
                this.$refs?.groupParticipantSelect?.$refs?.famParticipantSelect?.$refs?.['fam-dropdown'].hide();
            },
            // 刷新表格
            reloadMemberTable(payload) {
                this.tableBodyData = { ...this.searchParams, ...payload, orderBy: 'createTime' };
                // 避免首次进入加载过快还未渲染完成导致报错
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.$refs['famAdvancedTable'].fnRefreshTable();
                    }, 200);
                });
            },
            fnCreateGroup() {
                this.form.visible = true;
                let users = (this.$refs?.famAdvancedTable?.sourceData || []).filter(
                    (ite) => ite.roleBObjectRef == 'User'
                );
                let userGroups = (this.$refs?.famAdvancedTable?.sourceData || []).filter(
                    (ite) => ite.roleBObjectRef == 'Group'
                );
                this.selectedParticipant = {
                    users,
                    userGroups
                };
            },
            // 移除参与者
            fnRemoveParticipant() {
                let confirmText = this.i18nMappingObj.removeParticipant || ''; // 提示语
                let tableSelection = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                if (!tableSelection || tableSelection.length <= 0) {
                    return this.$message.error(this.i18nMappingObj.pleaseSelect);
                }
                this.$confirm(confirmText, this.i18nMappingObj.tips, {
                    type: 'warning',
                    customClass: 'fnRemoveParticipant',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        let deleteIds = tableSelection.map((ite) => ite.oid);
                        this.$famHttp({
                            url: `/fam/deleteByIds`,
                            params: {},
                            data: {
                                className: store.getters.className('GroupLink'),
                                oidList: deleteIds
                            },
                            method: 'delete'
                        })
                            .then((data) => {
                                if (data?.success) {
                                    this.$message.success(this.i18nMappingObj.removeSuccess);
                                    // this.$refs['famAdvancedTable'].fnRefreshTable();
                                    this.$emit('refreshTree', this.currentOperNode);
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: data?.message || data
                                    });
                                }
                            })
                            .catch((err) => {
                                // this.$message({
                                //     type: 'error',
                                //     message: err?.data?.message || err?.data || err
                                // });
                            });
                    })
                    .catch(() => {});
            },
            // 提交新增表单
            fnSubmitAddForm() {
                let addFormData = this.$refs['groupParticipantSelect']?.fnGetFormData() || {};
                let reqParams = {
                    action: 'CREATE',
                    className: store.getters.className('GroupLink'),
                    rawDataVoList: (addFormData?.selectVal || []).map((oid) => {
                        return {
                            action: 'CREATE',
                            attrRawList: [
                                {
                                    attrName: 'roleBObjectRef',
                                    value: oid
                                },
                                {
                                    attrName: 'roleAObjectRef',
                                    value: this.currentOperNode?.oid || ''
                                }
                            ],
                            className: store.getters.className('GroupLink')
                        };
                    })
                };
                if (_.isEmpty(reqParams.rawDataVoList)) {
                    return this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj.selectParticipant,
                        showClose: true
                    });
                }
                this.$famHttp({
                    url: `/fam/saveOrUpdate`,
                    data: reqParams,
                    method: 'POST'
                })
                    .then((resp) => {
                        if (resp && resp.success) {
                            this.$message.success(this.i18nMappingObj.addSuccess);
                            // this.$refs['famAdvancedTable'].fnRefreshTable();
                            // 刷新树
                            this.$emit('refreshTree', this.currentOperNode);
                            this.fnCloseMemberForm();
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: err?.data?.message || err?.data || err
                        // });
                    });
            },
            // 关闭表单
            fnCloseMemberForm() {
                this.selectedParticipant = {};
                this.form = {
                    oid: null,
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false,
                    defaultValue: {}
                };
            }
        }
    };
});
