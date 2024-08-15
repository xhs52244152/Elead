define([
    'erdcloud.kit',
    'dayjs',
    ELMP.resource('biz-announcements/components/AnnouncementForm/index.js'),
    'text!' + ELMP.resource('biz-announcements/template.html'),
    ELMP.resource('biz-announcements/components/AnnouncementDetail/index.js'),
    'css!' + ELMP.resource('biz-announcements/index.css')
], function (erdcloudKit, dayjs, NoticeEdit, template, NoticeDetail) {
    return {
        template: template,
        components: {
            famAdvancedTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            NoticeEdit,
            NoticeDetail,
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            const i18nMappingObj = {
                title: this.getI18nByKey('标题'),
                creator: this.getI18nByKey('创建人'),
                createTime: this.getI18nByKey('创建时间'),
                status: this.getI18nByKey('状态'),
                isPopover: this.getI18nByKey('是否弹窗'),

                edit: this.getI18nByKey('编辑'),
                delete: this.getI18nByKey('删除'),
                create: this.getI18nByKey('创建'),
                batchDelete: this.getI18nByKey('批量删除'),
                enable: this.getI18nByKey('启用'),
                disable: this.getI18nByKey('停用'),
                confirm: this.getI18nByKey('确定'),
                cancel: this.getI18nByKey('取消'),
                tips: this.getI18nByKey('tips'),
                deleteTip: this.getI18nByKey('deleteTip'),
                selectDataTip: this.getI18nByKey('请选择数据'),

                yes: this.getI18nByKey('是'),
                no: this.getI18nByKey('否')
            };
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-announcements/locale/index.js'),
                i18nMappingObj: i18nMappingObj,
                notifySendTypes: [] // 统一通知发送方式
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            viewTableConfig: function () {
                const { i18nMappingObj } = this;

                const className = 'erd.cloud.notice.entity.SysNotice';
                const self = this;
                return {
                    firstLoad: true,
                    isDeserialize: true, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    searchParamsKey: 'searchKey',
                    tableRequestConfig: {
                        url: '/fam/search',
                        data: {
                            appName: ['plat'],
                            className
                        },
                        method: 'post',
                        isFormData: false
                    },
                    tableBaseConfig: {
                        showOverflow: true,
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        }
                    },
                    columns: [
                        {
                            attrName: 'name',
                            label: i18nMappingObj.title
                        },
                        {
                            attrName: 'createBy',
                            label: i18nMappingObj.creator
                        },
                        {
                            attrName: 'createTime',
                            label: i18nMappingObj.createTime,
                            minWidth: 120,
                            width: 120
                        },
                        {
                            attrName: 'noticeState',
                            label: i18nMappingObj.status,
                            minWidth: 120,
                            width: 120
                        },
                        {
                            attrName: 'displayMode',
                            label: i18nMappingObj.isPopover,
                            minWidth: 100,
                            width: 100
                        },
                        {
                            attrName: 'operation',
                            label: this.i18n.operation,
                            isDisable: true,
                            fixed: 'right',
                            showOverflow: false,
                            minWidth: 100,
                            width: 100
                        }
                    ],
                    columnWidths: {
                        operation: '100'
                    },
                    toolbarConfig: {
                        showMoreSearch: false,
                        showConfigCol: true,
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: true,
                            isLocalSearch: false
                        },
                        mainBtn: {
                            label: self.i18nMappingObj.create,
                            onclick() {
                                self.handleNoticeEdit();
                            }
                        },
                        secondaryBtn: [
                            {
                                label: self.i18nMappingObj.batchDelete,
                                onclick() {
                                    self.handleNoticeBatchDeleteConfirm();
                                }
                            }
                        ]
                    },
                    addOperationCol: false,
                    addCheckbox: true,
                    addSeq: true,
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
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ],
                    fieldLinkConfig: {
                        fieldLink: true,
                        // 是否添加列超链接
                        fieldLinkName: 'name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            // 超链接事件
                            this.showDetail(row);
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
        created() {
            this.getNotifySendTypes();
        },
        methods: {
            displayMode(mode) {
                if (mode === 'popup') {
                    return this.i18nMappingObj.yes;
                } else {
                    return this.i18nMappingObj.no;
                }
            },
            displayState(state) {
                return this.i18nMappingObj[state] || '';
            },
            dateFormat(date) {
                return dayjs(date).format('YYYY-MM-DD');
            },
            /**
             * 公告编辑/创建
             * @param {*} data
             */
            handleNoticeEdit(data) {
                this.$refs.noticeEditRef.showDialog(data);
            },
            handleSave() {
                this.$refs['noticeTableRef'].fnRefreshTable();
            },
            showDetail(row) {
                this.$refs.noticeRef.show(row);
            },
            /**
             * 公告删除确认
             * @param {*} data 单条删除的数据
             */
            handleNoticeDeleteConfirm(data) {
                const { i18nMappingObj } = this;
                this.$confirm(i18nMappingObj.deleteTip, i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                }).then(() => {
                    this.handleNoticeDelete([data.id]);
                });
            },
            handleNoticeDelete(ids) {
                this.$famHttp({
                    url: '/common/notice/remove',
                    data: ids,
                    method: 'put'
                }).then((res) => {
                    if (res.data) {
                        this.$message({
                            message: this.i18nMappingObj.deleteTips,
                            type: 'success'
                        });
                        this.$refs['noticeTableRef'].fnRefreshTable();
                    }
                });
            },
            /**
             * 批量删除公告确认
             */
            handleNoticeBatchDeleteConfirm() {
                const selectData = this.$refs.noticeTableRef.selectData;
                if (!selectData.length) {
                    this.$message({
                        message: this.i18nMappingObj.selectDataTip,
                        type: 'warning'
                    });
                    return;
                }
                const { i18nMappingObj } = this;
                this.$confirm(i18nMappingObj.deleteTip, i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel
                }).then(() => {
                    const ids = selectData.map((item) => item.id);
                    this.handleNoticeDelete(ids);
                });
            },
            getNotifySendTypes() {
                this.getUseableSendTypes().then((data) => {
                    let sendConfigs = data?.sendConfigs || [];
                    sendConfigs.forEach((i) => {
                        i.value = i.code;
                        i.description = erdcloudKit.translateI18n(i.i18n);
                    });
                    this.notifySendTypes = sendConfigs;
                });
            },
            getUseableSendTypes() {
                return this.$famHttp({
                    url: '/message/notify/v1/main/enable/sendType',
                    data: {
                        code: 'sys_notice_send' // 固定值，服务端写死
                    },
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    method: 'POST'
                })
                    .then((res) => {
                        let types = [];
                        if (res.success) {
                            types = res.data;
                        }
                        return types;
                    })
                    .catch(() => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            }
            // getSendTypesEnum: function () {
            //     return this.$famHttp({
            //         url: '/fam/enumDataList',
            //         data: {
            //             realType: this.$store.getters.className('notifySendType')
            //         },
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'multipart/form-data'
            //         }
            //     })
            //         .then(function (resp) {
            //             const { data = [] } = resp;
            //
            //             return data;
            //         })
            //         .catch((err) => {
            //             // this.$message({
            //             //     showClose: true,
            //             //     message: err?.data?.message,
            //             //     type: 'error'
            //             // });
            //         });
            // }
        }
    };
});
