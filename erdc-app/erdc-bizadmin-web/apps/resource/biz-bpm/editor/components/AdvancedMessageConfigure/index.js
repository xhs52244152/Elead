define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedMessageConfigure/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/components/AdvancedMessageConfigure/style.css'),
    'erdcloud.kit',
    'underscore'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    const selectMore = function (callback) {
        return _.debounce(function () {
            const isLoad = this.scrollHeight - this.scrollTop - 60 <= this.clientHeight;
            if (isLoad && callback) {
                callback();
            }
        }, 100);
    };

    return {
        name: 'AdvancedMessageConfigure',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            BpmAvatar: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmAvatar/index.js'))
        },
        mixins: [PropertiesPanelMixin],
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                expanded: true,
                dialogVisible: false,
                isEditRow: null,
                formData: {},
                defaultFormData: {
                    notifyType: '',
                    fixTime: 30,
                    memberConfig: [],
                    beforeTime: 15,
                    beforeSendTime: 0,
                    afterTime: 0,
                    afterSendTime: 0,
                    sendType: [],
                    receiverUserOid: [],
                    receiverRoleOid: [],
                    msgNotifyRef: '',
                    msgNotifyAfterRef: ''
                },
                receiverUserInfo: [],
                receiverRoleInfo: [],
                notifyTypeList: [],
                msgNotifyRefList: [],
                msgNotifyAfterRefList: [],
                sendTypeList: [],
                pageIndex: 1,
                searchKey: '',
                // 预期完成周期列表
                fixTimeList: [
                    { label: '7', value: '7' },
                    { label: '10', value: '10' },
                    { label: '14', value: '14' },
                    { label: '30', value: '30' }
                ],
                otherMemberConfigList: {
                    receiverUserOid: '',
                    receiverRoleOid: ''
                }
            };
        },
        computed: {
            tableData: {
                get() {
                    return this.formatEchoData();
                }
            },
            columns() {
                return [
                    {
                        prop: 'notifyType',
                        title: this.i18n.notifyType // 通知类型
                    },
                    {
                        prop: 'sendType',
                        title: this.i18n.sendType // 发送类型
                    },
                    {
                        prop: 'notifyTemplate',
                        title: this.i18n.notifyTemplate // 通知模板
                    },
                    {
                        prop: 'notifyPersonnel',
                        title: this.i18n.notifyPersonnel // 通知人员
                    },
                    this.readonly
                        ? null
                        : {
                              prop: 'operation',
                              title: this.i18n.operation,
                              width: '88',
                              fixed: 'right'
                          }
                ].filter((i) => i);
            },
            // 通知人员列表
            memberConfigList() {
                return [
                    {
                        label: 'TASK_PARTICIPANT',
                        displayName: this.i18n.taskParticipant // 任务参与者
                    },
                    {
                        label: 'STARTER',
                        displayName: this.i18n.processInitiator // 流程启动者
                    },
                    {
                        label: 'TEAM_MEMBER',
                        displayName: this.i18n.contextTeamMember // 上下文团队成员
                    },
                    {
                        label: 'PROCESS_PARTICIPANT',
                        displayName: this.i18n.processParticipant // 流程参与者
                    },
                    {
                        label: 'TASK_ASSIGNEE',
                        displayName: this.i18n.currentPerson // 当前责任人
                    }
                ];
            },
            isNotifyTemplate() {
                return this.formData.notifyType === 'task_expired_notice';
            },
            sendTypeSelectProps() {
                return {
                    multiple: true,
                    clearable: true,
                    filterable: true,
                    collapseTags: true,
                    readonly: this.readonly,
                    row: {
                        componentName: 'constant-select',
                        viewProperty: 'displayName',
                        valueProperty: 'code',
                        referenceList: this.sendTypeList
                    }
                };
            }
        },
        mounted() {
            this.sendTypeSelectVisible(true);
            this.getNotifyType();
        },
        methods: {
            formatEchoData() {
                const { globalDueDateConfig, msgNotifyMap, userRoleMap } = this.template || {};
                const { dueDateConfig } = this.nodeInfo || {};
                let data = this.isGlobalConfiguration ? globalDueDateConfig : dueDateConfig;
                _.each(data, (notify) => {
                    const {
                        notifyType,
                        notifyTypeInfo,
                        sendType,
                        sendTypeInfo,
                        msgNotifyRef,
                        msgNotifyRefList,
                        msgNotifyAfterRef,
                        msgNotifyAfterRefList,
                        receiverUserOid,
                        receiverUserInfo,
                        receiverRoleOid,
                        receiverRoleInfo
                    } = notify;
                    notify.notifyTypeInfo = !_.isEmpty(notifyTypeInfo)
                        ? notifyTypeInfo
                        : _.find(this.notifyTypeList, (item) => notifyType === item.code);
                    notify.sendTypeInfo = !_.isEmpty(sendTypeInfo)
                        ? sendTypeInfo
                        : _.filter(this.sendTypeList, (item) => _.includes(sendType, item.code));
                    notify.msgNotifyRefList = !_.isEmpty(msgNotifyRefList)
                        ? msgNotifyRefList
                        : _.find(msgNotifyMap, (value, key) => msgNotifyRef === key);
                    notify.msgNotifyAfterRefList = !_.isEmpty(msgNotifyAfterRefList)
                        ? msgNotifyAfterRefList
                        : _.find(msgNotifyMap, (value, key) => msgNotifyAfterRef === key);
                    notify.receiverUserInfo = !_.isEmpty(receiverUserInfo)
                        ? receiverUserInfo
                        : _.filter(userRoleMap, (value, key) => _.includes(receiverUserOid, key));
                    notify.receiverRoleInfo = !_.isEmpty(receiverRoleInfo)
                        ? receiverRoleInfo
                        : _.filter(userRoleMap, (value, key) => _.includes(receiverRoleOid, key));
                });
                return data || [];
            },
            echoNotifyTypeName(row) {
                return row.notifyTypeInfo?.displayName;
            },
            echoSendTypeName(row) {
                return _.map(row.sendTypeInfo, 'displayName').join();
            },
            echoNotifyName(row) {
                return _.map(row.msgNotifyRefList, 'title').join();
            },
            echoNotifyPersonnelName(row) {
                const { memberConfig, receiverUserInfo, receiverRoleInfo } = row;
                const displayNameList = _.chain(this.memberConfigList)
                    .filter(item => _.includes(memberConfig, item.label))
                    .union([...receiverUserInfo, ...receiverRoleInfo])
                    .map('displayName')
                    .value();
                return displayNameList.join();
            },
            changeUser(value, data) {
                this.receiverUserInfo = data;
            },
            changeRole(value, data) {
                this.receiverRoleInfo = data;
            },
            selectMore() {
                this.pageIndex += 1;
                this.msgNotifySelectVisible(true, this.searchKey);
            },
            msgNotifySelectSearch(searchKey) {
                this.searchKey = searchKey;
                this.msgNotifySelectVisible(true, searchKey);
            },
            msgNotifySelectVisible(visible, searchKey = '') {
                if (visible) {
                    this.$famHttp({
                        url: `/bpm/search`,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            className: `${this.$store.getters.className('msgNotify')}`,
                            conditionDtoList: [],
                            pageIndex: this.pageIndex,
                            searchKey: searchKey
                        }
                    })
                        .then((resp) => {
                            const list = [];
                            _.each(resp?.data?.records, (item) => {
                                list.push({ ...item, ...this.formatAttrRawList(item.attrRawList) });
                            });
                            if (this.pageIndex === 1) {
                                this.msgNotifyRefList = list;
                                this.msgNotifyAfterRefList = list;
                            } else {
                                this.msgNotifyRefList = _.union(this.msgNotifyRefList, list);
                                this.msgNotifyAfterRefList = _.union(this.msgNotifyAfterRefList, list);
                            }
                        })
                        .catch((error) => {
                            // this.$message.error(error.message);
                        });
                } else {
                    this.pageIndex = 1;
                    this.searchKey = '';
                }
            },
            sendTypeSelectVisible(visible) {
                if (visible) {
                    const data = new FormData();
                    data.append('realType', this.$store.getters.className('notifySendType'));
                    this.$famHttp({
                        url: `/message/notify/v1/main/sendType`,
                        method: 'POST',
                        data
                    })
                        .then((resp) => {
                            _.each(resp.data, item => {
                                item.displayName = ErdcKit.translateI18n(item.i18n) || item.code;
                            });
                            this.sendTypeList = resp?.data || [];
                        })
                        .catch((error) => {
                            // this.$message.error(error.message);
                        });
                }
            },
            getNotifyType() {
                this.$famHttp({
                    url: `/fam/dictionary/tree/workflowNotify`,
                    method: 'get'
                }).then((resp) => {
                    this.notifyTypeList = resp?.data || [];
                });
            },
            addRow() {
                this.isEditRow = null;
                this.$set(this, 'formData', ErdcKit.deepClone(this.defaultFormData));
                this.receiverUserInfo = [];
                this.receiverRoleInfo = [];
                this.otherMemberConfigList = {
                    receiverUserOid: '',
                    receiverRoleOid: ''
                };
                this.dialogVisible = true;
            },
            editRow(row, rowIndex) {
                this.isEditRow = rowIndex;
                this.$set(this, 'formData', ErdcKit.deepClone(this.tableData[rowIndex]));
                const {
                    msgNotifyRefList,
                    msgNotifyAfterRefList,
                    receiverUserOid = [],
                    receiverUserInfo = [],
                    receiverRoleOid = [],
                    receiverRoleInfo = []
                } = this.formData;
                this.msgNotifyRefList = !_.isEmpty(msgNotifyRefList) ? msgNotifyRefList : [];
                this.msgNotifyAfterRefList = !_.isEmpty(msgNotifyAfterRefList) ? msgNotifyAfterRefList : [];
                this.receiverUserInfo = receiverUserInfo;
                this.receiverRoleInfo = receiverRoleInfo;
                this.otherMemberConfigList = {
                    receiverUserOid: !!receiverUserOid.length,
                    receiverRoleOid: !!receiverRoleOid.length
                };
                this.dialogVisible = true;
            },
            deleteRow(row, rowIndex) {
                this.$confirm(this.i18n.deleteConfirm, this.i18n.alert).then(() => {
                    this.tableData.splice(rowIndex, 1);
                });
                this.updateTemplate('globalDueDateConfig', 'dueDateConfig', this.tableData);
            },
            submit() {
                const data = ErdcKit.deepClone(this.formData);
                data.receiverUserOid = this.otherMemberConfigList.receiverUserOid ? data.receiverUserOid : [];
                data.receiverUserInfo = this.otherMemberConfigList.receiverUserOid ? this.receiverUserInfo : [];
                data.receiverRoleOid = this.otherMemberConfigList.receiverRoleOid ? data.receiverRoleOid : [];
                data.receiverRoleInfo = this.otherMemberConfigList.receiverRoleOid ? this.receiverRoleInfo : [];
                data.notifyTypeInfo = _.find(this.notifyTypeList, { code: this.formData.notifyType });
                data.sendTypeInfo = _.filter(this.sendTypeList, (item) =>
                    _.includes(this.formData.sendType, item.code)
                );
                data.msgNotifyRefList = _.filter(this.msgNotifyRefList, { code: this.formData.msgNotifyRef });
                data.msgNotifyAfterRefList = _.filter(this.msgNotifyAfterRefList, {
                    code: this.formData.msgNotifyAfterRef
                });
                const tableData = ErdcKit.deepClone(this.tableData);
                if (this.isEditRow !== null) {
                    tableData[this.isEditRow] = data;
                } else {
                    tableData.push(data);
                }
                this.updateTemplate('globalDueDateConfig', 'dueDateConfig', tableData);
                this.dialogVisible = false;
            }
        },
        directives: {
            'select-more': {
                inserted(el, binding) {
                    const $selectWrap = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');

                    el.bindingSelectMore = selectMore(binding.value);

                    $selectWrap?.addEventListener('scroll', el.bindingSelectMore);
                },
                unbind(el) {
                    const $selectWrap = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
                    $selectWrap?.removeEventListener('scroll', el.bindingSelectMore);
                }
            }
        }
    };
});
