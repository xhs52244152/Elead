/**
 * 公告摘要。
 */
define([
    'erdc-socket',
    'dayjs',
    'text!' + ELMP.resource('biz-message/widget/WidgetNotice/index.html'),
    ELMP.resource('biz-announcements/components/AnnouncementDetail/index.js'),
    'css!' + ELMP.resource('biz-message/widget/WidgetNotice/index.css')
], function (ErdcSocket, dayjs, template, NoticeDetail) {
    'use strict';
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            NoticeDetail,
            FamEmpty: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-message/locale/index.js'),
                i18nMappingObj: {
                    allMarkRead: this.getI18nByKey('全部标记为已读'),
                    readAllConfirm: this.getI18nByKey('readAllConfirm'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    confirmTitle: this.getI18nByKey('提示')
                },

                // 未读公告数量
                noticeCount: 0,
                popoverNoticeCount: 0, //需要通过弹框展示的公告
                noticeList: []
            };
        },
        computed: {
            user() {
                return this.$store.state.app.user;
            },
            showNext() {
                return this.popoverNoticeCount > 0;
            }
        },
        created() {
            this.getNewestNotice();
            this.registryNoticeWebsocket();
        },
        methods: {
            showPage() {
                this.getNoticeUnreadList();
            },
            registryNoticeWebsocket() {
                ErdcSocket.addEvent('notice', (resp) => {
                    if (resp.code === 200) {
                        this.getNewestNotice();
                    }
                });
            },
            /**
             * 标记为已读
             * @param {*} notice
             */
            handleRead(notice) {
                if (!notice) return;

                const ids = [notice.id];
                this.$famHttp({
                    url: '/common/notice/batch/read',
                    method: 'put',
                    data: ids
                })
                    .then((res) => {
                        if (res.success) {
                            this.getNoticeUnreadList();
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
            handleNext() {
                this.getNewestNotice();
            },

            getNoticeUnreadList(pageSize = 10) {
                const { user } = this;

                const data = {
                    pageSize,
                    pageIndex: 1,
                    noticeState: 'unread'
                };

                this.$famHttp({
                    // 更多配置参考axios官网
                    url: `/common/notice/user/${user.id}`, // 表格数据接口
                    method: 'GET', // 请求方法（默认get）
                    data
                })
                    .then((resp) => {
                        if (resp.success) {
                            const result = resp.data || {};
                            const total = parseInt(result.total);
                            this.noticeList = result.records;

                            this.setNoticeCount(total);
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
             * 获取最新公告
             */
            getNewestNotice() {
                this.$famHttp({
                    url: `/common/notice/popup`,
                    method: 'get'
                })
                    .then((res) => {
                        if (res.success) {
                            const data = res.data ?? {};
                            const { notice, num, allNum } = data;
                            if (notice) {
                                this.$refs.noticeRef.show(notice);
                            }
                            this.popoverNoticeCount = num;
                            this.setNoticeCount(allNum);
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

            goToNoticeList() {
                this.$emit('close');
                this.$router.push({
                    path: '/container/biz-message',
                    query: {
                        active: 'notice'
                    }
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
                }).then((res) => {
                    if (res.success) {
                        this.$message({
                            type: ' success',
                            message: this.getI18nByKey('已标记所有公告已读'),
                            showClose: true
                        });

                        this.getNoticeUnreadList();
                    }
                });
            },
            /**
             * 公告详情
             * @param {*} data
             */
            handleDetail(data) {
                this.$emit('close'); // 关闭消息popover
                this.$refs.noticeRef.show(data);
            },
            setNoticeCount(count) {
                if (isNaN(count)) return;

                this.noticeCount = count;
                this.$emit('countChange', {
                    type: 'noticeCount',
                    count: this.noticeCount
                });
            },
            dateFormat(date) {
                return dayjs(date).format('YYYY-MM-DD');
            }
        }
    };
});
