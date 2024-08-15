/**
 * 当前用户的公告列表
 */
define([
    'erdcloud.kit',
    'el-dayjs',
    'text!' + ELMP.resource('biz-message/MessageOverview/ReceivedNotice/index.html'),
    ELMP.resource('biz-announcements/components/AnnouncementDetail/index.js'),
    'css!' + ELMP.resource('biz-message/MessageOverview/ReceivedNotice/index.css')
], function (erdcloudKit, dayjs, template, NoticeDetail) {
    'use strict';

    return {
        template,
        components: {
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            NoticeDetail
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-message/locale/index.js'),
                i18nMappingObj: {
                    title: this.getI18nByKey('标题'),
                    creator: this.getI18nByKey('创建人'),
                    createTime: this.getI18nByKey('创建时间'),
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
                    emptyConfirm: this.getI18nByKey('emptyConfirm'),
                    deleteConfirm: this.getI18nByKey('确认删除'),
                    selectDataTip: this.getI18nByKey('请选择数据'),
                    readed: this.getI18nByKey('已读'),
                    unread: this.getI18nByKey('未读'),
                    status: this.getI18nByKey('状态'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否')
                },

                curState: '',
                states: [
                    { text: '全部', value: '' },
                    { text: '未读', value: 'unread' },
                    { text: '已读', value: 'readed' }
                ],

                tableHeight: document.body.clientHeight - 228
            };
        },
        computed: {
            user() {
                return this.$store.state.app.user;
            },
            viewTableConfig() {
                const { i18nMappingObj, user, curState } = this;

                return {
                    firstLoad: true,
                    addSeq: true,
                    addCheckbox: true,
                    addOperationCol: false,
                    fieldLinkConfig: {
                        fieldLink: true, // 是否添加列超链接
                        fieldLinkName: 'name',
                        linkClick: (row) => {
                            // 超链接事件
                            this.showDetail(row);
                        }
                    },
                    columns: [
                        {
                            attrName: 'name',
                            label: i18nMappingObj.title
                        },
                        {
                            attrName: 'createTime',
                            label: i18nMappingObj.createTime
                        },
                        {
                            attrName: 'noticeState',
                            label: i18nMappingObj.status
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'displayMode',
                            type: 'default'
                        },
                        {
                            prop: 'noticeState',
                            type: 'default'
                        },
                        {
                            prop: 'createTime',
                            type: 'default'
                        }
                    ],
                    tableBaseConfig: {
                        showOverflow: true, // 溢出隐藏显示省略号
                        rowConfig: {
                            keyField: 'id'
                        },
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        }
                    },
                    toolbarConfig: {
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        },
                        showConfigCol: true,
                        showMoreSearch: false,
                        secondaryBtn: [
                            {
                                type: 'primary',
                                label: i18nMappingObj.allMarkRead,
                                class: '',
                                icon: 'eliconfont icon-checksquareo',
                                onclick: () => {
                                    this.handleAllReadConfirm();
                                }
                            },
                            {
                                type: 'primary',
                                label: i18nMappingObj.markRead,
                                icon: 'eliconfont icon-check',
                                onclick: () => {
                                    this.hanldeReadConfirm();
                                }
                            },
                            {
                                // type: 'danger',
                                label: i18nMappingObj.empty,
                                icon: 'eliconfont icon-remove',
                                onclick: () => {
                                    this.handleEmptyConfirm();
                                }
                            },
                            {
                                // type: 'danger',
                                label: i18nMappingObj.delete,
                                icon: 'eliconfont icon-remove',
                                onclick: () => {
                                    this.handleDeleteConfirm();
                                }
                            }
                        ]
                    },
                    tableRequestConfig: {
                        url: `/common/notice/user/${user.id}`,
                        method: 'GET',
                        data: {
                            noticeState: curState
                        }
                    },
                    pagination: {
                        // 分页
                        showPagination: true, // 是否显示分页
                        pageSize: 20
                    }
                };
            }
        },
        methods: {
            dateFormat(date) {
                return dayjs(date).format('YYYY-MM-DD');
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
            showDetail(row) {
                this.$refs.noticeRef.show(row, 'relation');
            },
            handleStateChange() {
                this.$nextTick(() => {
                    this.$refs.famAdvancedTable.fnCurrentPageChange(1);
                });
            },
            /**
             * 全部已读确认
             */
            handleAllReadConfirm() {
                this.$confirm(this.i18nMappingObj.readAllConfirm, this.i18nMappingObj.confirmTitle, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.handleAllRead();
                });
            },
            /**
             * 全部标记为已读
             */
            handleAllRead() {
                this.$famHttp({
                    url: '/common/notice/readall',
                    method: 'put'
                })
                    .then((res) => {
                        if (res.success) {
                            this.refreshTable();
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            },
            refreshTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            /**
             * 标记为已读确认
             */
            hanldeReadConfirm() {
                const selectData = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                if (!selectData.length) {
                    this.$message({
                        message: this.i18nMappingObj.selectDataTip,
                        type: 'info'
                    });
                    return;
                }

                this.$confirm(this.i18nMappingObj.readConfirm, this.i18nMappingObj.confirmTitle, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    const ids = selectData.map((item) => item.id);
                    this.handleRead(ids);
                });
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
                                this.refreshTable();
                            }
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            },
            /**
             * 消息清空确认
             */
            handleEmptyConfirm() {
                this.$confirm(this.i18nMappingObj.emptyConfirm, this.i18nMappingObj.confirmTitle, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.handleEmpty();
                });
            },
            handleEmpty() {
                this.$famHttp({
                    url: '/common/notice/removeAll',
                    method: 'put'
                })
                    .then((res) => {
                        if (res.success) {
                            this.$message({
                                type: ' success',
                                message: this.getI18nByKey('消息清空成功'),
                                showClose: true
                            });
                            this.refreshTable();
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            },
            /**
             * 消息删除确认
             */
            handleDeleteConfirm() {
                const selectData = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                if (!selectData.length) {
                    this.$message({
                        message: this.i18nMappingObj.selectDataTip,
                        type: 'info'
                    });
                    return;
                }

                this.$confirm(this.i18nMappingObj.deleteConfirm, this.i18nMappingObj.confirmTitle, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    const oids = selectData.map((item) => item.id);
                    this.handleDelete(oids);
                });
            },
            handleDelete(oids) {
                this.$famHttp({
                    url: '/fam/deleteByRoleARoleBs',
                    params: {
                        className: 'erd.cloud.notice.entity.SysNoticeUserLink',
                        linkClassName: 'erd.cloud.notice.entity.SysNoticeUserLink',
                        roleAIds: this.user.id,
                        roleBIds: oids.join(',')
                    },
                    method: 'DELETE'
                })
                    .then(() => {
                        this.refreshTable();
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            }
        }
    };
});
