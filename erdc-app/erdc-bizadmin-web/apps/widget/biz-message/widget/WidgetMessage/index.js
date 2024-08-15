define([
    'erdc-socket',
    'text!' + ELMP.resource('biz-message/widget/WidgetMessage/index.html'),
    ELMP.resource('biz-message/components/MessageContent/index.js'),
    'css!' + ELMP.resource('biz-message/widget/WidgetMessage/index.css'),
    'erdc-socket'
], function (ErdcSocket, template, MessageContent) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template: template,
        components: {
            MessageContent,
            FamEmpty: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('locale/index.js', 'biz-message'),
                i18nMappingObj: {
                    allMarkRead: this.getI18nByKey('全部标记为已读'),
                    readAllConfirm: this.getI18nByKey('readConfirm'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    confirmTitle: this.getI18nByKey('提示')
                },

                msgCount: 0,
                msgList: []
            };
        },
        created() {
            this.getMessage().then((data) => {
                this.setMsgCount(data);
            });
            this.registryMessageWebsocket();
        },
        methods: {
            showPage() {
                this.getMessageAbstract();
            },
            registryMessageWebsocket() {
                // ErdcSocket.registeEvent
                // 未读站内信数量
                ErdcSocket.addEvent('unreadMessageEvent', (resp) => {
                    if (resp.code != 200) {
                        return;
                    }
                    const count = resp.res.data;
                    this.setMsgCount(count);
                });
            },
            goToMessageList() {
                this.$router.push({
                    path: '/container/biz-message',
                    query: {
                        active: 'message'
                    }
                });
                this.$emit('close');
            },
            getMessageAbstract() {
                this.getMessage().then((data) => {
                    this.setMsgCount(data);
                });
                this.getMessage(10).then((data) => {
                    this.msgList = data.records;
                });
            },
            getMessage(pageSize) {
                let params = Object.create(null);

                if (pageSize) {
                    params = { readed: 1, page_index: 1, page_size: pageSize, count_only: false };
                } else {
                    params = { readed: 1, count_only: true };
                }
                params.className = 'erd.cloud.message.entity.EtMessageSender';
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/message/msg/v1/list',
                        params,
                        method: 'get'
                    })
                        .then((res) => {
                            if (res.success) {
                                resolve(res.data);
                            }
                        })
                        .catch((err) => {
                            // this.$message({
                            //     showClose: true,
                            //     message: err?.data?.message,
                            //     type: 'error'
                            // });
                            reject(err);
                        });
                });
            },

            /**
             * 全部消息已读确认
             */
            handleAllMsgReadConfirm() {
                this.$confirm(this.i18nMappingObj.readAllConfirm, this.i18nMappingObj.confirmTitle, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.handleAllMsgRead();
                });
            },
            handleAllMsgRead() {
                this.$famHttp({
                    url: '/message/msg/v1/msg/readall',
                    method: 'put'
                })
                    .then((res) => {
                        if (res.success) {
                            this.getMessageAbstract();
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
            handleMsgRead(id) {
                this.$famHttp({
                    url: `/message/msg/v1/msg/${id}`,
                    method: 'put'
                })
                    .then((res) => {
                        if (res.success) {
                            this.getMessageAbstract();
                        }
                    })
                    .catch((err) => {
                        //  this.$message({
                        //      showClose: true,
                        //      message: err?.data?.message,
                        //      type: 'error'
                        //  });
                    });
            },
            /**
             * 消息详情
             */
            handleMsgDetail(message) {
                this.$emit('close');
                this.$refs.msgContent.show(message);
            },
            setMsgCount(count) {
                if (isNaN(count)) return;

                this.msgCount = count;
                this.$emit('countChange', {
                    type: 'msgCount',
                    count: this.msgCount
                });
            }
        }
    };
});
