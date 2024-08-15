define([
    'text!' + ELMP.resource('erdc-process-components/BpmParticipantChange/index.html'),
    ELMP.resource('erdc-process-components/BpmParticipantConfiguration/participantConfigMixin.js')
], function (template, participantConfigMixin) {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'BpmParticipantChange',
        template,
        components: {
            BpmAvatar: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmAvatar/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        mixins: [participantConfigMixin],
        props: {
            processInstanceOid: String,
            handlerData: {
                type: Object,
                default() {
                    return {};
                }
            },
            userStatus: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                participantConfiguration: [],
                formData: {
                    remark: ''
                },
                // 无需审批人配置
                skipApproverConfiguration: true
            };
        },
        computed: {
            column() {
                const _this = this;
                return [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'isRequired',
                        title: this.i18n.isRequired, // 是否必须
                        width: '80',
                        props: {
                            formatter: ({ row }) => {
                                return row.isRequired ? _this.i18n.yes : _this.i18n.no;
                            }
                        }
                    },
                    {
                        prop: 'parentId',
                        title: this.i18n.participant, // 参与者
                        width: '160',
                        props: {
                            formatter: ({ row }) => {
                                const { displayName, label } = row?.parentIdList?.[0] || {};
                                return displayName || label || '--';
                            },
                            params: {
                                multiple: false,
                                disabled: true,
                                placeholder: this.i18n.pleaseSelectParticipant // 请选择参与者
                            }
                        }
                    },
                    {
                        prop: 'participantRef',
                        title: this.i18n.handler, // 处理人
                        minWidth: '300',
                        props: {
                            formatter: ({ row }) => {
                                const { participantRef, participantRefList } = row;
                                const participant = _.isString(participantRef) ? [participantRef] : participantRef;
                                let echo = [];
                                _.each(participant, (oid) => {
                                    const { displayName, label, code } = _.find(participantRefList, { oid: oid }) || {};
                                    echo.push(`${displayName || label || oid}` + (code ? ` (${code})` : ''));
                                });
                                return echo.join() || '--';
                            },
                            params: {
                                disabled: ({ row }) => row.memberType === 'OPERATOR',
                                multiple: ({ row }) => row.memberType !== 'OPERATOR',
                                isFetchValue: true,
                                filterSecurityLabel: this.isSecret,
                                securityLabel: this.securityLabel,
                                showType: ['USER'],
                                queryMode: ['FUZZYSEARCH'],
                                queryScope: 'fullTenant',
                                queryParams: ({ row }) => _this.queryParams('countersign', row)
                            }
                        }
                    }
                ];
            },
            formConfig() {
                return [
                    {
                        field: 'remark',
                        component: 'erd-input',
                        label: this.i18n.remark,
                        required: true,
                        props: {
                            type: 'textarea',
                            rows: 3,
                            clearable: true,
                            maxlength: 500,
                            'show-word-limit': true,
                            placeholder: this.i18n.pleaseEnterSignRemark
                        },
                        col: 24
                    }
                ];
            }
        },
        watch: {
            innerHandlerConf: {
                handler(val) {
                    const data = ErdcKit.deepClone(val);
                    const otherData = _.filter(data, (row) => row.memberType !== 'USER');
                    let userDataT = _.filter(data, { memberType: 'USER', isRequired: true });
                    let userDataF = _.filter(data, { memberType: 'USER', isRequired: false });
                    userDataT = this.mergeAttrArrays(userDataT, ['participantRef', 'participantRefList']);
                    userDataF = this.mergeAttrArrays(userDataF, ['participantRef', 'participantRefList']);
                    if (this.handlerData.addSignFlag) {
                        if (!userDataT.length) {
                            userDataT.push({
                                notValid: true,
                                isRequired: true,
                                nodeKey: this.activityId,
                                memberType: 'USER',
                                parentId: '-2',
                                parentIdList: [
                                    {
                                        label: this.i18n.user, // 用户
                                        value: '-2',
                                        disabled: false
                                    }
                                ],
                                participantRef: [],
                                participantRefList: []
                            });
                        }
                        if (!userDataF.length) {
                            userDataF.push({
                                notValid: true,
                                isRequired: false,
                                nodeKey: this.activityId,
                                memberType: 'USER',
                                parentId: '-2',
                                parentIdList: [
                                    {
                                        label: this.i18n.user, // 用户
                                        value: '-2',
                                        disabled: false
                                    }
                                ],
                                participantRef: [],
                                participantRefList: []
                            });
                        }
                    }

                    const innerParticipant = _.union(otherData, userDataT, userDataF);
                    _.each(innerParticipant, (item) => {
                        const { participantRef, participantRefList, memberType, isRequired } = item;
                        if (memberType === 'USER' && isRequired) {
                            item.participantRef = [];
                        } else if (memberType !== 'OPERATOR') {
                            item.participantRef = _.filter(participantRef, oid => this.userStatus[oid]);
                        }
                        item.participantRefList = _.filter(participantRefList, user => _.includes(item.participantRef, user.oid));
                        item.participantRefListRead = _.filter(participantRefList, user => !_.includes(item.participantRef, user.oid));
                    });

                    this.participantConfiguration = innerParticipant;
                }
            }
        },
        methods: {
            mergeAttrArrays(arr = [], attrs = []) {
                const mergeAttrs = _.reduce(
                    attrs,
                    (obj, item) => {
                        obj[item] = [];
                        return obj;
                    },
                    {}
                );
                _.each(arr, (item) => {
                    _.each(attrs, (key) => {
                        mergeAttrs[key] = mergeAttrs[key].concat(item[key] || []);
                    });
                });
                return arr?.length
                    ? [
                          {
                              ...arr[0],
                              ...mergeAttrs
                          }
                      ]
                    : [];
            },
            getPropsProperty({ row, column }) {
                let props = {};
                _.each(column.params, (value, key) => {
                    props[key] = _.isFunction(value) ? value({ row, column }) : value;
                });
                return props;
            },
            optionsChange(val, data, scope) {
                this.$emit('options-change', val, data, scope);
            },
            // 修改处理人接口
            changeParticipantApi(data) {
                return this.$famHttp({
                    url: '/bpm/procinst/changeInstanceCandidateUser',
                    data,
                    method: 'POST'
                });
            },
            // 自定义接口
            queryParams(optType, { memberType, parentId }) {
                const mapper = {
                    ROLE: 'roleId',
                    GROUP: 'groupId',
                    ORG: 'orgId'
                };
                let otherData = {};
                if (mapper[memberType]) {
                    otherData = {
                        [mapper[memberType]]: parentId
                    };
                }
                return {
                    url: '/bpm/workitem/users',
                    method: 'GET',
                    data: {
                        processInstanceOid: this.processInstanceOid,
                        taskDefKey: this.activityId,
                        optType,
                        containerOid: optType === 'countersign' ? this.containerRef : '',
                        teamOrignType: 'erd.cloud.bpm.task.business.impl.WorkitemBizServiceImpl',
                        ...otherData
                    }
                };
            },
            validate() {
                let valid = true;
                const message = [];
                _.each(this.participantConfiguration, (row) => {
                    const { isRequired, participantRef, participantRefListRead, parentIdList, notValid } = row;
                    const memberId = _.chain(participantRefListRead).map('oid').union(participantRef).value();
                    if (isRequired && _.isEmpty(memberId) && !notValid) {
                        valid = false;
                        message.push(parentIdList[0]?.displayName || parentIdList[0]?.label);
                    }
                });
                return new Promise((resolve) => {
                    this.$refs.famDynamicForm.submit().then(() => {
                        resolve({
                            valid,
                            data: this.getData(),
                            message: `${message.join()}${this.i18n.isRequiredParticipant}`
                        });
                    });
                });
            },
            getData() {
                const participantData = _.reduce(
                    this.participantConfiguration,
                    (prev, row) => {
                        const {
                            memberType,
                            participantRef,
                            participantRefListRead,
                            parentId,
                            nodeKey,
                            participantFrom,
                            isRequired,
                            notValid
                        } = row;
                        let memberId = _.isString(participantRef) ? participantRef.split(',') : participantRef;
                        memberId = _.chain(participantRefListRead).map('oid').union(memberId).value();
                        if (memberId.length || !notValid) {
                            prev.push({
                                isRequired,
                                memberType,
                                memberId,
                                parentId,
                                actDefId: nodeKey,
                                participantFrom: participantFrom || undefined
                            });
                        }
                        return prev;
                    },
                    []
                );

                return {
                    memberList: participantData,
                    remark: this.formData.remark || ''
                };
            }
        }
    };
});
