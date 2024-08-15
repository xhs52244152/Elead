define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedDateConfigure/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/components/AdvancedDateConfigure/style.css'),
    'erdcloud.kit',
    'underscore'
], function(PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'AdvancedDateConfigure',
        template,
        mixins: [PropertiesPanelMixin],
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/components/AdvancedDateConfigure/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'dateConfigure', 'setDueTime', 'setFixTime', 'setNotifier', 'notifyParticipants', 'notifyInitiator',
                    'notifyRoles', 'notifyUsers', 'setNotifyTime', 'setNotifyDate', 'day', 'hour', 'beforeDueDate',
                    'afterDueDate', 'notifyTemplate', 'notifySendType', 'before', 'after', 'dueDate', 'sendReminder'
                ]),
                expanded: true,
                defaultFormData: {
                    fixTime: 30,
                    participant: 'true',
                    starter: 'false',
                    role: 'false',
                    user: 'false',
                    receiverRoleOid: [],
                    receiverUserOid: [],
                    beforeTime: {
                        day: 15,
                        hour: 0
                    },
                    afterTime: {
                        day: 0,
                        hour: 0
                    },
                    msgNotifyRef: '',
                    msgNotifyAfterRef: '',
                    sendType: []
                },
                memberConfig: ['PARTICIPANT', 'STARTER', 'ROLE', 'USER'],
                fixTimeList: [
                    { label: '无', value: '无' },
                    { label: '7', value: '7' },
                    { label: '10', value: '10' },
                    { label: '14', value: '14' },
                    { label: '30', value: '30' },
                ],
                roleList: [],
                userList: [],
                sendTypeList: [],
                templateList: [],
                pageIndex: 1,
                searchKey: ''
            }
        },
        computed: {
            formData: {
                get() {
                    return this.formatEchoData();
                }
            }
        },
        watch: {
            activeElement: {
                immediate: true,
                handler() {
                    // 下拉框数据回显
                    this.roleList = [];
                    this.userList = [];
                    _.each(this.template.userRoleMap, (value, key) => {
                        if(/Role/i.test(key)) {
                            this.roleList.push(value);
                        }
                        if(/User/i.test(key)) {
                            this.userList.push(value);
                        }
                    });
                }
            }
        },
        mounted() {
            this.getSendTypeList();
        },
        methods: {
            formatEchoData() {
                let data = this.isGlobalConfiguration ? this.template.globalDueDateConfig?.[0] : this.nodeInfo.dueDateConfig?.[0];
                if (!data) return this.defaultFormData;
                this.templateList = _.map(this.template?.msgNotifyMap, item => {
                    item.formatAttrRawList = item.formatAttrRawList || {};
                    item.formatAttrRawList.title = item.title
                    return item;
                });
                return {
                    fixTime: data.fixTime,
                    ...this.memberConfig.reduce((formData, member) => {
                        const key = member.toLowerCase();
                        formData[key] = data[key] || (_.includes(data.memberConfig, member) ? 'true' : 'false');
                        return formData;
                    }, {}),
                    receiverRoleOid: data.receiverRoleOid,
                    receiverUserOid: data.receiverUserOid,
                    beforeTime: { day: +data.beforeTime, hour: +data.beforeSendTime },
                    afterTime: { day: +data.afterTime, hour: +data.afterSendTime },
                    msgNotifyRef: data.msgNotifyRef,
                    msgNotifyAfterRef: data.msgNotifyAfterRef,
                    sendType: data.sendType
                };
            },
            saveDueDataConfig() {
                let data = ErdcKit.deepClone(this.formData);
                data.fixTime = /^(\u65e0|0|[1-9][0-9]*)$/.test('' + data.fixTime) ? data.fixTime : 30;
                data.memberConfig = this.memberConfig
                    .filter(property => data[property.toLowerCase()] === 'true')
                    .map(property => property.toUpperCase());
                delete data.participant;
                delete data.starter;
                delete data.role;
                delete data.user;
                data.beforeSendTime = data.beforeTime.hour;
                data.afterSendTime = data.afterTime.hour;
                data.beforeTime = data.beforeTime.day;
                data.afterTime = data.afterTime.day;
                // 下拉框数据储存
                _.each(_.filter(_.union(this.roleList, this.userList), item =>
                    (_.includes(data.receiverRoleOid, item.oid) || _.includes(data.receiverUserOid, item.oid)) &&
                    !_.includes(_.keys(this.template.userRoleMap))), item => {
                        this.template.userRoleMap = this.template.userRoleMap || {};
                        this.template.userRoleMap[item.oid] = item;
                    }
                );

                this.updateTemplate('globalDueDateConfig', 'dueDateConfig', [data]);
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
                    }).then(resp => {
                        _.each(resp?.data?.records, item => {
                            item.formatAttrRawList = this.formatAttrRawList(item.attrRawList);
                        })
                        if (this.pageIndex === 1) {
                            this.templateList = resp?.data?.records || [];
                        } else {
                            this.templateList = _.union(this.templateList, resp?.data?.records || []);
                        }
                    }).catch(error => {
                        // this.$message.error(error.message);
                    });
                } else {
                    this.pageIndex = 1;
                    this.searchKey = '';
                }
            },
            msgNotifyRefChange() {
                if (!this.formData.msgNotifyRef && !this.formData.msgNotifyAfterRef) {
                    this.formData.sendType = [];
                }
                this.saveDueDataConfig();
            },
            getSendTypeList() {
                const data = new FormData();
                data.append('realType', this.$store.getters.className('notifySendType'));
                this.$famHttp({
                    url: `/fam/enumDataList`,
                    method: 'POST',
                    data
                }).then(resp => {
                    this.sendTypeList = resp?.data || [];
                }).catch(error => {
                    // this.$message.error(error.message);
                });
            },
            getRolesList(visible) {
                if (visible) {
                    this.roleList = [];
                    this.$famHttp.get('/fam/role/list',{
                        params: {
                            appName: this.template.appName,
                            isGetVirtualRole: true
                        }
                    }).then(resp => {
                        this.roleList = resp?.data || [];
                    });
                }
            },
            getUsersList(value) {
                if (value) {
                    this.userList = [];
                    this.$famHttp({
                        url: '/fam/user/list',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify({
                            isGetDisable: false,
                            size: 20,
                            keywords: value
                        })
                    }).then(resp => {
                        this.userList = resp?.data?.userInfoList || [];
                    });
                }
            }
        },
        directives: {
            'select-more': {
                bind(el, binding) {
                    const SELECT_WRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
                    SELECT_WRAP_DOM.addEventListener('scroll', function () {
                        const CONDITION = this.scrollHeight - this.scrollTop <= this.clientHeight
                        if (CONDITION) {
                            binding.value()
                        }
                    })
                }
            }
        }
    };
})
