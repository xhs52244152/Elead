define([
    'erdcloud.kit',
    'text!' + ELMP.resource('platform-license/views/AuthList/index.html'),
    ELMP.resource('erdc-guideline/index.js'),
    'css!' + ELMP.resource('platform-license/index.css')
], function (erdcloudKit, template, ErdcHelp) {
    const className = 'erd.cloud.foundation.principal.entity.UserLicense';

    return {
        template,
        components: {
            // 基础表格
            ErdTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            AddParticipantSelect: erdcloudKit.asyncComponent(
                ELMP.resource('erdc-product-components/AddParticipantSelect/index.js')
            ),
            FamParticipantSelect: erdcloudKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            FamImport: erdcloudKit.asyncComponent(ELMP.resource(`erdc-components/FamImport/index.js`)),
            FamExport: erdcloudKit.asyncComponent(ELMP.resource(`erdc-components/FamExport/index.js`)),
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('platform-license/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    participantType: this.getI18nByKey('参与者类型'),
                    participant: this.getI18nByKey('参与者'),
                    department: this.getI18nByKey('部门'),
                    mobile: this.getI18nByKey('电话'),
                    email: this.getI18nByKey('邮箱'),

                    ROLE: this.getI18nByKey('ROLE'),
                    USER: this.getI18nByKey('USER'),
                    GROUP: this.getI18nByKey('GROUP'),
                    ORG: this.getI18nByKey('ORG'),

                    add: this.getI18nByKey('增加'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    tip: this.getI18nByKey('提示'),
                    batchDelete: this.getI18nByKey('批量删除'),
                    selectTip: this.getI18nByKey('请选择数据'),
                    deleteTip: this.getI18nByKey('deletTip'),
                    delSuccess: this.getI18nByKey('删除成功'),

                    addSuccess: this.getI18nByKey('添加成功')
                },
                tableHeight: document.body.clientHeight - 214,

                visible: false,
                searchParticipantVal: '',
                searchMemberList: [],
                queryParams: {},

                showParticipantType: ['USER'], // 参与者显示类型 'USER'
                memberList: [],
                selectedParticipant: {},

                page: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0
                },
                tableData: [],
                importVisible: false,
                exportVisible: false,
                requestConfig: {
                    data: {
                        tableSearchDto: {
                            className: 'erd.cloud.foundation.principal.entity.UserLicense'
                        }
                    }
                },
                licenseNum: 0
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            columns() {
                return [
                    {
                        prop: 'index',
                        type: 'index',
                        minWidth: '50', // 列宽度
                        width: '50',
                        fixed: 'left' // 是否固定列 left right
                    },
                    {
                        prop: 'checkbox', // 列数据字段key
                        type: 'checkbox', // 特定类型 复选框[checkbox] 单选框[radio]
                        minWidth: '60', // 列宽度
                        width: '60',
                        fixed: 'left' // 是否固定列 left right
                    },
                    {
                        prop: 'displayName', // 属性名
                        title: this.i18nMappingObj.participant, // 字段名
                        description: '', // 描述
                        sortAble: false, // 是否支持排序
                        minWidth: 100
                    },
                    {
                        prop: 'name',
                        title: this.i18nMappingObj.account,
                        description: '',
                        sortAble: false,
                        minWidth: 80
                    },
                    {
                        prop: 'status',
                        title: this.i18nMappingObj.status,
                        description: '',
                        sortAble: false,
                        width: 80
                    },
                    {
                        prop: 'participantType',
                        title: this.i18nMappingObj.participantType,
                        sortAble: false,
                        width: 120
                    },
                    {
                        prop: 'orgName',
                        title: this.i18nMappingObj.department,
                        description: '',
                        sortAble: false
                    },
                    {
                        prop: 'mobile',
                        title: this.i18nMappingObj.mobile,
                        description: '',
                        sortAble: false,
                        minWidth: 100
                    },
                    {
                        prop: 'email',
                        title: this.i18nMappingObj.email,
                        description: '',
                        sortAble: false,
                        minWidth: 100
                    }
                ];
            },
            statusList() {
                const { i18nMappingObj } = this;
                return {
                    RESIGNED: i18nMappingObj.resigned,
                    ACTIVE: i18nMappingObj.active,
                    LOGINDISABLE: i18nMappingObj.logindisable
                };
            }
        },
        watch: {
            'searchMemberList.length': {
                deep: true,
                handler() {
                    this.page.pageIndex = 1;
                    this.searchList();
                }
            }
        },
        created() {
            this.searchList();
            this.getLicenseNum();
        },
        mounted() {
            ErdcHelp.registerHelpShows(this.$route.path, (help) => {
                help.showHelp()
                    .useContent()
                    .then((content) => {
                        content.setActiveStepKey('LICENSE_MANAGE');
                    });
            });
        },
        methods: {
            searchList() {
                if (this.searchMemberList.length) {
                    this.searchLicenseList(this.searchMemberList);
                } else {
                    this.getLicenseList();
                }
            },
            handleSizeChange(val) {
                this.page.pageSize = val;
                this.page.pageIndex = 1;
                this.searchList();
            },
            handelCurrentChange(val) {
                this.page.pageIndex = val;
                this.searchList();
            },
            getLicenseList() {
                const { page } = this;

                const data = {
                    pageIndex: page.pageIndex,
                    pageSize: page.pageSize
                };
                this.$famHttp({
                    url: '/fam/userlicense/page',
                    method: 'POST',
                    data
                }).then((res) => {
                    if (res.code === '200') {
                        const data = res.data;
                        this.page.total = parseInt(data.total);
                        this.tableData = data.records ?? [];
                    }
                });
            },
            searchLicenseList(values) {
                const { page } = this;
                let str = '';
                values.forEach((item) => {
                    if (str === '') {
                        str += item.id;
                    } else {
                        str += ',' + item.id;
                    }
                });
                const conditionDtoList = [
                    {
                        attrName: 'userId',
                        oper: 'IN',
                        value1: str
                    }
                ];
                this.$famHttp({
                    url: '/common/search',
                    data: {
                        className,
                        conditionDtoList,
                        pageIndex: page.pageIndex,
                        pageSize: page.pageSize
                    },
                    method: 'POST'
                }).then((res) => {
                    if (res.code === '200') {
                        const data = res.data;

                        let tableData = [];
                        data.records.forEach((item) => {
                            const findAttr = item.attrRawList.find((attr) => attr.attrName === 'userId');
                            if (findAttr) {
                                const findValue = values.find((value) => value.id === findAttr.value);
                                if (findValue) {
                                    tableData.push(findValue);
                                }
                            }
                        });

                        this.tableData = tableData;
                        this.page.total = parseInt(data.total);
                    }
                });
            },
            changeMember(member) {
                this.memberList = member;
            },
            changeSearchMember(oid, member) {
                this.searchMemberList = member || [];
            },
            addUser() {
                this.visible = true;
            },
            /**
             * 批量删除
             */
            handleBatchDelete() {
                const { i18nMappingObj } = this;

                const selected = this.$refs['erdTable'].$table.getCheckboxRecords();
                if (!selected.length) {
                    this.$message({
                        type: 'warning',
                        message: i18nMappingObj.selectTip,
                        showClose: true
                    });
                    return;
                }
                this.$confirm(this.i18nMappingObj.deleteTip, this.i18nMappingObj.tip, {
                    confirmButtonText: i18nMappingObj.confirm,
                    cancelButtonText: i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    const ids = selected.map((item) => item.id);
                    this.delectedRequest(ids);
                });
            },
            /**
             * 删除
             */
            handleDelete(realm) {
                const { i18nMappingObj } = this;
                this.$confirm(i18nMappingObj.deleteTip, i18nMappingObj.tip, {
                    confirmButtonText: i18nMappingObj.confirm,
                    cancelButtonText: i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.delectedRequest([realm.id]);
                });
            },
            delectedRequest(ids) {
                this.$famHttp({
                    url: `/fam/userlicense/batch/delete`,
                    method: 'DELETE',
                    params: {},
                    data: ids,
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8'
                    }
                }).then((res) => {
                    if (res.code === '200') {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.delSuccess,
                            showClose: true
                        });
                        this.searchList();
                        this.getLicenseNum();
                    }
                });
            },

            dragEnd() {
                // this.$refs?.groupParticipantSelect?.$refs?.famParticipantSelect?.$refs?.['fam-dropdown'].hide();
            },
            // 提交新增表单
            onConfirm() {
                const memberList = this.memberList;
                if (!memberList.length) {
                    this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj.selectTip,
                        showClose: true
                    });
                    return;
                }
                const oids = memberList.map((item) => item.split(':')[2]);
                this.$famHttp({
                    url: `/fam/userlicense/batch/save`,
                    data: oids,
                    method: 'PUT'
                }).then((resp) => {
                    if (resp && resp.success) {
                        this.$message.success(this.i18nMappingObj.addSuccess);
                        this.visible = false;
                        // 刷新树
                        this.searchList();
                        this.getLicenseNum();
                    }
                });
            },
            onClose() {
                this.selectedParticipant = {};
                this.visible = false;
            },
            importData() {
                this.importVisible = true;
            },
            exportData() {
                this.exportVisible = true;
            },
            importSuccess() {
                this.searchList();
                this.getLicenseNum();
            },
            getLicenseNum() {
                this.$famHttp({
                    url: '/fam/userlicense/leave/count',
                    method: 'get'
                }).then((res) => {
                    if (res.success) {
                        this.licenseNum = res.data;
                    }
                });
            },
            refreshTable() {
                this.searchList();
            }
        }
    };
});
