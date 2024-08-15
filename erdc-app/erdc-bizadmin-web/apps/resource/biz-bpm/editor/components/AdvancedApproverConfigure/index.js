define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedApproverConfigure/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/components/AdvancedApproverConfigure/style.css'),
    'erdcloud.kit',
    'TreeUtil',
    'underscore'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    const TreeUtil = require('TreeUtil');
    const _ = require('underscore');

    return {
        name: 'AdvancedApproverConfigure',
        template,
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        mixins: [PropertiesPanelMixin],
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                dialogVisible: false,
                participantLeftList: [],
                participantRightList: [],
                processRoleConfig: [],
                configRoleRef: '',
                tableData: []
            };
        },
        computed: {
            isViewCheckAll: {
                get() {
                    return this.tableData.every((row) => row.isView);
                },
                set(checked) {
                    this.tableData.forEach((row) => (row.isView = checked));
                }
            },
            isViewIndeterminate() {
                return !this.isViewCheckAll && this.tableData.some((row) => row.isView);
            },
            isAddCheckAll: {
                get() {
                    return this.isAddReadonly
                        ? false
                        : this.tableData
                              .filter((row) => !['OPERATOR', 'USER'].includes(row.memberType))
                              .every((row) => row.isAdd);
                },
                set(checked) {
                    this.tableData
                        .filter((row) => !['OPERATOR', 'USER'].includes(row.memberType))
                        .forEach((row) => (row.isAdd = checked));
                }
            },
            isAddReadonly() {
                return this.readonly || this.tableData.every((row) => ['OPERATOR', 'USER'].includes(row.memberType));
            },
            isAddIndeterminate() {
                return (
                    !this.isAddCheckAll &&
                    this.tableData
                        .filter((row) => !['OPERATOR', 'USER'].includes(row.memberType))
                        .some((row) => row.isAdd)
                );
            },
            column() {
                return [
                    {
                        prop: 'configRoleName',
                        title: this.i18n.configurableParticipants
                    },
                    {
                        prop: 'isView',
                        title: this.i18n.view,
                        align: 'right',
                        width: '60px'
                    },
                    {
                        prop: 'isAdd',
                        title: this.i18n.edit,
                        align: 'right',
                        width: '60px',
                        props: {
                            params: {
                                disabled: ({ row }) => {
                                    return this.readonly || _.includes(['OPERATOR', 'USER'], row.memberType);
                                }
                            }
                        }
                    }
                ];
            },
            approverConfigureTips() {
                return this.isGlobalConfiguration
                    ? this.i18n.approverConfigureTips
                    : this.i18n.approverConfigureNodeTips;
            },
            // 参与者类型列表
            memberTypeList() {
                return [
                    {
                        name: this.i18n.user, // 用户
                        value: 'USER'
                    },
                    {
                        name: this.i18n.organization, // 组织
                        value: 'ORG'
                    },
                    {
                        name: this.i18n.group, // 群组
                        value: 'GROUP'
                    },
                    {
                        name: this.i18n.role, // 角色
                        value: 'ROLE'
                    },
                    {
                        name: this.i18n.operator, // 操作者
                        value: 'OPERATOR'
                    }
                ];
            }
        },
        watch: {
            tableData: {
                deep: true,
                handler(tableData) {
                    const target = _.find(this.processRoleConfig, (item) => item.participantRef === this.configRoleRef);
                    if (target) {
                        target.nodeRoleAclDtoList = tableData;
                    } else {
                        const data = _.find(
                            this.participantLeftList,
                            (item) => item.configRoleRef === this.configRoleRef
                        );
                        this.processRoleConfig.push({
                            nodeKey: this.nodeInfo?.nodeKey || '',
                            memberType: data?.memberType,
                            participantRef: data?.configRoleRef,
                            nodeRoleAclDtoList: tableData
                        });
                    }
                }
            }
        },
        methods: {
            configure() {
                this.participantLeftList = [];
                this.participantRightList = [];
                let globalPrincipalConfig = [];
                _.each(this.template.processActInstDefList, (node) => {
                    globalPrincipalConfig = [...globalPrincipalConfig, ...(node.localPrincipalConfig || [])];
                });
                globalPrincipalConfig = this.objectArrayRemoveDuplication(globalPrincipalConfig, 'participantRef');
                let principalConfig = this.nodeInfo?.localPrincipalConfig || [];
                let roleConfig = this.nodeInfo?.processRoleConfig || [];
                if (this.isGlobalConfiguration) {
                    principalConfig = [
                        {
                            memberType: 'OPERATOR',
                            participantRef: '-1'
                        }
                    ];
                    roleConfig = this.template.processRoleConfig || [];
                }
                this.participantLeftList = _.map(principalConfig, (item) => {
                    const participantRefList = TreeUtil.flattenTree2Array(item.participantRefList, {
                        childrenField: 'children'
                    });
                    const target = _.find(participantRefList, (it) => it.oid === item.participantRef) || {};

                    let displayName = target.displayName || item.participantName || item.participantRef;
                    let memberType = _.find(this.memberTypeList, (i) => i.value === item.memberType)?.name || '--';

                    if (item.participantRef === '-1') {
                        displayName = this.i18n.processInitiator;
                    }

                    return {
                        configRoleName: `${displayName}（${memberType}）`,
                        memberType: item.memberType,
                        configRoleRef: item.participantRef
                    };
                });
                this.participantRightList = _.chain(globalPrincipalConfig)
                    .map((item) => {
                        const participantRefList = TreeUtil.flattenTree2Array(item.participantRefList, {
                            childrenField: 'children'
                        });
                        const target = _.find(participantRefList, (it) => it.oid === item.participantRef) || {};
                        item.participantRef === '-1' && (target.displayName = this.i18n.processInitiator);
                        return {
                            configRoleName: target.displayName || item.participantName || item.participantRef,
                            memberType: item.memberType,
                            configRoleRef: item.participantRef
                        };
                    })
                    .value();
                this.processRoleConfig = ErdcKit.deepClone(roleConfig);
                this.dialogVisible = true;
            },
            openDialog() {
                this.$nextTick(() => {
                    const configRoleRef = this.participantLeftList[0]?.configRoleRef || '';
                    this.$refs.tree.setCurrentKey(configRoleRef);
                    this.echoTableData(configRoleRef);
                });
            },
            onCheck(row) {
                this.configRoleRef = row.configRoleRef;
                this.echoTableData(row.configRoleRef);
            },
            echoTableData(configRoleRef) {
                this.configRoleRef = configRoleRef;
                const target = _.find(this.processRoleConfig, (item) => item.participantRef === configRoleRef) || {};
                this.tableData = _.map(this.participantRightList, (item) => {
                    const echo =
                        _.find(target?.nodeRoleAclDtoList, (i) => i.configRoleRef === item.configRoleRef) || {};
                    return {
                        ...item,
                        isView: echo.isView || false,
                        isAdd: echo.isAdd || false
                    };
                });
            },
            confirmApproverConfigure() {
                this.updateTemplate('processRoleConfig', 'processRoleConfig', this.processRoleConfig);
                this.dialogVisible = false;
            }
        }
    };
});
