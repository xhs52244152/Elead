define([
    'erdcloud.kit',
    'text!' + ELMP.resource('biz-message/MessageOverview/ReceivedMessage/index.html'),
    ELMP.resource('biz-message/components/MessageContent/index.js'),
    'css!' + ELMP.resource('biz-message/MessageOverview/ReceivedMessage/index.css')
], function (erdcloudKit, template, MessageContent) {
    return {
        template,
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('locale/index.js', 'biz-message'),
                i18nMappingObj: {
                    receiveTime: this.getI18nByKey('接收时间'),
                    sender: this.getI18nByKey('发信人'),
                    title: this.getI18nByKey('标题'),
                    state: this.getI18nByKey('状态'),
                    allMarkRead: this.getI18nByKey('全部标记为已读'),
                    markRead: this.getI18nByKey('标记为已读'),
                    empty: this.getI18nByKey('清空'),
                    delete: this.getI18nByKey('删除'),
                    readAllConfirm: this.getI18nByKey('readConfirm'),
                    readConfirm: this.getI18nByKey('确认标记为已读'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    confirmTitle: this.getI18nByKey('提示'),
                    emptyConfirm: this.getI18nByKey('您确认清空消息吗'),
                    deleteConfirm: this.getI18nByKey('确认删除'),
                    operate: this.getI18nByKey('操作'),
                    selectDataTip: this.getI18nByKey('请选择数据'),
                    allMarkReadTip: this.getI18nByKey('消息已全部标记为已读')
                },
                curState: '',
                states: [
                    { text: '全部', value: '' },
                    { text: '未读', value: '1' },
                    { text: '已读', value: '2' }
                ],

                tableHeight: document.body.clientHeight - 228
            };
        },
        components: {
            MessageContent,
            FamAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        computed: {
            viewTableConfig() {
                const { curState } = this;
                return {
                    columns: [
                        {
                            attrName: 'title',
                            label: this.i18nMappingObj.title
                        },
                        {
                            attrName: 'state',
                            label: this.i18nMappingObj.state,
                            width: '100'
                        },
                        {
                            attrName: 'userName',
                            label: this.i18nMappingObj.sender,
                            width: '180'
                        },
                        {
                            attrName: 'createTime',
                            label: this.i18nMappingObj.receiveTime,
                            width: '200'
                        }
                        // {
                        //     attrName: 'operate',
                        //     label: this.i18nMappingObj.operate
                        // }
                    ],
                    slotsField: [
                        {
                            prop: 'title',
                            type: 'default'
                        },
                        {
                            prop: 'state',
                            type: 'default'
                        }
                    ],
                    tableBaseConfig: {
                        rowConfig: {
                            keyField: 'id'
                        },
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        }
                    },
                    firstLoad: true,
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
                                label: this.i18nMappingObj.allMarkRead,
                                class: '',
                                disable: this.curState === '2',
                                icon: 'eliconfont icon-checksquareo',
                                onclick: () => {
                                    this.handleAllMsgReadConfirm();
                                }
                            },
                            {
                                type: 'primary',
                                // type: 'default',
                                label: this.i18nMappingObj.markRead,
                                disable: this.curState === '2',
                                icon: 'eliconfont icon-check',
                                onclick: () => {
                                    this.hanldeMsgReadConfirm();
                                }
                            },
                            {
                                // type: 'danger',
                                label: this.i18nMappingObj.empty,
                                icon: 'eliconfont icon-remove',
                                onclick: () => {
                                    this.handleMsgEmptyConfirm();
                                }
                            },
                            {
                                // type: 'danger',
                                label: this.i18nMappingObj.delete,
                                icon: 'eliconfont icon-remove',
                                onclick: () => {
                                    this.handleMsgDeleteConfirm();
                                }
                            }
                        ]
                    },
                    addSeq: true,
                    addCheckbox: true,
                    tableRequestConfig: {
                        url: '/message/msg/v1/list',
                        data: {
                            readed: curState
                        }
                    },
                    pagination: {
                        showPagination: true,
                        pageSize: 20,
                        indexKey: 'page_index',
                        sizeKey: 'page_size'
                    }
                };
            }
        },
        methods: {
            handleStateChange() {
                this.$nextTick(() => {
                    this.$refs.famAdvancedTable.fnCurrentPageChange(1);
                });
            },
            /**
             * 消息详情
             */
            handleMsgDetail(message) {
                this.$refs.msgContent.show(message);
                this.handleMsgRead(message.id);
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
                            this.fnTableRefresh();
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
             * 消息已读确认
             */
            hanldeMsgReadConfirm(msg) {
                const selectData = this.$refs.famAdvancedTable.selectData;
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
                    const ids = selectData.map((item) => item.id).join(',');
                    this.handleMsgRead(ids);
                });
            },
            handleMsgRead(ids) {
                this.$famHttp({
                    url: `/message/msg/v1/msg/${ids}`,
                    method: 'put'
                })
                    .then((res) => {
                        if (res.success) {
                            this.$refs.famAdvancedTable.$refs.erdTable.$table.clearCheckboxRow();
                            this.fnTableRefresh();
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
            handleMsgDeleteConfirm() {
                const selectData = this.$refs.famAdvancedTable.selectData;
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
                    const ids = selectData.map((item) => item.id).join(',');
                    this.handleMsgDelete(ids);
                });
            },
            handleMsgDelete(ids) {
                this.$famHttp({
                    url: `/message/msg/v1/msg/${ids}`,
                    method: 'DELETE'
                })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: this.getI18nByKey('消息删除成功'),
                            showClose: true
                        });
                        this.fnTableRefresh();
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
            handleMsgEmptyConfirm() {
                this.$confirm(this.i18nMappingObj.emptyConfirm, this.i18nMappingObj.confirmTitle, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.handleMsgEmpty();
                });
            },
            handleMsgEmpty() {
                this.$famHttp({
                    url: '/message/msg/v1/msg/destroyall',
                    method: 'DELETE'
                })
                    .then((res) => {
                        if (res.success) {
                            this.$message({
                                type: ' success',
                                message: this.getI18nByKey('消息清空成功'),
                                showClose: true
                            });

                            this.fnTableRefresh();
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
            fnTableRefresh() {
                this.$refs.famAdvancedTable.fnSearchTableList();
            }
        }
    };
});
