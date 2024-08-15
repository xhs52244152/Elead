define([
    'erdcloud.kit',
    'underscore'
], function() {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const lanMap = {
        'zh-CN': 'zh_cn',
        'en-US': 'en_us'
    };

    return {
        components: {
            BpmParticipantConfiguration: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmParticipantConfiguration/index.js'))
        },
        props: {
            // 处理人配置
            handlerConfiguration: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            // 审批人配置
            processRoleConfig: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 人员回显信息
            userRoleMap: {
                type: Object,
                default: function() {
                    return {};
                }
            },
            // 上下文
            containerRef: {
                type: String,
                default: ''
            },
            // 评审对象团队成员
            holderRef: {
                type: String,
                default: ''
            },
            // 流程标识
            processDefinitionKey: {
                type: String,
                default: ''
            },
            // 节点标识
            activityId: {
                type: String,
                default: ''
            },
            // 当前流程状态： 发起：launcher、草稿：draft、处理：activator
            processStatus: {
                type: String,
                default: ''
            },
            // 只读状态
            readOnly: {
                type: Boolean,
                default: false
            },
            // 是否密级
            isSecret: {
                type: Boolean,
                default: false
            },
            securityLabel: {
                type: String,
                default: undefined
            }
        },
        data() {
            return {
                // 参与者数据
                handlerConf: [],
                innerHandlerConf: [],
                // 角色错误提示
                roleErrorMessage: [],
                // 参与者列表
                participantInfo: {},
                // 处理人列表
                participantRefInfo: {}
            };
        },
        computed: {
            // 参与者类型列表
            participantTypeList() {
                return [
                    {
                        label: this.i18n.user, // 用户
                        value: 'USER',
                        disabled: false
                    },
                    {
                        label: this.i18n.org, // 组织
                        value: 'ORG',
                        disabled: false
                    },
                    {
                        label: this.i18n.role, // 角色
                        value: 'ROLE',
                        disabled: false
                    },
                    {
                        label: this.i18n.group, // 群组
                        value: 'GROUP',
                        disabled: false
                    },
                    {
                        label: this.i18n.operator, // 操作者
                        value: 'OPERATOR',
                        disabled: false
                    }
                ];
            },
            // 参与者操作者列表
            participantList() {
                return [
                    {
                        label: this.i18n.processInitiator, // 流程启动者
                        value: '-1',
                        disabled: false
                    }
                ];
            },
            // 参与者用户列表
            userList() {
                return [
                    {
                        label: this.i18n.user, // 用户
                        value: '-2',
                        disabled: false
                    }
                ];
            },
            // 流程启动者处理人列表
            processInitiatorList() {
                let lang = this.getCurrentLanguage(), user = this.$store.state.app.user || {}, label = '';
                label = lang === 'zh_cn' ? user?.displayNameCn : lang === 'en_us' ? user?.displayNameEn : user?.displayName || '';
                return [
                    {
                        label,
                        value: this.$store.state.app.user.oid,
                        disabled: false
                    }
                ];
            },
            // 审批人配置
            approverConfiguration() {
                return this.processRoleConfig?.[0] || {};
            },
            // 最终审批人
            resultHandlerConf() {
                const handlerConf = ErdcKit.deepClone(this.handlerConf);
                _.each(handlerConf, node => {
                    const target = _.filter(this.innerHandlerConf, i =>
                        i.nodeKey === node.nodeKey && !_.includes(['OPERATOR', 'USER'], i.memberType));
                    if (target.length) {
                        _.each(node.tableData, row => {
                            const data = _.find(target, i => i.parentId === row.parentId);
                            if (data) {
                                row.participantRef = data.participantRef;
                                row.participantRefList = data.participantRefList;
                            }
                        });
                    }
                });
                return ErdcKit.deepClone(handlerConf);
            }
        },
        watch: {
            handlerConfiguration: {
                handler: function(val) {
                    if (val?.length) {
                        this.initParticipantConf(val);
                    }
                }
            }
        },
        created() {
            this.initParticipantConf(this.handlerConfiguration);
        },
        methods: {
            // 初始化参与者配置
            async initParticipantConf(handlerConf) {
                this.i18nMappingObj = await require('erdcloud.i18n').registerI18n({
                    i18nLocalePath: ELMP.resource('erdc-process-components/BpmParticipantConfiguration/locale/index.js')
                });
                for (let i = 0; i < handlerConf.length; i++) {
                    handlerConf[i].isFormat = handlerConf[i].isFormat || false;
                    for (let j = 0; j < handlerConf[i].tableData?.length; j++) {
                        let tableData = handlerConf[i].tableData[j];
                        if (!handlerConf[i].isFormat) {
                            handlerConf[i].tableData[j] = await this.newParticipant(tableData, handlerConf[i]);
                        }
                    }
                    handlerConf[i].isFormat = true;
                }
                this.handlerConf = ErdcKit.deepClone(handlerConf);

                let deepHandlerConf = ErdcKit.deepClone(handlerConf);
                const customData = this.$store.getters['bpmProcessPanel/getResource'](
                    'afterEcho',
                    {
                        processDefinitionKey: this.processDefinitionKey,
                        activityId: this.activityId
                    }
                );
                const { processStatus } = this;
                if (_.isFunction(customData?.[processStatus]?.handlerConf)) {
                    deepHandlerConf = await customData[processStatus].handlerConf(deepHandlerConf);
                }

                const { nodeRoleAclDtoList = [] } = this.approverConfiguration || {};
                if (!this.skipApproverConfiguration) {
                    this.validateMessage(deepHandlerConf);
                    _.each(deepHandlerConf, node => {
                        node.tableData = _.filter(node.tableData, row => {
                            const target = _.find(nodeRoleAclDtoList, config => {
                                const participantRef = _.isArray(row.participantRef) ? row.participantRef : [row.participantRef];
                                return _.includes([row.parentId, ...participantRef], config.configRoleRef);
                            });
                            const { isView = false, isAdd = false } = target || {};
                            return isView || isAdd;
                        });
                    });
                }

                this.innerHandlerConf = _.reduce(deepHandlerConf, (prev, item) => {
                    _.each(item.tableData, row => {
                        const { isFormat, nodeKey, nodeName, nodeType } = item;
                        prev.push({ isFormat, nodeKey, nodeName, nodeType, ...row });
                    });
                    return prev;
                }, []);
                this.$emit('show-handler-configuration', !!this.innerHandlerConf.length);
            },
            validateMessage(deepHandlerConf) {
                this.roleErrorMessage = [];
                _.each(deepHandlerConf, item => {
                    _.each(item.tableData, row => {
                        const { participantFrom, participantRef } = row;
                        if (participantFrom && !_.includes(['SYSTEM', 'TEAM_MEMBER'], participantFrom)) {
                            if (_.isEmpty(participantRef)) {
                                this.roleErrorMessage.push({
                                    node: item.nodeName + this.i18n.node,
                                    role: this.userRoleMap[participantFrom]?.displayName + this.i18n.role
                                });
                            }
                        }
                    });
                });
                if (this.roleErrorMessage.length) {
                    this.$message.error(`${_.map(this.roleErrorMessage, 'node').join(', ')}${this.i18n.handler}“${_.map(this.roleErrorMessage, 'role').join(', ')}”${this.i18n.notObtainApprovePersonnel}`);
                }
            },
            // 新增一条参与者
            async newParticipant(item = {}, data = {}) {
                let obj = {
                    isRequired: _.isBoolean(item.isRequired) ? item.isRequired : item.isRequired === 'true',
                    nodeKey: item.nodeKey || item.actDefId || '',
                    memberType: item.memberType || '',
                    memberTypeList: this.participantTypeList,
                    participantFrom: item.participantFrom || '',
                    params: item.params
                };

                obj.parentId = item.parentId || (item.memberType === 'OPERATOR' ? '-1' : item.memberType === 'USER' ? '-2' : item.participantRef);
                obj.parentIdList = this.echoParentIdList({ memberType: obj.memberType, parentId: obj.parentId });

                const echoParticipant = await this.echoParticipantRef(item);
                obj = Object.assign(obj, echoParticipant);

                return obj;
            },
            // 参与者列表
            echoParentIdList({ memberType, parentId }) {
                if (_.includes(['OPERATOR', 'USER'], memberType)) {
                    return memberType === 'USER' ? this.userList : this.participantList;
                }
                if (parentId) {
                    const userInfo = this.userRoleMap[parentId] || {};
                    const { oid, displayName, disabled = false } = userInfo;
                    return [{
                        ...userInfo,
                        label: displayName || parentId,
                        value: oid || parentId,
                        disabled: disabled
                    }];
                }
                return [];
            },
            // 处理人回显
            async echoParticipantRef(item) {
                let participantRef = [];
                let participantRefList = [];
                if (item.memberId && item.memberId.length) {
                    participantRef = item.memberId;
                    participantRefList = this.editDropDownOutput(participantRef);
                } else {
                    switch (item.memberType) {
                        case 'OPERATOR':
                            const userInfo = this.$store.state.app.user;
                            const { oid, displayName, disabled = false } = userInfo;
                            participantRef = oid;
                            participantRefList = [{
                                ...userInfo,
                                displayName: displayName || oid,
                                disabled: disabled
                            }];
                            break;
                        case 'USER':
                            participantRef = item.participantRef;
                            participantRefList = this.editDropDownOutput(participantRef);
                            break;
                        case 'ROLE':
                            if (item.participantFrom && !_.includes(['SYSTEM', 'TEAM_MEMBER'], item.participantFrom)) {
                                participantRefList = await this.getRoleTeamMembers('', item.participantFrom);
                                participantRef = _.map(participantRefList, 'oid');
                            }
                            break;
                        default:
                            participantRef = [];
                            participantRefList = [];
                    }
                }

                return {
                    participantRef,
                    participantRefList
                };
            },
            // 编辑下拉项回显
            editDropDownOutput(participantRef) {
                if (_.isEmpty(participantRef)) {
                    return [];
                }
                if (_.isString(participantRef)) {
                    participantRef = [participantRef];
                }
                let participantRefList = [];
                _.each(participantRef, item => {
                    const userInfo = this.userRoleMap[item] || {};
                    const { oid, displayName, disabled = false } = userInfo;
                    participantRefList.push({
                        ...userInfo,
                        displayName: displayName || item,
                        oid: oid || item,
                        disabled: disabled
                    });
                });
                return participantRefList;
            },
            // 获取团队角色人员
            getRoleTeamMembers(userSearchKey = '', roleOid = '', row = {}) {
                if (_.isEmpty(this.containerRef)) {
                    return [];
                }
                const isTeamMember = roleOid === 'TEAM_MEMBER';
                const customTeamMember = this.$store.getters['bpmProcessPanel/getProcessRoleList']({
                    processDefinitionKey: this.processDefinitionKey,
                    activityId: row.nodeKey
                });
                if (isTeamMember && customTeamMember) {
                    return new Promise(resolve => {
                        customTeamMember(row).then(data => {
                            resolve(data);
                        }).catch(() => {
                            resolve([]);
                        });
                    });
                }
                return new Promise(resolve => {
                    this.$famHttp({
                        url: '/fam/team/getUsersByContainer',
                        method: 'GET',
                        data: {
                            containerOid: this.containerRef,
                            getAllUser: true,
                            roleOid: isTeamMember ? '' : roleOid,
                            userSearchKey
                        }
                    }).then(resp => {
                        resolve(resp.data || []);
                    }).catch(() => {
                        resolve([]);
                    });
                });
            },
            // 下拉框选中值变化
            optionsChange(val, data, { row, column }) {
                if (column.field === 'memberType') {
                    row.parentId = val === 'OPERATOR' ? '-1' : val === 'USER' ? '-2' : '';
                }
                if (column.field !== 'participantRef') {
                    row.participantRef = row.memberType === 'OPERATOR' ? this.$store.state.app.user.oid : row.memberType === 'USER' ? '' : [];
                }
                this.$forceUpdate();
            },
            // 获取当前语言
            getCurrentLanguage() {
                let lang = localStorage.getItem('lang_current') ?? '';
                lang = lang ? lanMap[lang] ?? lang : 'zh_cn';
                return lang;
            }
        }
    };
});
