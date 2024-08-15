define([
    'erdc-kit',
    'text!' + ELMP.resource('biz-announcements/components/AnnouncementForm/template.html'),
    'css!' + ELMP.resource('biz-announcements/components/AnnouncementForm/index.css')
], function (erdcloudKit, template) {
    return {
        template,
        props: {
            notifySendTypes: {
                type: Array,
                default() {
                    return [];
                }
            },
            userSite: Object
        },
        components: {
            FamParticipantSelect: erdcloudKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            FamErdTable: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-announcements/locale/index.js'),
                i18nMappingObj: {
                    title: this.getI18nByKey('标题'),
                    content: this.getI18nByKey('内容'),
                    status: this.getI18nByKey('状态'),
                    ifPopover: this.getI18nByKey('是否弹窗'),
                    ifNotice: this.getI18nByKey('是否消息通知'),
                    notify: this.getI18nByKey('统一通知'),
                    attachment: this.getI18nByKey('附件'),
                    noticeObject: this.getI18nByKey('公告对象'),

                    participantType: this.getI18nByKey('参与者类型'),
                    participant: this.getI18nByKey('参与者'),
                    department: this.getI18nByKey('部门'),
                    telephone: this.getI18nByKey('电话'),
                    email: this.getI18nByKey('邮箱'),
                    remove: this.getI18nByKey('移除'),
                    operation: this.getI18nByKey('操作'),

                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),

                    all: this.getI18nByKey('all'),
                    part: this.getI18nByKey('part'),

                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),

                    ROLE: this.getI18nByKey('ROLE'),
                    USER: this.getI18nByKey('USER'),
                    GROUP: this.getI18nByKey('GROUP'),
                    ORG: this.getI18nByKey('ORG'),

                    updateNotice: this.getI18nByKey('编辑公告'),
                    createNotice: this.getI18nByKey('创建公告'),
                    fileUploading: this.getI18nByKey('文件上传中'),
                    relatedRequired: this.getI18nByKey('请先选择关联数据'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    addMember: this.getI18nByKey('addMember')
                },

                // 参与者选择
                queryParams: {
                    data: {
                        appName: 'plat',
                        isGetVirtualRole: true
                    }
                },
                participantVal: {
                    type: '',
                    value: []
                },
                memberList: [],
                groupList: [],

                visible: false,
                participantsList: [],
                relationTableData: [], // 当前表格的数据
                // 分页
                relationTablePagination: {
                    pageSize: 10,
                    pageIndex: 1,
                    total: 0
                },

                fileList: [],
                options: {
                    type: 'site'
                },
                attachFileReqStack: [], // 附件表操作请求栈

                formData: {
                    oid: '',
                    name: '',
                    content: '',
                    noticeState: 'enable',
                    displayMode: 'popup',
                    notifyCodes: [],
                    selectType: '0'
                },

                copyFileList: [],
                loading: false
            };
        },
        computed: {
            formConfigs() {
                const { notifySendTypes } = this;

                const config = [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj.title,
                        required: true,
                        validators: [],
                        props: {},
                        col: 24
                    },
                    {
                        field: 'content',
                        component: 'erd-quill-editor',
                        label: this.i18nMappingObj.content,
                        required: true,
                        col: 24
                    },
                    {
                        field: 'noticeState',
                        component: 'fam-radio',
                        label: this.i18nMappingObj.status,
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj.enable,
                                    value: 'enable'
                                },
                                {
                                    label: this.i18nMappingObj.disable,
                                    value: 'disable'
                                }
                            ]
                        },
                        col: 12
                    },
                    {
                        field: 'displayMode',
                        component: 'fam-radio',
                        label: this.i18nMappingObj.ifPopover,
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj.yes,
                                    value: 'popup'
                                },
                                {
                                    label: this.i18nMappingObj.no,
                                    value: 'none'
                                }
                            ]
                        },
                        col: 12
                    },
                    {
                        field: 'file',
                        label: this.i18nMappingObj.attachment,
                        slots: {
                            component: 'upload'
                        },
                        col: 24
                    },
                    {
                        field: 'selectType',
                        component: 'fam-radio',
                        label: this.i18nMappingObj.noticeObject,
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj.all,
                                    value: '0'
                                },
                                {
                                    label: this.i18nMappingObj.part,
                                    value: '1'
                                }
                            ]
                        },
                        col: 24
                    },
                    this.formData.selectType === '1'
                        ? {
                              field: 'relation',
                              slots: {
                                  component: 'relation'
                              },
                              col: 24
                          }
                        : null
                ].filter((i) => i);

                if (notifySendTypes.length) {
                    config.splice(4, 0, {
                        field: 'notify',
                        label: this.i18nMappingObj.notify,
                        slots: {
                            component: 'notify'
                        },
                        col: 24
                    });
                }
                return config;
            },
            relationTableColumn: function () {
                return [
                    {
                        prop: 'participantType',
                        title: this.i18nMappingObj.participantType,
                        width: '120'
                    },
                    {
                        prop: 'principalName',
                        title: this.i18nMappingObj.participant,
                        minWidth: '150',
                        width: '150'
                    },
                    {
                        prop: 'department',
                        title: this.i18nMappingObj.department
                    },
                    {
                        prop: 'mobile',
                        title: this.i18nMappingObj.telephone,
                        minWidth: '140',
                        width: '140'
                    },
                    {
                        prop: 'email',
                        title: this.i18nMappingObj.email,
                        width: '150'
                    },
                    {
                        prop: 'operation',
                        title: this.i18nMappingObj.operation,
                        width: '90'
                    }
                ];
            },
            server() {
                return this.userSite?.serverAddr ?? '';
            }
        },
        methods: {
            downloadFile(file) {
                if (file.storeId && this.formData.authorizeCode && this.formData.authorizeCode[file.storeId]) {
                    erdcloudKit.downloadFile(file.storeId, this.formData.authorizeCode[file.storeId]);
                }
            },
            /**
             * 由于 FamParticipantSelect 组件对于人员选择和角色选择change事件参数不同，
             * 因此这里监听了两个事件。参考模块【团队模块管理】
             */
            changeMember(id, data) {
                this.memberList = data;
                this.groupList = [];
            },
            changeUserGroup(data) {
                this.memberList = [];
                this.groupList = data.selected;
            },
            showDialog(data) {
                if (data) {
                    this.getNoticeDetail(data.oid);
                }
                this.visible = true;
            },
            /**
             * 获取公告详情。包含所有的公告数据
             * @param {*} oid
             */
            getNoticeDetail(oid) {
                return this.$famHttp({
                    url: `/common/notice/${oid}`,
                    method: 'GET'
                })
                    .then((res) => {
                        if (res.success) {
                            this.setFormData(res.data);
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
            setFormData(data = {}) {
                const properties = ['oid', 'name', 'content', 'noticeState', 'displayMode'];

                const tempObj = {
                    authorizeCode: data.authorizeCode || {}
                };
                properties.forEach((key) => {
                    tempObj[key] = data[key] ?? '';
                });
                // 编辑时需要重新选
                tempObj.notifyCodes = data.noticeSendTypes ? data.noticeSendTypes.split(',') : [];

                if (_.isEmpty(data.noticeObjectList)) {
                    tempObj.selectType = '0';
                } else {
                    tempObj.selectType = '1';
                    // 参与者
                    const participantsList = data.noticeObjectList.map((item) => {
                        const linkId = data.noticeObjectLinkList?.find((ele) => ele.roleBObjectRef === item.oid)?.oid;
                        return {
                            oid: item.oid,
                            id: item.id,
                            participantType: item.principalTarget,
                            principalName: item.displayName,
                            department: item.orgName,
                            mobile: item.mobile,
                            email: item.email,
                            linkId: linkId
                        };
                    });
                    this.participantsList = participantsList;
                    this.relationTablePagination.total = this.participantsList.length;
                }

                this.formData = tempObj;
                this.fileList = data.fileList.map((item) => {
                    return Object.assign({ name: item.displayName, attachId: item.id }, item);
                });
                this.copyFileList = [].concat(this.fileList);

                this.getTablePageData();
            },
            /**
             * 将角色/用户/部门添加到参与者列表中
             */
            addMember() {
                const { participantsList, memberList, groupList } = this;

                let newParticipant = [];
                if (memberList.length > 0) {
                    newParticipant = memberList.map((item) => {
                        return {
                            oid: item.oid,
                            id: item.id,
                            email: item.email,
                            principal: item.oid,
                            principalName: item.displayName,
                            participantType: item.principalTarget,
                            department: item.orgName,
                            mobile: item.mobile
                        };
                    });
                } else if (groupList.length > 0) {
                    newParticipant = groupList.map((item) => {
                        return {
                            oid: item.oid,
                            id: item.id,
                            principal: item.oid,
                            principalName: item.displayName,
                            participantType: item.principalTarget,
                            primarily: false
                        };
                    });
                }

                // 用户没有选择参与者时，给用户message提示，但是如果用户选择的参与者重复，则没有必要提示，直接过滤掉就好
                newParticipant = newParticipant.filter((ele) => {
                    return participantsList.findIndex((it) => it.oid === ele.oid) === -1;
                });

                this.participantVal.value = [];
                if (!newParticipant.length) return;

                this.participantsList = this.participantsList.concat(newParticipant);
                this.relationTablePagination.total = this.participantsList.length;

                this.getTablePageData();
            },
            getTablePageData() {
                const { participantsList, relationTablePagination: pagination } = this;

                const tableData = participantsList.slice(
                    (pagination.pageIndex - 1) * pagination.pageSize,
                    pagination.pageIndex * pagination.pageSize
                );
                this.relationTableData = tableData;
            },
            removeRelation: function (data) {
                const index = this.participantsList.findIndex((item) => item.oid === data.oid);
                if (index > -1) {
                    this.participantsList.splice(index, 1);

                    this.relationTablePagination.total = this.participantsList.length;
                    this.getTablePageData();
                }
            },
            // 人员列表分页切换
            handlePageChange: function (data) {
                this.getTablePageData();
            },
            // size切换
            handleSizeChange: function (data) {
                this.relationTablePagination.pageIndex = 1;
                this.getTablePageData();
            },

            // 提交
            submit() {
                this.loading = true;

                this.$refs.form
                    .submit()
                    .then(({ valid }) => {
                        if (valid) {
                            this.saveNotice().then(() => {
                                this.loading = false;
                            });
                        }
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            saveNotice() {
                const { participantsList, formData } = this;

                let rowList = [];
                _.each(formData, function (value, key) {
                    let rowValue = value;
                    if (key === 'notifyCodes') {
                        rowValue = value.join(',');
                    }
                    rowList.push({
                        attrName: key,
                        value: rowValue
                    });
                });
                // 固定参数
                rowList.push({
                    attrName: 'delFlag',
                    value: false
                });

                return this.getContentSet().then((fileIds) => {
                    let relations = [];
                    if (formData.selectType === '0') {
                        relations = [];
                    } else {
                        if (_.isEmpty(participantsList)) {
                            this.$message({
                                type: 'warning',
                                message: this.i18n.userEmptyWarning
                            });
                            return;
                        }
                        relations = participantsList.map((item) => {
                            return {
                                className: 'erd.cloud.notice.entity.SysNoticeReceiveLink',
                                attrRawList: [
                                    {
                                        attrName: 'roleBObjectRef',
                                        value: item.oid
                                    }
                                ],
                                oid: item.linkId
                            };
                        });
                    }

                    return this.$famHttp({
                        url: formData?.oid ? '/fam/update' : '/fam/create',
                        method: 'post',
                        data: {
                            action: formData?.oid ? 'UPDATE' : 'CREATE',
                            appName: 'plat',
                            className: 'erd.cloud.notice.entity.SysNotice',
                            attrRawList: rowList,
                            oid: formData?.oid || '',
                            contentSet: fileIds,
                            associationField: 'roleAObjectRef',
                            relationList: relations
                        }
                    })
                        .then(() => {
                            this.cancel();
                            this.$emit('save');
                        })
                        .catch((err) => {
                            // this.$message({
                            //     showClose: true,
                            //     message: err?.data?.message,
                            //     type: 'error'
                            // });
                        });
                });
            },
            getContentSet() {
                let self = this;
                const { copyFileList } = this;
                let fileList = this.$refs.uploadRef.uploadFileList || [];

                return Promise.all(
                    fileList
                        .filter((i) => !i.attachId)
                        .map((i) => {
                            return self.addToAttachFile(i);
                        })
                ).then(() => {
                    const changeFileList = [];
                    fileList.forEach((file) => {
                        const findIndex = copyFileList.findIndex(
                            (item) => (file.attachId || file.response.data) === item.attachId
                        );
                        // 操作标识（0不操作，1添加，2编辑，3删除,4主内容替换）
                        const actionFlag = findIndex === -1 ? 1 : 0;

                        changeFileList.push({
                            actionFlag,
                            id: file.attachId || file.response.data,
                            source: 0,
                            role: 'FILE_DEFAULT'
                        });
                    });

                    copyFileList.forEach((file) => {
                        const findIndex = fileList.findIndex((item) => file.attachId === item.attachId);
                        // 操作标识（0不操作，1添加，2编辑，3删除,4主内容替换）
                        if (findIndex === -1) {
                            changeFileList.push({
                                actionFlag: 3,
                                id: file.attachId,
                                source: 0,
                                role: 'FILE_DEFAULT'
                            });
                        }
                    });

                    return changeFileList;
                });
            },
            // 关闭弹窗
            cancel() {
                // 重置数据
                this.formData = {
                    oid: '',
                    name: '',
                    content: '',
                    noticeState: 'enable',
                    displayMode: 'popup',
                    selectType: '0',
                    notifyCodes: []
                };
                this.fileList = [];
                this.copyFileList = [];
                this.relationTableData = [];
                this.participantsList = [];
                this.relationTablePagination = {
                    pageSize: 10,
                    pageIndex: 1,
                    total: 0
                };

                this.visible = false;
            },
            addToAttachFile(file) {
                file.attachId = file.response.contentId;
            }
        }
    };
});
