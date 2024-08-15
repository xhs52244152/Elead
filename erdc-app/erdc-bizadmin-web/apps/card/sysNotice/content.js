//系统公告
define([
    'erdcloud.kit',
    'text!' + ELMP.resource('sysNotice/template.html'),
    'dayjs',
    'css!' + ELMP.resource('sysNotice/content.css')
], function (erdcloudKit, template, dayjs) {
    return {
        template: template,
        props: {
            title: String
        },
        components: {
            FamEmpty: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js')),
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            NoticeDetail: erdcloudKit.asyncComponent(ELMP.resource('sysNotice/NoticeDetail/index.js'))
        },
        filters: {
            dateFormat(date) {
                return dayjs(date).format('YYYY-MM-DD');
            }
        },
        data: function () {
            return {
                tableView: null,
                tableHeight: 0,
                i18nLocalePath: ELMP.resource('sysNotice/locale/index.js'),
                i18nMappingObj: {
                    title: this.getI18nByKey('标题'),
                    creator: this.getI18nByKey('创建人'),
                    createTime: this.getI18nByKey('创建时间'),
                    status: this.getI18nByKey('状态'),
                    isPopover: this.getI18nByKey('是否弹窗'),
                    allMarkRead: this.getI18nByKey('全部标记为已读'),
                    markRead: this.getI18nByKey('标记为已读'),
                    empty: this.getI18nByKey('清空'),
                    delete: this.getI18nByKey('删除'),
                    readAllConfirm: this.getI18nByKey('readAllConfirm'),
                    readConfirm: this.getI18nByKey('确认标记为已读'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    confirmTitle: this.getI18nByKey('提示'),
                    emptyConfrim: this.getI18nByKey('emptyConfrim'),
                    deleteConfirm: this.getI18nByKey('确认删除'),
                    selectDataTip: this.getI18nByKey('请选择数据'),
                    readed: this.getI18nByKey('已读'),
                    unread: this.getI18nByKey('未读'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否')
                },
                tableData: [],
                pageIndex: 1,
                pageSize: 5,
                total: 0
            };
        },
        computed: {
            user() {
                return this.$store.state.app.user;
            }
        },
        methods: {
            getTableData() {
                this.$famHttp({
                    url: `/common/notice/user/${this.user.id}`,
                    method: 'GET',
                    data: {
                        pageIndex: this.pageIndex,
                        pageSize: this.pageSize
                    }
                })
                    .then((res) => {
                        if (res.success) {
                            this.tableData = res.data.records;
                            this.total = Number(res.data.total);
                        }
                    })
                    .catch((err) => {
                        this.$message({
                            showClose: true,
                            message: err?.data?.message,
                            type: 'error'
                        });
                    });
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.getTableData();
            },
            handleCurrentChange(val) {
                this.pageIndex = val;
                this.getTableData();
            },
            handleReadByDetail(notice) {
                this.handleRead([notice.id]);
            },
            /**
             * 标记为已读
             * @param {*} ids
             */
            handleRead(ids) {
                this.$famHttp({
                    url: '/common/notice/batch/read',
                    method: 'put',
                    data: ids
                })
                    .then((res) => {
                        if (res.success) {
                            if (res.success) {
                                this.getTableData();
                            }
                        }
                    })
                    .catch((err) => {
                        this.$message({
                            showClose: true,
                            message: err?.data?.message,
                            type: 'error'
                        });
                    });
            },
            refreshTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            displayMode(mode) {
                if (mode === 'popup') {
                    return this.i18nMappingObj.yes;
                } else {
                    return this.i18nMappingObj.no;
                }
            },
            displayState(state) {
                if (state === 'readed') {
                    return this.i18nMappingObj.readed;
                } else {
                    return this.i18nMappingObj.unread;
                }
            },
            containerHeight: function () {
                this.tableHeight = this.$el.clientHeight - 60 - 5 - 40;
            },
            showDetail(row) {
                this.$refs.noticeRef.show(row, 'relation');
            }
        },
        mounted() {
            this.getTableData();
            var self = this;
            this.$nextTick(function () {
                self.containerHeight();
            });
            this.subscribeResize(this.containerHeight);
        }
    };
});
