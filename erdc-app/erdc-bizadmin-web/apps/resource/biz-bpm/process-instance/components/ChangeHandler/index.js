define([
    'text!' + ELMP.resource('biz-bpm/process-instance/components/ChangeHandler/index.html'),
    ELMP.resource('erdc-process-components/BpmParticipantConfiguration/participantConfigMixin.js'),
    'css!' + ELMP.resource('biz-bpm/process-instance/components/ChangeHandler/index.css')
], function (template, participantConfigMixin) {
    return {
        name: 'ChangeHandler',
        template,
        mixins: [participantConfigMixin],
        data() {
            return {
                // 无需审批人配置
                skipApproverConfiguration: true
            };
        },
        computed: {
            // 列
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
                                _.each(participant, oid => {
                                    const { displayName, label, code } = _.find(participantRefList, { oid: oid }) || {};
                                    echo.push(`${displayName || label || oid}` + (code ? ` (${code})` : ''));
                                })
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
                                // queryParams: ({ row }) => _this.queryParams('countersign', row)
                            }
                        }
                    }
                ];
            }
        },
        methods: {
            validate() {
                return new Promise((resolve) => {
                    resolve({
                        valid:  !_.find(this.innerHandlerConf, (item) => !item.participantRef?.length),
                        data: this.getData(),
                        message: this.i18n.pleaseSelectHandler
                    });
                });
            },
            getData() {
                let tableData = [];
                _.each(this.innerHandlerConf, (row) => {
                    const { memberType, participantRef, parentId, nodeKey, participantFrom, isRequired } = row;
                    tableData.push({
                        memberType: memberType,
                        memberId: _.isString(participantRef) ? participantRef.split(',') : participantRef,
                        parentId: parentId,
                        actDefId: nodeKey,
                        participantFrom: participantFrom || undefined,
                        isRequired
                    });
                });
                return tableData;
            }
        }
    };
});
