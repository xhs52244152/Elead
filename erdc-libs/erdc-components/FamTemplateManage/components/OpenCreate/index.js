/* 
    OpenCreate: FamKit.asyncComponent(ELMP.resource('erdc-components/FamTemplateManage/components/OpenCreate/index.js')),

    <open-create
	:team-oid="teamOid"
	v-if="dialogVisible"
   :role-refer="roleRef"
	@onsubmit="onSubmit"
	:visible.sync="dialogVisible"
	:title="dialogTitle">
   </open-create>
*/

define([
    'text!' + ELMP.resource('erdc-components/FamTemplateManage/components/OpenCreate/index.html'),
    'erdc-kit',
    'underscore',
    'css!' + ELMP.resource('erdc-components/FamTemplateManage/components/OpenCreate/style.css')
], function (template, utils) {
    const famHttp = require('fam:http');
    const FamKit = require('fam:kit');
    const _ = require('underscore');
    const store = require('fam:store');

    return {
        template,
        components: {
            // 基础表格
            ErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            AddParticipantSelect: FamKit.asyncComponent(
                ELMP.resource('erdc-product-components/AddParticipantSelect/index.js')
            ),
            FamParticipantSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
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
            },
            teamOid: {
                type: String,
                default: ''
            },
            roleRefer: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('portal-product/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    deleteMember: this.getI18nByKey('是否要移除该成员？'),
                    tips: this.getI18nByKey('提示'),
                    keys: this.getI18nByKey('请输入关键字'),
                    role: this.getI18nByKey('增加角色'),
                    member: this.getI18nByKey('增加成员'),
                    selectRole: this.getI18nByKey('选择角色'),
                    selectMember: this.getI18nByKey('选择成员'),
                    remove: this.getI18nByKey('移除'),
                    responsible: this.getI18nByKey('设为主责任人'),
                    cancelResponsible: this.getI18nByKey('取消主责任人'),
                    enter: this.getI18nByKey('请输入'),
                    edit: this.getI18nByKey('编辑'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    successfullyDelete: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    removeSuccess: this.getI18nByKey('移除成功'),
                    addSuccess: this.getI18nByKey('增加成功'),
                    cancel: this.getI18nByKey('取消'),
                    confirm: this.getI18nByKey('确定'),
                    detail: this.getI18nByKey('详情'),
                    confirmCancel: this.getI18nByKey('确认取消主责任人'),
                    continue: this.getI18nByKey('此操作将取消主责任人，是否继续？'),
                    // 表头
                    participants: this.getI18nByKey('参与者'),
                    participantsType: this.getI18nByKey('参与者类型'),
                    workNumber: this.getI18nByKey('工号'),
                    login: this.getI18nByKey('登录号'),
                    phone: this.getI18nByKey('手机'),
                    email: this.getI18nByKey('邮箱'),
                    department: this.getI18nByKey('部门'),
                    operation: this.getI18nByKey('操作')
                },
                selectedParticipant: {},
                showParticipantType: ['USER', 'GROUP'], // 参与者显示类型 'USER', 'GROUP'
                form: {
                    oid: null,
                    defaultValue: {},
                    visible: true,
                    loading: false,
                    editable: false,
                    deleteName: '',
                    readonly: false
                },
                unfoldRole: true,
                unfoldMember: true,
                disMember: false,
                participantVal: '',
                selectMember: '',
                memberList: [], // 成员
                groupList: [], // 群组
                selectRole: '',
                roleId: '',
                roleRef: '',
                tableData: [],
                oldParticipant: [], // 参与者
                oldParticipantIds: [], // 参与者id
                newParticipant: [], // 新增参与者人员
                formData: {},
                options: [
                    {
                        label: '特殊1',
                        value: 1
                    },
                    {
                        label: '特殊2',
                        value: 2
                    }
                ],
                loading: false
            };
        },
        watch: {
            selectRole(n, o) {
                this.roleId = n.split(':')[2];

                if (!_.isEmpty(n)) {
                    this.getPrincipalsById();
                }
            },
            roleRefer(n, o) {}
        },
        filters: {
            // 参与者类型
            filterType(val) {
                let displayLabel = val;
                switch (val) {
                    case 'USER':
                        displayLabel = '用户';
                        break;
                    case 'GROUP':
                        displayLabel = '群组';
                        break;
                    default:
                        break;
                }
                return displayLabel;
            }
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
            columns: {
                get() {
                    return [
                        {
                            prop: 'checkbox',
                            title: '',
                            minWidth: '50',
                            width: '50',
                            type: 'checkbox',
                            align: 'center'
                        },
                        {
                            type: 'seq',
                            title: ' ',
                            minWidth: '48',
                            width: '48',
                            align: 'center' //多选框默认居中显示
                        },
                        {
                            prop: 'principalName', // 参与者
                            width: '210',
                            title: this.i18nMappingObj?.['participants']
                        },
                        {
                            prop: 'principalTarget', // 参与者类型
                            title: this.i18nMappingObj?.['participantsType']
                        },
                        {
                            prop: 'workNumber', // 工号
                            title: this.i18nMappingObj?.['workNumber']
                        },
                        {
                            prop: 'login', // 登录号
                            title: this.i18nMappingObj?.['login']
                        },
                        {
                            prop: 'mobile', // 手机
                            title: this.i18nMappingObj?.['phone']
                        },
                        {
                            prop: 'email', // 邮箱
                            title: this.i18nMappingObj?.['email']
                        },
                        {
                            prop: 'department', // 部门
                            title: this.i18nMappingObj?.['department']
                        },
                        {
                            prop: 'operation', // 操作
                            title: this.i18nMappingObj?.['operation'],
                            width: 160,
                            sort: false,
                            fixed: 'right'
                        }
                    ];
                },
                set(val) {}
            },
            selectProps() {
                let roleCompName = 'custom-virtual-role-select';
                let roleComponentConf = this.fnComponentHandle(roleCompName, true);
                return {
                    multiple: false,
                    clearable: true,
                    filterable: true,
                    collapseTags: this.collapseTags || false,
                    row: {
                        componentName: roleCompName,
                        requestConfig: roleComponentConf.componentConfigs || ''
                    },
                    placeholder: this.i18nMappingObj.pleaseSelect
                };
            },
            memberDisabled() {
                let bool = _.isEmpty(this.selectRole);
                return bool;
            }
        },
        mounted() {
            this.init();
            if (!_.isEmpty(this.roleRefer)) {
                this.selectRole = this.roleRefer;
                this.disMember = true;
            }
        },
        methods: {
            init() {
                this.tableData = [];
            },
            // 获取团队角色成员
            getPrincipalsById(roleId) {
                let data = {
                    oid: this.teamOid,
                    roleOid: this.selectRole
                    // roleId: this.roleId
                };
                this.$famHttp({
                    url: '/fam/team/getPrincipalsById',
                    method: 'get',
                    data
                }).then((res) => {
                    this.tableData = res?.data;
                    this.oldParticipantIds = [];
                    this.oldParticipant = res?.data;
                    this.oldParticipant.forEach((item) => this.oldParticipantIds.push(item.principal));
                });
            },
            // 选择角色
            changeRole(data) {
                this.$emit('change', data);
            },
            // 选择用户
            changeMember(data) {
                this.memberList = data;
                this.groupList = [];
            },
            // 选择群组
            changeUserGroup(data) {
                this.memberList = [];
                this.groupList = data.selected;
            },
            // 增加成员
            addMember() {
                // 新增参与者人员
                let newParticipant = [];
                if (this.memberList.length > 0) {
                    _.each(this.memberList, (item) => {
                        let obj = {
                            oid: item.oid,
                            id: item.id,
                            email: item.email,
                            principal: item.oid,
                            principalName: item.name,
                            principalTarget: 'USER',
                            department: item.orgName,
                            primarily: false
                        };
                        newParticipant.push(obj);
                    });
                } else if (this.groupList.length > 0) {
                    _.each(this.groupList, (item) => {
                        let obj = {
                            oid: item.oid,
                            id: item.id,
                            principal: item.oid,
                            principalName: item.name,
                            principalTarget: 'GROUP',
                            primarily: false
                        };
                        newParticipant.push(obj);
                    });
                }
                this.newParticipant = newParticipant;
                let oldParticipantList = [];
                this.oldParticipant.forEach((item) => {
                    let filterRes = newParticipant.filter(
                        (ite) => ite.principal == item.principal && ite.principalTarget == item.principalTarget
                    );
                    // 如果没有重复的，把旧的参与者放到新数组中
                    if (!filterRes?.length > 0) {
                        oldParticipantList.push(item);
                    }
                });
                this.tableData = [...oldParticipantList, ...newParticipant];
            },
            // 增加成员提交
            fnOnSubmitForm() {
                let roleUserFormData = this.$refs['groupParticipantSelect']?.fnGetFormData() || {};

                // 新增参与者人员
                let newParticipant = (roleUserFormData?.selectVal || []).map((item) => {
                    return {
                        principal: item,
                        primarily: false,
                        principalTarget: roleUserFormData?.participantType
                    };
                });

                let oldParticipantList = [];
                this.oldParticipant.forEach((item) => {
                    let filterRes = this.newParticipant.filter(
                        (ite) => ite.principal == item.principal && ite.principalTarget == item.principalTarget
                    );
                    // 如果没有重复的，把旧的参与者放到新数组中
                    if (!filterRes?.length > 0) {
                        oldParticipantList.push({
                            principal: item.principal,
                            primarily: item.primarily,
                            principalTarget: item.principalTarget
                        });
                    }
                });
                let participants = [...oldParticipantList, ...this.newParticipant];
                this.loading = true;
                this.$famHttp({
                    url: `/fam/team/participants/add`,
                    method: 'post',
                    data: {
                        teamRef: this.teamOid || '',
                        roleRef: this.selectRole || '',
                        className: store.getters.className('OrgContainer'),
                        rolePrincipalLinks: participants
                    }
                })
                    .then((res) => {
                        if (res?.success) {
                            _.each(participants, (item) => {
                                if (item.primarily === true) {
                                    let formData = new FormData();
                                    formData.append('rolePrincipalMapId', item.principal.split(':')[2]);
                                    formData.append('teamOid', this.teamOid);
                                    formData.append('isPrimarily', item.primarily);

                                    this.$famHttp({
                                        url: '/fam/team/setPrimarily',
                                        data: formData,
                                        method: 'post'
                                    }).then((res) => {});
                                }
                            });
                            this.$message.success(this.i18nMappingObj['addSuccess']);
                            this.getPrincipalsById();
                            this.toggleShow();
                            this.$emit('onsubmit');
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: err?.data?.message || err?.data || err
                        // });
                    })
                    .finally(() => {
                        this.loading = false;
                        // this.roleForm.loading = false
                        // this.$loading().close()
                    });
            },
            // 移除成员
            fnRemoveRole(data) {
                let index = data.rowIndex;
                // 是否要移除该成员？
                this.$confirm(this.i18nMappingObj.deleteMember, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        this.$message.success(this.i18nMappingObj['removeSuccess']);
                        this.tableData.splice(index, 1);
                    })
                    .catch(() => {})
                    .finally(() => {});
            },
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            // 设置责任人
            onSetResp(data) {
                data.row.primarily = true;
                _.each(data.items, (item) => {
                    if (item.id !== data.row.id) {
                        item.primarily = false;
                    }
                });
                // let {primarily, id} = data.row;
                // let formData = new FormData()
                // formData.append('rolePrincipalMapId', id)
                // formData.append('teamOid', this.teamOid)
                // formData.append('isPrimarily', !primarily)

                // this.$famHttp({
                //     url: "/fam/team/setPrimarily",
                //     data: formData,
                //     method: 'post'
                // }).then(res => {
                //     this.getPrincipalsById() // 查询角色列表
                // })
            },
            onCancelResp(data) {
                let { primarily, id } = data.row;
                let formData = new FormData();
                formData.append('rolePrincipalMapId', id);
                formData.append('teamOid', this.teamOid);
                formData.append('isPrimarily', !primarily);

                this.$confirm(this.i18nMappingObj['continue'], this.i18nMappingObj['confirmCancel'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    data.row.primarily = !data.row.primarily;
                    // this.$famHttp({
                    //     url: "/fam/team/setPrimarily",
                    //     data: formData,
                    //     method: 'post'
                    // }).then(res => {
                    //     this.getPrincipalsById() // 查询角色列表
                    // })
                });
            },
            // 移除
            onRemove() {
                let teamId = this.teamOid || '';
                let oids = this.checkList;

                this.$confirm(this.i18nMappingObj.deleteData, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {})
                    .catch(() => {})
                    .finally(() => {
                        // this.$loading().close()
                    });
            },
            // 添加成员
            userSearchSubmit: function () {
                const type = this.participantVal?.type || '';
                let selectUser = this.participantVal?.value || [];
                // 部门
                if (type == 'ORG') {
                    const oid = this.participantVal?.value?.oid || '';
                    selectUser = oid ? [oid] : [];
                }
                //
                if (!selectUser.length) {
                    return this.$message({
                        message: this.i18nMappingObj.errorSelect,
                        type: 'error'
                    });
                }
                const relationList = selectUser.map((item) => {
                    let obj = {
                        action: 'CREATE',
                        attrRawList: [
                            {
                                attrName: 'roleBObjectRef',
                                value: item
                            }
                        ],
                        className: 'erd.cloud.foundation.core.menu.entity.ResourceLink'
                    };
                    return obj;
                });
                // 防抖
                utils.debounceFn(() => {
                    this.updateService({
                        className: 'erd.cloud.foundation.core.menu.entity.Resource',
                        oid: this.oid,
                        attrRawList: [],
                        associationField: 'roleAObjectRef',
                        relationList
                    }).then((res) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.successAdd
                        });
                        // this.$confirm(this.i18nMappingObj.successAdd, this.i18nMappingObj.wxts, {
                        //     confirmButtonText: this.i18nMappingObj.submit,
                        //     showCancelButton : false,
                        //     type: 'success',
                        //     closeOnClickModal : false
                        // }).then(res=>{
                        // }).catch(error=>{
                        // })
                        // 刷新表格
                        this.getTableList();
                    }, this.i18nMappingObj.failedAdd);
                }, 200);
            },
            /**
             * checkbox
             * 复选框
             * @checkbox-all="selectAllEvent"
                 @checkbox-change="selectChangeEvent"
                * **/
            selectChangeEvent(data) {
                const records = this.$refs['erdTable'].$table.getCheckboxRecords();
                this.selectData = records || [];
            },
            // 提交
            submitForm() {
                let tableData = this.$refs.erdTable;
            },
            // 取消
            onCancel() {
                this.innerVisible = false;
            }
        }
    };
});
