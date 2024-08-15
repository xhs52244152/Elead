define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedParticipantConfigure/template.html'),
    'erdcloud.kit',
    'fam:kit',
    'underscore'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    const FamKit = require('fam:kit');
    const _ = require('underscore');

    return {
        name: 'AdvancedParticipantConfigure',
        template,
        components: {
            EditableTable: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/EditableTable/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js')),
            AdvancedApproverConfigure: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedApproverConfigure/index.js'))
        },
        mixins: [PropertiesPanelMixin],
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                expanded: true,
                roleList: [],
                // 百分比列表
                percentageList: [
                    { name: '100%', value: '100' },
                    { name: '90%', value: '90' },
                    { name: '80%', value: '80' },
                    { name: '70%', value: '70' },
                    { name: '60%', value: '60' },
                    { name: '50%', value: '50' },
                    { name: '40%', value: '40' },
                    { name: '30%', value: '30' },
                    { name: '20%', value: '20' },
                    { name: '10%', value: '10' }
                ],
                participantRefUrl: {
                    USER: {
                        url: '/fam/user/list',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    },
                    ORG: {
                        url: '/fam/listByParentKey',
                        method: 'GET',
                        params: {
                            className: this.$store.getters.className('organization')
                        }
                    },
                    GROUP: {
                        url: '/fam/group/list',
                        method: 'GET',
                        params: {
                            appName: this.template.appName,
                            isGetVirtualGroup: false
                        }
                    },
                    ROLE: {
                        url: '/fam/role/list',
                        method: 'GET',
                        params: {
                            appName: this.template.appName,
                            isGetVirtualRole: true,
                            roleType: 'All'
                        }
                    },
                    OPERATOR: {}
                }
            };
        },
        computed: {
            appName() {
                return this.template.appName;
            },
            tableData: {
                get() {
                    return this.formatEchoData();
                },
                set(tableData) {
                    this.saveParticipantData(tableData);
                }
            },
            column() {
                return [
                    {
                        prop: 'memberType',
                        title: this.i18n.memberType,
                        minWidth: '110',
                        slots: {
                            default: 'custom-select-static-text',
                            edit: 'custom-select'
                        },
                        editRender: {
                            props: {
                                clearable: false,
                                defaultSelectFirst: true,
                                row: {
                                    componentName: 'constant-select', // 固定
                                    viewProperty: 'name', // 显示的label的key
                                    valueProperty: 'value', // 显示value的key
                                    referenceList: this.memberTypeList
                                }
                            }
                        }
                    },
                    {
                        prop: 'participantRef',
                        title: this.i18n.participantConfigure,
                        minWidth: '240',
                        slots: {
                            default: 'participant-select-static-text',
                            edit: 'participant-select'
                        },
                        editRender: {},
                        props: {
                            params: {
                                canEdit: () => true,
                                multiple: () => false,
                                showType: ({ row }) => (row.memberType === 'OPERATOR' ? ['USER'] : [row.memberType]),
                                queryScope: () => 'fullTenant',
                                queryParams: ({ row }) => {
                                    return row.memberType === 'GROUP' ? { data: { isGetVirtual: false } } : null;
                                }
                            }
                        }
                    },
                    {
                        prop: 'isRequired',
                        title: this.i18n.isRequired,
                        minWidth: '80',
                        slots: {
                            default: 'participant-select-static-text',
                            edit: 'custom-select'
                        },
                        editRender: {
                            props: {
                                clearable: false,
                                defaultSelectFirst: true,
                                row: {
                                    componentName: 'constant-select', // 固定
                                    viewProperty: 'name', // 显示的label的key
                                    valueProperty: 'value', // 显示value的key
                                    referenceList: this.isRequiredList
                                }
                            }
                        }
                    },
                    {
                        prop: 'processType',
                        title: this.i18n.processType,
                        minWidth: '310',
                        slots: {
                            default: 'participant-select-static-text',
                            edit: 'participant-select'
                        },
                        editRender: {
                            props: {
                                clearable: false,
                                defaultSelectFirst: false,
                                row: {
                                    componentName: 'constant-select', // 固定
                                    viewProperty: 'name', // 显示的label的key
                                    valueProperty: 'value', // 显示value的key
                                    referenceList: this.processTypeList
                                }
                            }
                        },
                        props: {
                            params: {
                                canEdit: ({ row }) => {
                                    return !this.readonly && _.includes(['ORG', 'GROUP', 'ROLE'], row.memberType);
                                }
                            }
                        }
                    },
                    {
                        prop: 'participantFrom',
                        title: this.i18n.approvalSources,
                        minWidth: '110',
                        slots: {
                            default: 'participant-select-static-text',
                            edit: 'participant-select'
                        },
                        editRender: {
                            props: {
                                clearable: false,
                                defaultSelectFirst: false,
                                row: {
                                    componentName: 'constant-select', // 固定
                                    viewProperty: 'name', // 显示的label的key
                                    valueProperty: 'value', // 显示value的key
                                    referenceList: this.participantFromList
                                }
                            }
                        },
                        props: {
                            params: {
                                canEdit: ({ row }) => {
                                    return !this.readonly && row.memberType === 'ROLE';
                                }
                            }
                        }
                    },
                    this.readonly
                        ? null
                        : {
                              prop: 'operation',
                              title: this.i18n.operation,
                              width: '80',
                              slots: {
                                  default: 'oper-remove'
                              }
                          }
                ].filter((i) => i);
            },
            rules() {
                return {};
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
            },
            // 参与者列表
            participantRefList() {
                return [
                    {
                        displayName: this.i18n.processInitiator,
                        oid: '-1'
                    }
                ];
            },
            // 是否必须列表
            isRequiredList() {
                return [
                    {
                        name: this.i18n.yes,
                        value: true
                    },
                    {
                        name: this.i18n.no,
                        value: false
                    }
                ];
            },
            // 处理方式列表
            processTypeList() {
                return [
                    {
                        name: this.i18n.anyOneApproval,
                        value: 'ANY'
                    },
                    {
                        name: this.i18n.allApproval,
                        value: 'ALL'
                    },
                    {
                        name: this.i18n.percentageApproval,
                        value: 'PERCENTAGE'
                    }
                ];
            },
            // 数据来源列表
            participantFromList() {
                return [
                    {
                        name: this.i18n.allSystemApproval,
                        value: 'SYSTEM'
                    },
                    {
                        name: this.i18n.teamMembers,
                        value: 'TEAM_MEMBER'
                    },
                    ...this.roleList
                ];
            },
            approverTemplate: {
                get() {
                    return this.template;
                },
                set(template) {
                    this.forceUpdateTemplate(template);
                }
            }
        },
        watch: {
            participantRefList(value) {
                this.setParticipantRefList(value);
            }
        },
        created() {
            this.$famHttp({
                url: '/fam/role/list',
                method: 'GET',
                params: {
                    appName: this.template.appName,
                    isGetVirtualRole: true,
                    roleType: 'All'
                }
            }).then((resp) => {
                if (resp.success) {
                    this.roleList = _.chain(resp.data)
                        .map((item) => ({
                            name: item.displayName,
                            value: item.oid,
                            displayName: item.displayName,
                            oid: item.oid
                        }))
                        .filter((item) => !_.includes(['SYSTEM', 'TEAM_MEMBER'], item.value))
                        .value();
                }
            });
        },
        mounted() {
            // document.addEventListener('mousewheel', this.movePositionElSelectDropdown, true);
        },
        beforeDestroy() {
            // document.removeEventListener('mousewheel', this.movePositionElSelectDropdown);
        },
        methods: {
            setParticipantRefList(value) {
                _.each(this.tableData, (data) => {
                    if (data.participantRef === '-1') {
                        data.participantRefList = value;
                    }
                });
            },
            formatEchoData() {
                _.each(this.nodeInfo.localPrincipalConfig, (item) => {
                    if (item.participantRef === '-1' && !item.participantRefList?.length) {
                        this.$set(item, 'participantRefList', this.participantRefList);
                    } else if (item.participantRef && !item.participantRefList?.length) {
                        const participantRefList = this.template?.userRoleMap?.[item.participantRef]
                            ? [this.template.userRoleMap[item.participantRef]]
                            : [];
                        this.$set(item, 'participantRefList', participantRefList);
                    }
                });
                return this.nodeInfo.localPrincipalConfig;
            },
            addRow() {
                this.expanded = true;
                this.$nextTick(() => {
                    const columns = _.chain(this.column)
                        .filter((i) => i.prop !== 'operation')
                        .map('prop')
                        .value();
                    let newColumns = {};
                    _.each(columns, (column) => {
                        newColumns[column] = '';
                        if (column === 'isRequired') {
                            newColumns[column] = true;
                        }
                    });
                    this.$refs.table.addRow({
                        _id: Date.now().toString(36),
                        percentage: '',
                        participantRefList: [],
                        ...newColumns
                    });
                });
            },
            rowChange(row, column) {
                if (column?.property === 'memberType') {
                    row.participantRef && this.$set(row, 'participantRef', '');
                    row.participantRefList && this.$set(row, 'participantRefList', []);
                    row.processType && this.$set(row, 'processType', '');
                    row.participantFrom && this.$set(row, 'participantFrom', '');
                    this.visibleChange(true, { row, column });
                }
            },
            cellChange({ row, column }, ...arg) {
                if (row.memberType !== 'OPERATOR' && column.property === 'participantRef') {
                    row[column.property + 'List'] = arg?.[1];
                }
                if (column.property === 'processType' && row.processType !== 'PERCENTAGE') {
                    row.percentage = '';
                }
            },
            visibleChange(visible, { row, column }) {
                if (!visible) {
                    return;
                }
                if (column.property === 'participantRef') {
                    if (row.memberType === 'OPERATOR') {
                        const existingData = _.chain(this.tableData)
                            .filter((item) => item.memberType === row.memberType)
                            .map('participantRef')
                            .compact()
                            .value();
                        const participantRefList = ErdcKit.deepClone(this.participantRefList);
                        _.each(participantRefList, (item) => {
                            if (_.includes(existingData, item.oid)) {
                                item.disabled = true;
                            }
                        });
                        this.$set(row, 'participantRefList', participantRefList);
                    }
                } else {
                    this.$set(row, `${column.property}List`, this[column.property + 'List'] || []);
                }
            },
            getUsersList(value, { row, column }) {
                if (value && row.memberType && column.property === 'participantRef') {
                    if (_.includes(['USER'], row.memberType)) {
                        this.$famHttp({
                            url: this.participantRefUrl[row.memberType].url,
                            method: this.participantRefUrl[row.memberType].method,
                            headers: this.participantRefUrl[row.memberType].headers,
                            data: JSON.stringify({
                                isGetDisable: false,
                                size: 20,
                                keywords: value
                            })
                        }).then((resp) => {
                            if (resp.success) {
                                const existingData = _.chain(this.tableData)
                                    .filter((item) => item.memberType === row.memberType)
                                    .map('participantRef')
                                    .compact()
                                    .value();
                                _.each(resp.data?.userInfoList, (item) => {
                                    if (_.includes(existingData, item.oid)) {
                                        item.disabled = true;
                                    }
                                });
                                row.participantRefList = resp.data?.userInfoList || [];
                            }
                        });
                    }
                }
            },
            participantSelectStaticText({ row, column }) {
                let displayName = '';
                if (column.property === 'participantRef') {
                    const displayNameList =
                        row.memberType === 'ORG'
                            ? FamKit.TreeUtil.flattenTree2Array(row[column.property + 'List'], {
                                  childrenField: 'children'
                              })
                            : row[column.property + 'List'];
                    const target = _.find(displayNameList, (data) => {
                        return data.value === row[column.property] || data.oid === row[column.property];
                    });
                    displayName = target?.displayName || target?.name;
                } else if (column.property === 'processType' && row.processType === 'PERCENTAGE') {
                    displayName = `${this.i18n.percentCompleted}（${row.percentage}%）`;
                } else {
                    const target = _.find(
                        this[column.property + 'List'],
                        (data) => data.value === row[column.property]
                    );
                    displayName = target?.displayName || target?.name;
                }
                return displayName;
            },
            saveParticipantData(tableData) {
                this.updateTemplate('', 'localPrincipalConfig', tableData);
            },
            movePositionElSelectDropdown() {
                window.requestAnimationFrame(() => {
                    let { clearEdit, getEditRecord } =
                        this.$refs?.table?.$refs?.table?.getTableInstance('vxeTable', 'instance') || {};
                    if (_.isFunction(getEditRecord)) {
                        let editRecord = getEditRecord();
                        editRecord && _.isFunction(clearEdit) && clearEdit();
                    }
                });
            }
        }
    };
});
