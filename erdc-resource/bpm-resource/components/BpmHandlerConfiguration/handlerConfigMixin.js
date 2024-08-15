define(['erdcloud.kit', 'underscore'], function () {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const lanMap = {
        'zh-CN': 'zh_cn',
        'en-US': 'en_us'
    };

    return {
        components: {
            BpmHandlerConfiguration: ErdcKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmHandlerConfiguration/index.js')
            )
        },
        props: {
            // 处理人配置
            handlerConfiguration: {
                type: Array,
                default: function () {
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
                default: function () {
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
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmHandlerConfiguration/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    '参与者类型',
                    '参与者',
                    '处理人',
                    '请选择参与者类型',
                    '请选择参与者',
                    '请选择处理人',
                    '用户',
                    '组织',
                    '角色',
                    '群组',
                    '操作者',
                    '节点',
                    '流程启动者',
                    '处理人配置不合法',
                    '未获取到上下文信息',
                    '未获取审批人员',
                    '角色无法获取人员'
                ]),
                // 参与者数据
                handlerConf: [],
                innerHandlerConf: [],
                // 上下文错误提示
                containerRefEmpty: [],
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
                        label: this.i18nMappingObj['用户'],
                        value: 'USER',
                        disabled: false
                    },
                    {
                        label: this.i18nMappingObj['组织'],
                        value: 'ORG',
                        disabled: false
                    },
                    {
                        label: this.i18nMappingObj['角色'],
                        value: 'ROLE',
                        disabled: false
                    },
                    {
                        label: this.i18nMappingObj['群组'],
                        value: 'GROUP',
                        disabled: false
                    },
                    {
                        label: this.i18nMappingObj['操作者'],
                        value: 'OPERATOR',
                        disabled: false
                    }
                ];
            },
            // 参与者用户列表
            userList() {
                return [
                    {
                        label: this.i18nMappingObj['用户'],
                        value: '-2',
                        disabled: false
                    }
                ];
            },
            // 参与者操作者列表
            participantList() {
                return [
                    {
                        label: this.i18nMappingObj['流程启动者'],
                        value: '-1',
                        disabled: false
                    }
                ];
            },
            // 流程启动者处理人列表
            processInitiatorList() {
                let lang = this.getCurrentLanguage(),
                    user = this.$store.state.app.user || {},
                    label = '';
                label =
                    lang === 'zh_cn'
                        ? user?.displayNameCn
                        : lang === 'en_us'
                          ? user?.displayNameEn
                          : user?.displayName || '';
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
                _.each(handlerConf, (node) => {
                    const target = _.find(this.innerHandlerConf, (i) => i.nodeKey === node.nodeKey);
                    if (target) {
                        _.each(node.tableData, (row) => {
                            const data = _.find(target.tableData, (i) => i.parentId === row.parentId);
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
                immediate: true,
                handler: function (val) {
                    if (val?.length) {
                        this.initParticipantConf(val);
                    }
                }
            }
        },
        methods: {
            // 初始化参与者配置
            async initParticipantConf(handlerConf) {
                this.containerRefEmpty = [];
                for (let i = 0; i < handlerConf.length; i++) {
                    handlerConf[i].isFormat = handlerConf[i].isFormat || false;
                    let error = false;
                    for (let j = 0; j < handlerConf[i].tableData.length; j++) {
                        let tableData = handlerConf[i].tableData[j];
                        if (!handlerConf[i].isFormat) {
                            handlerConf[i].tableData[j] = await this.newParticipant(tableData, handlerConf[i]);
                        }
                        if (
                            !error &&
                            !this.containerRef &&
                            tableData.memberType === 'ROLE' &&
                            tableData.participantFrom &&
                            tableData.participantFrom !== 'SYSTEM'
                        ) {
                            this.containerRefEmpty.push(handlerConf[i].nodeName + this.i18nMappingObj['节点']);
                            error = true;
                        }
                    }
                    handlerConf[i].isFormat = true;
                }

                this.handlerConf = ErdcKit.deepClone(handlerConf);

                let deepHandlerConf = ErdcKit.deepClone(handlerConf);
                // 审批人配置
                const { nodeRoleAclDtoList = [] } = this.approverConfiguration || {};
                _.each(deepHandlerConf, (node) => {
                    node.tableData = _.filter(node.tableData, (row) => {
                        const target = _.find(nodeRoleAclDtoList, (config) => config.configRoleRef === row.parentId);
                        const { isView = false, isAdd = false, isDelete = false } = target || {};
                        return _.includes(['OPERATOR', 'USER'], row.memberType) || isView || isAdd || isDelete;
                    });
                });

                // 获取自定义数据
                const customData = this.$store.getters['bpmProcessPanel/getResource']('afterEcho', {
                    processDefinitionKey: this.processDefinitionKey,
                    activityId: this.activityId
                });
                const { processStatus } = this;
                if (_.isFunction(customData?.[processStatus]?.handlerConf)) {
                    deepHandlerConf = await customData[processStatus].handlerConf(deepHandlerConf);
                }

                this.innerHandlerConf = _.filter(deepHandlerConf, (item) => item.tableData.length);
                this.$emit('show-handler-configuration', !!this.innerHandlerConf.length);

                if (this.containerRefEmpty.length) {
                    this.$message.error(
                        `${this.i18nMappingObj['未获取到上下文信息']}, ${this.containerRefEmpty.join(', ')}${this.i18nMappingObj['角色无法获取人员']}`
                    );
                    return;
                }

                if (this.containerRef && this.roleErrorMessage.length) {
                    this.$message.error(
                        `${_.map(this.roleErrorMessage, 'node').join(', ')}${this.i18nMappingObj['处理人']}“${_.map(this.roleErrorMessage, 'role').join(', ')}”${this.i18nMappingObj['未获取审批人员']}`
                    );
                }
            },
            // 新增一条参与者
            async newParticipant(item = {}, data = {}) {
                let obj = {
                    isRequired: !!item.isRequired,
                    nodeKey: item.nodeKey || '',
                    memberType: item.memberType || '',
                    memberTypeList: this.participantTypeList,
                    participantFrom: item.participantFrom || '',
                    params: item.params
                };

                obj.parentId =
                    item.parentId ||
                    (item.memberType === 'OPERATOR' ? '-1' : item.memberType === 'USER' ? '-2' : item.participantRef);
                obj.parentIdList = this.echoParentIdList({ memberType: obj.memberType, parentId: obj.parentId });

                const echoParticipant = await this.echoParticipantRef(item, data);
                obj = Object.assign(obj, echoParticipant);

                return obj;
            },
            // 参与者列表
            echoParentIdList({ memberType, parentId }) {
                if (_.includes(['OPERATOR', 'USER'], memberType)) {
                    return memberType === 'USER' ? this.userList : this.participantList;
                }
                if (parentId) {
                    return [{ label: this.personnelEchoMatching(parentId) || '', value: parentId, disabled: false }];
                }
                return [];
            },
            // 处理人回显
            async echoParticipantRef(item, data) {
                let participantRef = [];
                let participantRefList = [];
                if (item.memberId && item.memberId.length) {
                    participantRef =
                        _.includes(['OPERATOR', 'USER'], item.memberType) && _.isArray(item.memberId)
                            ? item.memberId.join(',')
                            : item.memberId;
                    participantRefList = this.editDropDownOutput({
                        memberType: item.memberType,
                        participantRef: participantRef
                    });
                } else {
                    switch (item.memberType) {
                        case 'OPERATOR':
                            const userInfo = this.$store.state.app.user;
                            const { oid, displayName, disabled = false } = userInfo;
                            participantRef = oid;
                            participantRefList = [
                                {
                                    ...userInfo,
                                    label: displayName,
                                    value: oid,
                                    disabled: disabled
                                }
                            ];
                            break;
                        case 'USER':
                            participantRef = item.participantRef;
                            participantRefList = this.editDropDownOutput({
                                memberType: item.memberType,
                                participantRef: participantRef
                            });
                            break;
                        case 'ROLE':
                            this.roleErrorMessage = [];
                            if (item.participantFrom && !_.includes(['SYSTEM', 'TEAM_MEMBER'], item.participantFrom)) {
                                participantRefList = await this.getRoleTeamMembers('', item.participantFrom);
                                participantRef = _.map(participantRefList, 'value');
                                if (!participantRefList || !participantRefList.length) {
                                    this.roleErrorMessage.push({
                                        node: data.nodeName + this.i18nMappingObj['节点'],
                                        role:
                                            this.userRoleMap[item.participantFrom]?.value + this.i18nMappingObj['角色']
                                    });
                                }
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
            editDropDownOutput({ memberType, participantRef }) {
                if (!participantRef) {
                    return [];
                }
                if (_.includes(['OPERATOR', 'USER'], memberType)) {
                    return [
                        {
                            oid: participantRef,
                            displayName: participantRef,
                            disabled: false,
                            ...(this.userRoleMap[participantRef] || {})
                        }
                    ];
                } else if (_.isArray(participantRef) && participantRef.length) {
                    let participantRefList = [];
                    _.each(participantRef, (item) => {
                        participantRefList.push({
                            oid: item,
                            displayName: item,
                            disabled: false,
                            ...(this.userRoleMap[item] || {})
                        });
                    });
                    return participantRefList;
                }
                return [];
            },
            // 下拉框出现触发事件
            visibleChange(type, { row, column }) {
                // eslint-disable-next-line no-async-promise-executor
                return new Promise(async (resolve) => {
                    if (type) {
                        if (column.field === 'memberType') {
                            row[column.field + 'List'] = await this.initParticipantType({ row });
                        }
                        if (column.field === 'parentId') {
                            row[column.field + 'List'] = await this.initParticipant({ row, column });
                        }
                        if (column.field === 'participantRef') {
                            row[column.field + 'List'] = await this.initHandler({ row });
                        }
                    }
                    resolve();
                });
            },
            // 初始化处理人
            initHandler({ row }) {
                // eslint-disable-next-line no-async-promise-executor
                return new Promise(async (resolve) => {
                    let list = row.participantRefList || [];
                    const cache = `${row.nodeKey}-${row.parentId}`;
                    if (_.isArray(this.participantRefInfo[cache]) && this.participantRefInfo[cache].length) {
                        list = _.map(this.participantRefInfo[cache], (item) => _.extend({}, item));
                    } else {
                        if (row.memberType === 'ORG') {
                            list = await this.getOrgPersonnel(row.parentId);
                        } else if (row.memberType === 'GROUP') {
                            list = await this.getGroupMembers(row.parentId);
                        } else if (row.memberType === 'ROLE' && row.participantFrom === 'TEAM_MEMBER') {
                            list = await this.getRoleTeamMembers('', row.participantFrom, row);
                        } else if (row.memberType === 'OPERATOR') {
                            list = await this.getProcessInitiator();
                        }
                        this.$set(
                            this.participantRefInfo,
                            cache,
                            _.map(list, (item) => _.extend({}, item))
                        );
                    }
                    resolve(list);
                });
            },
            // 初始化参与者
            initParticipant({ row }) {
                // eslint-disable-next-line no-async-promise-executor
                return new Promise(async (resolve) => {
                    let list = [];
                    if (
                        _.isArray(this.participantInfo[row['memberType']]) &&
                        this.participantInfo[row['memberType']].length
                    ) {
                        list = _.map(this.participantInfo[row['memberType']], (item) => _.extend({}, item));
                    } else {
                        if (row['memberType'] === 'USER') {
                            list = await this.getUserList();
                        }
                        if (row['memberType'] === 'OPERATOR') {
                            list = await this.getParticipantList();
                        }
                        if (row['memberType'] === 'ORG') {
                            list = await this.getOrganizationList();
                        }
                        if (row['memberType'] === 'GROUP') {
                            list = await this.getGroupList();
                        }
                        if (row['memberType'] === 'ROLE') {
                            list = await this.getRoleList();
                        }
                        this.$set(
                            this.participantInfo,
                            row['memberType'],
                            _.map(list, (item) => _.extend({}, item))
                        );
                    }
                    resolve(list);
                });
            },
            // 初始化参与者类型
            initParticipantType({ row }) {
                return new Promise((resolve) => {
                    let list = this.getParticipantTypeList();
                    resolve(list);
                });
            },
            // 获取用户列表
            getUserList() {
                return new Promise((resolve) => {
                    let list = _.map(this.userList, (item) => _.extend({}, item));
                    resolve(list);
                });
            },
            // 获取参与者列表
            getParticipantList() {
                return new Promise((resolve) => {
                    let list = _.map(this.participantList, (item) => _.extend({}, item));
                    resolve(list);
                });
            },
            // 获取组织列表
            getOrganizationList() {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/listByParentKey',
                        method: 'GET',
                        params: {
                            className: 'erd.cloud.foundation.principal.entity.Organization'
                        }
                    })
                        .then((resp) => {
                            let { data = [] } = resp || {};
                            data = _.map(data, (item) => {
                                return {
                                    label: item?.displayName || '',
                                    value: item?.oid || '',
                                    disabled: false
                                };
                            });
                            resolve(data);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            },
            // 获取群组列表
            getGroupList() {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/group/list',
                        method: 'GET',
                        params: {
                            appName: 'plat',
                            isGetVirtualRole: true
                        }
                    })
                        .then((resp) => {
                            let { data = [] } = resp || {};
                            data = _.map(data, (item) => {
                                return {
                                    label: item?.displayName || '',
                                    value: item?.oid || '',
                                    disabled: false
                                };
                            });
                            resolve(data);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            },
            // 获取角色列表
            getRoleList() {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/role/list',
                        method: 'GET',
                        params: {
                            appName: 'plat',
                            isGetVirtualRole: true
                        }
                    })
                        .then((resp) => {
                            let { data = [] } = resp || {};
                            data = _.map(data, (item) => {
                                return {
                                    label: item?.displayName || '',
                                    value: item?.oid || '',
                                    disabled: false
                                };
                            });
                            resolve(data);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            },
            // 获取团队角色人员
            getRoleTeamMembers(userSearchKey = '', roleOid = '', row = {}) {
                if (!this.containerRef) {
                    return [];
                }
                const isTeamMember = roleOid === 'TEAM_MEMBER';
                const customTeamMember = this.$store.getters['bpmProcessPanel/getProcessRoleList']({
                    processDefinitionKey: this.processDefinitionKey,
                    activityId: row.nodeKey
                });
                if (isTeamMember && customTeamMember) {
                    return new Promise((resolve) => {
                        customTeamMember(row)
                            .then((data) => {
                                resolve(data);
                            })
                            .catch(() => {
                                resolve([]);
                            });
                    });
                }
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/team/getUsersByContainer',
                        method: 'GET',
                        data: {
                            containerOid: this.containerRef,
                            getAllUser: true,
                            roleOid: isTeamMember ? '' : roleOid,
                            userSearchKey
                        }
                    })
                        .then((resp) => {
                            let { data = [] } = resp || {};
                            data = _.map(data, (item) => {
                                return {
                                    label: item?.displayName || '',
                                    value: item?.oid || '',
                                    code: item?.code || '',
                                    disabled: false
                                };
                            });
                            resolve(data);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            },
            // 获取流程启动者
            getProcessInitiator() {
                return new Promise((resolve) => {
                    let list = _.map(this.processInitiatorList, (item) => _.extend({}, item));
                    resolve(list);
                });
            },
            // 获取用户
            getUser({ query }) {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/user/list',
                        data: JSON.stringify({
                            keywords: query,
                            isGetDisable: false,
                            size: 20
                        }),
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then((resp) => {
                            let { success, data = {} } = resp || {},
                                userInfoList = [];
                            if (success) {
                                ({ userInfoList = [] } = data || {});
                            }
                            userInfoList = _.map(userInfoList, (item) => {
                                return {
                                    label: item?.displayName || '',
                                    value: item?.oid || '',
                                    disabled: false
                                };
                            });
                            resolve(userInfoList);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            },
            // 获取群组人员
            getGroupMembers(roleAObjectOId) {
                let groupIds = roleAObjectOId.split(':') || [];
                groupIds.length ? (groupIds = [groupIds[groupIds.length - 1]]) : [];
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/user/page/byGroup',
                        data: {
                            groupIds,
                            current: 1,
                            size: 9999
                        },
                        method: 'POST'
                    })
                        .then((resp) => {
                            let { success, data = {} } = resp || {},
                                records = [];
                            if (success) {
                                ({ records } = data || {});
                                records = _.map(records, (item) => {
                                    return {
                                        label: item?.displayName || '',
                                        value: item?.oid || '',
                                        disabled: false
                                    };
                                });
                            }
                            resolve(records);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            },
            // 获取组织人员
            getOrgPersonnel(orgId) {
                orgId = orgId.slice(orgId.lastIndexOf(':') + 1, orgId.length);
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/user/page',
                        data: {
                            current: 1,
                            size: 9999,
                            orderBy: 'createTime',
                            orgId
                        },
                        method: 'POST'
                    })
                        .then((resp) => {
                            let { success, data = {} } = resp || {},
                                records = [];
                            if (success) {
                                ({ records } = data || {});
                                records = _.map(records, (item) => {
                                    return {
                                        label: item?.displayName || '',
                                        value: item?.oid || '',
                                        disabled: false
                                    };
                                });
                            }
                            resolve(records);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            },
            // 下拉框选中值变化
            optionsChange(val, data, { row, column }) {
                if (column.field === 'memberType') {
                    this.visibleChange(true, { row, column: { field: 'parentId' } });
                    row.parentId = val === 'OPERATOR' ? '-1' : val === 'USER' ? '-2' : '';
                }
                if (column.field !== 'participantRef') {
                    this.visibleChange(true, { row, column: { field: 'participantRef' } });
                    row.participantRef =
                        row.memberType === 'OPERATOR'
                            ? this.$store.state.app.user.oid
                            : row.memberType === 'USER'
                              ? ''
                              : [];
                }
                this.$forceUpdate();
            },
            // 人员回显匹配
            personnelEchoMatching(mapId) {
                let obj = this.userRoleMap[mapId] || {},
                    lang = this.getCurrentLanguage();
                if (!_.isEmpty(obj)) {
                    return obj[lang] || obj.value || obj.displayName || '';
                }
                return '';
            },
            // 获取当前语言
            getCurrentLanguage() {
                let lang = localStorage.getItem('lang_current') ?? '';
                lang = lang ? lanMap[lang] ?? lang : 'zh_cn';
                return lang;
            },
            // 批量配置默认选中全部人员
            async batchConfigDefaultSelect(batchConfigColumn, batchConfigTableData) {
                let column = _.find(batchConfigColumn, { prop: 'participantRef' }) || {};
                for (let i = 0; i < batchConfigTableData.length; i++) {
                    let row = batchConfigTableData[i] || {};
                    await this.visibleChange(true, { row, column: _.extend({ field: column.prop }, column) });
                    row.participantRef = _.map(row.participantRefList, (item) => item.value);
                }
            }
        }
    };
});
