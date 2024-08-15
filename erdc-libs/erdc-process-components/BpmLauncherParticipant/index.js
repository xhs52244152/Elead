define([
    ELMP.resource('erdc-process-components/BpmParticipantConfiguration/participantConfigMixin.js'),
    'text!' + ELMP.resource('erdc-process-components/BpmLauncherParticipant/index.html'),
], function (participantConfigMixin, template) {
    return {
        name: 'BpmLauncherParticipant', // BpmProcessApprove
        template,
        mixins: [participantConfigMixin],
        props: {
            startActivity: {
                type: Array,
                default() {
                    return [];
                }
            }
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
                        prop: 'nodeName',
                        title: this.i18n.nodeName, // 节点名称
                        width: '200'
                    },
                    {
                        prop: 'parentId',
                        title: this.i18n.participant, // 参与者
                        width: '200',
                        minWidth: '200',
                        props: {
                            formatter: ({ row, column, cellValue }) => {
                                cellValue && ({ label: cellValue } = _.find(row.parentIdList, { value: cellValue }) || {});
                                return cellValue || '-';
                            },
                            params: {
                                multiple: false,
                                filterable: false,
                                clearable: false,
                                'collapse-tags': false,
                                'remote-method': () => { },
                                'remote': false,
                                disabled: true,
                                prefix: false,
                                placeholder: this.i18n.pleaseSelectParticipant // 请选择参与者
                            }
                        }
                    },
                    {
                        prop: 'participantRef',
                        title: this.i18n.handler, // 处理人
                        minWidth: '300',
                        props: {
                            formatter: ({ row, cellValue }) => {
                                let arr = [];
                                _.isString(cellValue) && (cellValue = [cellValue]);
                                _.each(cellValue, cellValue => {
                                    const target = _.find(row.participantRefList, { oid: cellValue }) || {};
                                    arr.push(target.code ? `${target.displayName} ${target.code}` : `${target.displayName}`);
                                })
                                cellValue = _.compact(arr).join('，');
                                if (row.memberType === 'ROLE') {
                                    return `${this.userRoleMap[row.participantFrom]?.displayName || '--'}（${cellValue || '--'}）`;
                                }
                                return cellValue || '--';
                            },
                            params: {
                                disabled: ({ row }) => {
                                    const target = _.find(_this.approverConfiguration?.nodeRoleAclDtoList, item => item.configRoleRef === row.parentId);
                                    return !target?.isAdd && !target?.isDelete;
                                },
                                multiple: ({ row }) => !_.includes(['USER', 'OPERATOR'], row.memberType),
                                placeholder: this.i18n.pleaseSelectHandler, // 请选择处理人
                                isFetchValue: () => true,
                                filterSecurityLabel: this.isSecret,
                                securityLabel: this.securityLabel,
                                showType: ['USER'],
                                queryMode: ({ row }) => {
                                    const { memberType, participantFrom } = row;
                                    if (_.includes(['ORG', 'GROUP'], memberType) ||
                                        (memberType === 'ROLE' && participantFrom === 'SYSTEM')
                                    ) {
                                        return ['FUZZYSEARCH'];
                                    }
                                    return undefined;
                                },
                                queryScope: ({ row }) => {
                                    const { memberType, participantFrom } = row;
                                    if (memberType === 'ROLE' && participantFrom !== 'SYSTEM') {
                                        return participantFrom === 'TEAM_MEMBER' ? 'team' : 'teamRole';
                                    }
                                    return 'fullTenant';
                                },
                                queryParams: ({ row }) => {
                                    const { memberType, parentId, participantFrom } = row;
                                    const _queryParams = {
                                        ROLE: {
                                            SYSTEM: {},
                                            OTHER: {
                                                containerOid: this.containerRef,
                                                isQueryGroupUser: false,
                                                isQueryChildRole: true,
                                                teamOrignType: 'erd.cloud.foundation.core.container.business.impl.ScalableContainerBizServiceImpl',
                                                roleOid: _.includes(['SYSTEM', 'TEAM_MEMBER'], participantFrom) ? '' : participantFrom
                                            }
                                        },
                                        GROUP: {
                                            orgId: '',
                                            groupIds: [parentId]
                                        },
                                        ORG: {
                                            orgId: parentId,
                                            groupIds: []
                                        }
                                    }
                                    let queryParams;
                                    if (memberType === 'ROLE') {
                                        queryParams = _queryParams[memberType][participantFrom] || _queryParams[memberType].OTHER
                                    } else {
                                        queryParams = _queryParams[memberType]
                                    }
                                    return {
                                        data: queryParams
                                    };
                                }
                            }
                        }
                    }
                ]
            }
        },
        methods: {
            validate() {
                return new Promise(resolve => {
                    let valid = true;
                    let errorNode = [];
                    const resultData = _.filter(this.resultHandlerConf, node => _.includes(this.startActivity, node.nodeKey));
                    _.each(resultData, node => {
                        for (let i = 0; i < node.tableData?.length; i++) {
                            const { isRequired, participantRef } = node.tableData[i];
                            if (isRequired && _.isEmpty(participantRef)) {
                                errorNode.push(node.nodeName + this.i18n.node);
                                valid = false;
                                break;
                            }
                        }
                    });
                    resolve({
                        valid,
                        data: this.getData(),
                        message: `${errorNode.join('、')}，${this.i18n.notObtainApprovePersonnel}`
                    });
                })
            },
            getData() {
                let tableData = [];
                _.each(this.resultHandlerConf, item => {
                    _.each(item.tableData, row => {
                        const { memberType, participantRef, parentId, nodeKey, participantFrom, isRequired } = row;
                        tableData.push({
                            memberType: memberType,
                            memberId: _.isString(participantRef) ? participantRef.split(',') : participantRef,
                            parentId: parentId,
                            actDefId: nodeKey,
                            participantFrom: participantFrom || undefined,
                            isRequired: isRequired
                        })
                    });
                });
                return JSON.stringify(tableData);
            }
        }
    }
});
