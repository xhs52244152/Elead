define([
    'text!' + ELMP.resource('platform-storage/views/BindingWithDepartment/index.html'),
    'erdcloud.kit',
    ELMP.resource('platform-storage/api.js')
], function (template, erdcloudKit, api) {
    return {
        template,
        components: {
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            // 基础表格
            ErdTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys([
                        'depName',
                        'curDocSite',
                        'updater',
                        'updateTime',
                        'bindSite',
                        'unbindSite',
                        'batchBindSite',
                        'operate',
                        'back',
                        'confirm',
                        'cancel',
                        'bindDepartments'
                    ]),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑')
                },

                orgData: [],
                loading: false,
                treeConfig: {
                    lazy: true,
                    transform: false, // 当前数据已经是树形了，不需要自动转换了
                    rowField: 'id',
                    parentField: 'parentId',
                    hasChild: 'hasChild', // 设置是否有子节点标识
                    loadMethod: ({ row }) => {
                        return this.getOrgByParent(row);
                    }
                },
                rowConfig: {
                    useKey: true,
                    keyField: 'id'
                },
                checkboxConfig: {
                    rowField: 'id',
                    parentField: 'parentId',
                    checkStrictly: true
                },
                scrollY: {
                    gt: 0
                },

                allSites: [], // 不包含部门信息的站点列表，绑定站点搜索时减少服务的查询压力
                // siteData: {
                //     data: [],
                //     users: []
                // },
                siteData: [], // 当前部门和站点的关联信息

                bindVisible: false,
                selectedSite: '',
                selectedOrgs: [],

                tableHeight: document.body.clientHeight - 144
            };
        },
        computed: {
            columns() {
                const { i18nMappingObj } = this;
                return [
                    {
                        prop: 'id',
                        type: 'checkbox',
                        align: 'center',
                        fixed: 'left', // 是否固定列
                        width: '40px'
                    },
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: '70px',
                        fixed: 'left', // 是否固定列
                        align: 'left', //多选框默认居中显示
                        props: {
                            className: 'seq-cloumn'
                        }
                    },
                    {
                        minWidth: '400px',
                        title: i18nMappingObj.depName,
                        prop: 'name',
                        treeNode: true
                    },
                    {
                        width: '150px',
                        title: i18nMappingObj.curDocSite,
                        prop: 'linkSiteName'
                    },
                    // {
                    //     minWidth: '150',
                    //     title: i18nMappingObj.updater,
                    //     prop: 'updateUser',
                    // },
                    {
                        minWidth: '100',
                        title: i18nMappingObj.updateTime,
                        prop: 'linkUpdateTime'
                    },
                    {
                        width: '140',
                        title: i18nMappingObj.operate,
                        prop: 'operation',
                        fixed: 'right'
                    }
                ];
            }
        },
        created() {
            this.getInitData();
        },
        methods: {
            // 返回
            goBack() {
                this.$router.go(-1);
            },
            closed() {
                this.selectedSite = '';
            },
            getInitData() {
                this.loading = true;
                Promise.all([api.site.getLinkSites(), api.org.getOrgByParent()])
                    .then((results) => {
                        const siteData = results[0];
                        const orgs = results[1];

                        this.orgData = this.getOrgAndSitesAssemble(orgs, siteData);

                        this.siteData = siteData;
                        this.loading = false;
                    })
                    .catch((res) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: res.data.message,
                        //     type: 'error'
                        // });
                        this.loading = false;
                    });

                api.site.list().then((res) => {
                    this.allSites = res.data;
                });
            },
            async getOrgByParent(row) {
                const { siteData } = this;

                const orgs = await api.org.getOrgByParent(row?.id);
                const bindOrgs = this.getOrgAndSitesAssemble(orgs, siteData);

                return bindOrgs;
            },
            async updateOrg() {
                const siteData = await api.site.getLinkSites();
                this.getOrgAndSitesAssemble(this.selectedOrgs, siteData);
            },
            unbindUpdateOrg(org) {
                org.linkSiteName = '';
                org.linkSiteCode = '';
                org.linkUpdateTime = '';
                org.updateUser = '';
            },
            /**
             * 获取部门和站点的组装数据.
             * @
             */
            getOrgAndSitesAssemble(orgs, sites = [], users = []) {
                const bindOrgs = orgs.map((org) => {
                    const findSite = sites.find((site) => {
                        return (site.linkType = 'DEPARTMENT' && site.linkObj === org.id);
                    });

                    org.linkSiteName = findSite ? findSite.siteName : '';
                    org.linkSiteCode = findSite ? findSite.siteCode : '';
                    org.linkUpdateTime = findSite ? findSite.updateTime : '';
                    // org.updateUser = findSite ? this.findUpdateUsers(findSite.updateBy, users) : '';
                    return org;
                });

                return bindOrgs;
            },
            findUpdateUsers(userId, users) {
                const findUser = users.find((item) => item.id === userId);
                return findUser;
            },
            handleSelectChange() {
                let selections = this.$refs.tableRef.$table.getCheckboxRecords();
                this.selectedOrgs = selections;
            },
            confirmBind() {
                this.bindSiteReq();
            },
            cancelBind() {
                this.bindVisible = false;
            },
            handleBatchBindSite() {
                if (this.selectedOrgs.length) {
                    this.bindVisible = true;
                } else {
                    this.$message({
                        showClose: true,
                        message: '请选择部门',
                        type: 'warning'
                    });
                }
            },
            handleBindSite(row) {
                this.selectedOrgs = [row];
                this.bindVisible = true;
            },
            handleUnbindSite(row) {
                // 如果没有绑定站点就不需要解绑
                if (!row.linkSiteCode) return;

                this.$confirm('是否解绑该站点', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.unbindSiteReq(row);
                });
            },
            bindSiteReq() {
                const { selectedOrgs, selectedSite } = this;

                if (!selectedOrgs.length || !selectedSite) return;

                const params = {
                    linkObjs: selectedOrgs.map((item) => item.id),
                    linkType: 'DEPARTMENT',
                    siteCode: selectedSite
                };

                api.site
                    .batchLinkSite(params)
                    .then((res) => {
                        if (res.data) {
                            this.bindVisible = false;
                            this.$message({
                                showClose: true,
                                message: '站点绑定成功',
                                type: 'success'
                            });
                            this.updateOrg();
                            // 批量更新完毕后就清空用户的选择。
                            this.clearTableCheckBox();
                        }
                    })
                    .catch(() => {
                        this.$message({
                            showClose: true,
                            message: '站点绑定失败',
                            type: 'warning'
                        });
                    });
            },
            unbindSiteReq(row) {
                api.site
                    .unLinkSite(row.id)
                    .then((res) => {
                        if (res.data) {
                            this.$message({
                                showClose: true,
                                message: '站点解绑成功',
                                type: 'success'
                            });
                            this.unbindUpdateOrg(row);
                        }
                    })
                    .catch(() => {
                        this.$message({
                            showClose: true,
                            message: '站点解绑失败',
                            type: 'warning'
                        });
                    });
            },
            clearTableCheckBox() {
                const tableRef = this.$refs['tableRef'].$table;

                const selections = tableRef.getCheckboxRecords();
                if (selections.length > 0) {
                    tableRef.clearCheckboxRow();
                }
            }
        }
    };
});
