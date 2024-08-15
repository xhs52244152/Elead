define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedHandlerConfigure/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/components/AdvancedHandlerConfigure/style.css'),
    'erdcloud.kit',
    'underscore'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'AdvancedHandlerConfigure',
        template,
        components: {
            EditableTable: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/EditableTable/index.js'))
        },
        mixins: [PropertiesPanelMixin],
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'handlerConfigure',
                    'addReduceApproval',
                    'addApproval',
                    'reduceApproval',
                    'jumpApproval',
                    'yes',
                    'no',
                    'addApprovalCan',
                    'addApprovalCant',
                    'reduceApprovalCan',
                    'reduceApprovalCant',
                    'processingNodes',
                    'routeName',
                    'jumpOrNot',
                    'jumpSelect'
                ]),
                expanded: true,
                addSignFlagSelect: 1
            };
        },
        computed: {
            addSignFlag: {
                get() {
                    return this.nodeInfo?.addSignFlag || 0;
                },
                set(value) {
                    const template = ErdcKit.deepClone(this.template);
                    this.currentNode(template).addSignFlag = value;
                    this.$emit('update:template', template);
                }
            },
            subSignFlag: {
                get() {
                    return this.nodeInfo?.subSignFlag + '' === 'true' ? 'true' : 'false';
                },
                set(value) {
                    const template = ErdcKit.deepClone(this.template);
                    this.currentNode(template).subSignFlag = value;
                    this.$emit('update:template', template);
                }
            },
            tableData: {
                get() {
                    return this.formatEchoData();
                }
            },
            column() {
                return [
                    {
                        prop: 'routeName',
                        title: this.i18n.routeName
                    },
                    {
                        prop: 'skipUser',
                        title: this.i18n.skipUser,
                        slots: {
                            default: 'custom-select-static-text',
                            edit: 'custom-select'
                        },
                        editRender: {
                            props: {
                                popperClass: 'vxe-table--ignore-clear',
                                multiple: true,
                                clearable: true,
                                defaultSelectFirst: false,
                                row: {
                                    componentName: 'constant-select', // 固定
                                    viewProperty: 'displayName', // 显示的label的key
                                    valueProperty: 'oid', // 显示value的key
                                    referenceList: _.reduce(
                                        this.nodeInfo.localPrincipalConfig,
                                        (prev, item) => _.union(prev, item.participantRefList),
                                        []
                                    )
                                }
                            }
                        }
                    },
                    {
                        prop: 'skipFlag',
                        title: this.i18n.jumpOrNot,
                        slots: {
                            default: 'custom-select-static-text',
                            edit: 'custom-select'
                        },
                        editRender: {
                            props: {
                                popperClass: 'vxe-table--ignore-clear',
                                clearable: true,
                                defaultSelectFirst: false,
                                row: {
                                    componentName: 'constant-select', // 固定
                                    viewProperty: 'name', // 显示的label的key
                                    valueProperty: 'value', // 显示value的key
                                    referenceList: [
                                        {
                                            name: this.i18n.yes,
                                            value: 'true'
                                        },
                                        {
                                            name: this.i18n.no,
                                            value: 'false'
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    {
                        prop: 'skipActivityList',
                        title: this.i18n.jumpSelect,
                        slots: {
                            default: 'custom-select-static-text',
                            edit: 'custom-select'
                        },
                        editRender: {
                            props: {
                                popperClass: 'vxe-table--ignore-clear',
                                multiple: true,
                                clearable: true,
                                defaultSelectFirst: false,
                                row: {
                                    componentName: 'constant-select', // 固定
                                    viewProperty: 'name', // 显示的label的key
                                    valueProperty: 'id', // 显示value的key
                                    referenceList: this.taskNodes.filter((node) => node.id !== this.activeElement.id)
                                }
                            }
                        },
                        props: {
                            params: {
                                canEdit: ({ row }) => {
                                    return row.skipFlag === 'true';
                                }
                            }
                        }
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
            taskNodes() {
                return _.chain(this.elementRegistry?._elements)
                    .filter((el) => el.element.type === 'bpmn:UserTask')
                    .map((el) => ({
                        id: el.element?.id,
                        name: el.element?.businessObject?.name || el.element?.id
                    }))
                    .value();
            }
        },
        methods: {
            formatEchoData() {
                const formatRoutes = this.getExtensionRouteValue(this.activeElement);
                const { name, nodeKey, skipSignConfig = [], addSignFlag } = this.nodeInfo || {};

                this.addSignFlagSelect = addSignFlag || this.addSignFlagSelect || 1;

                if (!formatRoutes.length && !skipSignConfig.length) {
                    return [
                        {
                            nodeKey: name || nodeKey,
                            routeName: '--',
                            skipUser: [],
                            skipRoleAclDtoList: [],
                            skipFlag: skipSignConfig[0]?.skipFlag + '' === 'true' ? 'true' : 'false',
                            skipActivityList: skipSignConfig[0]?.skipActivityList || []
                        }
                    ];
                }

                if (formatRoutes.length && !skipSignConfig.length) {
                    return _.map(formatRoutes, (node) => ({
                        nodeKey: name || nodeKey,
                        routeFlag: node.id,
                        routeName: node.name,
                        skipUser: [],
                        skipRoleAclDtoList: [],
                        skipFlag:
                            _.find(skipSignConfig, (item) => item.routeFlag === node.id)?.skipFlag + '' === 'true'
                                ? 'true'
                                : 'false',
                        skipActivityList:
                            _.find(skipSignConfig, (item) => item.routeFlag === node.id)?.skipActivityList || []
                    }));
                }

                _.each(skipSignConfig, (item) => {
                    item.skipFlag = item.skipFlag + '' === 'true' ? 'true' : 'false';
                    item.skipUser = _.map(item.skipRoleAclDtoList, 'configRoleRef');
                });

                return skipSignConfig;
            },
            currentNode(template) {
                return _.find(template.processActInstDefList, (node) => node.nodeKey === this.activeElement.id);
            },
            addRow(row, index) {
                const { nodeKey, routeFlag, routeName } = row;
                const newRow = {
                    nodeKey,
                    routeFlag,
                    routeName,
                    skipUser: [],
                    skipFlag: 'false',
                    skipActivityList: []
                };
                let tableData = ErdcKit.deepClone(this.tableData);
                tableData.splice(index + 1, 0, newRow);
                this.updateTemplate('', 'skipSignConfig', tableData);
            },
            deleteRow(rowIndex) {
                this.tableData.splice(rowIndex, 1);
            },
            btnConfig(row, $index) {
                let isFirst = true;
                const length = this.tableData.length;
                for (let i = 0; i < length; i++) {
                    if (this.tableData[i].routeFlag === row.routeFlag && i < $index) {
                        isFirst = false;
                        break;
                    }
                }
                return isFirst;
            },
            rowChange() {
                let tableData = ErdcKit.deepClone(this.tableData);
                _.each(tableData, (row) => {
                    const list = _.reduce(
                        this.nodeInfo.localPrincipalConfig,
                        (prev, item) => _.union(prev, item.participantRefList),
                        []
                    );
                    row.skipRoleAclDtoList = _.reduce(
                        list,
                        (prev, item) => {
                            if (_.includes(row.skipUser, item.oid)) {
                                prev.push({
                                    configParticipantType: item.principalTarget,
                                    configRoleRef: item.oid
                                });
                            }
                            return prev;
                        },
                        []
                    );
                    if (row.skipFlag === 'false') {
                        row.skipActivityList = [];
                    }
                });
                this.updateTemplate('', 'skipSignConfig', tableData);
            },
            addSignFlagChange(val) {
                this.addSignFlag = val;
            }
        }
    };
});
